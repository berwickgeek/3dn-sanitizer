# Email Content Sanitizer

A tool for removing personally identifiable information (PII) from email exports while preserving meaningful content.

## Features

- Supports EML and MSG file formats
- Processes ZIP archives containing up to 100 email files
- Detects and sanitizes:
  - Names and email addresses
  - Phone numbers
  - Australian business identifiers (ABN, ACN)
  - Australian addresses
  - Other PII patterns
- Context-aware analysis for better accuracy
- JSON export of sanitized content
- No data storage - all processing done in memory
- No AI/ML - uses predefined rules and patterns

## Deployment to Vercel

1. Fork this repository

2. Create a new project on Vercel:

   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Select "Next.js" as the framework

3. Configure project settings:

   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. Environment Variables:

   - No environment variables required

5. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your project

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Technical Details

- Built with Next.js and TypeScript
- Uses Tailwind CSS for styling
- Serverless API endpoint with rate limiting
- Stateless processing with no data persistence
- Comprehensive test coverage

## Security Features

- Rate limiting (5 requests per minute per IP)
- File size limits (50MB max)
- File count limits (100 emails per ZIP)
- No data storage
- No third-party processing

## License

MIT License - See LICENSE file for details

## Built By

[3 Degrees North Pty Ltd](https://3degreesnorth.com.au)
