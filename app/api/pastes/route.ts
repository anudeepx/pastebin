import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { savePaste, type Paste } from "@/lib/kv";
import { getCurrentTime } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate content
    if (
      !body.content ||
      typeof body.content !== "string" ||
      body.content.trim() === ""
    ) {
      return NextResponse.json(
        { error: "content is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate ttl_seconds
    if (body.ttl_seconds !== undefined) {
      if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
        return NextResponse.json(
          { error: "ttl_seconds must be an integer >= 1" },
          { status: 400 }
        );
      }
    }

    // Validate max_views
    if (body.max_views !== undefined) {
      if (!Number.isInteger(body.max_views) || body.max_views < 1) {
        return NextResponse.json(
          { error: "max_views must be an integer >= 1" },
          { status: 400 }
        );
      }
    }

    const id = nanoid(10);
    const currentTime = getCurrentTime(request.headers);

    const paste: Paste = {
      id,
      content: body.content,
      created_at: currentTime,
      expires_at: body.ttl_seconds
        ? currentTime + body.ttl_seconds * 1000
        : null,
      max_views: body.max_views ?? null,
      view_count: 0,
    };

    await savePaste(paste);

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : request.nextUrl.origin;

    return NextResponse.json(
      {
        id,
        url: `${baseUrl}/p/${id}`,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
