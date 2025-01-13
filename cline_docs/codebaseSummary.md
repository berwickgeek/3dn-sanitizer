## Key Components

1. Upload Interface

   - Handles file upload and validation
   - Implements size and type restrictions
   - Provides progress feedback to users

2. File Processing Service

   - Manages ZIP file extraction
   - Coordinates processing flow
   - Handles cleanup of temporary files

3. Email Parser Service

   - Unified interface for EML and MSG parsing
   - Extracts relevant content from email files
   - Manages attachment filtering

4. Content Extractor Service

   - Removes HTML formatting
   - Strips email signatures
   - Handles conversation threads
   - Converts to plain text

5. PII Sanitization Service

   - Pattern matching engine
   - Context analysis system
   - Token analysis
   - Replacement management

6. Response Formatter
   - Structures sanitized content
   - Generates statistics
   - Formats JSON response

## Data Flow

1. Client Upload

   - Client sends ZIP file to /api/process endpoint
   - System validates file size and type
   - Progress indicators provide feedback

2. File Processing

   - ZIP file is streamed and extracted
   - Email files are identified and validated
   - Invalid files are rejected

3. Content Processing

   - Emails are parsed based on type (EML/MSG)
   - Content is extracted and normalized
   - HTML is converted to plain text
   - Signatures and attachments are removed

4. Sanitization

   - Content passes through pattern matching
   - Context analysis refines matches
   - Token analysis provides additional verification
   - PII is replaced with placeholders

5. Response Generation
   - Sanitized content is collected
   - Statistics are calculated
   - JSON response is formatted and returned

## Error Handling

1. Input Validation

   - ZIP file size checks
   - File count validation
   - File type verification

2. Processing Errors

   - Corrupted file handling
   - Timeout management
   - Memory overflow protection

3. System Errors
   - Service availability checks
   - Resource management
   - Rate limiting enforcement

## External Dependencies

- None (Stateless processing)

## Recent Significant Changes

- [2024-01-17] Initial project structure defined
- [2024-01-17] Technical specification completed

## Development Guidelines

1. Code Organization

   - Modular component structure
   - Clear separation of concerns
   - TypeScript interfaces for all components

2. Error Management

   - Consistent error response format
   - Detailed error logging
   - User-friendly error messages

3. Performance Optimization

   - Stream processing for large files
   - Memory usage monitoring
   - Processing time tracking

4. Testing Strategy
   - Unit tests for each component
   - Integration tests for workflows
   - Performance benchmarking
