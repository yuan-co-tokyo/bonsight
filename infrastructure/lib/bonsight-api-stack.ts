import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface BonsightApiStackProps extends cdk.StackProps {
  readonly appEnv: string;
  readonly vpc: ec2.IVpc;
  readonly apiSecurityGroup: ec2.ISecurityGroup;
  readonly dbSecurityGroup: ec2.ISecurityGroup;
  readonly mediaCloudfrontDomain: string;
}

export class BonsightApiStack extends cdk.Stack {
  public readonly repository: ecr.IRepository;
  public readonly service: apprunner.CfnService;

  constructor(scope: Construct, id: string, props: BonsightApiStackProps) {
    super(scope, id, props);

    const mediaBucketArn = cdk.Stack.of(this).formatArn({
      service: 's3',
      region: '',
      account: '',
      resource: `bonsight-media-${props.appEnv}-${cdk.Stack.of(this).account}`,
    });
    const stack = cdk.Stack.of(this);
    const ssmParameterArn = (name: string) =>
      `arn:${stack.partition}:ssm:${stack.region}:${stack.account}:parameter/bonsight/${props.appEnv}/${name}`;

    this.repository = ecr.Repository.fromRepositoryName(
      this,
      'BonsightApiRepository',
      'bonsight-api',
    );

    const accessRole = new iam.Role(this, 'BonsightAppRunnerEcrAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
    });
    this.repository.grantPull(accessRole);

    const instanceRole = new iam.Role(this, 'BonsightAppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });

    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter', 'ssm:GetParameters'],
        resources: [
          `arn:${cdk.Stack.of(this).partition}:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter/bonsight/${props.appEnv}/*`,
        ],
      }),
    );
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        // jp.* 推論プロファイルは内部でap-northeast-1/ap-northeast-3等の複数リージョンへ
        // 自動ルーティングするため、リージョンを限定する条件は付けない。
        actions: ['bedrock:InvokeModel'],
        resources: ['*'],
      }),
    );
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:PutObject'],
        resources: [`${mediaBucketArn}/*`],
      }),
    );
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ecr:BatchCheckLayerAvailability',
          'ecr:BatchGetImage',
          'ecr:GetAuthorizationToken',
          'ecr:GetDownloadUrlForLayer',
        ],
        resources: ['*'],
      }),
    );

    const apiVpcConnectorSecurityGroup = new ec2.SecurityGroup(this, 'BonsightApiVpcConnectorSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Security group for Bonsight App Runner VPC connector (private subnet)',
    });
    new ec2.CfnSecurityGroupIngress(this, 'DbIngressFromApiVpcConnector', {
      groupId: props.dbSecurityGroup.securityGroupId,
      sourceSecurityGroupId: apiVpcConnectorSecurityGroup.securityGroupId,
      ipProtocol: 'tcp',
      fromPort: 5432,
      toPort: 5432,
      description: 'Allow PostgreSQL from Bonsight API VPC connector (private subnet)',
    });

    const vpcConnector = new apprunner.CfnVpcConnector(this, 'BonsightVpcConnector', {
      vpcConnectorName: `bonsight-${props.appEnv}-api-v2`,
      subnets: props.vpc.privateSubnets.map((subnet) => subnet.subnetId),
      securityGroups: [apiVpcConnectorSecurityGroup.securityGroupId],
    });

    this.service = new apprunner.CfnService(this, 'BonsightApiService', {
      serviceName: `bonsight-${props.appEnv}-api`,
      instanceConfiguration: {
        cpu: '0.25 vCPU',
        memory: '0.5 GB',
        instanceRoleArn: instanceRole.roleArn,
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
      sourceConfiguration: {
        autoDeploymentsEnabled: false,
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        imageRepository: {
          imageIdentifier: this.repository.repositoryUriForTag('latest'),
          imageRepositoryType: 'ECR',
          imageConfiguration: {
            port: '3000',
            runtimeEnvironmentVariables: [
              {
                name: 'NODE_ENV',
                value: 'production',
              },
              {
                name: 'BEDROCK_REGION',
                value: stack.region,
              },
              {
                name: 'AWS_REGION',
                value: stack.region,
              },
              {
                name: 'BEDROCK_DIAGNOSIS_MODEL_ID',
                value: 'jp.anthropic.claude-sonnet-4-6',
              },
              {
                name: 'BEDROCK_CHAT_MODEL_ID',
                value: 'jp.anthropic.claude-haiku-4-5-20251001-v1:0',
              },
              {
                name: 'CLOUDFRONT_DOMAIN',
                value: props.mediaCloudfrontDomain,
              },
            ],
            runtimeEnvironmentSecrets: [
              {
                name: 'DATABASE_URL',
                value: ssmParameterArn('DATABASE_URL'),
              },
              {
                name: 'COGNITO_USER_POOL_ID',
                value: ssmParameterArn('COGNITO_USER_POOL_ID'),
              },
              {
                name: 'COGNITO_CLIENT_ID',
                value: ssmParameterArn('COGNITO_CLIENT_ID'),
              },
              {
                name: 'S3_BUCKET_NAME',
                value: ssmParameterArn('S3_BUCKET_NAME'),
              },
            ],
          },
        },
      },
    });

    this.service.node.addDependency(vpcConnector);
    this.service.node.addDependency(props.dbSecurityGroup);

    new cdk.CfnOutput(this, 'ApiRepositoryUri', {
      value: this.repository.repositoryUri,
      description: 'ECR repository URI for Bonsight API images',
    });
    new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
      value: `https://${this.service.attrServiceUrl}`,
      description: 'App Runner service URL',
    });
  }
}
