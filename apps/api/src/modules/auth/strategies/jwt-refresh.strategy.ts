import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from './jwt.strategy';

export interface RefreshJwtPayload extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.refreshSecret') ?? 'change-me-refresh',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): RefreshJwtPayload {
    if (!payload.sub) {
      throw new UnauthorizedException('Malformed refresh token payload');
    }
    const body = req.body as { refreshToken?: string };
    const refreshToken = body.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in body');
    }
    return { ...payload, refreshToken };
  }
}
