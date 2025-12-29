import { notFound } from "next/navigation";
import { headers } from "next/headers";
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Paste Content</h1>

          <div className="mb-4 flex gap-4 text-sm text-gray-600">
            {updatedPaste.max_views !== null && (
              <span>
                Views: {updatedPaste.view_count} / {updatedPaste.max_views}
              </span>
            )}
            {updatedPaste.expires_at && (
              <span>
                Expires: {new Date(updatedPaste.expires_at).toLocaleString()}
              </span>
            )}
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap wrap-break-word">
              {escapedContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
