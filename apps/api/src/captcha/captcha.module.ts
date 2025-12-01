import { Module, Global } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { AuthAbuseService } from './auth-abuse.service';

@Global()
@Module({
  providers: [CaptchaService, AuthAbuseService],
  exports: [CaptchaService, AuthAbuseService],
})
export class CaptchaModule {}
