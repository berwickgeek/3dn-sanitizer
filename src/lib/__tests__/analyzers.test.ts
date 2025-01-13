import { ContextAnalyzer, TokenAnalyzer } from '../analyzers';

describe('ContextAnalyzer', () => {
  describe('analyzeContext', () => {
    it('should detect greeting context', () => {
      const text = 'Dear Mr. Smith,\nHere is the report you requested.';
      const context = ContextAnalyzer.analyzeContext(text, 5, 9); // "Mr. Smith"
      
      expect(context.isInGreeting).toBe(true);
      expect(context.confidence).toBeGreaterThan(0);
    });

    it('should detect signature context', () => {
      const text = 'Let me know if you need anything.\n\nBest regards,\nJohn';
      const context = ContextAnalyzer.analyzeContext(text, text.length - 4, 4); // "John"
      
      expect(context.isInSignature).toBe(true);
      expect(context.confidence).toBeGreaterThan(0);
    });

    it('should detect reference context', () => {
      const text = 'Regarding our meeting with John yesterday...';
      const context = ContextAnalyzer.analyzeContext(text, 24, 4); // "John"
      
      expect(context.isInReference).toBe(true);
      expect(context.confidence).toBeGreaterThan(0);
    });

    it('should handle text boundaries correctly', () => {
      const text = 'Hi John';
      const context = ContextAnalyzer.analyzeContext(text, 3, 4); // "John"
      
      expect(context.isInGreeting).toBe(true);
      expect(context.confidence).toBeGreaterThan(0);
    });
  });
});

describe('TokenAnalyzer', () => {
  describe('analyzeToken', () => {
    it('should identify capitalized words', () => {
      const analysis = TokenAnalyzer.analyzeToken('John');
      
      expect(analysis.isCapitalized).toBe(true);
      expect(analysis.isAllCaps).toBe(false);
      expect(analysis.containsDigits).toBe(false);
      expect(analysis.isCommonWord).toBe(false);
      expect(analysis.length).toBe(4);
    });

    it('should identify all caps words', () => {
      const analysis = TokenAnalyzer.analyzeToken('CEO');
      
      expect(analysis.isCapitalized).toBe(true);
      expect(analysis.isAllCaps).toBe(true);
      expect(analysis.containsDigits).toBe(false);
      expect(analysis.isCommonWord).toBe(false);
      expect(analysis.length).toBe(3);
    });

    it('should identify common words', () => {
      const analysis = TokenAnalyzer.analyzeToken('the');
      
      expect(analysis.isCapitalized).toBe(false);
      expect(analysis.isAllCaps).toBe(false);
      expect(analysis.containsDigits).toBe(false);
      expect(analysis.isCommonWord).toBe(true);
      expect(analysis.length).toBe(3);
    });

    it('should identify tokens with digits', () => {
      const analysis = TokenAnalyzer.analyzeToken('ID123');
      
      expect(analysis.isCapitalized).toBe(true);
      expect(analysis.isAllCaps).toBe(true);
      expect(analysis.containsDigits).toBe(true);
      expect(analysis.isCommonWord).toBe(false);
      expect(analysis.length).toBe(5);
    });
  });

  describe('shouldSanitizeToken', () => {
    it('should identify tokens that need sanitization', () => {
      const analysis = TokenAnalyzer.analyzeToken('John');
      expect(TokenAnalyzer.shouldSanitizeToken('John', analysis)).toBe(true);
    });

    it('should skip common words', () => {
      const analysis = TokenAnalyzer.analyzeToken('the');
      expect(TokenAnalyzer.shouldSanitizeToken('the', analysis)).toBe(false);
    });

    it('should identify organization names', () => {
      const analysis = TokenAnalyzer.analyzeToken('ACME');
      expect(TokenAnalyzer.shouldSanitizeToken('ACME', analysis)).toBe(true);
    });

    it('should identify identifiers', () => {
      const analysis = TokenAnalyzer.analyzeToken('ID12345');
      expect(TokenAnalyzer.shouldSanitizeToken('ID12345', analysis)).toBe(true);
    });

    it('should skip short tokens', () => {
      const analysis = TokenAnalyzer.analyzeToken('a');
      expect(TokenAnalyzer.shouldSanitizeToken('a', analysis)).toBe(false);
    });
  });
});
