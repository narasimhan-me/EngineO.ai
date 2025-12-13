import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export const ESTIMATED_METADATA_TOKENS_PER_CALL = 400;

@Injectable()
export class TokenUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async log(userId: string, amount: number, source: string): Promise<void> {
    if (!userId || !source || amount <= 0) {
      return;
    }
    await this.prisma.tokenUsage.create({
      data: {
        userId,
        amount,
        source,
      },
    });
  }

  async getMonthlyUsage(userId: string): Promise<number> {
    if (!userId) {
      return 0;
    }
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    const result = await this.prisma.tokenUsage.aggregate({
      where: {
        userId,
        createdAt: {
          gte: start,
        },
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount ?? 0;
  }
}
