import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Thiếu nội dung văn bản" }, { status: 400 });
    }

    // Clean text: strip markdown characters
    const cleanText = text
      .replace(/[*#_`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    // Google Translate TTS accepts max 200 chars per query. If longer, we split into chunks
    const chunks: string[] = [];
    const sentences = cleanText.split(/(?<=[.?!,;\n])\s+/);
    let current = "";

    for (const sentence of sentences) {
      if ((current + " " + sentence).length < 180) {
        current = current ? current + " " + sentence : sentence;
      } else {
        if (current) chunks.push(current);
        if (sentence.length > 180) {
          // split long sentence by words
          const words = sentence.split(" ");
          let wChunk = "";
          for (const w of words) {
            if ((wChunk + " " + w).length < 180) {
              wChunk = wChunk ? wChunk + " " + w : w;
            } else {
              if (wChunk) chunks.push(wChunk);
              wChunk = w;
            }
          }
          if (wChunk) current = wChunk;
        } else {
          current = sentence;
        }
      }
    }
    if (current) chunks.push(current);

    // If single chunk or small
    if (chunks.length <= 1) {
      const targetChunk = chunks[0] || cleanText.slice(0, 180);
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        targetChunk
      )}&tl=vi&client=tw-ob`;

      const audioRes = await fetch(googleTtsUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!audioRes.ok) {
        return NextResponse.json({ error: "TTS provider error" }, { status: 502 });
      }

      const audioBuffer = await audioRes.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Multiple chunks: fetch all and concatenate audio buffers
    const buffers: ArrayBuffer[] = [];
    for (const chunk of chunks.slice(0, 15)) {
      // limit max 15 chunks
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=vi&client=tw-ob`;

      const audioRes = await fetch(googleTtsUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (audioRes.ok) {
        const buf = await audioRes.arrayBuffer();
        buffers.push(buf);
      }
    }

    if (buffers.length === 0) {
      return NextResponse.json({ error: "TTS fetch failed" }, { status: 502 });
    }

    // Combine all ArrayBuffers
    const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of buffers) {
      combined.set(new Uint8Array(b), offset);
      offset += b.byteLength;
    }

    return new NextResponse(combined.buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "Lỗi tạo giọng đọc" }, { status: 500 });
  }
}
