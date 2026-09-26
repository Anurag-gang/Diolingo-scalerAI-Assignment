/**
 * Built-in Fallback Data Engine for Diolingo
 *
 * Ensures 100% platform availability offline, during network outages,
 * or when deployed to frontend-only hosts (e.g. Vercel) without a live backend.
 */

export interface FallbackCourse {
  id: number;
  slug: string;
  title: string;
  flag_emoji: string;
  native_name: string;
  language_family: string;
  locale_code: string;
  source_language: string;
  target_language: string;
  description: string;
  units_count: number;
}

export const FALLBACK_COURSES: FallbackCourse[] = [
  // Romance
  { id: 1, slug: "es", title: "Spanish", flag_emoji: "🇪🇸", native_name: "Español", language_family: "Romance", locale_code: "es-ES", source_language: "en", target_language: "es", description: "Learn conversational Spanish with everyday phrases, café ordering, travel navigation, and grammar guidebooks.", units_count: 3 },
  { id: 2, slug: "fr", title: "French", flag_emoji: "🇫🇷", native_name: "Français", language_family: "Romance", locale_code: "fr-FR", source_language: "en", target_language: "fr", description: "Master foundational French greetings, pronunciation, and Parisian café expressions.", units_count: 3 },
  { id: 3, slug: "it", title: "Italian", flag_emoji: "🇮🇹", native_name: "Italiano", language_family: "Romance", locale_code: "it-IT", source_language: "en", target_language: "it", description: "Explore the melodious Italian language through food, travel, art, and daily conversations.", units_count: 3 },
  { id: 4, slug: "pt", title: "Portuguese", flag_emoji: "🇵🇹", native_name: "Português", language_family: "Romance", locale_code: "pt-PT", source_language: "en", target_language: "pt", description: "Learn Brazilian and European Portuguese essentials.", units_count: 3 },
  { id: 5, slug: "ro", title: "Romanian", flag_emoji: "🇷🇴", native_name: "Română", language_family: "Romance", locale_code: "ro-RO", source_language: "en", target_language: "ro", description: "Discover Eastern Romance vocabulary and Latin roots.", units_count: 3 },
  { id: 6, slug: "ca", title: "Catalan", flag_emoji: "🇦🇩", native_name: "Català", language_family: "Romance", locale_code: "ca-ES", source_language: "en", target_language: "ca", description: "Speak the rich cultural language of Barcelona and Valencia.", units_count: 3 },

  // Germanic
  { id: 7, slug: "de", title: "German", flag_emoji: "🇩🇪", native_name: "Deutsch", language_family: "Germanic", locale_code: "de-DE", source_language: "en", target_language: "de", description: "Conquer German grammar cases, compound words, and everyday dialogue.", units_count: 3 },
  { id: 8, slug: "nl", title: "Dutch", flag_emoji: "🇳🇱", native_name: "Nederlands", language_family: "Germanic", locale_code: "nl-NL", source_language: "en", target_language: "nl", description: "Learn Dutch for Amsterdam travel, business, and social life.", units_count: 3 },
  { id: 9, slug: "sv", title: "Swedish", flag_emoji: "🇸🇪", native_name: "Svenska", language_family: "Germanic", locale_code: "sv-SE", source_language: "en", target_language: "sv", description: "Nordic conversations, everyday polite phrases, and Scandinavian culture.", units_count: 3 },
  { id: 10, slug: "no", title: "Norwegian", flag_emoji: "🇳🇴", native_name: "Norsk", language_family: "Germanic", locale_code: "nb-NO", source_language: "en", target_language: "no", description: "Clear pitch-accented Norwegian Bokmål for travelers and learners.", units_count: 3 },
  { id: 11, slug: "da", title: "Danish", flag_emoji: "🇩🇰", native_name: "Dansk", language_family: "Germanic", locale_code: "da-DK", source_language: "en", target_language: "da", description: "Copenhagen café talk, numbers, and friendly conversations.", units_count: 3 },
  { id: 12, slug: "en", title: "English", flag_emoji: "🇺🇸", native_name: "English", language_family: "Germanic", locale_code: "en-US", source_language: "en", target_language: "en", description: "Global English fluency with idioms, grammar, and pronunciation drills.", units_count: 3 },

  // East Asian
  { id: 13, slug: "ja", title: "Japanese", flag_emoji: "🇯🇵", native_name: "日本語", language_family: "East Asian", locale_code: "ja-JP", source_language: "en", target_language: "ja", description: "Kana syllabaries, essential Kanji, and polite conversational phrases.", units_count: 3 },
  { id: 14, slug: "zh", title: "Mandarin", flag_emoji: "🇨🇳", native_name: "中文", language_family: "East Asian", locale_code: "zh-CN", source_language: "en", target_language: "zh", description: "Pinyin tones, HSK 1-3 vocabulary, and practical Mandarin dialogues.", units_count: 3 },
  { id: 15, slug: "ko", title: "Korean", flag_emoji: "🇰🇷", native_name: "한국어", language_family: "East Asian", locale_code: "ko-KR", source_language: "en", target_language: "ko", description: "Hangul alphabet reading, honorifics, K-culture, and daily interactions.", units_count: 3 },
  { id: 16, slug: "yue", title: "Cantonese", flag_emoji: "🇭🇰", native_name: "粵語", language_family: "East Asian", locale_code: "zh-HK", source_language: "en", target_language: "yue", description: "Colloquial Cantonese spoken in Hong Kong and Guangdong.", units_count: 3 },

  // Slavic
  { id: 17, slug: "ru", title: "Russian", flag_emoji: "🇷🇺", native_name: "Русский", language_family: "Slavic", locale_code: "ru-RU", source_language: "en", target_language: "ru", description: "Cyrillic script, verb conjugation, and practical survival phrases.", units_count: 3 },
  { id: 18, slug: "pl", title: "Polish", flag_emoji: "🇵🇱", native_name: "Polski", language_family: "Slavic", locale_code: "pl-PL", source_language: "en", target_language: "pl", description: "Pronunciation keys, case endings, and warm Polish greetings.", units_count: 3 },
  { id: 19, slug: "uk", title: "Ukrainian", flag_emoji: "🇺🇦", native_name: "Українська", language_family: "Slavic", locale_code: "uk-UA", source_language: "en", target_language: "uk", description: "Rich Slavic expressions, Cyrillic foundations, and friendly greetings.", units_count: 3 },
  { id: 20, slug: "cs", title: "Czech", flag_emoji: "🇨🇿", native_name: "Čeština", language_family: "Slavic", locale_code: "cs-CZ", source_language: "en", target_language: "cs", description: "Prague navigation, dining etiquette, and everyday Czech grammar.", units_count: 3 },

  // Indo-Aryan & Dravidian
  { id: 21, slug: "hi", title: "Hindi", flag_emoji: "🇮🇳", native_name: "हिन्दी", language_family: "Indo-Aryan", locale_code: "hi-IN", source_language: "en", target_language: "hi", description: "Devanagari script, polite forms, and vibrant conversational Hindi.", units_count: 3 },
  { id: 22, slug: "bn", title: "Bengali", flag_emoji: "🇧🇩", native_name: "বাংলা", language_family: "Indo-Aryan", locale_code: "bn-BD", source_language: "en", target_language: "bn", description: "Expressive Bengali literature, poetry, and everyday talk.", units_count: 3 },
  { id: 23, slug: "ta", title: "Tamil", flag_emoji: "🇮🇳", native_name: "தமிழ்", language_family: "Dravidian", locale_code: "ta-IN", source_language: "en", target_language: "ta", description: "Classical Dravidian tongue spoken across southern India and Singapore.", units_count: 3 },
  { id: 24, slug: "te", title: "Telugu", flag_emoji: "🇮🇳", native_name: "తెలుగు", language_family: "Dravidian", locale_code: "te-IN", source_language: "en", target_language: "te", description: "The Italian of the East with sweet vowel harmonies and melodic tones.", units_count: 3 },

  // Semitic
  { id: 25, slug: "ar", title: "Arabic", flag_emoji: "🇸🇦", native_name: "العربية", language_family: "Semitic", locale_code: "ar-SA", source_language: "en", target_language: "ar", description: "Modern Standard Arabic script, root structures, and formal greetings.", units_count: 3 },
  { id: 26, slug: "he", title: "Hebrew", flag_emoji: "🇮🇱", native_name: "עברית", language_family: "Semitic", locale_code: "he-IL", source_language: "en", target_language: "he", description: "Modern spoken Hebrew, alef-bet writing, and Tel Aviv everyday phrases.", units_count: 3 },

  // Hellenic, Celtic, Uralic, Austronesian, Turkic, Niger-Congo, etc.
  { id: 27, slug: "el", title: "Greek", flag_emoji: "🇬🇷", native_name: "Ελληνικά", language_family: "Hellenic", locale_code: "el-GR", source_language: "en", target_language: "el", description: "Greek alphabet, ancient roots, and warm Mediterranean phrases.", units_count: 3 },
  { id: 28, slug: "ga", title: "Irish", flag_emoji: "🇮🇪", native_name: "Gaeilge", language_family: "Celtic", locale_code: "ga-IE", source_language: "en", target_language: "ga", description: "Gaelic heritage, idioms, and conversational Irish.", units_count: 3 },
  { id: 29, slug: "tr", title: "Turkish", flag_emoji: "🇹🇷", native_name: "Türkçe", language_family: "Turkic", locale_code: "tr-TR", source_language: "en", target_language: "tr", description: "Agglutinative harmony, tea culture, and Istanbul hospitality.", units_count: 3 },
  { id: 30, slug: "vi", title: "Vietnamese", flag_emoji: "🇻🇳", native_name: "Tiếng Việt", language_family: "Austroasiatic", locale_code: "vi-VN", source_language: "en", target_language: "vi", description: "Tone markers, street food ordering, and southern/northern accents.", units_count: 3 },
  { id: 31, slug: "id", title: "Indonesian", flag_emoji: "🇮🇩", native_name: "Bahasa Indonesia", language_family: "Austronesian", locale_code: "id-ID", source_language: "en", target_language: "id", description: "One of the easiest grammar systems in the world with zero verb conjugation.", units_count: 3 },
  { id: 32, slug: "sw", title: "Swahili", flag_emoji: "🇰🇪", native_name: "Kiswahili", language_family: "Niger-Congo", locale_code: "sw-KE", source_language: "en", target_language: "sw", description: "East African lingua franca of Kenya, Tanzania, and Zanzibar.", units_count: 3 },
  { id: 33, slug: "fi", title: "Finnish", flag_emoji: "🇫🇮", native_name: "Suomi", language_family: "Uralic", locale_code: "fi-FI", source_language: "en", target_language: "fi", description: "Unique vowel harmony, sauna culture, and Nordic expression.", units_count: 3 },
  { id: 34, slug: "hu", title: "Hungarian", flag_emoji: "🇭🇺", native_name: "Magyar", language_family: "Uralic", locale_code: "hu-HU", source_language: "en", target_language: "hu", description: "Rich Uralic vocabulary, Budapest travel, and cultural proverbs.", units_count: 3 },
];

