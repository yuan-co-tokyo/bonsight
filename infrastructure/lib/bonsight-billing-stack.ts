import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import * as path from 'path';

export interface BonsightBillingStackProps extends cdk.StackProps {
  readonly appEnv: string;
}

export class BonsightBillingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BonsightBillingStackProps) {
    super(scope, id, props);

    const webhookParamName = `/bonsight/${props.appEnv}/SLACK_BILLING_WEBHOOK_URL`;

    const fn = new lambda.Function(this, 'BillingReportFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda', 'billing-report')),
      timeout: cdk.Duration.seconds(30),
      environment: {
        SLACK_WEBHOOK_PARAM: webhookParamName,
      },
    });

    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ce:GetCostAndUsage'],
        resources: ['*'],
      }),
    );

    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:${cdk.Stack.of(this).partition}:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter${webhookParamName}`,
        ],
      }),
    );

    // 毎日09:00 JST (00:00 UTC) に実行
    new events.Rule(this, 'DailyBillingReportSchedule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '0' }),
      targets: [new targets.LambdaFunction(fn)],
    });
  }
}
