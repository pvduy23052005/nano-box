import { PipeTransform, Injectable } from '@nestjs/common';
import { DomainValidationException } from '../customs/domain-validation.exception';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (
      !value ||
      typeof value !== 'string' ||
      !/^[0-9a-fA-F]{24}$/.test(value.trim())
    ) {
      throw new DomainValidationException(
        'id',
        'ID người dùng không đúng định dạng',
      );
    }
    return value.trim();
  }
}