export const FALLBACK_USER = {
  id: 1,
  email: "guest@diolingo.edu",
  username: "alex_guest",
  display_name: "Alex Rivera (Guest Learner)",
  avatar_url: "/mascot-dio.png",
  equipped_outfit: "outfit_superhero",
  role: "learner",
  is_guest: true,
  daily_xp_goal: 20,
  sound_enabled: true,
  speaking_enabled: true,
  listening_enabled: true,
  notifications_enabled: true,
  created_at: new Date().toISOString(),
  active_course: {
    id: 1,
    slug: "es",
    title: "Spanish",
    flag_emoji: "🇪🇸",
    target_language: "es",
  },
  stats: {
    xp_total: 460,
    xp_today: 15,
    streak_count: 5,
    longest_streak: 9,
    last_active_date: new Date().toISOString().split("T")[0],
    hearts: 5,
    max_hearts: 5,
    seconds_until_next_heart: 0,
    gems: 240,
    streak_freeze_equipped: true,
    xp_boost_active: false,
    xp_boost_seconds_remaining: 0,
    league_tier: "Silver",
    lessons_completed_count: 6,
    perfect_lessons_count: 3,
    total_crowns: 4,
  },
  achievements: [
    { id: 1, code: "first_lesson", title: "First Step", description: "Complete your very first language lesson", icon_emoji: "🐣", target_value: 1, current_value: 1, gem_reward: 25, unlocked: true },
    { id: 2, code: "streak_3", title: "Wildfire", description: "Reach a 3-day learning streak", icon_emoji: "🔥", target_value: 3, current_value: 3, gem_reward: 40, unlocked: true },
    { id: 3, code: "streak_7", title: "Unstoppable", description: "Maintain a 7-day learning streak", icon_emoji: "⚡", target_value: 7, current_value: 5, gem_reward: 100, unlocked: false },
    { id: 4, code: "perfect_lesson", title: "Sharpshooter", description: "Complete a lesson with 100% accuracy", icon_emoji: "🎯", target_value: 1, current_value: 1, gem_reward: 30, unlocked: true },
    { id: 5, code: "xp_500", title: "Scholar", description: "Earn 500 lifetime XP across lessons", icon_emoji: "🎓", target_value: 500, current_value: 460, gem_reward: 60, unlocked: false },
    { id: 6, code: "crown_collector", title: "Crown Collector", description: "Earn 5 skill crowns on the learning path", icon_emoji: "👑", target_value: 5, current_value: 4, gem_reward: 80, unlocked: false },
  ],
  inventory: ["outfit_superhero", "streak_freeze"],
  following_count: 3,
  followers_count: 2,
};

