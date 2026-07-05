import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IpasswordHasher } from '../../applications/ports/password-hasher.port';

@Injectable()
export class PasswordHasher implements IpasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
