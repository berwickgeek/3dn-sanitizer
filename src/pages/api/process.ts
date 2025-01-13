import type { NextApiRequest, NextApiResponse } from 'next';
import StreamZip from 'node-stream-zip';
import { simpleParser } from 'emailjs-mime-parser';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

type ProcessResponse = {
  stats: {
    total_files_processed: number;
    total_sanitized_items: number;
  };
  content: Array<{
    text: string;
    word_count: number;
  }>;
};

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

const PATTERNS = {
  PHONE_PATTERNS: {
    MOBILE: /(?:\+61|0)?(?:4[0-9]{2}|450)\s?[0-9]{3}\s?[0-9]{3}/g,
    LANDLINE: /(?:\+61|0)?(?:[2378])\s?[0-9]{4}\s?[0-9]{4}/g,
  },
  EMAIL_PATTERNS: {
    STANDARD: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    QUOTED: /"[^"]+"\s*<[^>]+>/g,
  },
  NAME_PATTERNS: {
    FORMAL: /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g,
    CAPITALIZED_WORDS: /\b[A-Z][a-z]{1,20}\s+[A-Z][a-z]{1,20}\b/g,
  },
};

const EMAIL_SIGNATURES = [
  /^(?:Regards|Best regards|Kind regards|Cheers|Thanks|Thank you|Yours sincerely).{0,50}$/gm,
  /^--$/m,
  /^_{3,}$/m,
  /^-{3,}$/m,
];

class ContentSanitizer {
  private replacements = new Map<string, number>();

  sanitize(text: string): string {
    let sanitized = this.preprocessText(text);
    sanitized = this.removeSignatures(sanitized);
    sanitized = this.applyPatternSanitization(sanitized);
    return sanitized;
  }

  private preprocessText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^On.*wrote:$/gm, '')
      .replace(/^>+/gm, '')
      .replace(/^Sent from my.*$/gm, '');
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

    for (const [category, patterns] of Object.entries(PATTERNS)) {
      for (const [type, pattern] of Object.entries(patterns)) {
        const count = (this.replacements.get(`${category}_${type}`) || 0) + 1;
        sanitized = sanitized.replace(pattern, () => {
          const key = `[${category}_${type}_${count}]`;
          this.replacements.set(`${category}_${type}`, count);
          return key;
        });
      }
    }

    return sanitized;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    });
  }

  try {
    // Create temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'email-sanitizer-'));
    const zipPath = path.join(tempDir, 'upload.zip');

    // Write uploaded file to disk
    const chunks: Uint8Array[] = [];
    for await (const chunk of req.body) {
      chunks.push(chunk);
    }
    await fs.writeFile(zipPath, Buffer.concat(chunks));

    // Process ZIP file
    const zip = new StreamZip.async({ file: zipPath });
    const entries = await zip.entries();

    if (Object.keys(entries).length > 100) {
      await zip.close();
      await fs.rm(tempDir, { recursive: true });
      return res.status(400).json({
        error: {
          code: 'TOO_MANY_FILES',
          message: 'ZIP file contains more than 100 emails',
        },
      });
    }

    const sanitizer = new ContentSanitizer();
    const results = [];
    let totalSanitizedItems = 0;

    for (const entry of Object.values(entries)) {
      if (!entry.name.toLowerCase().endsWith('.eml')) continue;

      const content = await zip.entryData(entry);
      const email = await simpleParser(content);
      
      if (email.text) {
        const sanitized = sanitizer.sanitize(email.text);
        const wordCount = sanitized.split(/\s+/).length;
        
        results.push({
          text: sanitized,
          word_count: wordCount,
        });

        totalSanitizedItems += sanitized.match(/\[.*?\]/g)?.length || 0;
      }
    }

    await zip.close();
    await fs.rm(tempDir, { recursive: true });

    return res.status(200).json({
      stats: {
        total_files_processed: results.length,
        total_sanitized_items: totalSanitizedItems,
      },
      content: results,
    });
  } catch (error) {
    console.error('Processing error:', error);
    return res.status(500).json({
      error: {
        code: 'PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'An error occurred while processing the file',
      },
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
