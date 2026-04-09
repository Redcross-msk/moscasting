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
    case "m4v":
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

type ResolvedFile = { fullPath: string; size: number; ext: string };

async function resolveUploadFile(rel: string): Promise<ResolvedFile | null> {
  if (!rel || rel.includes("..")) return null;
  const first = rel.split("/")[0] ?? "";
  if (!allowedTopSegment(first)) return null;

  const resolvedRoot = path.resolve(PUBLIC_UPLOADS_DIR);
  const fullPath = path.resolve(path.join(PUBLIC_UPLOADS_DIR, rel));
  if (!fullPath.startsWith(resolvedRoot + path.sep) && fullPath !== resolvedRoot) {
    return null;
  }

  try {
    const s = await stat(fullPath);
    if (!s.isFile()) return null;
    const ext = path.extname(fullPath).replace(/^\./, "");
    return { fullPath, size: s.size, ext };
  } catch {
    return null;
  }
}

/** Парсит один диапазон из заголовка Range (видео на iOS/Android без 206 часто не воспроизводится). */
function parseFirstByteRange(
  rangeHeader: string | null,
  size: number,
): { start: number; end: number } | "unsatisfiable" | null {
  if (!rangeHeader || !rangeHeader.toLowerCase().startsWith("bytes=")) return null;
  const rangeSpec = rangeHeader.slice(6).split(",")[0]?.trim() ?? "";
  const dash = rangeSpec.indexOf("-");
  if (dash < 0) return null;
  const startStr = rangeSpec.slice(0, dash);
  const endStr = rangeSpec.slice(dash + 1);

  if (startStr === "" && endStr !== "") {
    const suffixLen = parseInt(endStr, 10);
    if (Number.isNaN(suffixLen) || suffixLen <= 0) return "unsatisfiable";
    if (suffixLen >= size) return { start: 0, end: size - 1 };
    return { start: size - suffixLen, end: size - 1 };
  }
  if (startStr !== "" && endStr === "") {
    const start = parseInt(startStr, 10);
    if (Number.isNaN(start) || start < 0 || start >= size) return "unsatisfiable";
    return { start, end: size - 1 };
  }
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start > end || start >= size) {
    return "unsatisfiable";
  }
  return { start, end: Math.min(end, size - 1) };
}

const cacheHeaders = {
  "Cache-Control": "public, max-age=31536000, immutable",
} as const;

export async function HEAD(
  _request: Request,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return new NextResponse(null, { status: 404 });
  }
  const rel = segments.join("/").replace(/\\/g, "/");
  const file = await resolveUploadFile(rel);
  if (!file) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": contentTypeForExt(file.ext),
      "Content-Length": String(file.size),
      "Accept-Ranges": "bytes",
      ...cacheHeaders,
    },
  });
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return new NextResponse(null, { status: 404 });
  }

  const rel = segments.join("/").replace(/\\/g, "/");
  const file = await resolveUploadFile(rel);
  if (!file) {
    return new NextResponse(null, { status: 404 });
  }

  const { fullPath, size, ext } = file;
  const contentType = contentTypeForExt(ext);
  const rangeRaw = request.headers.get("range");
  const parsed = parseFirstByteRange(rangeRaw, size);

  if (parsed === "unsatisfiable") {
    return new NextResponse(null, {
      status: 416,
      headers: {
        "Content-Range": `bytes */${size}`,
        ...cacheHeaders,
      },
    });
  }

  if (parsed) {
    const { start, end } = parsed;
    const chunkLength = end - start + 1;
    const stream = createReadStream(fullPath, { start, end });
    const web = Readable.toWeb(stream) as unknown as ReadableStream;
    return new NextResponse(web, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(chunkLength),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        ...cacheHeaders,
      },
    });
  }

  const stream = createReadStream(fullPath);
  const web = Readable.toWeb(stream) as unknown as ReadableStream;
  return new NextResponse(web, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Accept-Ranges": "bytes",
      ...cacheHeaders,
    },
  });
}
