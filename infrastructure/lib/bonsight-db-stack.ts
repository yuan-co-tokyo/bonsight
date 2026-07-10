import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export interface BonsightDbStackProps extends cdk.StackProps {
  readonly appEnv: string;
}

export class BonsightDbStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly apiSecurityGroup: ec2.SecurityGroup;
  public readonly dbSecurityGroup: ec2.SecurityGroup;
  public readonly database: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: BonsightDbStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'BonsightVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    this.apiSecurityGroup = new ec2.SecurityGroup(this, 'BonsightApiSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      description: 'Security group for Bonsight App Runner VPC connector',
    });

    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'BonsightDbSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: false,
      description: 'Security group for Bonsight PostgreSQL',
    });

    this.dbSecurityGroup.addIngressRule(
      this.apiSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from Bonsight API only',
    );

    this.database = new rds.DatabaseInstance(this, 'BonsightPostgres', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [this.dbSecurityGroup],
      allocatedStorage: 20,
      multiAz: false,
      publiclyAccessible: false,
      credentials: rds.Credentials.fromGeneratedSecret('bonsight_admin'),
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'DbEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      description: 'PostgreSQL endpoint for SSM DATABASE_URL assembly',
    });
    new cdk.CfnOutput(this, 'DbSecretArn', {
      value: this.database.secret?.secretArn ?? 'generated-secret',
      description: 'Generated database secret ARN',
    });
  }
}
