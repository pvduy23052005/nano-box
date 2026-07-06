import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '../../applications/dto/login.type';
import { ITokenGenerator } from '../../applications/ports/token-generator.port';

@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  constructor(private readonly jwtService: JwtService) { }

  generateToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }
}
