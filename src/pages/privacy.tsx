import type { NextPage } from "next";

const Privacy: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Privacy & Data Management
        </h1>

        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              How It Works
            </h2>
            <div className="prose prose-gray">
              <p>
                The Email Content Sanitizer processes your email exports to
                remove personally identifiable information (PII) while
                preserving the meaningful content for analysis.
              </p>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Data Processing
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Stateless Processing
                </h3>
                <p className="text-gray-600">
                  All processing is done in memory. No data is ever stored on
                  our servers or written to disk. Once processing is complete,
                  all temporary files are immediately deleted.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  File Handling
                </h3>
                <p className="text-gray-600">
                  Files are processed in chunks using stream processing. Large
                  files are never fully loaded into memory. ZIP files are
                  extracted on-the-fly, and each email is processed
                  individually.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Data Security
                </h3>
                <p className="text-gray-600">
                  All processing happens server-side in a secure environment. No
                  data is sent to third-party services. The application runs on
                  isolated serverless functions with strict security policies.
                </p>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Information Removal
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Pattern Matching
                </h3>
                <p className="text-gray-600">
                  Advanced pattern matching identifies personal information like
                  names, email addresses, phone numbers, and addresses. Context
                  analysis ensures accurate detection while minimizing false
                  positives.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Australian Context
                </h3>
                <p className="text-gray-600">
                  Specialized patterns detect Australian-specific information
                  like ABNs, ACNs, Medicare numbers, and local address formats.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Token Analysis
                </h3>
                <p className="text-gray-600">
                  Smart token analysis examines individual words and phrases to
                  identify potential PII that might not match standard patterns.
                  This helps catch variations in how information might be
                  written.
                </p>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Data Retention
            </h2>
            <div className="prose prose-gray">
              <ul className="list-disc pl-5 space-y-2">
                <li>No data is stored after processing is complete</li>
                <li>Temporary files are immediately deleted</li>
                <li>No logs contain personal information</li>
                <li>No analytics or tracking is used</li>
              </ul>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Technical Safeguards
            </h2>
            <div className="prose prose-gray">
              <ul className="list-disc pl-5 space-y-2">
                <li>Rate limiting prevents abuse</li>
                <li>File size limits ensure safe processing</li>
                <li>Memory usage is strictly controlled</li>
                <li>Processing timeouts prevent hanging operations</li>
                <li>Error handling preserves privacy even during failures</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
