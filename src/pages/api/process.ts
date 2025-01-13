import type { NextApiRequest, NextApiResponse } from "next";
import StreamZip from "node-stream-zip";
import { simpleParser } from "mailparser";
import MsgReader from "@kenjiuno/msgreader";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import formidable from "formidable";
import type { File } from "formidable";
import { ContentSanitizer } from "@/lib/sanitizer";

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

interface ProcessedEmail {
  text: string;
  word_count: number;
  metadata: {
    timestamp: string;
    file_type: string;
    file_name: string;
    sanitized_items: number;
  };
}

type ProcessResponse = {
  stats: {
    total_files_processed: number;
    total_sanitized_items: number;
    processing_time_ms: number;
  };
  content: ProcessedEmail[];
};

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

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
    const startTime = Date.now();
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
        const sanitizedItems = sanitized.match(/\[.*?\]/g)?.length || 0;
        
        results.push({
          text: sanitized,
          word_count: sanitized.split(/\s+/).length,
          metadata: {
            timestamp: new Date().toISOString(),
            file_type: fileName.endsWith('.eml') ? 'EML' : 'MSG',
            file_name: entry.name,
            sanitized_items: sanitizedItems,
          }
        });

        totalSanitizedItems += sanitizedItems;
      }
    }

    await zip.close();
    await fs.rm(tempDir, { recursive: true });

    const endTime = Date.now();
    return res.status(200).json({
      stats: {
        total_files_processed: results.length,
        total_sanitized_items: totalSanitizedItems,
        processing_time_ms: endTime - startTime,
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
