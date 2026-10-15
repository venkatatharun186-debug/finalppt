export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voice: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon' | 'Aoede';
  sample: string;
  speechLang: string; // for Web Speech API recognition fallback
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    voice: 'Kore',
    sample: 'Hello! I am Drishti Voice AI. How can I assist your navigation today?',
    speechLang: 'en-US'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    voice: 'Zephyr',
    sample: 'नमस्ते! मैं दृष्टि वॉइस एआई हूँ। आज मैं आपकी दृष्टि और नेविगेशन में कैसे मदद करूँ?',
    speechLang: 'hi-IN'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    voice: 'Puck',
    sample: 'నమస్కారం! నేను దృష్టి వాయిస్ ఏఐ. మీ ప్రయాణం మరియు రక్షణలో నేను ఎలా సహాయపడగలను?',
    speechLang: 'te-IN'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    voice: 'Kore',
    sample: 'வணக்கம்! நான் திருஷ்டி வாய்ஸ் ஏஐ. உங்கள் நடைபாதை மற்றும் பாதுகாப்புக்கு எப்படி உதவலாம்?',
    speechLang: 'ta-IN'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    voice: 'Zephyr',
    sample: 'নমস্কার! আমি দৃষ্টি ভয়েস এআই। আজ আপনার পথচলা এবং প্রশ্নগুলোতে কীভাবে সাহায্য করতে পারি?',
    speechLang: 'bn-BD'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    voice: 'Zephyr',
    sample: 'नमस्कार! मी दृष्टी व्हॉईस एआय. आज मी आपल्या सुरक्षित प्रवासात कशी मदत करू शकतो?',
    speechLang: 'mr-IN'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    voice: 'Puck',
    sample: 'નમસ્તે! હું દ્રષ્ટિ વોઇસ એઆઇ છું. આજે તમારી મુસાફરીમાં હું કેવી રીતે મદદ કરી શકું?',
    speechLang: 'gu-IN'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    voice: 'Fenrir',
    sample: 'ನಮಸ್ಕಾರ! ನಾನು ದೃಷ್ಟಿ ವಾಯ್ಸ್ ಎಐ. ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸುರಕ್ಷತೆಯಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    speechLang: 'kn-IN'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    voice: 'Zephyr',
    sample: 'നമസ്കാരം! ഞാൻ ദൃഷ്ടി വോയ്‌സ് എഐ. നിങ്ങളുടെ യാത്രയിലും സുരക്ഷയിലും ഞാൻ എങ്ങനെ സഹായിക്കണം?',
    speechLang: 'ml-IN'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    voice: 'Puck',
    sample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਦ੍ਰਿਸ਼ਟੀ ਵਾਇਸ ਏਆਈ ਹਾਂ। ਤੁਹਾਡੇ ਸਫ਼ਰ ਅਤੇ ਸੁਰੱਖਿਆ ਵਿੱਚ ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    speechLang: 'pa-IN'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    voice: 'Kore',
    sample: '¡Hola! Soy Drishti Voice AI. ¿En qué puedo asistirte hoy con tu navegación y seguridad?',
    speechLang: 'es-ES'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    voice: 'Zephyr',
    sample: 'Bonjour! Je suis Drishti Voice AI. Comment puis-je vous guider en toute sécurité aujourd’hui?',
    speechLang: 'fr-FR'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    voice: 'Fenrir',
    sample: 'Hallo! Ich bin Drishti Voice AI. Wie kann ich Ihnen heute bei der Navigation behilflich sein?',
    speechLang: 'de-DE'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    voice: 'Kore',
    sample: 'こんにちは！Drishti Voice AIです。周囲の障害物検知や道案内をお手伝いします。',
    speechLang: 'ja-JP'
  },
  {
    code: 'zh',
    name: 'Mandarin Chinese',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
    voice: 'Kore',
    sample: '你好！我是 Drishti Voice AI。请问今天有什么我可以为您导航或安全避障的？',
    speechLang: 'zh-CN'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    voice: 'Fenrir',
    sample: 'مرحباً! أنا دِرشتي Voice AI. كيف يمكنني مساعدتك اليوم في التنقل واستكشاف المحيط بأمان؟',
    speechLang: 'ar-SA'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    voice: 'Kore',
    sample: 'Olá! Sou o Drishti Voice AI. Como posso ajudar com sua navegação e detecção de obstáculos hoje?',
    speechLang: 'pt-BR'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    voice: 'Fenrir',
    sample: 'Здравствуйте! Я Drishti Voice AI. Чем я могу помочь вам в безопасной навигации сегодня?',
    speechLang: 'ru-RU'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    voice: 'Kore',
    sample: '안녕하세요! Drishti Voice AI입니다. 오늘 어떤 안전 안내와 경로 도움이 필요하신가요?',
    speechLang: 'ko-KR'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    voice: 'Zephyr',
    sample: 'Ciao! Sono Drishti Voice AI. Come posso aiutarti oggi con la navigazione e i tuoi percorsi?',
    speechLang: 'it-IT'
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    voice: 'Puck',
    sample: 'Merhaba! Ben Drishti Voice AI. Bugün güvenli rota ve engel tespitinde size nasıl yardımcı olabilirim?',
    speechLang: 'tr-TR'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    voice: 'Kore',
    sample: 'Xin chào! Tôi là Drishti Voice AI. Tôi có thể hỗ trợ điều hướng và cảnh báo vật cản gì cho bạn?',
    speechLang: 'vi-VN'
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    voice: 'Puck',
    sample: 'Halo! Saya Drishti Voice AI. Bagaimana saya bisa membantu navigasi dan keselamatan Anda hari ini?',
    speechLang: 'id-ID'
  }
];

export const AVAILABLE_VOICES = [
  { id: 'Zephyr', name: 'Zephyr (Warm & Clear)', gender: 'Neutral' },
  { id: 'Kore', name: 'Kore (Calm & Gentle)', gender: 'Female' },
  { id: 'Puck', name: 'Puck (Lively & Friendly)', gender: 'Male' },
  { id: 'Fenrir', name: 'Fenrir (Deep & Confident)', gender: 'Male' },
  { id: 'Aoede', name: 'Aoede (Expressive & Melodic)', gender: 'Female' },
  { id: 'Charon', name: 'Charon (Steady & Authoritative)', gender: 'Male' }
] as const;