export const FALLBACK_UNITS = [
  {
    id: 1,
    order_index: 1,
    title: "Unit 1: Foundations & Core Greetings",
    description: "Master polite introductions, saying hello & goodbye, and asking how someone is doing.",
    theme_color: "emerald",
    grammar_tip_title: "Spanish Subject Pronouns & Gender",
    grammar_tip_markdown: "In Spanish, nouns are either **masculine** (*el libro*) or **feminine** (*la casa*). Subject pronouns like *yo* (I) and *tú* (you) can often be omitted because the verb ending clarifies who is acting.",
    skills: [
      {
        id: 1,
        slug: "basics-1",
        title: "Basics 1",
        description: "Say hello, introduce yourself, and greet friends.",
        icon_name: "star",
        order_index: 1,
        is_checkpoint: false,
        is_bonus_legendary: false,
        crowns: 3,
        max_crowns: 3,
        state: "completed",
        grammar_tip: "Use 'Hola' for informal greetings and 'Buenos días' for formal mornings.",
        lesson_id: 1,
        xp_reward: 15,
        is_unlocked: true,
      },
      {
        id: 2,
        slug: "basics-2",
        title: "Basics 2",
        description: "Articles, gender agreement, and simple sentences.",
        icon_name: "book",
        order_index: 2,
        is_checkpoint: false,
        is_bonus_legendary: false,
        crowns: 1,
        max_crowns: 3,
        state: "active",
        grammar_tip: "El niño = The boy; La niña = The girl.",
        lesson_id: 2,
        xp_reward: 20,
        is_unlocked: true,
      },
      {
        id: 3,
        slug: "travel-basics",
        title: "Travel Basics",
        description: "Polite expressions: please, thank you, excuse me.",
        icon_name: "compass",
        order_index: 3,
        is_checkpoint: false,
        is_bonus_legendary: false,
        crowns: 0,
        max_crowns: 3,
        state: "available",
        grammar_tip: "Por favor means please; Muchas gracias means thank you very much.",
        lesson_id: 3,
        xp_reward: 20,
        is_unlocked: true,
      },
      {
        id: 4,
        slug: "unit-1-checkpoint",
        title: "Unit 1 Checkpoint",
        description: "Prove your mastery of greetings and foundational phrases.",
        icon_name: "trophy",
        order_index: 4,
        is_checkpoint: true,
        is_bonus_legendary: false,
        crowns: 0,
        max_crowns: 1,
        state: "available",
        grammar_tip: "A comprehensive test covering all Unit 1 vocabulary.",
        lesson_id: 4,
        xp_reward: 30,
        is_unlocked: true,
      },
    ],
  },
  {
    id: 2,
    order_index: 2,
    title: "Unit 2: Restaurant & Café Exploration",
    description: "Order drinks and tapas, ask for the bill, and express your food preferences.",
    theme_color: "sky",
    grammar_tip_title: "Ordering with 'Quisiera' vs 'Quiero'",
    grammar_tip_markdown: "Use *Quisiera* (I would like) for polite requests in restaurants. *La cuenta, por favor* asks for the bill.",
    skills: [
      {
        id: 5,
        slug: "food-tapas",
        title: "Food & Tapas",
        description: "Order water, coffee, bread, and popular tapas dishes.",
        icon_name: "coffee",
        order_index: 1,
        is_checkpoint: false,
        is_bonus_legendary: false,
        crowns: 0,
        max_crowns: 3,
        state: "available",
        grammar_tip: "Un café con leche por favor.",
        lesson_id: 5,
        xp_reward: 20,
        is_unlocked: true,
      },
      {
        id: 6,
        slug: "city-directions",
        title: "City Directions",
        description: "Find the metro, station, museum, and restrooms.",
        icon_name: "map-pin",
        order_index: 2,
        is_checkpoint: false,
        is_bonus_legendary: false,
        crowns: 0,
        max_crowns: 3,
        state: "available",
        grammar_tip: "¿Dónde está la estación de tren?",
        lesson_id: 6,
        xp_reward: 20,
        is_unlocked: true,
      },
    ],
  },
  {
    id: 3,
    order_index: 3,
    title: "Unit 3: Daily Life & Hobbies",
    description: "Talk about your family, friends, hobbies, music, and daily routine.",
    theme_color: "purple",
    grammar_tip_title: "Regular -AR, -ER, -IR Verbs",
    grammar_tip_markdown: "Hablar (to speak): yo hablo, tú hablas, él habla. Comer (to eat): yo como, tú comes. Vivir (to live): yo vivo, tú vives.",
    skills: [
      {
        id: 7,
        slug: "family-friends",
        title: "Family & Friends",
        description: "Talk about parents, siblings, and close friends.",
        icon_name: "users",
        order_index: 1,
        is_checkpoint: false,
        is_bonus_legendary: false,
        crowns: 0,
        max_crowns: 3,
        state: "available",
        grammar_tip: "Mi hermano y mi hermana.",
        lesson_id: 7,
        xp_reward: 20,
        is_unlocked: true,
      },
      {
        id: 8,
        slug: "music-hobbies",
        title: "Hobbies & Music",
        description: "Express what you like to do on weekends.",
        icon_name: "music",
        order_index: 2,
        is_checkpoint: false,
        is_bonus_legendary: false,
        crowns: 0,
        max_crowns: 3,
        state: "available",
        grammar_tip: "Me gusta escuchar música y leer libros.",
        lesson_id: 8,
        xp_reward: 25,
        is_unlocked: true,
      },
    ],
  },
];

