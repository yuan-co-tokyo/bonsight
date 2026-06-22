import { Injectable, OnModuleInit } from '@nestjs/common';

const generatedClientPath = __dirname.includes('/dist/')
  ? '../../../generated/prisma/client.js'
  : '../../generated/prisma/client.js';
const { PrismaClient } = require(generatedClientPath);
const { PrismaPg } = require('@prisma/adapter-pg');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required to initialize PrismaClient');
    }

    super({ adapter: new PrismaPg(databaseUrl) });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
