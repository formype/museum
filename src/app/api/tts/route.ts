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

// Fallback to Google Vietnamese Female TTS if Edge-TTS has connection/rate-limit issues
async function generateGtts(text: string, outPath: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const pythonCode = `
import sys
from gtts import gTTS

text = sys.stdin.read().strip()
if text:
    tts = gTTS(text=text, lang="vi", slow=False)
    tts.save("${outPath}")
    sys.exit(0)
sys.exit(1)
`;
    const proc = spawn("python3", ["-c", pythonCode]);
    proc.stdin.write(text);
    proc.stdin.end();

    const errChunks: Buffer[] = [];
    proc.stderr.on("data", (chunk: Buffer) => errChunks.push(chunk));
    proc.on("error", (err) => reject(err));

    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 500) {
        const buf = fs.readFileSync(outPath);
        resolve(buf);
      } else {
        const errMsg = Buffer.concat(errChunks).toString("utf-8");
        reject(new Error(`gTTS failed with code ${code}: ${errMsg}`));
      }
    });
  });
}

// Primary Edge-TTS generator
async function generateEdgeTts(text: string, voice: string, outPath: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const proc = spawn("edge-tts", [
      "--voice",
      voice,
      "--text",
      text,
      "--write-media",
      outPath,
    ]);

    const errChunks: Buffer[] = [];
    proc.stderr.on("data", (chunk: Buffer) => errChunks.push(chunk));
    proc.on("error", (err) => reject(err));

    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
        const buf = fs.readFileSync(outPath);
        resolve(buf);
      } else {
        const errMsg = Buffer.concat(errChunks).toString("utf-8");
        reject(new Error(`edge-tts failed with code ${code}: ${errMsg}`));
      }
    });
  });
}

async function handleTtsRequest(text: string | null, voiceParam: string | null) {
  const voice = voiceParam || "vi-VN-HoaiMyNeural";

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
    const stats = fs.statSync(cachePath);
    if (stats.size > 500) {
      const cachedBuffer = fs.readFileSync(cachePath);
      return new NextResponse(new Uint8Array(cachedBuffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-TTS-Cache": "HIT",
        },
      });
    } else {
      try {
        fs.unlinkSync(cachePath);
      } catch {
        // ignore
      }
    }
  }

  // Dual engine: Try Edge-TTS female voice first, seamlessly fallback to Google Vietnamese female voice
  let audioBuffer: Buffer;
  try {
    audioBuffer = await generateEdgeTts(cleanText, voice, cachePath);
  } catch (edgeErr) {
    console.warn("Edge-TTS failed, falling back to Google VN Female TTS:", edgeErr);
    try {
      audioBuffer = await generateGtts(cleanText, cachePath);
    } catch (gttsErr) {
      console.error("Both TTS engines failed:", gttsErr);
      return NextResponse.json({ error: "Lỗi tạo giọng đọc thuyết minh" }, { status: 500 });
    }
  }

  return new NextResponse(new Uint8Array(audioBuffer), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-TTS-Cache": "MISS",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const voice = searchParams.get("voice") || "vi-VN-HoaiMyNeural";
    return await handleTtsRequest(text, voice);
  } catch (error) {
    console.error("TTS GET error:", error);
    return NextResponse.json({ error: "Lỗi tạo giọng đọc thuyết minh" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;
    const voice = body.voice || "vi-VN-HoaiMyNeural";
    return await handleTtsRequest(text, voice);
  } catch (error) {
    console.error("TTS POST error:", error);
    return NextResponse.json({ error: "Lỗi tạo giọng đọc thuyết minh" }, { status: 500 });
  }
}
