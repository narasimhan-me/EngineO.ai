'use client';

import { Turnstile } from '@marsidev/react-turnstile';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || '';

// Cloudflare Turnstile test keys for development
// See: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const DEV_SITE_KEY = '1x00000000000000000000AA'; // Always passes

export function Captcha({ onVerify, onError, onExpire }: CaptchaProps) {
  const siteKey = SITE_KEY || DEV_SITE_KEY;

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onVerify}
      onError={onError}
      onExpire={onExpire}
    />
  );
}
