export interface Context {
  isInGreeting: boolean;
  isInSignature: boolean;
  isInReference: boolean;
  confidence: number;
}

export interface TokenAnalysis {
  isCapitalized: boolean;
  isAllCaps: boolean;
  containsDigits: boolean;
  isCommonWord: boolean;
  length: number;
}

export class ContextAnalyzer {
  private static CONTEXT_MARKERS = {
    GREETING: /^(?:Dear|Hi|Hello|Hey|Good morning|Good afternoon|Good evening)\b/i,
    INTRODUCTION: /(?:I am|This is|My name is|Speaking|Writing)\s+/i,
    REFERENCE: /(?:regards to|referring to|about|concerning)\s+/i,
    SIGNATURE_START: /^(?:Best|Kind|Warm|Regards|Sincerely|Thank you|Thanks)\b/im
  };

  static analyzeContext(text: string, position: number, length: number): Context {
    const surroundingText = text.substring(
      Math.max(0, position - 100),
      Math.min(text.length, position + length + 100)
    );

    const context: Context = {
      isInGreeting: false,
      isInSignature: false,
      isInReference: false,
      confidence: 0
    };

    // Check for context markers
    for (const [type, pattern] of Object.entries(this.CONTEXT_MARKERS)) {
      if (pattern.test(surroundingText)) {
        switch (type) {
          case 'GREETING':
            context.isInGreeting = true;
            break;
          case 'INTRODUCTION':
            context.isInReference = true;
            break;
          case 'REFERENCE':
            context.isInReference = true;
            break;
          case 'SIGNATURE_START':
            context.isInSignature = true;
            break;
        }
        context.confidence += 0.25;
      }
    }

    return context;
  }
}

export class TokenAnalyzer {
  private static COMMON_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
    'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
    'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
    'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
    'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
    'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
    'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
    'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
    'give', 'day', 'most', 'us'
  ]);

  static analyzeToken(token: string): TokenAnalysis {
    return {
      isCapitalized: /^[A-Z][a-z]/.test(token),
      isAllCaps: /^[A-Z]+$/.test(token),
      containsDigits: /\d/.test(token),
      isCommonWord: this.COMMON_WORDS.has(token.toLowerCase()),
      length: token.length
    };
  }

  static shouldSanitizeToken(token: string, analysis: TokenAnalysis): boolean {
    // Skip common words and very short tokens
    if (analysis.isCommonWord || analysis.length < 2) {
      return false;
    }

    // Likely a name if capitalized and not containing digits
    if (analysis.isCapitalized && !analysis.containsDigits) {
      return true;
    }

    // Likely an acronym or organization name if all caps and longer than 2 characters
    if (analysis.isAllCaps && analysis.length > 2) {
      return true;
    }

    // Likely an identifier if contains digits and longer than 4 characters
    if (analysis.containsDigits && analysis.length > 4) {
      return true;
    }

    return false;
  }
}
