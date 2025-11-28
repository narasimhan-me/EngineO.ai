import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShopifyModule } from './shopify/shopify.module';
import { ProjectsModule } from './projects/projects.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SeoScanModule } from './seo-scan/seo-scan.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    ShopifyModule,
    ProjectsModule,
    IntegrationsModule,
    SeoScanModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
