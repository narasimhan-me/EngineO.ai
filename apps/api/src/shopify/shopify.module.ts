import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopifyController } from './shopify.controller';
import { ShopifyService } from './shopify.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ShopifyController],
  providers: [ShopifyService, PrismaService],
  exports: [ShopifyService],
})
export class ShopifyModule {}
