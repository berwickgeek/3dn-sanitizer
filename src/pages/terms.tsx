import type { NextPage } from "next";

const Terms: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Terms and Conditions
          </h1>

          <div className="space-y-8">
            <section className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Free Service
              </h2>
              <div className="prose prose-gray">
                <p>
                  The Email Content Sanitizer is provided as a free service.
                  There is no charge for using this tool, and no warranty or
                  guarantee of service availability.
                </p>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Disclaimer
              </h2>
              <div className="prose prose-gray">
                <p>
                  This tool is provided "as is" without any warranties of any
                  kind, either express or implied. 3 Degrees North Pty Ltd makes
                  no representations or warranties about the accuracy,
                  completeness, or reliability of the service or its results.
                </p>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Liability
              </h2>
              <div className="prose prose-gray">
                <p>
                  In no event shall 3 Degrees North Pty Ltd be liable for any
                  direct, indirect, incidental, special, consequential, or
                  exemplary damages, including but not limited to:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>Loss of data or information</li>
                  <li>Loss of profits or business opportunities</li>
                  <li>Business interruption</li>
                  <li>Any other commercial damages or losses</li>
                </ul>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Use at Your Own Risk
              </h2>
              <div className="prose prose-gray">
                <p>By using this service, you acknowledge and agree that:</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>
                    You are using the service voluntarily and at your own risk
                  </li>
                  <li>
                    You are responsible for verifying the results and their
                    suitability for your purposes
                  </li>
                  <li>
                    No guarantees are made about the completeness of PII removal
                  </li>
                  <li>
                    You will not rely on this service as your sole means of
                    protecting sensitive information
                  </li>
                </ul>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Service Availability
              </h2>
              <div className="prose prose-gray">
                <p>We reserve the right to:</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>Modify or discontinue the service at any time</li>
                  <li>Change these terms and conditions without notice</li>
                  <li>Limit or restrict service usage</li>
                  <li>Deny service to anyone for any reason</li>
                </ul>
              </div>
            </section>

            <section className="card p-6 bg-blue-50">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Important Notice
              </h2>
              <div className="prose prose-gray">
                <p className="font-medium">
                  This tool is not intended to be a complete solution for
                  protecting sensitive information. It should be used as part of
                  a broader approach to data privacy and security. Always review
                  sanitized content before sharing it.
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
          <a
            href="https://github.com/berwickgeek/3dn-sanitizer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800"
          >
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
