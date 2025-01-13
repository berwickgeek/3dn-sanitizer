## Common Code Patterns

### 1. File Upload Handling

```typescript
async function handleUpload(zipFile: File) {
  const zip = new StreamZip.async({ file: zipFile });
  const entries = await zip.entries();

  if (Object.keys(entries).length > 100) {
    throw new Error("ZIP file contains more than 100 emails");
  }

  return processEntries(zip, entries);
}
```

### 2. Pattern Matching

```typescript
const PATTERNS = {
  PHONE_PATTERNS: {
    MOBILE: /(?:\+61|0)?(?:4[0-9]{2}|450)\s?[0-9]{3}\s?[0-9]{3}/g,
    LANDLINE: /(?:\+61|0)?(?:[2378])\s?[0-9]{4}\s?[0-9]{4}/g,
  },
  EMAIL_PATTERNS: {
    STANDARD: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    QUOTED: /"[^"]+"\s*<[^>]+>/g,
  },
};
```

### 3. Content Sanitization

```typescript
class ContentSanitizer {
  sanitize(text: string): string {
    let sanitized = this.preprocessText(text);
    sanitized = this.removeSignatures(sanitized);
    sanitized = this.applyPatternSanitization(sanitized);
    sanitized = this.applyContextualSanitization(sanitized);
    return this.postprocessText(sanitized);
  }
}
```

### 4. API Response Format

```typescript
interface ApiResponse {
  stats: {
    total_files_processed: number;
    total_sanitized_items: number;
  };
  content: Array<{
    text: string;
    word_count: number;
  }>;
}
```

## Common Issues and Solutions

### 1. Memory Management

Problem: Large file processing causing memory issues
Solution:

```typescript
const processLargeFile = async (file: File) => {
  const stream = createReadStream(file);
  let chunks = [];

  for await (const chunk of stream) {
    await processChunk(chunk);
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
```

### 2. Error Handling

Problem: Inconsistent error responses
Solution:

```typescript
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400
  ) {
    super(message);
  }

  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}
```

### 3. Rate Limiting

Problem: Need to implement rate limiting
Solution:

```typescript
const rateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
      },
    });
  },
};
```

## Testing Patterns

### 1. Unit Test Structure

```typescript
describe("ContentSanitizer", () => {
  let sanitizer: ContentSanitizer;

  beforeEach(() => {
    sanitizer = new ContentSanitizer();
  });

  test("should sanitize personal information", () => {
    const input = "Contact John Doe at john@example.com";
    const expected = "Contact [PERSON_1] at [EMAIL_1]";
    expect(sanitizer.sanitize(input)).toBe(expected);
  });
});
```

### 2. Integration Test Example

```typescript
describe("API Endpoints", () => {
  test("should process ZIP file", async () => {
    const file = new File(["test content"], "test.zip");
    const response = await request(app)
      .post("/api/process")
      .attach("file", file);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("stats");
    expect(response.body).toHaveProperty("content");
  });
});
```

## Performance Tips

1. Use streams for file processing
2. Implement proper cleanup in finally blocks
3. Cache compiled regex patterns
4. Use TypeScript strict mode
5. Implement proper error boundaries
6. Monitor memory usage during file processing
7. Use appropriate buffer sizes for streams
8. Implement timeout handling for long operations

## Development Workflow

1. Run tests before commits
2. Use proper TypeScript types
3. Follow error handling patterns
4. Implement proper logging
5. Monitor performance metrics
6. Regular security audits
7. Code review checklist
8. Documentation updates
