#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BonsightApiStack } from '../lib/bonsight-api-stack';
import { BonsightDbStack } from '../lib/bonsight-db-stack';
import { BonsightMediaStack } from '../lib/bonsight-media-stack';
import { BonsightWebStack } from '../lib/bonsight-web-stack';

const app = new cdk.App();
const appEnv = app.node.tryGetContext('env') ?? 'dev';
const stackEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'ap-northeast-1',
};

const dbStack = new BonsightDbStack(app, `BonsightDbStack-${appEnv}`, {
  appEnv,
  env: stackEnv,
});

const mediaStack = new BonsightMediaStack(app, `BonsightMediaStack-${appEnv}`, {
  env: stackEnv,
});

new BonsightWebStack(app, `BonsightWebStack-${appEnv}`, {
  appEnv,
  env: stackEnv,
});

const apiStack = new BonsightApiStack(app, `BonsightApiStack-${appEnv}`, {
  appEnv,
  vpc: dbStack.vpc,
  apiSecurityGroup: dbStack.apiSecurityGroup,
  dbSecurityGroup: dbStack.dbSecurityGroup,
  mediaCloudfrontDomain: `https://${mediaStack.distribution.distributionDomainName}`,
  env: stackEnv,
});

apiStack.addDependency(dbStack);
apiStack.addDependency(mediaStack);
