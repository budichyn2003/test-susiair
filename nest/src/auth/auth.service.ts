import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly validTokens = new Set<string>();

  login(credentials: LoginDto): { accessToken: string; tokenType: string } {
    if (
      credentials.username !== 'johndoe' ||
      credentials.password !== 'susiairtest'
    ) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const accessToken = randomBytes(32).toString('hex');
    this.validTokens.add(accessToken);

    return { accessToken, tokenType: 'Bearer' };
  }

  isValidToken(token: string): boolean {
    return this.validTokens.has(token);
  }
}
