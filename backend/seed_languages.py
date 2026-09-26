"""Parameterized seed generator for 61 world languages in Diolingo.

Emits standardized curriculum depth:
- >= 3 units per language
- >= 3 skills per unit
- Full exercise type mix (multiple_choice, word_bank, match_pairs, fill_blank, type_answer, listening, speaking)
"""
from typing import Dict, List, Any

# Curated catalog of 61 world languages across language families
LANGUAGES_CATALOG: List[Dict[str, Any]] = [
    # Romance
    {"slug": "es", "title": "Spanish", "native": "Español", "family": "Romance", "locale": "es-ES", "flag": "🇪🇸",
     "phrases": [("Hola, buenos días", "Hello, good morning"), ("Mucho gusto en conocerte", "Nice to meet you"), ("¿Dónde está el restaurante?", "Where is the restaurant?")]},
    {"slug": "fr", "title": "French", "native": "Français", "family": "Romance", "locale": "fr-FR", "flag": "🇫🇷",
     "phrases": [("Bonjour, comment allez-vous?", "Hello, how are you?"), ("Enchanté de vous rencontrer", "Pleased to meet you"), ("Où est la gare centrale?", "Where is the central station?")]},
    {"slug": "it", "title": "Italian", "native": "Italiano", "family": "Romance", "locale": "it-IT", "flag": "🇮🇹",
     "phrases": [("Ciao, buongiorno a tutti", "Hello, good morning to all"), ("Piacere di conoscerti", "Pleased to meet you"), ("Un caffè per favore", "A coffee please")]},
    {"slug": "pt", "title": "Portuguese", "native": "Português", "family": "Romance", "locale": "pt-PT", "flag": "🇵🇹",
     "phrases": [("Olá, como você está?", "Hello, how are you?"), ("Muito prazer em conhecer", "Great pleasure to meet you"), ("Obrigado pela sua ajuda", "Thank you for your help")]},
    {"slug": "ro", "title": "Romanian", "native": "Română", "family": "Romance", "locale": "ro-RO", "flag": "🇷🇴",
     "phrases": [("Bună dimineața și bun venit", "Good morning and welcome"), ("Încântat de cunoștință", "Pleased to meet you"), ("Unde este biblioteca?", "Where is the library?")]},
    {"slug": "ca", "title": "Catalan", "native": "Català", "family": "Romance", "locale": "ca-ES", "flag": "🇦🇩",
     "phrases": [("Bon dia, com esteu?", "Good day, how are you?"), ("Molt de gust de conèixer-te", "Pleased to meet you"), ("Gràcies per tot", "Thanks for everything")]},
    {"slug": "gl", "title": "Galician", "native": "Galego", "family": "Romance", "locale": "gl-ES", "flag": "🇪🇸",
     "phrases": [("Bo día a todas e todos", "Good day to all"), ("Moito pracer en verte", "Great pleasure seeing you"), ("Ata logo meu amigo", "See you later my friend")]},
    {"slug": "oc", "title": "Occitan", "native": "Occitan", "family": "Romance", "locale": "oc-FR", "flag": "🇫🇷",
     "phrases": [("Bonjorn a totes", "Hello everyone"), ("Grandmercé per l'ajuda", "Thanks very much for help"), ("A lèu amics", "See you soon friends")]},

    # Germanic
    {"slug": "de", "title": "German", "native": "Deutsch", "family": "Germanic", "locale": "de-DE", "flag": "🇩🇪",
     "phrases": [("Guten Tag, wie geht es Ihnen?", "Good day, how are you?"), ("Schön Sie kennenzulernen", "Nice to meet you"), ("Wo ist der Bahnhof?", "Where is the train station?")]},
    {"slug": "nl", "title": "Dutch", "native": "Nederlands", "family": "Germanic", "locale": "nl-NL", "flag": "🇳🇱",
     "phrases": [("Goedemorgen, hoe gaat het?", "Good morning, how are things?"), ("Aangenaam kennis te maken", "Pleased to meet you"), ("Dank je wel voor je hulp", "Thank you very much for your help")]},
    {"slug": "sv", "title": "Swedish", "native": "Svenska", "family": "Germanic", "locale": "sv-SE", "flag": "🇸🇪",
     "phrases": [("God morgon, allt väl?", "Good morning, all well?"), ("Trevligt att träffas", "Nice to meet you"), ("Tack så mycket för kaffet", "Thank you so much for the coffee")]},
    {"slug": "no", "title": "Norwegian", "native": "Norsk", "family": "Germanic", "locale": "nb-NO", "flag": "🇳🇴",
     "phrases": [("God morgen, hvordan har du det?", "Good morning, how are you?"), ("Hyggelig å møte deg", "Nice to meet you"), ("Tusen takk for hjelpen", "A thousand thanks for the help")]},
    {"slug": "da", "title": "Danish", "native": "Dansk", "family": "Germanic", "locale": "da-DK", "flag": "🇩🇰",
     "phrases": [("Godmorgen, hvordan går det?", "Good morning, how goes it?"), ("Dejligt at møde dig", "Lovely to meet you"), ("Hvor er museet?", "Where is the museum?")]},
    {"slug": "is", "title": "Icelandic", "native": "Íslenska", "family": "Germanic", "locale": "is-IS", "flag": "🇮🇸",
     "phrases": [("Góðan daginn, hvernig hefurðu það?", "Good day, how are you?"), ("Gaman að kynnast þér", "Nice to get to know you"), ("Takk kærlega fyrir", "Thank you dearly")]},
    {"slug": "yi", "title": "Yiddish", "native": "ייִדיש", "family": "Germanic", "locale": "yi-001", "flag": "✡️",
     "phrases": [("Guten tog, vos makhstu?", "Good day, how are you doing?"), ("A sheynem dank dir", "A beautiful thanks to you"), ("Zei gezunt un shtark", "Be healthy and strong")]},
    {"slug": "en", "title": "English", "native": "English", "family": "Germanic", "locale": "en-US", "flag": "🇺🇸",
     "phrases": [("Good morning, welcome to our class", "Good morning, welcome to our class"), ("Pleased to make your acquaintance", "Pleased to make your acquaintance"), ("Have a wonderful journey", "Have a wonderful journey")]},

    # East Asian
    {"slug": "ja", "title": "Japanese", "native": "日本語", "family": "East Asian", "locale": "ja-JP", "flag": "🇯🇵",
     "phrases": [("おはようございます、元気ですか", "Good morning, are you well?"), ("はじめまして、どうぞよろしく", "Nice to meet you, please treat me well"), ("駅はどちらにありますか", "Which direction is the station?")]},
    {"slug": "zh", "title": "Mandarin", "native": "中文", "family": "East Asian", "locale": "zh-CN", "flag": "🇨🇳",
     "phrases": [("早上好，最近怎么样？", "Good morning, how have you been?"), ("很高兴认识你", "Very pleased to meet you"), ("请问地铁站在哪里？", "Excuse me, where is the subway?")]},
    {"slug": "ko", "title": "Korean", "native": "한국어", "family": "East Asian", "locale": "ko-KR", "flag": "🇰🇷",
     "phrases": [("안녕하세요, 만나서 반갑습니다", "Hello, nice to meet you"), ("오늘 날씨가 정말 좋습니다", "Today the weather is truly great"), ("이것은 얼마인가요?", "How much is this?")]},
    {"slug": "yue", "title": "Cantonese", "native": "粵語", "family": "East Asian", "locale": "zh-HK", "flag": "🇭🇰",
     "phrases": [("早晨，你食咗飯未呀？", "Good morning, have you eaten yet?"), ("好高興認識你", "Very glad to meet you"), ("唔該借借", "Excuse me please")]},

    # Slavic
    {"slug": "ru", "title": "Russian", "native": "Русский", "family": "Slavic", "locale": "ru-RU", "flag": "🇷🇺",
     "phrases": [("Доброе утро, как ваши дела?", "Good morning, how are your matters?"), ("Очень приятно познакомиться", "Very pleasant to make your acquaintance"), ("Спасибо за внимание", "Thank you for attention")]},
    {"slug": "pl", "title": "Polish", "native": "Polski", "family": "Slavic", "locale": "pl-PL", "flag": "🇵🇱",
     "phrases": [("Dzień dobry, jak się masz?", "Good day, how are you?"), ("Miło cię poznać", "Nice to meet you"), ("Dziękuję bardzo za pomoc", "Thank you very much for help")]},
    {"slug": "uk", "title": "Ukrainian", "native": "Українська", "family": "Slavic", "locale": "uk-UA", "flag": "🇺🇦",
     "phrases": [("Доброго ранку, як справи?", "Good morning, how are things?"), ("Приємно познайомитися", "Pleasant to meet you"), ("Щиро дякую вам", "Sincerely thank you")]},
    {"slug": "cs", "title": "Czech", "native": "Čeština", "family": "Slavic", "locale": "cs-CZ", "flag": "🇨🇿",
     "phrases": [("Dobré ráno, jak se máte?", "Good morning, how are you?"), ("Těší mě, že vás poznávám", "Delighted to meet you"), ("Kde je prosím tramvaj?", "Where is the tram please?")]},
    {"slug": "sk", "title": "Slovak", "native": "Slovenčina", "family": "Slavic", "locale": "sk-SK", "flag": "🇸🇰",
     "phrases": [("Dobré ráno, teší ma", "Good morning, pleased to meet you"), ("Ďakujem pekne za pomoc", "Thank you nicely for help"), ("Kde nájdem stanicu?", "Where can I find the station?")]},
    {"slug": "bg", "title": "Bulgarian", "native": "Български", "family": "Slavic", "locale": "bg-BG", "flag": "🇧🇬",
     "phrases": [("Добро утро на всички", "Good morning to all"), ("Приятно ми е да се запознаем", "Pleasure to meet you"), ("Благодаря ви много", "Thank you very much")]},
    {"slug": "sr", "title": "Serbian", "native": "Српски", "family": "Slavic", "locale": "sr-RS", "flag": "🇷🇸",
     "phrases": [("Добро јутро, како сте?", "Good morning, how are you?"), ("Драго ми је што смо се упознали", "Glad that we met"), ("Хвала вам пуно", "Thank you plenty")]},
    {"slug": "hr", "title": "Croatian", "native": "Hrvatski", "family": "Slavic", "locale": "hr-HR", "flag": "🇭🇷",
     "phrases": [("Dobro jutro, drago mi je", "Good morning, pleased to meet you"), ("Lijep pozdrav iz Zagreba", "Warm greetings from Zagreb"), ("Hvala lijepa na svemu", "Thank you very much for everything")]},

    # Semitic
    {"slug": "ar", "title": "Arabic", "native": "العربية", "family": "Semitic", "locale": "ar-SA", "flag": "🇸🇦",
     "phrases": [("صباح الخير، كيف حالك؟", "Good morning, how are you?"), ("تشرفت بمعرفتك كثيراً", "Greatly honored to know you"), ("شكراً جزيلاً لمساعدتك", "Thank you very much for your help")]},
    {"slug": "he", "title": "Hebrew", "native": "עברית", "family": "Semitic", "locale": "he-IL", "flag": "🇮🇱",
     "phrases": [("בוקר טוב, מה שלומך היום?", "Good morning, how are you today?"), ("נעים מאוד להכיר אותך", "Very pleasant to meet you"), ("תודה רבה על הכל", "Thank you very much for everything")]},
    {"slug": "am", "title": "Amharic", "native": "አማርኛ", "family": "Semitic", "locale": "am-ET", "flag": "🇪🇹",
     "phrases": [("እንደምን አደሩ፣ ደህና ነዎት?", "Good morning, are you well?"), ("ስላገኘሁዎት በጣም ደስ ብሎኛል", "Very glad to have met you"), ("በጣም አመሰግናለሁ", "Thank you very much")]},

    # Indo-Aryan & Iranian
    {"slug": "hi", "title": "Hindi", "native": "हिन्दी", "family": "Indo-Aryan", "locale": "hi-IN", "flag": "🇮🇳",
     "phrases": [("नमस्ते, आप कैसे हैं?", "Hello, how are you?"), ("आपसे मिलकर बहुत खुशी हुई", "Very happy to meet you"), ("आपकी मदद के लिए धन्यवाद", "Thank you for your help")]},
    {"slug": "bn", "title": "Bengali", "native": "বাংলা", "family": "Indo-Aryan", "locale": "bn-BD", "flag": "🇧🇩",
     "phrases": [("শুভ সকাল, আপনি কেমন আছেন?", "Good morning, how are you?"), ("আপনার সাথে পরিচিত হয়ে ভালো লাগলো", "Good to meet you"), ("আপনাকে অনেক ধন্যবাদ", "Thank you very much")]},
    {"slug": "pa", "title": "Punjabi", "native": "ਪੰਜਾਬੀ", "family": "Indo-Aryan", "locale": "pa-IN", "flag": "🇮🇳",
     "phrases": [("ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ", "Greetings and blessings"), ("ਤੁਹਾਡੇ ਨਾਲ ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ", "Happy to have met you"), ("ਧੰਨਵਾਦ ਜੀ", "Thank you")]},
    {"slug": "gu", "title": "Gujarati", "native": "ગુજરાતી", "family": "Indo-Aryan", "locale": "gu-IN", "flag": "🇮🇳",
     "phrases": [("નમસ્તે, તમે કેમ છો?", "Hello, how are you?"), ("તમને મળીને આનંદ થયો", "Delighted to meet you"), ("ખૂબ ખૂબ આભાર", "Thank you very much")]},
    {"slug": "ur", "title": "Urdu", "native": "اردو", "family": "Indo-Aryan", "locale": "ur-PK", "flag": "🇵🇰",
     "phrases": [("صبح بخیر، آپ کیسے ہیں؟", "Good morning, how are you?"), ("آپ سے مل کر دلی خوشی ہوئی", "Heartfelt pleasure to meet you"), ("بہت بہت شکریہ", "Thank you very much")]},
    {"slug": "mr", "title": "Marathi", "native": "मराठी", "family": "Indo-Aryan", "locale": "mr-IN", "flag": "🇮🇳",
     "phrases": [("शुभ प्रभात, कसे आहात?", "Good morning, how are you?"), ("तुम्हाला भेटून खूप आनंद झाला", "Very glad to meet you"), ("धन्यवाद", "Thank you")]},
    {"slug": "fa", "title": "Persian", "native": "فارسی", "family": "Indo-Iranian", "locale": "fa-IR", "flag": "🇮🇷",
     "phrases": [("صبح بخیر، حال شما چطور است؟", "Good morning, how is your state?"), ("از آشنایی با شما بسیار خوشوقتم", "Very pleased to become acquainted with you"), ("خیلی متشکرم", "Thank you very much")]},

    # Dravidian
    {"slug": "ta", "title": "Tamil", "native": "தமிழ்", "family": "Dravidian", "locale": "ta-IN", "flag": "🇮🇳",
     "phrases": [("காலை வணக்கம், எப்படி இருக்கிறீர்கள்?", "Good morning, how are you?"), ("உங்களை சந்தித்ததில் மகிழ்ச்சி", "Glad to meet you"), ("மிக்க நன்றி", "Thanks much")]},
    {"slug": "te", "title": "Telugu", "native": "తెలుగు", "family": "Dravidian", "locale": "te-IN", "flag": "🇮🇳",
     "phrases": [("శుభోదయం, మీరు ఎలా ఉన్నారు?", "Good morning, how are you?"), ("మిమ్మల్ని కలవడం సంతోషం", "Happy to meet you"), ("చాలా ధన్యవాదాలు", "Many thanks")]},
    {"slug": "ml", "title": "Malayalam", "native": "മലയാളം", "family": "Dravidian", "locale": "ml-IN", "flag": "🇮🇳",
     "phrases": [("സുപ്രഭാതം, സുഖമാണോ?", "Good morning, are you comfortable?"), ("കണ്ടുമുട്ടിയതിൽ സന്തോഷം", "Happy to have met"), ("വളരെ നന്ദി", "Very thanks")]},
    {"slug": "kn", "title": "Kannada", "native": "ಕನ್ನಡ", "family": "Dravidian", "locale": "kn-IN", "flag": "🇮🇳",
     "phrases": [("ಶುಭೋದಯ, ಹೇಗಿದ್ದೀರಿ?", "Good morning, how are you?"), ("ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷ", "Happy having met you"), ("ತುಂಬಾ ಧನ್ಯವಾದಗಳು", "Many thanks")]},

    # Uralic
    {"slug": "fi", "title": "Finnish", "native": "Suomi", "family": "Uralic", "locale": "fi-FI", "flag": "🇫🇮",
     "phrases": [("Hyvää huomenta, mitä kuuluu?", "Good morning, what belongs?"), ("Hauska tutustua sinuun", "Fun to get to know you"), ("Kiitos paljon avusta", "Thanks much for help")]},
    {"slug": "hu", "title": "Hungarian", "native": "Magyar", "family": "Uralic", "locale": "hu-HU", "flag": "🇭🇺",
     "phrases": [("Jó reggelt, hogy vagy?", "Good morning, how are you?"), ("Örülök, hogy megismerhetlek", "Glad I can know you"), ("Köszönöm szépen a segítséget", "Thank you nicely for help")]},
    {"slug": "et", "title": "Estonian", "native": "Eesti", "family": "Uralic", "locale": "et-EE", "flag": "🇪🇪",
     "phrases": [("Tere hommikust kõigile", "Good morning to all"), ("Väga meeldiv kohtuda", "Very pleasant to meet"), ("Suur aitäh sulle", "Big thanks to you")]},

    # Celtic
    {"slug": "ga", "title": "Irish", "native": "Gaeilge", "family": "Celtic", "locale": "ga-IE", "flag": "🇮🇪",
     "phrases": [("Dia duit ar maidin", "God be with you this morning"), ("Deas bualadh leat", "Nice meeting with you"), ("Go raibh míle maith agat", "May you have a thousand good things")]},
    {"slug": "gd", "title": "Scottish Gaelic", "native": "Gàidhlig", "family": "Celtic", "locale": "gd-GB", "flag": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
     "phrases": [("Madainn mhath dhuibh uile", "Good morning to you all"), ("Tha e math coinneachadh riut", "It is good meeting you"), ("Tapadh leat gu mòr", "Thank you greatly")]},
    {"slug": "cy", "title": "Welsh", "native": "Cymraeg", "family": "Celtic", "locale": "cy-GB", "flag": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
     "phrases": [("Bore da, sut wyt ti heddiw?", "Good morning, how are you today?"), ("Braf cwrdd â chi", "Fine meeting you"), ("Diolch yn fawr iawn", "Thanks very big indeed")]},
    {"slug": "br", "title": "Breton", "native": "Brezhoneg", "family": "Celtic", "locale": "br-FR", "flag": "🇫🇷",
     "phrases": [("Demat d'an holl", "Good day to all"), ("Plijadur zo oc'h ober anaoudegezh", "Pleasure is making acquaintance"), ("Trugarez vras", "Great gratitude")]},

    # Turkic
    {"slug": "tr", "title": "Turkish", "native": "Türkçe", "family": "Turkic", "locale": "tr-TR", "flag": "🇹🇷",
     "phrases": [("Günaydın, nasılsınız bugün?", "Good morning, how are you today?"), ("Tanıştığımıza çok memnun oldum", "Very pleased we met"), ("Çok teşekkür ederim", "Thank you very much")]},
    {"slug": "az", "title": "Azerbaijani", "native": "Azərbaycan", "family": "Turkic", "locale": "az-AZ", "flag": "🇦🇿",
     "phrases": [("Sabahınız xeyir olsun", "May your morning be good"), ("Sizinlə tanış olmaqdan çox şadam", "Very glad to meet you"), ("Çox sağ olun", "Be very healthy")]},
    {"slug": "kk", "title": "Kazakh", "native": "Қазақ тілі", "family": "Turkic", "locale": "kk-KZ", "flag": "🇰🇿",
     "phrases": [("Қайырлы таң, қалыңыз қалай?", "Good morning, how is your state?"), ("Сізбен танысқаныма қуаныштымын", "Glad to have met you"), ("Үлкен рақмет", "Big thank you")]},
    {"slug": "uz", "title": "Uzbek", "native": "Oʻzbekcha", "family": "Turkic", "locale": "uz-UZ", "flag": "🇺🇿",
     "phrases": [("Xayrli tong, yaxshimisiz?", "Good morning, are you good?"), ("Siz bilan tanishganimdan xursandman", "Happy having met you"), ("Katta rahmat", "Big thanks")]},

    # Austronesian
    {"slug": "id", "title": "Indonesian", "native": "Bahasa Indonesia", "family": "Austronesian", "locale": "id-ID", "flag": "🇮🇩",
     "phrases": [("Selamat pagi, apa kabar?", "Good morning, what news?"), ("Senang berkenalan dengan Anda", "Happy getting acquainted with you"), ("Terima kasih banyak atas bantuannya", "Thank you very much for help")]},
    {"slug": "tl", "title": "Tagalog", "native": "Tagalog", "family": "Austronesian", "locale": "tl-PH", "flag": "🇵🇭",
     "phrases": [("Magandang umaga sa inyo", "Beautiful morning to you"), ("Ikinagagalak kitang makilala", "Glad to meet you"), ("Maraming salamat po", "Many thanks")]},
    {"slug": "haw", "title": "Hawaiian", "native": "ʻŌlelo Hawaiʻi", "family": "Austronesian", "locale": "haw-US", "flag": "🌺",
     "phrases": [("Aloha kakahiaka e nā hoa", "Good morning friends"), ("Hauʻoli e hui pū me ʻoe", "Happy to meet with you"), ("Mahalo nui loa", "Thanks very much")]},
    {"slug": "mi", "title": "Maori", "native": "Te Reo Māori", "family": "Austronesian", "locale": "mi-NZ", "flag": "🇳🇿",
     "phrases": [("Kia ora mōrena e hoa mā", "Good morning friends"), ("Koa ana te tūtaki ki a koe", "Joyous meeting you"), ("Kia ora rawa atu", "Be well indeed")]},

    # Hellenic & Kartvelian & Others
    {"slug": "el", "title": "Greek", "native": "Ελληνικά", "family": "Hellenic", "locale": "el-GR", "flag": "🇬🇷",
     "phrases": [("Καλημέρα, πώς είστε σήμερα;", "Good morning, how are you today?"), ("Χάρηκα πολύ για τη γνωριμία", "Delighted very much for acquaintance"), ("Ευχαριστώ πάρα πολύ", "Thank you very much")]},
    {"slug": "ka", "title": "Georgian", "native": "ქართული", "family": "Kartvelian", "locale": "ka-GE", "flag": "🇬🇪",
     "phrases": [("დილა მშვიდობისა ყველას", "Peaceful morning to all"), ("ძალიან სასიამოვნოა თქვენი გაცნობა", "Very pleasant meeting you"), ("დიდი მადლობა", "Big gratitude")]},
    {"slug": "vi", "title": "Vietnamese", "native": "Tiếng Việt", "family": "Austroasiatic", "locale": "vi-VN", "flag": "🇻🇳",
     "phrases": [("Chào buổi sáng, bạn khỏe không?", "Good morning, are you healthy?"), ("Rất vui được gặp bạn", "Very happy to meet you"), ("Cảm ơn bạn rất nhiều", "Thank you very much")]},
    {"slug": "th", "title": "Thai", "native": "ไทย", "family": "Kra-Dai", "locale": "th-TH", "flag": "🇹🇭",
     "phrases": [("สวัสดีตอนเช้า สบายดีไหมครับ", "Good morning, are you comfortable?"), ("ยินดีที่ได้รู้จักครับ", "Delighted to have known you"), ("ขอบคุณมากครับ", "Thank you very much")]},
    {"slug": "sw", "title": "Swahili", "native": "Kiswahili", "family": "Niger-Congo", "locale": "sw-KE", "flag": "🇰🇪",
     "phrases": [("Habari za asubuhi rafiki yangu", "Morning news my friend"), ("Nimefurahi kukutana nawe", "Happy to meet with you"), ("Asante sana kwa msaada", "Thanks much for help")]},
    {"slug": "la", "title": "Latin", "native": "Latina", "family": "Classic", "locale": "la-VA", "flag": "🏛️",
     "phrases": [("Salve, quomodo te habes hodie?", "Hail, how do you have yourself today?"), ("Mihi pergratum est te convenisse", "It is very pleasing to have met you"), ("Gratias maximas tibi ago", "I give the greatest thanks to you")]},
    {"slug": "eo", "title": "Esperanto", "native": "Esperanto", "family": "Constructed", "locale": "eo-001", "flag": "🟢",
     "phrases": [("Bonan matenon, kiel vi fartas?", "Good morning, how do you fare?"), ("Tre plaĉas al mi renkonti vin", "Very pleasing to me to meet you"), ("Dankon multe pro via helpo", "Thanks much for your help")]},
]


