import { useState } from "react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <main>
        <h1>Email Content Sanitizer</h1>

        <div className="upload-section">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            disabled={isUploading}
          />

          {isUploading && <p>Processing...</p>}

          {error && <div className="error">{error}</div>}

          {result && (
            <div className="result">
              <h2>Results</h2>
              <div>
                <strong>Files Processed:</strong>{" "}
                {result.stats.total_files_processed}
              </div>
              <div>
                <strong>Items Sanitized:</strong>{" "}
                {result.stats.total_sanitized_items}
              </div>
              <div>
                <strong>Processing Time:</strong>{" "}
                {result.stats.processing_time_ms}ms
              </div>
              <div className="content">
                {result.content.map((item: any, index: number) => (
                  <div key={index} className="content-item">
                    <div className="metadata">
                      <div>
                        <strong>File:</strong> {item.metadata.file_name}
                      </div>
                      <div>
                        <strong>Type:</strong> {item.metadata.file_type}
                      </div>
                      <div>
                        <strong>Processed:</strong>{" "}
                        {new Date(item.metadata.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <strong>Sanitized Items:</strong>{" "}
                        {item.metadata.sanitized_items}
                      </div>
                      <div>
                        <strong>Word Count:</strong> {item.word_count}
                      </div>
                    </div>
                    <pre className="text">{item.text}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        main {
          width: 100%;
          max-width: 800px;
        }

        h1 {
          margin-bottom: 2rem;
          text-align: center;
        }

        .upload-section {
          padding: 2rem;
          border: 2px dashed #ccc;
          border-radius: 8px;
          text-align: center;
        }

        .error {
          margin-top: 1rem;
          padding: 0.5rem;
          color: red;
          border: 1px solid red;
          border-radius: 4px;
        }

        .result {
          margin-top: 2rem;
          text-align: left;
        }

        .content {
          margin-top: 1rem;
        }

        .content-item {
          margin-top: 1.5rem;
          padding: 1.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .metadata {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .text {
          white-space: pre-wrap;
          word-wrap: break-word;
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          margin-top: 0.5rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default Home;
