export interface GoogleUserPayload {
  email: string;
  name?: string;
  picture?: string;
}

export abstract class IGoogleAuthVerifier {
  abstract verify(idToken: string): Promise<GoogleUserPayload | null>;
}