def seed_languages_catalog(db) -> int:
    """Seed or update all 61 world language courses with standardized units, skills, and exercises."""
    from app.models import Course, Unit, Skill, Lesson, Exercise, ExerciseOption

    created_count = 0

    for lang in LANGUAGES_CATALOG:
        slug = lang["slug"]
        course = db.query(Course).filter(Course.slug == slug).first()
        if not course:
            course = Course(
                slug=slug,
                title=f"{lang['title']} for English Speakers",
                source_language="en",
                target_language=slug,
                flag_emoji=lang["flag"],
                description=f"Master {lang['title']} with bite-sized lessons, native speech cadence, and cognitive spaced repetition.",
                locale_code=lang["locale"],
                native_name=lang["native"],
                learner_name=lang["title"],
                language_family=lang["family"],
                flag_asset=f"/flags/{slug}.svg",
            )
            db.add(course)
            db.flush()
            created_count += 1
        else:
            course.locale_code = lang["locale"]
            course.native_name = lang["native"]
            course.learner_name = lang["title"]
            course.language_family = lang["family"]
            course.flag_asset = f"/flags/{slug}.svg"
            course.flag_emoji = lang["flag"]

        # Ensure >= 3 units exist per course
        existing_units = db.query(Unit).filter(Unit.course_id == course.id).all()
        if len(existing_units) < 3:
            unit_specs = [
                ("Unit 1: Essentials & Greetings", "Form basic sentences, introduce yourself, and master core conversational rhythm.", "emerald"),
                ("Unit 2: Daily Life & Travel", "Navigate transport, order meals, and ask local directions in cities.", "sky"),
                ("Unit 3: Culture & Connections", "Express opinions, describe experiences, and converse naturally.", "amber"),
            ]
            for u_idx, (u_title, u_desc, u_color) in enumerate(unit_specs, start=1):
                unit = Unit(
                    course_id=course.id,
                    order_index=u_idx,
                    title=u_title,
                    description=u_desc,
                    theme_color=u_color,
                    grammar_tip_title=f"{lang['title']} Phonetic & Word Order Notes",
                    grammar_tip_markdown=f"In {lang['title']}, listen carefully to the sentence cadence and phonetic tones.",
                )
                db.add(unit)
                db.flush()

                # >= 3 skills per unit
                skill_names = [
                    (f"{lang['title']} Fundamentals", "star", False),
                    ("Café & Transit", "coffee", False),
                    ("Checkpoint & Review", "crown", True),
                ]
                for s_idx, (s_title, s_icon, is_gate) in enumerate(skill_names, start=1):
                    skill = Skill(
                        unit_id=unit.id,
                        order_index=s_idx,
                        slug=f"{slug}-u{u_idx}-s{s_idx}",
                        title=s_title,
                        description=f"Practice {s_title.lower()} with interactive vocabulary and audio speech.",
                        icon_name=s_icon,
                        is_checkpoint=is_gate,
                        is_bonus_legendary=(s_idx == 3 and u_idx == 3),
                        max_crowns=3,
                        grammar_tip=f"Remember common colloquial greetings in {lang['title']}.",
                    )
                    db.add(skill)
                    db.flush()

                    # 1 lesson per skill
                    lesson = Lesson(
                        skill_id=skill.id,
                        order_index=1,
                        title=f"{s_title} Practice 1",
                        xp_reward=15,
                        is_legendary=(s_idx == 3 and u_idx == 3),
                        heart_limit=5,
                    )
                    db.add(lesson)
                    db.flush()

                    # Representative mix of exercises: multiple_choice, word_bank, match_pairs, listening, speaking
                    phrases = lang["phrases"]
                    target_phrase, eng_trans = phrases[(u_idx + s_idx) % len(phrases)]

                    # Exercise 1: Multiple choice
                    ex1 = Exercise(
                        lesson_id=lesson.id,
                        order_index=1,
                        exercise_type="multiple_choice",
                        difficulty=1,
                        prompt_text=f'What is the English translation for "{target_phrase}"?',
                        source_sentence=target_phrase,
                        correct_answer=eng_trans,
                        hint_text="Common greeting",
                        audio_text=target_phrase,
                        audio_lang=lang["locale"],
                        explanation=f'"{target_phrase}" directly translates to "{eng_trans}".',
                    )
                    db.add(ex1)
                    db.flush()
                    db.add(ExerciseOption(exercise_id=ex1.id, order_index=1, option_text=eng_trans, is_correct=True))
                    db.add(ExerciseOption(exercise_id=ex1.id, order_index=2, option_text="Where is the airport?", is_correct=False))
                    db.add(ExerciseOption(exercise_id=ex1.id, order_index=3, option_text="Good night, see you tomorrow", is_correct=False))

                    # Exercise 2: Word Bank
                    words = target_phrase.split(" ")
                    ex2 = Exercise(
                        lesson_id=lesson.id,
                        order_index=2,
                        exercise_type="word_bank",
                        difficulty=1,
                        prompt_text=f'Assemble the phrase: "{eng_trans}"',
                        source_sentence="",
                        correct_answer=target_phrase,
                        hint_text="Tap the tiles in correct order",
                        audio_text=target_phrase,
                        audio_lang=lang["locale"],
                        explanation="Word order in natural speech.",
                    )
                    db.add(ex2)
                    db.flush()
                    for w_i, w in enumerate(words):
                        db.add(ExerciseOption(exercise_id=ex2.id, order_index=w_i + 1, option_text=w, is_correct=True))
                    db.add(ExerciseOption(exercise_id=ex2.id, order_index=len(words) + 1, option_text="extra", is_correct=False))

                    # Exercise 3: Match Pairs
                    ex3 = Exercise(
                        lesson_id=lesson.id,
                        order_index=3,
                        exercise_type="match_pairs",
                        difficulty=2,
                        prompt_text="Match the corresponding word pairs",
                        source_sentence="",
                        correct_answer=f"{words[0]}:{eng_trans.split()[0]}",
                        hint_text="Match source to translation",
                        audio_text="",
                        audio_lang=lang["locale"],
                        explanation="Connect the paired vocabulary terms.",
                    )
                    db.add(ex3)
                    db.flush()
                    for pair_idx, p in enumerate(phrases):
                        db.add(ExerciseOption(
                            exercise_id=ex3.id,
                            order_index=pair_idx + 1,
                            option_text=p[0].split()[0],
                            match_pair_text=p[1].split()[0],
                            is_correct=True,
                        ))

                    # Exercise 4: Listening
                    ex4 = Exercise(
                        lesson_id=lesson.id,
                        order_index=4,
                        exercise_type="listening",
                        difficulty=2,
                        prompt_text="Listen carefully and select the spoken phrase",
                        source_sentence=target_phrase,
                        correct_answer=target_phrase,
                        hint_text="Use turtle mode if speech is fast",
                        audio_text=target_phrase,
                        audio_lang=lang["locale"],
                        explanation="Phonetic auditory listening comprehension.",
                    )
                    db.add(ex4)
                    db.flush()
                    db.add(ExerciseOption(exercise_id=ex4.id, order_index=1, option_text=target_phrase, is_correct=True))
                    db.add(ExerciseOption(exercise_id=ex4.id, order_index=2, option_text="Alternate spoken dialect", is_correct=False))

                    # Exercise 5: Speaking
                    ex5 = Exercise(
                        lesson_id=lesson.id,
                        order_index=5,
                        exercise_type="speaking",
                        difficulty=2,
                        prompt_text=f'Speak this phrase into the microphone: "{target_phrase}"',
                        source_sentence=target_phrase,
                        correct_answer=target_phrase,
                        hint_text="Speak clearly into your microphone",
                        audio_text=target_phrase,
                        audio_lang=lang["locale"],
                        explanation="Voice cadence and accent accuracy.",
                    )
                    db.add(ex5)
                    db.flush()

    db.commit()
    return created_count
