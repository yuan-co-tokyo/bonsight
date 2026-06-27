import { Injectable } from '@nestjs/common';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

@Injectable()
export class BedrockService {
  private readonly client = new BedrockRuntimeClient({
    region: process.env.BEDROCK_REGION ?? 'us-east-1',
    maxAttempts: 3,
  });
  private readonly modelId = process.env.BEDROCK_MODEL_ID!;

  async converse(input: {
    system?: { text: string }[];
    messages: any[];
    toolConfig?: any;
    maxTokens?: number;
  }) {
    return this.client.send(new ConverseCommand({
      modelId: this.modelId,
      system: input.system,
      messages: input.messages,
      toolConfig: input.toolConfig,
      inferenceConfig: { maxTokens: input.maxTokens ?? 1024 },
    }));
  }
}
