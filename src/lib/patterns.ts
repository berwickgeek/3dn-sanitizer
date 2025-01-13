export const PATTERNS = {
  // Australian Phone Numbers
  PHONE_PATTERNS: {
    MOBILE: /(?:\+61|0)?(?:4[0-9]{2}|450)\s?[0-9]{3}\s?[0-9]{3}/g,
    LANDLINE: /(?:\+61|0)?(?:[2378])\s?[0-9]{4}\s?[0-9]{4}/g,
    INTERNATIONAL: /\+[0-9]{1,4}\s?[0-9]{2,14}/g
  },
  
  // Email Patterns
  EMAIL_PATTERNS: {
    QUOTED: /"[^"]+"\s*<[^>]+>/g,
    UNUSUAL_TLD: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/g,
    STANDARD: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  },
  
  // Name Patterns
  NAME_PATTERNS: {
    FORMAL: /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g,
    CAPITALIZED_WORDS: /\b[A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20}\b/g,
    EMAIL_PREFIX: new RegExp([
      '(?:^|\\s)',
      '(?:from|to|by|sent|received from):?\\s*',
      '[A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,2}',
      '(?:\\s|$)'
    ].join(''), 'gim'),
    SIGNATURE_BLOCK: new RegExp([
      '^[-_]{2,}\\r?\\n',
      '(?:[^\\n]+\\r?\\n){1,4}',
      '[A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,2}'
    ].join(''), 'gm')
  },

  // Australian Business Identifiers
  BUSINESS_PATTERNS: {
    COMPANY: [
      /\b[A-Z][a-zA-Z0-9\s&]+(?:Pty\.?\s)?Ltd\.?\b/g,
      /\b[A-Z][a-zA-Z0-9\s&]+Limited\b/g,
      /\b[A-Z][a-zA-Z0-9\s&]+(?:Incorporated|Inc\.?)\b/g,
      /\bT\/A\s+[A-Z][a-zA-Z0-9\s&]+\b/g
    ],
    ABN: /\b\d{2}(?:\s?\d{3}){2}\s?\d{3}\b/g,
    ACN: /\b\d{3}(?:\s?\d{3}){2}\b/g
  },
  
  // Australian Addresses
  ADDRESS_PATTERNS: {
    FULL: new RegExp([
      '\\b\\d+\\s+',
      '(?:[A-Za-z]+\\s)+',
      '(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|',
      'Place|Pl|Boulevard|Blvd|Crescent|Cr|Way|Lane|Ln|',
      'Circuit|Cct|Parade|Pde|Square|Sq|Close|Cl)',
      '(?:\\s+[A-Za-z]+){1,2}\\s+',
      '(?:NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\s+',
      '\\d{4}\\b'
    ].join(''), 'gi'),
    POBOX: /\bP\.?O\.?\s*Box\s+\d+\b/gi,
    STREET: new RegExp([
      '\\b\\d+\\s+',
      '(?:[A-Za-z]+\\s)+',
      '(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|',
      'Place|Pl|Boulevard|Blvd|Crescent|Cr|Way|Lane|Ln|',
      'Circuit|Cct|Parade|Pde|Square|Sq|Close|Cl)',
      '\\b'
    ].join(''), 'gi')
  },
  
  // Other Identifiers
  OTHER_PATTERNS: {
    URL: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g,
    MEDICARE: /\b[2-6]\d{9}\b/g,
    TFN: /\b\d{3}[ -]?\d{3}[ -]?\d{3}\b/g,
    CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
    PASSPORT: /\b[A-Z][0-9]{7}\b/g  // Australian passport format
  }
};

export const EMAIL_SIGNATURES = [
  // Basic signature markers
  /^(?:Regards|Best regards|Kind regards|Cheers|Thanks|Thank you|Yours sincerely).{0,50}$/gm,
  /^--$/m,
  /^_{3,}$/m,
  /^-{3,}$/m,
  
  // Complex signature blocks
  new RegExp([
    '^(?:Best|Kind|Warm|Regards|Sincerely|Thank you|Thanks).*\\r?\\n',
    '(?:[^\\n]+\\r?\\n){1,6}'  // Up to 6 lines of signature content
  ].join(''), 'gim'),
  
  // Phone/email blocks
  new RegExp([
    '^\\s*(?:Tel|Phone|Mobile|Email|Web):\\s*[^\\n]+',
    '(?:\\r?\\n\\s*(?:Tel|Phone|Mobile|Email|Web):\\s*[^\\n]+)*'
  ].join(''), 'gm')
];
