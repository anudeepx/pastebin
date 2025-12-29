import { NextRequest, NextResponse } from "next/server";
import { getPaste, incrementViewCount, deletePaste } from "@/lib/kv";
import { getCurrentTime, isPasteAvailable } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const paste = await getPaste(id);

  if (!paste) {
    return NextResponse.json({ error: "Paste not found" }, { status: 404 });
  }

  const currentTime = getCurrentTime(request.headers);

  // Check if paste is available before incrementing view
  if (!isPasteAvailable(paste, currentTime)) {
    await deletePaste(id);
    return NextResponse.json({ error: "Paste not found" }, { status: 404 });
  }

  // Increment view count atomically and get updated paste
  const updatedPaste = await incrementViewCount(id);
  
  if (!updatedPaste) {
    return NextResponse.json({ error: "Paste not found" }, { status: 404 });
  }

  // Check again after incrementing (in case view limit was just reached)
  if (!isPasteAvailable(updatedPaste, currentTime)) {
    await deletePaste(id);
    return NextResponse.json({ error: "Paste not found" }, { status: 404 });
  }

  // Calculate remaining views - ensure no negative values
  const remaining_views =
    updatedPaste.max_views !== null
      ? Math.max(0, updatedPaste.max_views - updatedPaste.view_count)
      : null;

  return NextResponse.json(
    {
      content: updatedPaste.content,
      remaining_views,
      expires_at: updatedPaste.expires_at
        ? new Date(updatedPaste.expires_at).toISOString()
        : null,
    },
    { status: 200 }
  );
}
