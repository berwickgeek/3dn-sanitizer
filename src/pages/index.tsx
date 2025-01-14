import { useState, useCallback } from "react";
import type { NextPage } from "next";
import { useDropzone } from "react-dropzone";

const Home: NextPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      setError("Please upload a ZIP file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/process", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error.message));
            } catch {
              reject(new Error("An error occurred while processing the file"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Email Content Sanitizer
        </h1>
        <p className="text-center mb-8">
          <a href="/privacy" className="text-blue-600 hover:text-blue-800">
            Privacy & Data Management
          </a>
        </p>

        <div className="card p-8">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? "dropzone-active" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-5xl text-gray-400">📥</div>
              <p className="text-lg text-gray-600">
                {isDragActive
                  ? "Drop the ZIP file here..."
                  : "Drag & drop a ZIP file here, or click to select"}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Maximum size: 50MB, up to 100 email files (.eml, .msg)
                </p>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-2">How to use:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Open Outlook and go to your Sent folder</li>
                    <li>
                      Select and drag up to 100 messages to a folder on your
                      desktop
                    </li>
                    <li>Compress (zip) the folder</li>
                    <li>Upload the ZIP file here</li>
                    <li>
                      Use the Export JSON button to get the sanitized email
                      content
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Processing... {uploadProgress}%
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    // Only export the text content from each file
                    const textOnly = result.content.map(
                      (item: { text: string }) => item.text
                    );
                    const blob = new Blob([JSON.stringify(textOnly, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "sanitized-content.json";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="btn btn-primary"
                >
                  Export JSON
                </button>
                <a
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Privacy & Data Management
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                  <p className="text-sm text-gray-500">Files Processed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {result.stats.total_files_processed}
                  </p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-sm text-gray-500">Items Sanitized</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {result.stats.total_sanitized_items}
                  </p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-sm text-gray-500">Processing Time</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(result.stats.processing_time_ms / 1000).toFixed(2)}s
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {result.content.map((item: any, index: number) => (
                  <div key={index} className="card p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">File</p>
                        <p className="font-medium text-gray-900">
                          {item.metadata.file_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">
                          {item.metadata.file_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sanitized Items</p>
                        <p className="font-medium text-gray-900">
                          {item.metadata.sanitized_items}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Word Count</p>
                        <p className="font-medium text-gray-900">
                          {item.word_count}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="mt-8 py-4 border-t border-gray-200">
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

export default Home;
