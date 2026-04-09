import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { PUBLIC_UPLOADS_DIR } from "@/server/uploads/public-uploads-root";

export const runtime = "nodejs";

function allowedTopSegment(seg: string): boolean {
  return seg === "actor" || seg === "producer" || seg === "chat";
}

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return new NextResponse(null, { status: 404 });
  }

  const rel = segments.join("/").replace(/\\/g, "/");
  if (!rel || rel.includes("..")) {
    return new NextResponse(null, { status: 404 });
  }

  const first = rel.split("/")[0] ?? "";
  if (!allowedTopSegment(first)) {
    return new NextResponse(null, { status: 404 });
  }

  const resolvedRoot = path.resolve(PUBLIC_UPLOADS_DIR);
  const fullPath = path.resolve(path.join(PUBLIC_UPLOADS_DIR, rel));
  if (!fullPath.startsWith(resolvedRoot + path.sep) && fullPath !== resolvedRoot) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const s = await stat(fullPath);
    if (!s.isFile()) {
      return new NextResponse(null, { status: 404 });
    }
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const ext = path.extname(fullPath).replace(/^\./, "");
  const stream = createReadStream(fullPath);
  const web = Readable.toWeb(stream) as unknown as ReadableStream;

  return new NextResponse(web, {
    status: 200,
    headers: {
      "Content-Type": contentTypeForExt(ext),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