export const FALLBACK_LESSON = {
  id: 1,
  title: "Basics 1 — First Greetings",
  skill_title: "Basics 1",
  xp_reward: 15,
  is_legendary: false,
  grammar_tip: "Hola means hello, Adiós means goodbye.",
  exercises: [
    {
      id: 101,
      order_index: 1,
      exercise_type: "multiple_choice",
      difficulty: 1,
      prompt_text: "What does 'Hola' mean in English?",
      source_sentence: "Hola",
      correct_answer: "Hello",
      hint_text: "Common greeting said at any time of day.",
      audio_text: "Hola",
      audio_lang: "es-ES",
      explanation: "'Hola' is the universal informal greeting in Spanish.",
      options: [
        { id: 1, text: "Hello", match: "", emoji: "👋" },
        { id: 2, text: "Goodbye", match: "", emoji: "🚶" },
        { id: 3, text: "Thank you", match: "", emoji: "🙏" },
      ],
    },
    {
      id: 102,
      order_index: 2,
      exercise_type: "word_bank",
      difficulty: 1,
      prompt_text: "Translate the sentence: 'Buenos días'",
      source_sentence: "Buenos días",
      correct_answer: "Good morning",
      hint_text: "Used before noon.",
      audio_text: "Buenos días",
      audio_lang: "es-ES",
      explanation: "'Buenos días' literally translates to 'Good days' and is used as 'Good morning'.",
      options: [
        { id: 11, text: "Good", match: "", emoji: "" },
        { id: 12, text: "morning", match: "", emoji: "" },
        { id: 13, text: "night", match: "", emoji: "" },
        { id: 14, text: "friend", match: "", emoji: "" },
      ],
    },
    {
      id: 103,
      order_index: 3,
      exercise_type: "match_pairs",
      difficulty: 1,
      prompt_text: "Match the Spanish and English greeting pairs",
      source_sentence: "Pair matching drill",
      correct_answer: "MATCHED_ALL",
      hint_text: "Click each Spanish phrase then its English match.",
      audio_text: "",
      audio_lang: "es-ES",
      explanation: "Pairs: Hola = Hello, Adiós = Goodbye, Gracias = Thank you, Por favor = Please",
      options: [
        { id: 21, text: "Hola", match: "Hello", emoji: "" },
        { id: 22, text: "Adiós", match: "Goodbye", emoji: "" },
        { id: 23, text: "Gracias", match: "Thank you", emoji: "" },
        { id: 24, text: "Por favor", match: "Please", emoji: "" },
      ],
    },
    {
      id: 104,
      order_index: 4,
      exercise_type: "type_answer",
      difficulty: 2,
      prompt_text: "Type the English translation for 'Muchas gracias'",
      source_sentence: "Muchas gracias",
      correct_answer: "Thank you very much|Thanks a lot|Many thanks",
      hint_text: "Very grateful expression",
      audio_text: "Muchas gracias",
      audio_lang: "es-ES",
      explanation: "'Muchas gracias' conveys warm gratitude.",
      options: [],
    },
  ],
};

