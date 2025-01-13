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

   - Advanced pattern matching engine
   - Context-aware analysis system
   - Token-based analysis
   - Smart replacement management
   - Australian-specific patterns

6. Response Formatter
   - Structures sanitized content
   - Generates detailed statistics
   - Formats JSON response with metadata

## Data Flow

1. Client Upload

   - Client sends ZIP file to /api/process endpoint
   - System validates file size and type
   - Progress indicators provide feedback

2. File Processing

   - ZIP file is streamed and extracted
   - Email files (EML/MSG) are identified
   - Invalid files are rejected

3. Content Processing

   - Unified parser handles EML and MSG formats
   - Content is extracted and normalized
   - HTML is converted to plain text
   - Signatures and attachments are removed

4. Sanitization

   - Multi-layer pattern matching
   - Context analysis for improved accuracy
   - Token analysis for better PII detection
   - Smart replacement with categorized tokens

5. Response Generation
   - Sanitized content is collected
   - Comprehensive statistics are calculated
   - Detailed JSON response with metadata

## Error Handling

1. Input Validation

   - ZIP file size checks
   - File count validation
   - File type verification (EML/MSG)

2. Processing Errors

   - Corrupted file handling
   - Timeout management
   - Memory overflow protection

3. System Errors
   - Service availability checks
   - Resource management
   - Rate limiting enforcement

## External Dependencies

- node-stream-zip for ZIP handling
- mailparser for EML parsing
- @kenjiuno/msgreader for MSG files
- Jest for testing

## Recent Significant Changes

- [2024-01-17] Added MSG file support
- [2024-01-17] Enhanced pattern matching with context analysis
- [2024-01-17] Added token-based analysis
- [2024-01-17] Implemented comprehensive testing

## Development Guidelines

1. Code Organization

   - Modular component structure
   - Clear separation of concerns
   - TypeScript interfaces for all components
   - Comprehensive test coverage

2. Error Management

   - Consistent error response format
   - Detailed error logging
   - User-friendly error messages

3. Performance Optimization

   - Stream processing for large files
   - Memory usage monitoring
   - Processing time tracking

4. Testing Strategy
   - Unit tests for pattern matching
   - Integration tests for workflows
   - Performance benchmarking
   - Coverage monitoring
