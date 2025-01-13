import { ContentSanitizer } from '../sanitizer';

describe('ContentSanitizer', () => {
  let sanitizer: ContentSanitizer;

  beforeEach(() => {
    sanitizer = new ContentSanitizer();
  });

  describe('sanitize', () => {
    it('should sanitize personal information', () => {
      const input = 'Contact "John Doe" <john.doe@example.com> or +61412345678';
      const sanitized = sanitizer.sanitize(input);
      
      expect(sanitized).toMatch(/\[PERSON_\d+\]/);
      expect(sanitized).toMatch(/\[EMAIL_\d+\]/);
      expect(sanitized).toMatch(/\[PHONE_\d+\]/);
      expect(sanitized).not.toContain('John Doe');
      expect(sanitized).not.toContain('john.doe@example.com');
      expect(sanitized).not.toContain('+61412345678');
    });

    it('should sanitize business information', () => {
      const input = 'Working at Acme Corp Pty Ltd (ABN: 12 345 678 901)\nT/A Business Solutions';
      const sanitized = sanitizer.sanitize(input);
      
      expect(sanitized).toMatch(/\[BUSINESS_\d+\]/);
      expect(sanitized).toMatch(/\[IDENTIFIER_\d+\]/);
      expect(sanitized).not.toContain('Acme Corp Pty Ltd');
      expect(sanitized).not.toContain('12 345 678 901');
    });

    it('should sanitize Australian addresses', () => {
      const input = '123 Example Street Sydney NSW 2000';
      const sanitized = sanitizer.sanitize(input);
      
      expect(sanitized).toMatch(/\[ADDRESS_\d+\]/);
      expect(sanitized).not.toContain('123 Example Street');
      expect(sanitized).not.toContain('Sydney NSW 2000');
    });

    it('should remove email signatures', () => {
      const input = 'Here is my message.\n\nBest regards,\nJohn Smith\nSenior Manager\nAcme Corp';
      const sanitized = sanitizer.sanitize(input);
      
      expect(sanitized).toMatch(/\[PERSON_\d+\] is my message/);
      expect(sanitized).not.toContain('Best regards');
      expect(sanitized).not.toContain('John Smith');
      expect(sanitized).not.toContain('Senior Manager');
      expect(sanitized).not.toContain('Acme Corp');
    });

    it('should handle empty input', () => {
      const input = '';
      const sanitized = sanitizer.sanitize(input);
      expect(sanitized).toBe('');
    });

    it('should preserve non-sensitive content', () => {
      const input = 'The project deadline is next week.';
      const sanitized = sanitizer.sanitize(input);
      expect(sanitized).toBe(input);
    });
  });
});
