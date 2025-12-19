import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from './auth.service';

/**
 * [ADMIN-OPS-1] Impersonation payload structure.
 * Passed through req.user when an admin is impersonating a user.
 * NOT persisted to DB - only exists in the JWT session.
 */
export interface ImpersonationPayload {
  actorUserId: string;      // The internal admin initiating impersonation
  actorAdminRole: string;   // Admin role at time of impersonation
  mode: 'readOnly';         // Always read-only for ADMIN-OPS-1
  issuedAt: number;         // Timestamp when impersonation was initiated
  reason?: string;          // Optional reason for impersonation
}

/**
 * [ADMIN-OPS-1] Extended JWT payload that may include impersonation data.
 */
export interface ExtendedJwtPayload extends JwtPayload {
  impersonation?: ImpersonationPayload;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
    });
  }

  async validate(payload: ExtendedJwtPayload) {
    // Reject temp 2FA tokens - they should only be used for /auth/2fa/verify
    // This ensures temp tokens cannot grant normal API access
    if (payload.twoFactor === true) {
      throw new UnauthorizedException('Invalid token - 2FA verification required');
    }

    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }

    // [ADMIN-OPS-1] Pass through impersonation payload if present (do NOT persist to DB)
    if (payload.impersonation) {
      return {
        ...user,
        impersonation: payload.impersonation,
      };
    }

    return user;
  }
}
