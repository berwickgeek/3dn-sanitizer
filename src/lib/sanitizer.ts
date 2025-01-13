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

  private applyPattern(text: string, category: string, type: string, pattern: RegExp): string {
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
