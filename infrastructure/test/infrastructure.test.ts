import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BonsightApiStack } from '../lib/bonsight-api-stack';

describe('BonsightApiStack', () => {
  const createTemplate = () => {
    const app = new cdk.App();
    const stack = new BonsightApiStack(app, 'BonsightApiStack-test', {
      appEnv: 'test',
      mediaCloudfrontDomain: 'https://media.example.com',
      env: {
        account: '123456789012',
        region: 'ap-northeast-1',
      },
    });

    return Template.fromStack(stack);
  };

  test('uses public egress without a VPC connector', () => {
    const template = createTemplate();

    template.hasResourceProperties('AWS::AppRunner::Service', {
      NetworkConfiguration: {
        EgressConfiguration: {
          EgressType: 'DEFAULT',
        },
      },
    });
    template.resourceCountIs('AWS::AppRunner::VpcConnector', 0);
    template.resourceCountIs('AWS::EC2::SecurityGroup', 0);
    template.resourceCountIs('AWS::EC2::SecurityGroupIngress', 0);
  });
});
