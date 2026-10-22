// خدمة التنبيه الصوتي باللهجة العربية العامية المصرية عند تسجيل أو استقبال طلب جديد

let preloadedAudio: HTMLAudioElement | null = null;
let lastSpokenAt = 0;

if (typeof window !== 'undefined') {
  try {
    preloadedAudio = new Audio('/api/tts?text=' + encodeURIComponent('تم تسجيل الطلب'));
    preloadedAudio.preload = 'auto';
  } catch {}

  // Pre-load Web Speech API voices if supported
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    } catch {}
  }
}

function speakWithWebSpeech(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Prefer Egyptian Arabic (ar-EG) voice first, then any Arabic voice
    const egyptianVoice =
      voices.find((v) => v.lang.toLowerCase() === 'ar-eg' || v.lang.toLowerCase().includes('ar_eg')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('ar'));

    if (egyptianVoice) {
      utterance.voice = egyptianVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
}

export function playOrderRegisteredVoice() {
  const now = Date.now();
  // Prevent duplicate overlapping voice playback within 1.2 seconds
  if (now - lastSpokenAt < 1200) return;
  lastSpokenAt = now;

  const phrase = 'تم تسجيل الطلب';

  if (typeof window === 'undefined') return;

  try {
    const audio = preloadedAudio || new Audio('/api/tts?text=' + encodeURIComponent(phrase));
    audio.currentTime = 0;
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Speech API (ar-EG) if audio stream fails
        speakWithWebSpeech(phrase);
      });
    }
  } catch {
    speakWithWebSpeech(phrase);
  }
}
