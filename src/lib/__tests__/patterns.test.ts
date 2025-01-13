import { PATTERNS, EMAIL_SIGNATURES } from '../patterns';

describe('PATTERNS', () => {
  describe('PHONE_PATTERNS', () => {
    it('should match Australian mobile numbers', () => {
      const { MOBILE } = PATTERNS.PHONE_PATTERNS;
      expect('0412345678').toMatch(MOBILE);
      expect('+61412345678').toMatch(MOBILE);
      expect('0412 345 678').toMatch(MOBILE);
      expect('+61 412 345 678').toMatch(MOBILE);
    });

    it('should match Australian landline numbers', () => {
      const { LANDLINE } = PATTERNS.PHONE_PATTERNS;
      expect('0298765432').toMatch(LANDLINE);
      expect('+61298765432').toMatch(LANDLINE);
      expect('02 9876 5432').toMatch(LANDLINE);
      expect('+61 2 9876 5432').toMatch(LANDLINE);
    });

    it('should match international numbers', () => {
      const { INTERNATIONAL } = PATTERNS.PHONE_PATTERNS;
      expect('+1234567890').toMatch(INTERNATIONAL);
      expect('+44 20 1234 5678').toMatch(INTERNATIONAL);
    });
  });

  describe('EMAIL_PATTERNS', () => {
    it('should match standard email addresses', () => {
      const { STANDARD } = PATTERNS.EMAIL_PATTERNS;
      expect('user@example.com').toMatch(STANDARD);
      expect('first.last@domain.com.au').toMatch(STANDARD);
      expect('user+tag@example.co.uk').toMatch(STANDARD);
    });

    it('should match quoted email addresses', () => {
      const { QUOTED } = PATTERNS.EMAIL_PATTERNS;
      expect('"John Smith" <john@example.com>').toMatch(QUOTED);
      expect('"First Last" <user@domain.com>').toMatch(QUOTED);
    });

    it('should match unusual TLD email addresses', () => {
      const { UNUSUAL_TLD } = PATTERNS.EMAIL_PATTERNS;
      expect('user@domain.co.uk').toMatch(UNUSUAL_TLD);
      expect('user@domain.com.au').toMatch(UNUSUAL_TLD);
    });
  });

  describe('NAME_PATTERNS', () => {
    it('should match formal names', () => {
      const { FORMAL } = PATTERNS.NAME_PATTERNS;
      expect('Mr. John Smith').toMatch(FORMAL);
      expect('Dr. Jane Doe').toMatch(FORMAL);
      expect('Prof. Robert Johnson').toMatch(FORMAL);
    });

    it('should match capitalized names', () => {
      const { CAPITALIZED_WORDS } = PATTERNS.NAME_PATTERNS;
      expect('John Smith').toMatch(CAPITALIZED_WORDS);
      expect('Jane Doe').toMatch(CAPITALIZED_WORDS);
    });

    it('should match names in email context', () => {
      const { EMAIL_PREFIX } = PATTERNS.NAME_PATTERNS;
      expect('From: John Smith').toMatch(EMAIL_PREFIX);
      expect('To: Jane Doe').toMatch(EMAIL_PREFIX);
      expect('Sent by: Robert Johnson').toMatch(EMAIL_PREFIX);
    });
  });

  describe('BUSINESS_PATTERNS', () => {
    it('should match ABN numbers', () => {
      const { ABN } = PATTERNS.BUSINESS_PATTERNS;
      expect('12345678901').toMatch(ABN);
      expect('12 345 678 901').toMatch(ABN);
    });

    it('should match ACN numbers', () => {
      const { ACN } = PATTERNS.BUSINESS_PATTERNS;
      expect('123456789').toMatch(ACN);
      expect('123 456 789').toMatch(ACN);
    });

    it('should match company names', () => {
      const [PTY_LTD, LIMITED, INC, TRADING_AS] = PATTERNS.BUSINESS_PATTERNS.COMPANY;
      expect('Acme Corp Pty Ltd').toMatch(PTY_LTD);
      expect('Example Company Limited').toMatch(LIMITED);
      expect('Test Corp Inc.').toMatch(INC);
      expect('T/A Business Name').toMatch(TRADING_AS);
    });
  });

  describe('ADDRESS_PATTERNS', () => {
    it('should match street addresses', () => {
      const { STREET } = PATTERNS.ADDRESS_PATTERNS;
      expect('123 Example Street').toMatch(STREET);
      expect('456 Test Road').toMatch(STREET);
    });

    it('should match full addresses', () => {
      const { FULL } = PATTERNS.ADDRESS_PATTERNS;
      expect('123 Example Street Sydney NSW 2000').toMatch(FULL);
      expect('456 Test Road Melbourne VIC 3000').toMatch(FULL);
    });

    it('should match PO Box addresses', () => {
      const { POBOX } = PATTERNS.ADDRESS_PATTERNS;
      expect('PO Box 123').toMatch(POBOX);
      expect('P.O. Box 456').toMatch(POBOX);
    });
  });
});

describe('EMAIL_SIGNATURES', () => {
  it('should match common signature lines', () => {
    const text = 'Best regards,\nJohn Smith';
    expect(text).toMatch(EMAIL_SIGNATURES[0]); // Basic signature marker
  });

  it('should match complex signature blocks', () => {
    const text = `
Best regards,
John Smith
Senior Manager
Acme Corp
Tel: +61 2 9876 5432
Email: john@acme.com
`;
    expect(text).toMatch(EMAIL_SIGNATURES[0]); // Basic signature marker
    expect(text).toMatch(EMAIL_SIGNATURES[4]); // Complex signature block
    expect(text).toMatch(EMAIL_SIGNATURES[5]); // Phone/email block
  });
});
