import type { NextApiRequest, NextApiResponse } from "next";
import StreamZip from "node-stream-zip";
import { simpleParser } from "mailparser";
import MsgReader from "@kenjiuno/msgreader";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import formidable from "formidable";
import type { File } from "formidable";

interface EmailParser {
  parse(content: Buffer): Promise<string | null>;
}

class EmlParser implements EmailParser {
  async parse(content: Buffer): Promise<string | null> {
    const email = await simpleParser(content);
    return email.text || null;
  }
}

class MsgParser implements EmailParser {
  async parse(content: Buffer): Promise<string | null> {
    const uint8Array = new Uint8Array(content);
    const msgReader = new MsgReader(uint8Array.buffer);
    const msg = msgReader.getFileData();
    return msg.body || null;
  }
}

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
    const form = formidable({
      maxFiles: 1,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filter: (part) => part.mimetype === 'application/zip',
    });

    // Parse the form data
    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0] as File;

    if (!uploadedFile) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file was uploaded',
        },
      });
    }

    // Create temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'email-sanitizer-'));
    const zipPath = uploadedFile.filepath;

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
      const fileName = entry.name.toLowerCase();
      if (!fileName.endsWith('.eml') && !fileName.endsWith('.msg')) continue;

      const content = await zip.entryData(entry);
      const parser: EmailParser = fileName.endsWith('.eml') 
        ? new EmlParser() 
        : new MsgParser();

      const text = await parser.parse(content);
      
      if (text) {
        const sanitized = sanitizer.sanitize(text);
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
