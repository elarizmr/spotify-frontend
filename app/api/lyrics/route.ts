export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const songId = searchParams.get('songId') ?? '';

  try {
    const res = await fetch(`${API_URL}/api/songs/${songId}`);
    const data = await res.json();
    return Response.json({ lyrics: data.song?.lyrics || 'Lyrics not found' });
  } catch {
    return Response.json({ lyrics: 'Lyrics not found' }, { status: 200 });
  }
}
import { API_URL } from "@/lib/config";
