import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class BonsightMediaStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケット（メディア保存用）
    this.bucket = new s3.Bucket(this, 'BonsightMediaBucket', {
      bucketName: `bonsight-${props?.env?.account ?? 'dev'}-media`,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,  // 本番データ保護
      cors: [
        {
          allowedOrigins: ['http://localhost:5173', 'http://localhost:8080'],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,   // presigned URL アップロード用
            s3.HttpMethods.POST,
            s3.HttpMethods.HEAD,
          ],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,  // OAC経由のみアクセス可
    });

    // CloudFront Origin Access Control (OAC)
    const oac = new cloudfront.S3OriginAccessControl(this, 'MediaOAC', {
      description: 'OAC for Bonsight media bucket',
    });

    // CloudFrontディストリビューション
    this.distribution = new cloudfront.Distribution(this, 'BonsightMediaDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      // presigned URL用のキャッシュ無効化パス
      additionalBehaviors: {
        '/upload/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
            originAccessControl: oac,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,  // コスト最適化
      comment: 'Bonsight Phase1 Media Distribution',
    });

    // バケットポリシー: CloudFront OACのみアクセス許可
    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [this.bucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
          },
        },
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3バケット名（.envのS3_BUCKET_NAMEに設定）',
    });
    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFrontドメイン（.envのCLOUDFRONT_DOMAINに設定）',
    });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront DistributionID（キャッシュ無効化に使用）',
    });
  }
}
