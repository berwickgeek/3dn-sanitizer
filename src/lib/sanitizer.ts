import { PATTERNS, EMAIL_SIGNATURES } from './patterns';
import { ContextAnalyzer, TokenAnalyzer } from './analyzers';

export class ContentSanitizer {
  private replacements = new Map<string, number>();

  sanitize(text: string): string {
    let sanitized = this.preprocessText(text);
    sanitized = this.removeSignatures(sanitized);
    sanitized = this.applyPatternSanitization(sanitized);
    sanitized = this.applyContextualSanitization(sanitized);
    return this.postprocessText(sanitized);
  }

  private preprocessText(text: string): string {
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

  private removeSignatures(text: string): string {
    let result = text;
    for (const pattern of EMAIL_SIGNATURES) {
      result = result.replace(pattern, '');
    }
    return result.trim();
  }

  private applyPatternSanitization(text: string): string {
    let sanitized = text;

    // Process patterns in specific order
    const patternOrder = [
      'EMAIL_PATTERNS',
      'PHONE_PATTERNS',
      'BUSINESS_PATTERNS',
      'ADDRESS_PATTERNS',
      'NAME_PATTERNS',
      'OTHER_PATTERNS'
    ];

    for (const category of patternOrder) {
      const patterns = PATTERNS[category as keyof typeof PATTERNS];
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

  private applyPattern(text: string, category: string, type: string, pattern: RegExp): string {
    let count = (this.replacements.get(`${category}_${type}`) || 0) + 1;
    
    // Special handling for compound patterns
    if (category === 'EMAIL_PATTERNS' && type === 'QUOTED') {
      return text.replace(pattern, () => `[EMAIL_${count++}]`);
    }

    if (category === 'ADDRESS_PATTERNS' && type === 'FULL') {
      return text.replace(pattern, () => `[ADDRESS_${count++}]`);
    }

    if (category === 'BUSINESS_PATTERNS' && type === 'COMPANY') {
      return text.replace(pattern, () => `[BUSINESS_${count++}]`);
    }

    return text.replace(pattern, (match) => {
      switch (category) {
        case 'EMAIL_PATTERNS':
          return `[EMAIL_${count++}]`;
        case 'PHONE_PATTERNS':
          return `[PHONE_${count++}]`;
        case 'BUSINESS_PATTERNS':
          return `[IDENTIFIER_${count++}]`;
        case 'ADDRESS_PATTERNS':
          return `[ADDRESS_${count++}]`;
        case 'NAME_PATTERNS': {
          const startPos = text.indexOf(match);
          const context = ContextAnalyzer.analyzeContext(text, startPos, match.length);
          return context.confidence > 0.25 ? `[PERSON_${count++}]` : match;
        }
        default:
          return `[${category.split('_')[0]}_${count++}]`;
      }
    });
  }

  private applyContextualSanitization(text: string): string {
    // Split into tokens while preserving whitespace
    const tokens = text.split(/(\s+)/);
    
    return tokens.map(token => {
      if (token.trim().length === 0) return token;
      
      const analysis = TokenAnalyzer.analyzeToken(token);
      
      // Apply contextual rules
      if (TokenAnalyzer.shouldSanitizeToken(token, analysis)) {
        const category = this.determineCategory(token, analysis);
        return this.getReplacementToken(category, token);
      }
      
      return token;
    }).join('');
  }

  private determineCategory(token: string, analysis: { isAllCaps: boolean; containsDigits: boolean }): string {
    if (analysis.isAllCaps && !analysis.containsDigits) {
      return 'ORGANIZATION';
    }
    if (analysis.containsDigits) {
      return 'IDENTIFIER';
    }
    return 'PERSON';
  }

  private getReplacementToken(category: string, token: string): string {
    const count = (this.replacements.get(category) || 0) + 1;
    this.replacements.set(category, count);
    return `[${category}_${count}]`;
  }

  private postprocessText(text: string): string {
    // Remove any remaining excessive whitespace
    return text.replace(/\s+/g, ' ').trim();
  }
}
