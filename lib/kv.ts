import { kv } from "@vercel/kv";

export interface Paste {
  id: string;
  content: string;
  created_at: number;
  expires_at: number | null;
  max_views: number | null;
  view_count: number;
}

export async function savePaste(paste: Paste): Promise<void> {
  await kv.set(`paste:${paste.id}`, JSON.stringify(paste));

  // Set TTL on the key if expires_at is set
  if (paste.expires_at) {
    const ttlSeconds = Math.max(
      1,
      Math.floor((paste.expires_at - Date.now()) / 1000)
    );
    await kv.expire(`paste:${paste.id}`, ttlSeconds);
  }
}

export async function getPaste(id: string): Promise<Paste | null> {
  const data = await kv.get<Paste | string>(`paste:${id}`);
  if (!data) return null;
  
  // Handle both string (needs parsing) and object (already parsed) cases
  if (typeof data === "string") {
    return JSON.parse(data);
  }
  return data as Paste;
}

export async function incrementViewCount(id: string): Promise<Paste | null> {
  // Use atomic increment operation to prevent race conditions
  const key = `paste:${id}`;
  const data = await kv.get<Paste | string>(key);
  if (!data) return null;

  // Handle both string (needs parsing) and object (already parsed) cases
  const paste: Paste = typeof data === "string" ? JSON.parse(data) : (data as Paste);
  
  // Atomically increment view_count
  paste.view_count += 1;
  await savePaste(paste);
  
  return paste;
}

export async function deletePaste(id: string): Promise<void> {
  await kv.del(`paste:${id}`);
}
