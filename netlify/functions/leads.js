// Reads and writes the whole pipeline to Netlify Blobs.
// GET  -> returns the current data object
// POST -> replaces it with the body
import { getStore } from "@netlify/blobs";

const KEY = "pipeline";

export default async (req) => {
  const store = getStore("ipb-pipeline");

  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json" });
    return Response.json(data || null);
  }

  if (req.method === "POST") {
    const body = await req.json();
    await store.setJSON(KEY, body);
    // Rolling daily backup so a bad write is never fatal.
    const stamp = new Date().toISOString().slice(0, 10);
    await store.setJSON("backup-" + stamp, body);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};
