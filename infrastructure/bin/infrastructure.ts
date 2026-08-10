#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BonsightApiStack } from '../lib/bonsight-api-stack';
import { BonsightBillingStack } from '../lib/bonsight-billing-stack';
import { BonsightMediaStack } from '../lib/bonsight-media-stack';
import { BonsightWebStack } from '../lib/bonsight-web-stack';

const app = new cdk.App();
const appEnv = app.node.tryGetContext('env') ?? 'dev';
const stackEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'ap-northeast-1',
};

const mediaStack = new BonsightMediaStack(app, `BonsightMediaStack-${appEnv}`, {
  env: stackEnv,
});

new BonsightWebStack(app, `BonsightWebStack-${appEnv}`, {
  appEnv,
  env: stackEnv,
});

const apiStack = new BonsightApiStack(app, `BonsightApiStack-${appEnv}`, {
  appEnv,
  mediaCloudfrontDomain: `https://${mediaStack.distribution.distributionDomainName}`,
  env: stackEnv,
});

apiStack.addDependency(mediaStack);

new BonsightBillingStack(app, `BonsightBillingStack-${appEnv}`, {
  appEnv,
  env: stackEnv,
});
