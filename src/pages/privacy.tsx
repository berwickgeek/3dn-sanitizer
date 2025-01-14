import type { NextPage } from "next";

const Privacy: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-8">
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
                    Files are processed using temporary storage that is
                    automatically cleaned up. ZIP files are extracted to a
                    temporary directory which is deleted immediately after
                    processing. No data is permanently stored.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700">
                    File Handling
                  </h3>
                  <p className="text-gray-600">
                    Files are processed using streaming where possible. ZIP
                    files are processed entry by entry, and each email is
                    handled individually. File size is limited to 50MB and a
                    maximum of 100 email files per ZIP to ensure safe
                    processing.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Data Security
                  </h3>
                  <p className="text-gray-600">
                    All processing happens server-side in a secure environment.
                    No data is sent to third-party services. The application
                    runs on isolated serverless functions with strict security
                    policies.
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
                    Advanced pattern matching identifies personal information
                    like names, email addresses, phone numbers, and addresses.
                    Context analysis ensures accurate detection while minimizing
                    false positives.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Australian Context
                  </h3>
                  <p className="text-gray-600">
                    Specialized patterns detect Australian-specific information
                    like ABNs, ACNs, Medicare numbers, and local address
                    formats.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Token Analysis
                  </h3>
                  <p className="text-gray-600">
                    Smart token analysis examines individual words and phrases
                    to identify potential PII that might not match standard
                    patterns. This helps catch variations in how information
                    might be written.
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

            <section className="card p-6 bg-blue-50">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Important Notice
              </h2>
              <div className="prose prose-gray">
                <p className="font-medium">
                  No data is sent to any AI or machine learning services for
                  processing. All pattern matching and analysis is done using
                  predefined rules and algorithms running locally on our
                  servers.
                </p>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Limitations
              </h2>
              <div className="prose prose-gray">
                <p>
                  While our system is designed to be thorough, it has certain
                  limitations you should be aware of:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>
                    Not all names or email addresses may be detected, especially
                    those with unusual formats or spellings
                  </li>
                  <li>
                    Context-based detection may miss or incorrectly identify
                    some personal information
                  </li>
                  <li>
                    Some legitimate business terms might be mistakenly
                    identified as personal information
                  </li>
                  <li>
                    Complex or nested content structures may affect detection
                    accuracy
                  </li>
                </ul>
                <p className="mt-4">
                  Always review the sanitized output before using it to ensure
                  it meets your privacy requirements.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <footer className="py-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <a
            href="https://3degreesnorth.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800"
          >
            Built by 3 Degrees North Pty Ltd
          </a>
          <div className="space-x-4">
            <a href="/terms" className="text-gray-600 hover:text-gray-800">
              Terms & Conditions
            </a>
            <a
              href="https://github.com/berwickgeek/3dn-sanitizer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
