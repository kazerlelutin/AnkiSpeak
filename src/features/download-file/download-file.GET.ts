import type { BunRequest } from "bun";
import path from "path";

export async function downloadFile(req: BunRequest) {
  const { filename } = req.params as { filename: string };
  if (!filename) {
    return new Response("Filename is required", { status: 400 });
  }
  const filePath = path.resolve('data', 'csv', filename);
  const file = Bun.file(filePath);
  const exists = await file.exists();
  if (exists) {
    const fileBuffer = await file.arrayBuffer();
    Bun.file(filePath).delete();
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }
}