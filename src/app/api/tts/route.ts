import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.join(process.cwd(), ".cache", "tts");
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const voice = searchParams.get("voice") || "vi-VN-HoaiMyNeural";

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Thiếu nội dung văn bản" }, { status: 400 });
    }

    // Clean text: strip markdown characters, brackets, multiple whitespaces
    const cleanText = text
      .replace(/[*#_`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: "Nội dung văn bản rỗng" }, { status: 400 });
    }

    // Check disk cache first
    const cacheKey = crypto
      .createHash("md5")
      .update(`${voice}:${cleanText}`)
      .digest("hex");
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    if (fs.existsSync(cachePath)) {
      const cachedBuffer = fs.readFileSync(cachePath);
      return new NextResponse(new Uint8Array(cachedBuffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-TTS-Cache": "HIT",
        },
      });
    }

    // Generate natural Vietnamese speech with Microsoft Edge TTS (vi-VN-HoaiMyNeural)
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const proc = spawn("edge-tts", [
        "--voice",
        voice,
        "--text",
        cleanText,
        "--write-media",
        cachePath,
      ]);

      const errChunks: Buffer[] = [];
      proc.stderr.on("data", (chunk: Buffer) => errChunks.push(chunk));
      proc.on("error", (err) => reject(err));

      proc.on("close", (code) => {
        if (code === 0 && fs.existsSync(cachePath)) {
          const buf = fs.readFileSync(cachePath);
          resolve(buf);
        } else {
          const errMsg = Buffer.concat(errChunks).toString("utf-8");
          reject(new Error(`edge-tts exited with code ${code}: ${errMsg}`));
        }
      });
    });

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "Lỗi tạo giọng đọc thuyết minh" }, { status: 500 });
  }
}