export const FALLBACK_LEADERBOARD = [
  { rank: 1, username: "sofia_admin", display_name: "Prof. Sofia", xp: 1250, avatar_url: "/mascot-dio.png", outfit: "outfit_tuxedo", is_current_user: false },
  { rank: 2, username: "mateo_es", display_name: "Mateo Silva", xp: 890, avatar_url: "/mascot-dio.png", outfit: "classic", is_current_user: false },
  { rank: 3, username: "kenji_t", display_name: "Kenji Tanaka", xp: 740, avatar_url: "/mascot-dio.png", outfit: "classic", is_current_user: false },
  { rank: 4, username: "alex_guest", display_name: "Alex Rivera (You)", xp: 460, avatar_url: "/mascot-dio.png", outfit: "outfit_superhero", is_current_user: true },
  { rank: 5, username: "amelie_p", display_name: "Amélie Poulain", xp: 390, avatar_url: "/mascot-dio.png", outfit: "classic", is_current_user: false },
];

export const FALLBACK_SHOP_ITEMS = [
  { id: 1, code: "streak_freeze", name: "Streak Freeze", category: "powerup", description: "Protects your streak if you miss a calendar day of practice.", price_gems: 100, icon_emoji: "🧊", is_equipped: true },
  { id: 2, code: "xp_boost", name: "Double XP Potion (15m)", category: "powerup", description: "Earn 2x XP on all lessons completed for the next 15 minutes.", price_gems: 80, icon_emoji: "🧪", is_equipped: false },
  { id: 3, code: "heart_refill", name: "Full Heart Refill", category: "powerup", description: "Instantly restore your hearts back to the maximum of 5.", price_gems: 50, icon_emoji: "❤️", is_equipped: false },
  { id: 4, code: "outfit_tuxedo", name: "Golden Gala Tuxedo Dio", category: "outfit", description: "Dress Dio in a sharp emerald-trimmed tuxedo for formal study.", price_gems: 120, icon_emoji: "🤵", is_equipped: false },
  { id: 5, code: "outfit_superhero", name: "Super Feather Cape", category: "outfit", description: "Give Dio a heroic cape that flutters on every streak milestone.", price_gems: 150, icon_emoji: "🦸", is_equipped: true },
  { id: 6, code: "outfit_pirate", name: "Captain Polyglot Hat", category: "outfit", description: "Sail the seven seas of vocabulary with Captain Dio.", price_gems: 140, icon_emoji: "🏴‍☠️", is_equipped: false },
];

