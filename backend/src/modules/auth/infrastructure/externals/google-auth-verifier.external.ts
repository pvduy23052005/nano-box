import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import {
  GoogleUserPayload,
  IGoogleAuthVerifier,
} from '../../applications/ports/google-auth-verifier.port';

@Injectable()
export class GoogleAuthVerifier implements IGoogleAuthVerifier {
  private readonly logger = new Logger(GoogleAuthVerifier.name);
  private readonly client: OAuth2Client;
  private readonly clientId: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  async verify(idToken: string): Promise<GoogleUserPayload | null> {
    if (!this.clientId) {
      this.logger.error(
        'GOOGLE_CLIENT_ID is not configured. Google token verification rejected.',
      );
      return null;
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || payload.email_verified !== true) {
        return null;
      }

      return {
        email: payload.email.trim().toLowerCase(),
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      this.logger.warn(
        `Google token verification failed: ${(error as Error).message}`,
      );
      return null;
    }
  }
}
