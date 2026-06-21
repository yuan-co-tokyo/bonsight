#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BonsightMediaStack } from '../lib/bonsight-media-stack';

const app = new cdk.App();
new BonsightMediaStack(app, 'BonsightMediaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'ap-northeast-1',
  },
});
