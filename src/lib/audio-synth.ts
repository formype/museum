// Web Audio API ambient sound generator & Dual Engine (Natural Vietnamese Female AI Voice + Browser Web Speech Synthesis)

class SpaceAudioManager {
  private synthVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private audioCtx: AudioContext | null = null;
  private isAmbientPlaying = false;
  private useOnlineAiVoice = true;
  private activeSessionId = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.initVoice();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  // Prioritize authentic female Vietnamese voices
  private initVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();

    const femaleVi = voices.find(
      (v) =>
        (v.lang.startsWith("vi") || v.lang.includes("VI")) &&
        (v.name.toLowerCase().includes("hoaimy") ||
          v.name.toLowerCase().includes("linh") ||
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("nu") ||
          v.name.toLowerCase().includes("google tiếng việt") ||
          v.name.toLowerCase().includes("natural"))
    );

    const anyVi = voices.find((v) => v.lang.startsWith("vi") || v.lang.includes("VI"));
    this.synthVoice = femaleVi || anyVi || null;
  }

  public setUseOnlineVoice(enabled: boolean) {
    this.useOnlineAiVoice = enabled;
  }

  public isOnlineVoiceEnabled(): boolean {
    return this.useOnlineAiVoice;
  }

  public startAmbientSound() {
    this.isAmbientPlaying = false;
  }

  public stopAmbientSound() {
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.isAmbientPlaying = false;
  }

  // High-fidelity Speech Synthesis with Natural Vietnamese Female Voice (vi-VN-HoaiMyNeural)
  public async speakNarration(
    text: string,
    onProgress?: (progressSec: number) => void,
    onEnd?: () => void
  ) {
    if (typeof window === "undefined") {
      if (onEnd) onEnd();
      return;
    }

    // Stop and invalidate previous session
    this.stopSpeech();
    const sessionId = ++this.activeSessionId;

    const cleanText = text
      .replace(/[*#_`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // Always prioritize the Natural Vietnamese Female AI Voice (vi-VN-HoaiMyNeural)
    if (this.useOnlineAiVoice) {
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            voice: "vi-VN-HoaiMyNeural",
          }),
        });

        if (this.activeSessionId !== sessionId) return;

        if (response.ok) {
          const blob = await response.blob();
          if (this.activeSessionId !== sessionId) return;

          const blobUrl = URL.createObjectURL(blob);
          this.currentBlobUrl = blobUrl;
          const audio = new Audio(blobUrl);
          this.currentAudioElement = audio;

          audio.ontimeupdate = () => {
            if (this.activeSessionId !== sessionId) return;
            if (onProgress && audio.currentTime) {
              onProgress(audio.currentTime);
            }
          };

          audio.onended = () => {
            if (this.activeSessionId !== sessionId) return;
            this.currentAudioElement = null;
            if (this.currentBlobUrl) {
              URL.revokeObjectURL(this.currentBlobUrl);
              this.currentBlobUrl = null;
            }
            if (onEnd) onEnd();
          };

          audio.onerror = () => {
            if (this.activeSessionId !== sessionId) return;
            console.warn("Audio playback failed, attempting web speech fallback");
            this.speakWithWebSpeech(cleanText, onProgress, onEnd, sessionId);
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise.catch((err) => {
              if (this.activeSessionId !== sessionId) return;
              console.warn("Autoplay blocked or play error:", err);
              this.speakWithWebSpeech(cleanText, onProgress, onEnd, sessionId);
            });
          }
          return;
        }
      } catch (err) {
        if (this.activeSessionId !== sessionId) return;
        console.warn("Online TTS request error:", err);
      }
    }

    // Fallback directly to Web Speech API
    this.speakWithWebSpeech(cleanText, onProgress, onEnd, sessionId);
  }

  private speakWithWebSpeech(
    cleanText: string,
    onProgress?: (progressSec: number) => void,
    onEnd?: () => void,
    sessionId?: number
  ) {
    if (!("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    const currentSid = sessionId ?? this.activeSessionId;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.synthVoice) {
      utterance.voice = this.synthVoice;
    }
    utterance.lang = "vi-VN";
    utterance.rate = 0.94;
    utterance.pitch = 1.08;

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (this.activeSessionId !== currentSid) {
        clearInterval(interval);
        return;
      }
      if (window.speechSynthesis.speaking) {
        const elapsed = (Date.now() - startTime) / 1000;
        if (onProgress) onProgress(elapsed);
      } else {
        clearInterval(interval);
      }
    }, 200);

    utterance.onend = () => {
      clearInterval(interval);
      if (this.activeSessionId !== currentSid) return;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      clearInterval(interval);
      if (this.activeSessionId !== currentSid) return;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech() {
    // Invalidate active session so pending events/callbacks are discarded
    this.activeSessionId++;

    if (this.currentAudioElement) {
      this.currentAudioElement.onended = null;
      this.currentAudioElement.onerror = null;
      this.currentAudioElement.ontimeupdate = null;
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = "";
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (this.currentBlobUrl) {
      try {
        URL.revokeObjectURL(this.currentBlobUrl);
      } catch {
        // ignore
      }
      this.currentBlobUrl = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (this.currentUtterance) {
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
      }
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      this.currentUtterance = null;
    }
  }

  public pauseSpeech() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
  }

  public resumeSpeech() {
    if (this.currentAudioElement) {
      this.currentAudioElement.play().catch(() => {});
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
    }
  }

  public playWarpSound() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Ignored if user hasn't interacted
    }
  }
}

export const spaceAudio = new SpaceAudioManager();