/**
 * Dispatches an offline fallback response for any given API path
 */
export function getFallbackResponse(path: string, options?: RequestInit): any {
  const cleanPath = path.split("?")[0].replace(/^\/api\/v1/, "");

  if (cleanPath === "/courses") {
    return { courses: FALLBACK_COURSES };
  }

  if (cleanPath.startsWith("/courses/") && cleanPath.endsWith("/select")) {
    const parts = cleanPath.split("/");
    const id = parseInt(parts[2], 10) || 1;
    const selected = FALLBACK_COURSES.find((c) => c.id === id) || FALLBACK_COURSES[0];
    return {
      user: {
        ...FALLBACK_USER,
        active_course: selected,
      },
    };
  }

  if (cleanPath.startsWith("/courses/") && cleanPath.endsWith("/path")) {
    const parts = cleanPath.split("/");
    const id = parseInt(parts[2], 10) || 1;
    const selected = FALLBACK_COURSES.find((c) => c.id === id) || FALLBACK_COURSES[0];
    return {
      course: selected,
      units: FALLBACK_UNITS,
    };
  }

  if (
    cleanPath === "/auth/guest" ||
    cleanPath === "/auth/login" ||
    cleanPath === "/auth/register" ||
    cleanPath === "/auth/google" ||
    cleanPath === "/auth/apple" ||
    cleanPath === "/auth/switch-demo" ||
    cleanPath.startsWith("/auth/oauth/")
  ) {
    return {
      access_token: "diolingo_verified_session_token_" + Date.now(),
      token_type: "bearer",
      user: FALLBACK_USER,
    };
  }

  if (cleanPath === "/me") {
    return { user: FALLBACK_USER };
  }

  if (cleanPath.startsWith("/lessons/") && cleanPath.endsWith("/check")) {
    return {
      is_correct: true,
      has_typo: false,
      message: "¡Excelente! Correct answer.",
      correct_solution: "Correct",
      explanation: "Great job mastering this phrase!",
      hearts: 5,
      max_hearts: 5,
      out_of_hearts: false,
      xp_breakdown: {
        base_xp: 15,
        accuracy_bonus: 5,
        legendary_bonus: 0,
        multiplier: 1,
        total_xp: 20,
        gems_earned: 5,
      },
      accuracy: 100,
      streak: {
        streak_count: 6,
        streak_incremented: true,
        freeze_used: false,
      },
      newly_unlocked_achievements: [],
    };
  }

  if (cleanPath.startsWith("/lessons/") && cleanPath.endsWith("/complete")) {
    return {
      accuracy: 100,
      xp_breakdown: {
        base_xp: 15,
        accuracy_bonus: 5,
        legendary_bonus: 0,
        multiplier: 1,
        total_xp: 20,
        gems_earned: 5,
      },
      streak: {
        streak_count: 6,
        streak_incremented: true,
        freeze_used: false,
      },
      newly_unlocked_achievements: [],
      user: {
        ...FALLBACK_USER,
        stats: {
          ...FALLBACK_USER.stats,
          xp_total: 480,
          xp_today: 35,
          streak_count: 6,
          lessons_completed_count: 7,
          gems: 245,
        },
      },
    };
  }

  if (cleanPath.startsWith("/lessons/")) {
    return {
      lesson: FALLBACK_LESSON,
      exercises: FALLBACK_LESSON.exercises,
      hearts: 5,
      max_hearts: 5,
    };
  }

  if (cleanPath.startsWith("/hearts/practice")) {
    return {
      hearts: 5,
      max_hearts: 5,
      gems: 240,
      message: "Hearts restored to maximum!",
    };
  }

  if (cleanPath === "/leaderboard") {
    return { standings: FALLBACK_LEADERBOARD, tier: "Silver" };
  }

  if (cleanPath === "/shop" || cleanPath === "/shop/buy" || cleanPath === "/shop/equip") {
    return {
      success: true,
      message: "Action completed successfully.",
      user: FALLBACK_USER,
      items: FALLBACK_SHOP_ITEMS,
    };
  }

  if (cleanPath.startsWith("/social/follow/")) {
    return {
      is_following: true,
      followers_count: 3,
      message: "Following learner!",
    };
  }

  if (cleanPath === "/social/users") {
    return {
      learners: [
        { id: 2, username: "sofia_admin", display_name: "Prof. Sofia", streak: 14, xp: 1250, is_following: true },
        { id: 3, username: "mateo_es", display_name: "Mateo Silva", streak: 9, xp: 890, is_following: true },
        { id: 5, username: "kenji_t", display_name: "Kenji Tanaka", streak: 7, xp: 740, is_following: false },
      ],
    };
  }

  if (cleanPath.startsWith("/settings")) {
    return {
      success: true,
      user: FALLBACK_USER,
      export_data: { user: FALLBACK_USER, progress: [] },
    };
  }

  if (cleanPath.startsWith("/admin/")) {
    return {
      success: true,
      analytics: { total_learners: 1248, active_today: 432, completion_rate_pct: 88.4 },
      users: [FALLBACK_USER],
      reports: [],
    };
  }

  return { success: true, message: "OK" };
}
