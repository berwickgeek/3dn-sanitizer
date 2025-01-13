# Technical Specification: Email Content Sanitization Service

## 1. Overview

### 1.1 Purpose
This document specifies the requirements and implementation details for a web-based email content sanitization service. The service will process email exports (.eml and .msg files), extract the user's written content, remove personally identifiable information (PII), and output sanitized content suitable for AI analysis.

### 1.2 Scope
The service will be deployed on Vercel and provide a public interface for users to upload ZIP files containing email exports. The system will process these files, apply sanitization rules, and return a JSON document containing the sanitized content.

## 2. System Architecture

### 2.1 Technology Stack
- Frontend: Next.js (React)
- Backend: Vercel Serverless Functions
- File Processing: node-stream-zip for ZIP handling
- Email Parsing:
  - EML: emailjs-mime-parser
  - MSG: msg-reader
- Storage: None (stateless processing)

### 2.2 High-Level Components
1. Upload Interface
2. File Processing Service
3. Email Parser Service
4. Content Extractor Service
5. PII Sanitization Service
6. Response Formatter

## 3. Detailed Requirements

### 3.1 File Processing
- Accept ZIP files containing .eml and/or .msg files
- Maximum of 100 email files per ZIP
- Reject ZIP files that:
  - Contain more than 100 email files
  - Contain unsupported file types
  - Exceed 50MB total size

### 3.2 Content Extraction
- Parse email files to extract:
  - Main message body
  - Remove all attachments
  - Strip email signatures
  - Extract only the most recent message in conversation threads
- Remove HTML formatting
- Convert to plain text

### 3.3 Sanitization Rules
The service will identify and replace the following patterns with standardized placeholders:

1. Personal Information
   - Names: [PERSON_n] where n is a sequential number
   - Email addresses: [EMAIL_n]
   - Phone numbers: [PHONE_n]
   - Physical addresses: [ADDRESS_n]

2. Organization Information
   - Company names: [ORGANIZATION_n]
   - ABN/ACN numbers: [ABN_n]/[ACN_n]
   - Website URLs: [URL_n]

3. Australian-Specific Patterns
   - Medicare numbers: [MEDICARE_n]
   - TFN: [TFN_n]
   - Centrelink references: [CENTRELINK_n]

### 3.4 Output Format
```json
{
  "stats": {
    "total_files_processed": number,
    "total_sanitized_items": number
  },
  "content": [
    {
      "text": string,
      "word_count": number
    }
  ]
}
```

## 4. Implementation Details

### 4.1 Sanitization System

The sanitization system uses a multi-layered approach to detect and remove PII:

#### 4.1.1 Pattern Matching Layer

```javascript
const PATTERNS = {
  // Australian Phone Numbers
  PHONE_PATTERNS: {
    MOBILE: /(?:\+61|0)?(?:4[0-9]{2}|450)\s?[0-9]{3}\s?[0-9]{3}/g,
    LANDLINE: /(?:\+61|0)?(?:[2378])\s?[0-9]{4}\s?[0-9]{4}/g,
    INTERNATIONAL: /\+[0-9]{1,4}\s?[0-9]{2,14}/g
  },
  
  // Email Patterns
  EMAIL_PATTERNS: {
    STANDARD: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    QUOTED: /"[^"]+"\s*<[^>]+>/g,
    UNUSUAL_TLD: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/g
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
    ABN: /\b\d{2}(?:\s?\d{3}){2}\s?\d{3}\b/g,
    ACN: /\b\d{3}(?:\s?\d{3}){2}\b/g,
    COMPANY: [
      /\b[A-Z][a-zA-Z0-9\s&]+(?:Pty\.?\s)?Ltd\.?\b/g,
      /\b[A-Z][a-zA-Z0-9\s&]+Limited\b/g,
      /\b[A-Z][a-zA-Z0-9\s&]+(?:Incorporated|Inc\.?)\b/g,
      /\bT\/A\s+[A-Z][a-zA-Z0-9\s&]+\b/g
    ]
  },
  
  // Australian Addresses
  ADDRESS_PATTERNS: {
    STREET: new RegExp([
      '\\b\\d+\\s+',
      '(?:[A-Za-z]+\\s)+',
      '(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|',
      'Place|Pl|Boulevard|Blvd|Crescent|Cr|Way|Lane|Ln|',
      'Circuit|Cct|Parade|Pde|Square|Sq|Close|Cl)',
      '\\b'
    ].join(''), 'gi'),
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
    POBOX: /\bP\.?O\.?\s*Box\s+\d+\b/gi
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

const EMAIL_SIGNATURES = [
  // Basic signature markers
  /^(?:Regards|Best regards|Kind regards|Cheers|Thanks|Thank you|Yours sincerely).{0,50}$/gm,
  /^--$/m,
  /^_{3,}$/m,
  /^-{3,}$/m,
  
  // Complex signature blocks
  new RegExp([
    '^[-_]{2,}\\r?\\n',
    '(?:[^\\n]+\\r?\\n){1,6}'  // Up to 6 lines of signature content
  ].join(''), 'gm'),
  
  // Phone/email blocks
  new RegExp([
    '^\\s*(?:Tel|Phone|Mobile|Email|Web):\\s*[^\\n]+',
    '(?:\\r?\\n\\s*(?:Tel|Phone|Mobile|Email|Web):\\s*[^\\n]+)*'
  ].join(''), 'gm')
];
```

