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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Pastebin-Lite</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded p-3 h-48"
              placeholder="Enter your text here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                TTL (seconds)
              </label>
              <input
                type="number"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Optional"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Views
              </label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Optional"
                min="1"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </div>
      </div>
    </div>
  );
}
