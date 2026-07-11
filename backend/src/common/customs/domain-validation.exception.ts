export class DomainValidationException extends Error {
  public readonly errors: Record<string, string>;

  constructor(
    fieldOrErrors: string | Record<string, string>,
    message?: string,
  ) {
    super(typeof fieldOrErrors === 'string' ? message : 'Lỗi nghiệp vụ');
    this.name = 'DomainValidationException';

    if (typeof fieldOrErrors === 'string') {
      this.errors = { [fieldOrErrors]: message || '' };
    } else {
      this.errors = fieldOrErrors;
    }
  }
}
