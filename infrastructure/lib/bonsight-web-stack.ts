import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface BonsightWebStackProps extends cdk.StackProps {
  readonly appEnv: string;
}

export class BonsightWebStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: BonsightWebStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'BonsightWebBucket', {
      bucketName: `bonsight-web-${props.appEnv}-${cdk.Stack.of(this).account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const oac = new cloudfront.S3OriginAccessControl(this, 'WebOAC', {
      description: `OAC for Bonsight ${props.appEnv} web bucket`,
    });

    this.distribution = new cloudfront.Distribution(this, 'BonsightWebDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      comment: `Bonsight ${props.appEnv} web distribution`,
    });

    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [this.bucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:${cdk.Stack.of(this).partition}:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.distribution.distributionId}`,
          },
        },
      }),
    );

    new cdk.CfnOutput(this, 'WebBucketName', {
      value: this.bucket.bucketName,
      description: 'S3 bucket for Bonsight web assets',
    });
    new cdk.CfnOutput(this, 'WebCloudFrontUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront URL for Bonsight web',
    });
    new cdk.CfnOutput(this, 'WebCloudFrontDistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID for web invalidation',
    });
  }
}