### 4.2 Processing Flow

1. File Upload
```javascript
async function handleUpload(zipFile) {
  const zip = new StreamZip.async({ file: zipFile });
  const entries = await zip.entries();
  
  if (Object.keys(entries).length > 100) {
    throw new Error('ZIP file contains more than 100 emails');
  }
  
  return processEntries(zip, entries);
}
```

2. Content Extraction
```javascript
async function extractContent(emailData, type) {
  const parser = type === 'eml' ? emlParser : msgParser;
  const parsed = await parser.parse(emailData);
  
  return {
    text: stripSignature(stripHTML(parsed.text)),
    metadata: parsed.headers
  };
}
```

#### 4.1.2 Context Analysis Layer

```javascript
class ContextAnalyzer {
  static CONTEXT_MARKERS = {
    GREETING: /^(?:Dear|Hi|Hello|Hey|Good morning|Good afternoon|Good evening)\b/i,
    INTRODUCTION: /(?:I am|This is|My name is|Speaking|Writing)\s+/i,
    REFERENCE: /(?:regards to|referring to|about|concerning)\s+/i,
    SIGNATURE_START: /^(?:Best|Kind|Warm|Regards|Sincerely|Thank you|Thanks)\b/im
  };

  static analyzeContext(text, position, length) {
    const surroundingText = text.substring(
      Math.max(0, position - 100),
      Math.min(text.length, position + length + 100)
    );

    const context = {
      isInGreeting: false,
      isInSignature: false,
      isInReference: false,
      confidence: 0
    };

    // Check for context markers
    for (const [type, pattern] of Object.entries(this.CONTEXT_MARKERS)) {
      if (pattern.test(surroundingText)) {
        context[`isIn${type}`] = true;
        context.confidence += 0.25;
      }
    }

    return context;
  }
}

#### 4.1.3 Token Analysis Layer

```javascript
class TokenAnalyzer {
  static COMMON_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
    // ... extend with more common words
  ]);

  static analyzeToken(token) {
    return {
      isCapitalized: /^[A-Z][a-z]/.test(token),
      isAllCaps: /^[A-Z]+$/.test(token),
      containsDigits: /\d/.test(token),
      isCommonWord: this.COMMON_WORDS.has(token.toLowerCase()),
      length: token.length
    };
  }
}

#### 4.1.4 Main Sanitization Process

