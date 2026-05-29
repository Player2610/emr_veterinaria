import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, tenantSlugOrId: string): Promise<TokenPair> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantSlugOrId }, { slug: tenantSlugOrId }] }
    });
    
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tenantId = tenant.id;

    await this.prisma.setTenantContext(tenantId);

    // Find user by email within the tenant context (RLS filters by tenant)
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokenPair({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    // Persist hashed refresh token for rotation validation
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hashedRefresh },
    });

    this.logger.log(`User ${user.email} logged in on tenant ${tenantId}`);
    return tokens;
  }

  async refresh(
    userId: string,
    tenantId: string,
    incomingRefreshToken: string,
  ): Promise<TokenPair> {
    await this.prisma.setTenantContext(tenantId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('No active session');
    }

    const tokenMatches = await bcrypt.compare(
      incomingRefreshToken,
      user.refreshTokenHash,
    );
    if (!tokenMatches) {
      // Possible token reuse attack – invalidate all sessions
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const tokens = await this.generateTokenPair({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hashedRefresh },
    });

    return tokens;
  }

  async logout(userId: string, tenantId: string): Promise<void> {
    await this.prisma.setTenantContext(tenantId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async getMe(userId: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        tenantId: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const accessSecret =
      this.configService.get<string>('jwt.secret') ?? 'change-me';
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ??
      'change-me-refresh';
    const accessExpiresIn =
      this.configService.get<string>('jwt.expiresIn') ?? '15m';
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(
        { sub: payload.sub, tenantId: payload.tenantId },
        { secret: refreshSecret, expiresIn: refreshExpiresIn },
      ),
    ]);

    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }
}
