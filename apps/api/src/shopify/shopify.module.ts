import { Module } from '@nestjs/common';
import { ShopifyController } from './shopify.controller';
import { ShopifyService } from './shopify.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ShopifyController],
  providers: [ShopifyService, PrismaService],
  exports: [ShopifyService],
})
export class ShopifyModule {}
