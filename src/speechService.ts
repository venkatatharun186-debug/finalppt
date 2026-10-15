// Speech-to-Text and Text-to-Speech service for Drishti

export class SpeechRecognizer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  public isSupported: boolean = false;
  public isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.recognition = new (SpeechRecognition as any)();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.isSupported = true;
      }
    }
  }

  start(
    langCode: string,
    onResult: (data: { transcript: string; isFinal: boolean }) => void,
    onError: (err: unknown) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported in this browser'));
      return;
    }

    try {
      this.recognition.lang = langCode || 'en-US';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        onResult({
          transcript: final || interim,
          isFinal: Boolean(final)
        });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      onError(err);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}

let activeAudioElement: HTMLAudioElement | null = null;

export async function speakText(
  text: string,
  options: {
    voiceName?: string;
    languageCode?: string;
    speechLang?: string;
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  stopSpeaking();

  if (!text || !text.trim()) {
    options.onEnd?.();
    return;
  }

  options.onStart?.();

  // 1. Try server Gemini TTS first for natural AI voice
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceName: options.voiceName || 'Zephyr',
        language: options.languageCode || 'en'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        activeAudioElement = audio;

        audio.onended = () => {
          activeAudioElement = null;
          options.onEnd?.();
        };

        audio.onerror = () => {
          activeAudioElement = null;
          speakWithBrowser(text, options.speechLang || 'en-US', options.onEnd);
        };

        await audio.play();
        return;
      }
    }
  } catch {
    // fallback to browser Web Speech API
  }

  // 2. Fallback to Browser SpeechSynthesis
  speakWithBrowser(text, options.speechLang || 'en-US', options.onEnd);
}

function speakWithBrowser(text: string, lang: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };
  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
