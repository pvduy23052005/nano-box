import { escapeRegex } from '../regex.util';

describe('escapeRegex', () => {
  it('should return empty string when input is empty', () => {
    expect(escapeRegex('')).toBe('');
  });

  it('should not alter strings without special regex characters', () => {
    expect(escapeRegex('hello world 123')).toBe('hello world 123');
  });

  it('should escape all special regex characters', () => {
    const specialChars = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(specialChars);
    expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');

    // Should not throw when creating RegExp
    expect(() => new RegExp(escaped)).not.toThrow();

    // Should match exact literal string
    const regex = new RegExp(escaped);
    expect(regex.test(specialChars)).toBe(true);
    expect(regex.test('completely different')).toBe(false);
  });

  it('should prevent catastrophic backtracking and invalid regex queries', () => {
    const problematicInputs = [
      '[',
      '(',
      '\\',
      '((((a*)*)*)*)',
      '.*.*.*.*.*.*',
      'user+test@example.com',
      'room [general]',
    ];

    for (const input of problematicInputs) {
      const escaped = escapeRegex(input);
      expect(() => new RegExp(escaped)).not.toThrow();
      expect(new RegExp(escaped).test(input)).toBe(true);
    }
  });
});
