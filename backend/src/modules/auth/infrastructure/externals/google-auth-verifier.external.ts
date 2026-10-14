import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import {
  GoogleUserPayload,
  IGoogleAuthVerifier,
} from '../../applications/ports/google-auth-verifier.port';

@Injectable()
export class GoogleAuthVerifier implements IGoogleAuthVerifier {
  private readonly client: OAuth2Client;
  private readonly clientId: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async verify(idToken: string): Promise<GoogleUserPayload | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return null;
      }

      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch {
      return null;
    }
  }
}
