"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    // Validate optional fields
    if (ttlSeconds.trim()) {
      const ttl = parseInt(ttlSeconds, 10);
      if (isNaN(ttl) || ttl < 1) {
        setError("TTL must be an integer >= 1");
        return;
      }
    }

    if (maxViews.trim()) {
      const views = parseInt(maxViews, 10);
      if (isNaN(views) || views < 1) {
        setError("Max views must be an integer >= 1");
        return;
      }
    }

    setError("");
    setLoading(true);

    try {
      const body: {
        content: string;
        ttl_seconds?: number;
        max_views?: number;
      } = { content };

      // Parse and add optional fields
      if (ttlSeconds.trim()) {
        body.ttl_seconds = parseInt(ttlSeconds, 10);
      }

      if (maxViews.trim()) {
        body.max_views = parseInt(maxViews, 10);
      }

      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create paste");
        return;
      }

      router.push(`/p/${data.id}`);
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Pastebin-Lite
          </h1>
          <p className="text-gray-600 text-lg">
            Share text quickly and securely
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg transition-all duration-200"
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 sm:p-8 transition-shadow duration-200 hover:shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Content Textarea */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none font-mono text-sm"
                placeholder="Enter your text here..."
                rows={12}
                disabled={loading}
              />
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ttl"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  TTL (seconds)
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    Optional
                  </span>
                </label>
                <input
                  id="ttl"
                  type="number"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="e.g., 3600"
                  min="1"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="maxViews"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Max Views
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    Optional
                  </span>
                </label>
                <input
                  id="maxViews"
                  type="number"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="e.g., 10"
                  min="1"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Paste"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
