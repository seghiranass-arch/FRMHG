import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { AuthService, JwtPayload, AuthUser } from '../auth.service';

// Extract JWT from cookie
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['frmhg_token'] || null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.authService.getUserFromToken(payload);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
