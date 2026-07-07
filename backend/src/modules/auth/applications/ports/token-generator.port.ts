import { TokenPayload } from '../dto/login.type';

export abstract class ITokenGenerator {
  abstract generateToken(payload: TokenPayload): string;
}
