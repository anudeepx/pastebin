import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getPaste, incrementViewCount, deletePaste } from "@/lib/kv";
import { getCurrentTime, isPasteAvailable } from "@/lib/utils";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default async function ViewPaste({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  const headersList = await headers();
  const currentTime = getCurrentTime(headersList);

  // Check if paste is available before incrementing view
  if (!isPasteAvailable(paste, currentTime)) {
    await deletePaste(id);
    notFound();
  }

  // Increment view count (this view counts as a view)
  const updatedPaste = await incrementViewCount(id);

  if (!updatedPaste) {
    notFound();
  }

  // Check again after incrementing (in case view limit was just reached)
  if (!isPasteAvailable(updatedPaste, currentTime)) {
    await deletePaste(id);
    notFound();
  }

  // Escape HTML to prevent XSS
  const escapedContent = escapeHtml(updatedPaste.content);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Paste Content
          </h1>
          <Link
            href="/"
            className="inline-flex mt-4 items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Create a new paste 📋
          </Link> 
        </div>

        {/* Paste Card */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {/* Metadata */}
          {(updatedPaste.max_views !== null || updatedPaste.expires_at) && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
                {updatedPaste.max_views !== null && (
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="font-medium">
                      {updatedPaste.view_count} / {updatedPaste.max_views} views
                    </span>
                  </div>
                )}
                {updatedPaste.expires_at && (
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      Expires:{" "}
                      {new Date(updatedPaste.expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="bg-gray-900 rounded-lg p-4 sm:p-6 overflow-x-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-100 font-mono leading-relaxed">
                {escapedContent}
              </pre>
            </div>
          </div>
          <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
          > 
              Copy link 📋
            </button>
        </div>
      </div>
    </div>
  );
}
