# Email Content Sanitization Service

A web-based service that processes email exports (.eml and .msg files), extracts user content, removes personally identifiable information (PII), and outputs sanitized content suitable for AI analysis.

## Features

- ZIP file processing with validation
  - Support for .eml files (MSG support coming soon)
  - Maximum 100 email files per ZIP
  - 50MB total size limit
- Advanced PII sanitization
  - Personal information detection
  - Organization information handling
  - Australian-specific pattern recognition
- Stateless processing architecture
- Real-time processing with progress indicators

## Tech Stack

- Frontend: Next.js (React)
- Backend: Vercel Serverless Functions
- File Processing: node-stream-zip
- Email Parsing:
  - EML: mailparser
  - MSG: msg-reader

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Documentation

Detailed documentation can be found in the `cline_docs` directory:

- [Project Roadmap](cline_docs/projectRoadmap.md)
- [Technical Specification](cline_docs/tech-spec.md)
- [Technology Stack](cline_docs/techStack.md)
- [Codebase Summary](cline_docs/codebaseSummary.md)
- [Development Hints](cline_docs/hints.md)

## API Endpoints

### POST /api/process

Process a ZIP file containing email exports.

Request:

- Content-Type: multipart/form-data
- Body: ZIP file containing email exports

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

## Security

- File size limits (50MB max)
- File type validation
- Rate limiting (10 requests per hour per IP)
- No persistent storage
- Memory-efficient processing

## License

MIT