```javascript
class ContentSanitizer {
  constructor() {
    this.replacements = new Map();
    this.contextAnalyzer = new ContextAnalyzer();
    this.tokenAnalyzer = new TokenAnalyzer();
  }

  sanitize(text) {
    let sanitized = this.preprocessText(text);
    sanitized = this.removeSignatures(sanitized);
    sanitized = this.applyPatternSanitization(sanitized);
    sanitized = this.applyContextualSanitization(sanitized);
    return this.postprocessText(sanitized);
  }

  preprocessText(text) {
    // Normalize whitespace and line endings
    text = text.replace(/\r\n/g, '\n')
               .replace(/\s+/g, ' ')
               .trim();
    
    // Remove common email client artifacts
    text = text.replace(/^On.*wrote:$/gm, '')
               .replace(/^>+/gm, '')
               .replace(/^Sent from my.*$/gm, '');
    
    return text;
  }

  applyPatternSanitization(text) {
    let sanitized = text;

    // Apply each pattern category
    for (const [category, patterns] of Object.entries(PATTERNS)) {
      for (const [type, pattern] of Object.entries(patterns)) {
        if (Array.isArray(pattern)) {
          pattern.forEach(p => {
            sanitized = this.applyPattern(sanitized, category, type, p);
          });
        } else {
          sanitized = this.applyPattern(sanitized, category, type, pattern);
        }
      }
    }

    return sanitized;
  }

  applyPattern(text, category, type, pattern) {
    let count = (this.replacements.get(`${category}_${type}`) || 0) + 1;
    
    return text.replace(pattern, (match) => {
      // Analyze context to confirm this is likely PII
      const startPos = text.indexOf(match);
      const context = ContextAnalyzer.analyzeContext(text, startPos, match.length);
      
      if (context.confidence > 0.5) {
        const key = `[${category}_${type}_${count++}]`;
        this.replacements.set(`${category}_${type}`, count);
        return key;
      }
      
      return match;
    });
  }

  applyContextualSanitization(text) {
    // Split into tokens while preserving whitespace
    const tokens = text.split(/(\s+)/);
    
    return tokens.map(token => {
      if (token.trim().length === 0) return token;
      
      const analysis = TokenAnalyzer.analyzeToken(token);
      
      // Apply contextual rules
      if (this.shouldSanitizeToken(token, analysis)) {
        return this.getReplacementToken('CONTEXT', token);
      }
      
      return token;
    }).join('');
  }

  shouldSanitizeToken(token, analysis) {
    // Complex logic to determine if a token should be sanitized
    if (analysis.isCommonWord) return false;
    if (analysis.length < 2) return false;
    
```

## 5. API Endpoints

### 5.1 Upload Endpoint
```
POST /api/process
Content-Type: multipart/form-data
Body: ZIP file containing email exports
```

Response:
```json
{
  "stats": {
    "total_files_processed": number,
    "total_sanitized_items": number
  },
  "content": [
    {
      "text": string,
      "word_count": number
    }
  ]
}
```

### 5.2 Error Responses
```json
{
  "error": {
    "code": string,
    "message": string
  }
}
```

## 6. Security Considerations

1. File Processing
   - Implement file size limits (50MB max)
   - Validate file types before processing
   - Implement timeout for processing (30 seconds max)

2. Data Handling
   - No storage of uploaded files
   - Process in memory only
   - Clear all temporary files after processing

3. Rate Limiting
   - Implement per-IP rate limiting
   - Maximum 10 requests per hour per IP

## 7. Performance Considerations

1. Processing Optimization
   - Stream processing for ZIP files
   - Parallel processing of email files
   - Memory management for large files

2. Response Time
   - Target processing time: < 5 seconds for 100 emails
   - Implement progress indicators for user feedback

## 8. Error Handling

1. Input Validation Errors
   - Invalid file types
   - ZIP file too large
   - Too many files

2. Processing Errors
   - Corrupted email files
   - Malformed content
   - Timeout errors

3. System Errors
   - Out of memory
   - Service unavailable

## 9. Documentation Requirements

1. User Documentation
   - Supported email export formats
   - ZIP file requirements
   - Privacy policy
   - Usage instructions

2. Technical Documentation
   - API documentation
   - Error codes and meanings
   - Deployment instructions
   - Configuration options

## 10. Testing Requirements

1. Unit Tests
   - Pattern matching
   - Content extraction
   - Sanitization rules

2. Integration Tests
   - File processing
   - API endpoints
   - Error handling

3. Performance Tests
   - Load testing
   - Memory usage
   - Processing time

4. Security Tests
   - File type validation
   - Rate limiting
   - Input sanitization