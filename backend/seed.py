"""Deterministic database seed script for Diolingo.

Populates:
- 3 Courses (Spanish with 3 complete Units & 10 Skills, plus French & Japanese starter units)
- All 7 exercise types (multiple_choice, word_bank, match_pairs, fill_blank, type_answer, listening, speaking)
- Default Guest Learner (guest@diolingo.edu) & Admin account (admin@diolingo.edu)
- 10 competing Leaderboard learners with social graph connections
- Achievements, Shop catalog, and sample Feedback/Bug reports
"""
from datetime import date, datetime, timedelta
import bcrypt
from sqlalchemy.orm import Session
from app.database import Base, SessionLocal, engine
from app.models import (
    Achievement,
    Course,
    Exercise,
    ExerciseMissStat,
    ExerciseOption,
    FeedbackReport,
    Follow,
    Lesson,
    ShopItem,
    Skill,
    Unit,
    User,
    UserAchievement,
    UserInventory,
    UserSkillProgress,
    UserStats,
)


def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def add_exercise(
    db: Session,
    lesson_id: int,
    order_index: int,
    exercise_type: str,
    prompt_text: str,
    correct_answer: str,
    source_sentence: str = "",
    hint_text: str = "",
    audio_text: str = "",
    audio_lang: str = "es-ES",
    explanation: str = "",
    difficulty: int = 1,
    options: list | None = None,
    miss_count: int = 0,
):
    ex = Exercise(
        lesson_id=lesson_id,
        order_index=order_index,
        exercise_type=exercise_type,
        difficulty=difficulty,
        prompt_text=prompt_text,
        source_sentence=source_sentence,
        correct_answer=correct_answer,
        hint_text=hint_text,
        audio_text=audio_text or source_sentence,
        audio_lang=audio_lang,
        explanation=explanation,
    )
    db.add(ex)
    db.flush()

    if options:
        for idx, opt in enumerate(options, start=1):
            db.add(
                ExerciseOption(
                    exercise_id=ex.id,
                    order_index=idx,
                    option_text=opt.get("text", ""),
                    match_pair_text=opt.get("match", ""),
                    image_emoji=opt.get("emoji", ""),
                    is_correct=opt.get("is_correct", False),
                )
            )

    if miss_count > 0:
        db.add(
            ExerciseMissStat(
                exercise_id=ex.id,
                miss_count=miss_count,
                attempt_count=miss_count * 3 + 5,
            )
        )
    return ex


def seed_database(db: Session) -> dict:
    Base.metadata.create_all(bind=engine)

    existing_course = db.query(Course).first()
    if existing_course:
        return {"status": "already_seeded"}

    # 1. Courses
    es_course = Course(
        slug="spanish",
        title="Spanish",
        source_language="en",
        target_language="es",
        flag_emoji="🇪🇸",
        description="Learn conversational Spanish with everyday phrases, café ordering, travel navigation, and grammar guidebooks.",
    )
    fr_course = Course(
        slug="french",
        title="French",
        source_language="en",
        target_language="fr",
        flag_emoji="🇫🇷",
        description="Master foundational French greetings, pronunciation, and Parisian café expressions.",
    )
    ja_course = Course(
        slug="japanese",
        title="Japanese",
        source_language="en",
        target_language="ja",
        flag_emoji="🇯🇵",
        description="Discover essential Japanese greetings, polite expressions, and travel phrases.",
    )
    db.add_all([es_course, fr_course, ja_course])
    db.flush()

    # 2. Spanish Units (3 full units)
    u1 = Unit(
        course_id=es_course.id,
        order_index=1,
        title="Unit 1: Greetings & Introductions",
        description="Say hello, introduce yourself, and use basic gendered nouns.",
        theme_color="emerald",
        grammar_tip_title="Gendered Nouns & Polite Greetings",
        grammar_tip_markdown=(
            "### Masculine & Feminine Nouns\n"
            "In Spanish, nouns have grammatical gender:\n"
            "- **El niño** (the boy) uses the masculine article **el**.\n"
            "- **La niña** (the girl) uses the feminine article **la**.\n\n"
            "### Key Expressions\n"
            "| Spanish | English |\n"
            "|---|---|\n"
            "| **¡Hola! Buenos días** | Hello! Good morning |\n"
            "| **Mucho gusto** | Nice to meet you |\n"
            "| **Yo soy...** | I am... |\n"
            "| **Por favor / Gracias** | Please / Thank you |"
        ),
    )
    u2 = Unit(
        course_id=es_course.id,
        order_index=2,
        title="Unit 2: Café, Food & Ordering",
        description="Order coffee, meals, and ask for the check in a bustling café.",
        theme_color="sky",
        grammar_tip_title="Using 'Quiero' & 'Me gustaría'",
        grammar_tip_markdown=(
            "### Ordering Food Politely\n"
            "- **Yo quiero un café** = I want a coffee.\n"
            "- **¿La cuenta, por favor?** = The check, please?\n"
            "- **Un vaso de agua** = A glass of water.\n"
            "- Notice that **agua** uses **el agua** in singular for pronunciation flow!"
        ),
    )
    u3 = Unit(
        course_id=es_course.id,
        order_index=3,
        title="Unit 3: Travel, Directions & Daily Routine",
        description="Navigate airports, train stations, hotels, and tell time.",
        theme_color="purple",
        grammar_tip_title="Asking '¿Dónde está...?' vs '¿Dónde hay...?'",
        grammar_tip_markdown=(
            "### Asking for Locations\n"
            "- Use **¿Dónde está...?** for a specific place: *¿Dónde está el hotel?* (Where is the hotel?)\n"
            "- Use **Necesito ayuda** when you need assistance while traveling."
        ),
    )
    db.add_all([u1, u2, u3])
    db.flush()

    # Unit 1 Skills (4 skills: 3 regular + 1 Unit 1 Checkpoint)
    s1_1 = Skill(
        unit_id=u1.id,
        order_index=1,
        slug="greetings-1",
        title="Hello & Goodbye",
        description="Essential daily greetings and polite words.",
        icon_name="hand-wave",
        max_crowns=3,
        grammar_tip="Remember that ¡Hola! always uses an inverted exclamation mark at the beginning in written Spanish.",
    )
    s1_2 = Skill(
        unit_id=u1.id,
        order_index=2,
        slug="people-basics",
        title="People & Introductions",
        description="Talk about who you are and where you are from.",
        icon_name="users",
        max_crowns=3,
        grammar_tip="Use 'Yo soy' (I am) + name or nationality, and 'Tú eres' (You are).",
    )
    s1_3 = Skill(
        unit_id=u1.id,
        order_index=3,
        slug="courtesy-phrases",
        title="Polite Phrases",
        description="Say please, thank you, excuse me, and nice to meet you.",
        icon_name="heart-handshake",
        max_crowns=3,
        grammar_tip="'Mucho gusto' literally means 'much pleasure' and is used by anyone to say 'Nice to meet you'.",
    )
    s1_checkpoint = Skill(
        unit_id=u1.id,
        order_index=4,
        slug="unit-1-checkpoint",
        title="Unit 1 Checkpoint",
        description="Pass this mixed-review exam to unlock Unit 2!",
        icon_name="trophy",
        is_checkpoint=True,
        max_crowns=1,
        grammar_tip="Review all Unit 1 greetings, pronouns, and courtesy expressions.",
    )

    # Unit 2 Skills (3 skills + 1 Checkpoint)
    s2_1 = Skill(
        unit_id=u2.id,
        order_index=1,
        slug="cafe-drinks",
        title="At the Café",
        description="Order coffee, tea, milk, and bread.",
        icon_name="coffee",
        max_crowns=3,
        grammar_tip="'Con leche' means 'with milk' and 'sin azúcar' means 'without sugar'.",
    )
    s2_2 = Skill(
        unit_id=u2.id,
        order_index=2,
        slug="restaurant-table",
        title="Restaurant Table",
        description="Ask for a table, menu, and the bill.",
        icon_name="utensils",
        max_crowns=3,
        grammar_tip="Use 'Una mesa para dos' to ask for a table for two people.",
    )
    s2_3 = Skill(
        unit_id=u2.id,
        order_index=3,
        slug="market-shopping",
        title="Market & Prices",
        description="Ask how much items cost at the market.",
        icon_name="shopping-bag",
        max_crowns=3,
        grammar_tip="'¿Cuánto cuesta esto?' means 'How much does this cost?'",
    )
    s2_checkpoint = Skill(
        unit_id=u2.id,
        order_index=4,
        slug="unit-2-checkpoint",
        title="Unit 2 Checkpoint",
        description="Mixed food and café review gating Unit 3.",
        icon_name="trophy",
        is_checkpoint=True,
        max_crowns=1,
    )

    # Unit 3 Skills (3 skills including Legendary Bonus Boss)
    s3_1 = Skill(
        unit_id=u3.id,
        order_index=1,
        slug="airport-transit",
        title="Airport & Train",
        description="Passports, tickets, and boarding gates.",
        icon_name="plane",
        max_crowns=3,
    )
    s3_2 = Skill(
        unit_id=u3.id,
        order_index=2,
        slug="city-directions",
        title="City Directions",
        description="Find hotels, museums, and streets.",
        icon_name="compass",
        max_crowns=3,
    )
    s3_3 = Skill(
        unit_id=u3.id,
        order_index=3,
        slug="legendary-mastery",
        title="Legendary Mastery",
        description="High-stakes bonus challenge with 3-heart limit and double XP!",
        icon_name="crown",
        is_bonus_legendary=True,
        max_crowns=1,
    )

    db.add_all([s1_1, s1_2, s1_3, s1_checkpoint, s2_1, s2_2, s2_3, s2_checkpoint, s3_1, s3_2, s3_3])
    db.flush()

    # Lesson 1.1: Hello & Goodbye (Contains all 7 exercise types!)
    l1_1 = Lesson(skill_id=s1_1.id, order_index=1, title="Greetings Essentials", xp_reward=15)
    db.add(l1_1)
    db.flush()

    add_exercise(
        db, l1_1.id, 1, "multiple_choice",
        prompt_text="Select the correct translation for \"Good morning\"",
        source_sentence="Good morning",
        correct_answer="Buenos días",
        hint_text="Buenos = good, días = mornings/days",
        audio_text="Buenos días",
        explanation="'Buenos días' is used throughout the morning until noon.",
        options=[
            {"text": "Buenos días", "emoji": "☀️", "is_correct": True},
            {"text": "Buenas noches", "emoji": "🌙", "is_correct": False},
            {"text": "Hasta luego", "emoji": "👋", "is_correct": False},
            {"text": "Muchas gracias", "emoji": "🙏", "is_correct": False},
        ],
        miss_count=4,
    )
    add_exercise(
        db, l1_1.id, 2, "word_bank",
        prompt_text="Translate this sentence using the word bank",
        source_sentence="¡Hola! Buenos días, amigo.",
        correct_answer="Hello! Good morning, friend.|Hello Good morning friend",
        hint_text="Hola = Hello, amigo = friend",
        audio_text="¡Hola! Buenos días, amigo.",
        explanation="'Amigo' means male friend (or friend in general).",
        options=[
            {"text": "Hello!", "is_correct": True},
            {"text": "Good", "is_correct": True},
            {"text": "morning,", "is_correct": True},
            {"text": "friend.", "is_correct": True},
            {"text": "night", "is_correct": False},
            {"text": "water", "is_correct": False},
            {"text": "goodbye", "is_correct": False},
        ],
        miss_count=9,
    )
    add_exercise(
        db, l1_1.id, 3, "match_pairs",
        prompt_text="Tap the matching Spanish and English pairs",
        source_sentence="Match all 4 vocabulary pairs",
        correct_answer="MATCHED_ALL",
        hint_text="Pair each Spanish word on the left with its English meaning on the right.",
        options=[
            {"text": "Hola", "match": "Hello", "is_correct": True},
            {"text": "Adiós", "match": "Goodbye", "is_correct": True},
            {"text": "Gracias", "match": "Thank you", "is_correct": True},
            {"text": "Por favor", "match": "Please", "is_correct": True},
        ],
        miss_count=3,
    )
    add_exercise(
        db, l1_1.id, 4, "fill_blank",
        prompt_text="Fill in the blank to complete the sentence",
        source_sentence="¡Buenas _____, hasta mañana! (Good night, see you tomorrow!)",
        correct_answer="noches",
        hint_text="Night in plural = noches",
        audio_text="Buenas noches, hasta mañana",
        options=[
            {"text": "noches", "is_correct": True},
            {"text": "días", "is_correct": False},
            {"text": "agua", "is_correct": False},
            {"text": "perros", "is_correct": False},
        ],
        miss_count=6,
    )
    add_exercise(
        db, l1_1.id, 5, "type_answer",
        prompt_text="Type the English translation (typo tolerance active!)",
        source_sentence="Muchas gracias, amigo",
        correct_answer="Thank you very much friend|Thanks a lot friend|Many thanks friend",
        hint_text="Muchas gracias = Thank you very much",
        audio_text="Muchas gracias, amigo",
        explanation="Even if you make a tiny 1-letter typo like 'Thnk you very much friend', Diolingo's fuzzy matcher accepts it!",
        miss_count=12,
    )
    add_exercise(
        db, l1_1.id, 6, "listening",
        prompt_text="Tap what you hear",
        source_sentence="Hola, mucho gusto",
        correct_answer="Hola, mucho gusto|Hola mucho gusto",
        hint_text="Click the speaker button to hear normal or slow turtle speed.",
        audio_text="Hola, mucho gusto",
        options=[
            {"text": "Hola,", "is_correct": True},
            {"text": "mucho", "is_correct": True},
            {"text": "gusto", "is_correct": True},
            {"text": "noche", "is_correct": False},
            {"text": "leche", "is_correct": False},
        ],
    )
    add_exercise(
        db, l1_1.id, 7, "speaking",
        prompt_text="Speak this sentence out loud",
        source_sentence="Buenos días, ¿cómo estás?",
        correct_answer="Buenos días, ¿cómo estás?|Buenos dias como estas",
        hint_text="Click the microphone or 'Simulate Speech / Skip' if on a quiet device.",
        audio_text="Buenos días, ¿cómo estás?",
    )

    # Lesson 1.2: People & Introductions
    l1_2 = Lesson(skill_id=s1_2.id, order_index=1, title="Introducing Yourself", xp_reward=15)
    db.add(l1_2)
    db.flush()

    add_exercise(
        db, l1_2.id, 1, "multiple_choice",
        prompt_text="Which word means \"The boy\"?",
        source_sentence="The boy",
        correct_answer="El niño",
        hint_text="Masculine singular uses 'El'",
        audio_text="El niño",
        options=[
            {"text": "El niño", "emoji": "👦", "is_correct": True},
            {"text": "La niña", "emoji": "👧", "is_correct": False},
            {"text": "La mujer", "emoji": "👩", "is_correct": False},
            {"text": "El libro", "emoji": "📗", "is_correct": False},
        ],
        miss_count=7,
    )
    add_exercise(
        db, l1_2.id, 2, "word_bank",
        prompt_text="Translate into English",
        source_sentence="Yo soy de Madrid y tú eres de México.",
        correct_answer="I am from Madrid and you are from Mexico.",
        hint_text="Yo soy = I am, tú eres = you are",
        audio_text="Yo soy de Madrid y tú eres de México.",
        options=[
            {"text": "I", "is_correct": True},
            {"text": "am", "is_correct": True},
            {"text": "from", "is_correct": True},
            {"text": "Madrid", "is_correct": True},
            {"text": "and", "is_correct": True},
            {"text": "you", "is_correct": True},
            {"text": "are", "is_correct": True},
            {"text": "from", "is_correct": True},
            {"text": "Mexico.", "is_correct": True},
            {"text": "coffee", "is_correct": False},
        ],
        miss_count=11,
    )
    add_exercise(
        db, l1_2.id, 3, "match_pairs",
        prompt_text="Match the pronouns and nouns",
        source_sentence="Tap matching pairs",
        correct_answer="MATCHED_ALL",
        options=[
            {"text": "Yo", "match": "I", "is_correct": True},
            {"text": "Tú", "match": "You", "is_correct": True},
            {"text": "El hombre", "match": "The man", "is_correct": True},
            {"text": "La mujer", "match": "The woman", "is_correct": True},
        ],
    )
    add_exercise(
        db, l1_2.id, 4, "fill_blank",
        prompt_text="Complete the introduction",
        source_sentence="Hola, yo _____ estudiante de español.",
        correct_answer="soy",
        hint_text="First-person singular of 'ser' (to be)",
        audio_text="Hola, yo soy estudiante de español.",
        options=[
            {"text": "soy", "is_correct": True},
            {"text": "eres", "is_correct": False},
            {"text": "son", "is_correct": False},
            {"text": "agua", "is_correct": False},
        ],
    )
    add_exercise(
        db, l1_2.id, 5, "type_answer",
        prompt_text="Translate this sentence into English",
        source_sentence="Ella es mi amiga",
        correct_answer="She is my friend|She is my female friend",
        hint_text="Ella = She, es = is, mi amiga = my friend",
        audio_text="Ella es mi amiga",
    )

    # Lesson 1.3: Polite Phrases
    l1_3 = Lesson(skill_id=s1_3.id, order_index=1, title="Everyday Courtesy", xp_reward=15)
    db.add(l1_3)
    db.flush()

    add_exercise(
        db, l1_3.id, 1, "multiple_choice",
        prompt_text="How do you say \"Excuse me / Sorry\" in Spanish?",
        source_sentence="Excuse me",
        correct_answer="Perdón",
        audio_text="Perdón, señor",
        options=[
            {"text": "Perdón", "emoji": "🙋", "is_correct": True},
            {"text": "Manzana", "emoji": "🍎", "is_correct": False},
            {"text": "Mañana", "emoji": "📅", "is_correct": False},
            {"text": "Hermano", "emoji": "🧑", "is_correct": False},
        ],
    )
    add_exercise(
        db, l1_3.id, 2, "word_bank",
        prompt_text="Build the English translation",
        source_sentence="Disculpe, ¿habla usted inglés?",
        correct_answer="Excuse me, do you speak English?|Excuse me do you speak English",
        audio_text="Disculpe, ¿habla usted inglés?",
        options=[
            {"text": "Excuse", "is_correct": True},
            {"text": "me,", "is_correct": True},
            {"text": "do", "is_correct": True},
            {"text": "you", "is_correct": True},
            {"text": "speak", "is_correct": True},
            {"text": "English?", "is_correct": True},
            {"text": "train", "is_correct": False},
            {"text": "apple", "is_correct": False},
        ],
        miss_count=14,
    )
    add_exercise(
        db, l1_3.id, 3, "match_pairs",
        prompt_text="Match the polite expressions",
        source_sentence="Pair Spanish and English",
        correct_answer="MATCHED_ALL",
        options=[
            {"text": "De nada", "match": "You're welcome", "is_correct": True},
            {"text": "Lo siento", "match": "I am sorry", "is_correct": True},
            {"text": "Con permiso", "match": "Pardon me", "is_correct": True},
            {"text": "Claro", "match": "Of course", "is_correct": True},
        ],
    )
    add_exercise(
        db, l1_3.id, 4, "fill_blank",
        prompt_text="Complete the polite response",
        source_sentence="— ¡Muchas gracias! — ¡De _____!",
        correct_answer="nada",
        options=[
            {"text": "nada", "is_correct": True},
            {"text": "todo", "is_correct": False},
            {"text": "algo", "is_correct": False},
            {"text": "leche", "is_correct": False},
        ],
    )
    add_exercise(
        db, l1_3.id, 5, "type_answer",
        prompt_text="Type the Spanish phrase for \"Nice to meet you\"",
        source_sentence="Nice to meet you",
        correct_answer="Mucho gusto|Encantado|Encantada",
        hint_text="Starts with 'Mucho...'",
        audio_text="Mucho gusto",
    )

    # Lesson 1.4: Unit 1 Checkpoint Exam
    l1_cp = Lesson(skill_id=s1_checkpoint.id, order_index=1, title="Unit 1 Checkpoint Challenge", xp_reward=30)
    db.add(l1_cp)
    db.flush()

    add_exercise(
        db, l1_cp.id, 1, "word_bank",
        prompt_text="Checkpoint Q1: Translate the full greeting",
        source_sentence="Buenos días, yo soy Sofía. ¡Mucho gusto!",
        correct_answer="Good morning, I am Sofia. Nice to meet you!|Good morning I am Sofia Nice to meet you",
        audio_text="Buenos días, yo soy Sofía. ¡Mucho gusto!",
        options=[
            {"text": "Good", "is_correct": True},
            {"text": "morning,", "is_correct": True},
            {"text": "I", "is_correct": True},
            {"text": "am", "is_correct": True},
            {"text": "Sofia.", "is_correct": True},
            {"text": "Nice", "is_correct": True},
            {"text": "to", "is_correct": True},
            {"text": "meet", "is_correct": True},
            {"text": "you!", "is_correct": True},
        ],
    )
    add_exercise(
        db, l1_cp.id, 2, "match_pairs",
        prompt_text="Checkpoint Q2: Match all Unit 1 vocabulary",
        source_sentence="Match pairs",
        correct_answer="MATCHED_ALL",
        options=[
            {"text": "Buenos días", "match": "Good morning", "is_correct": True},
            {"text": "El niño", "match": "The boy", "is_correct": True},
            {"text": "La niña", "match": "The girl", "is_correct": True},
            {"text": "De nada", "match": "You're welcome", "is_correct": True},
        ],
    )
    add_exercise(
        db, l1_cp.id, 3, "type_answer",
        prompt_text="Checkpoint Q3: Translate into English",
        source_sentence="Disculpe, ¿habla usted español?",
        correct_answer="Excuse me, do you speak Spanish?|Excuse me do you speak Spanish",
        audio_text="Disculpe, ¿habla usted español?",
    )

    # Unit 2 Lessons
    for idx, sk in enumerate([s2_1, s2_2, s2_3, s2_checkpoint], start=1):
        les = Lesson(skill_id=sk.id, order_index=1, title=f"{sk.title} Practice", xp_reward=20 if sk.is_checkpoint else 15)
        db.add(les)
        db.flush()
        add_exercise(
            db, les.id, 1, "multiple_choice",
            prompt_text="How do you order \"A coffee with milk, please\"?",
            source_sentence="A coffee with milk, please",
            correct_answer="Un café con leche, por favor",
            audio_text="Un café con leche, por favor",
            options=[
                {"text": "Un café con leche, por favor", "emoji": "☕", "is_correct": True},
                {"text": "Una mesa para cuatro", "emoji": "🪑", "is_correct": False},
                {"text": "El tren rápido", "emoji": "🚆", "is_correct": False},
                {"text": "Buenas tardes", "emoji": "🌇", "is_correct": False},
            ],
            miss_count=8,
        )
        add_exercise(
            db, les.id, 2, "word_bank",
            prompt_text="Translate this restaurant request",
            source_sentence="Yo quiero una mesa para dos personas, por favor.",
            correct_answer="I want a table for two people, please.|I want a table for two people please",
            audio_text="Yo quiero una mesa para dos personas, por favor.",
            options=[
                {"text": "I", "is_correct": True},
                {"text": "want", "is_correct": True},
                {"text": "a", "is_correct": True},
                {"text": "table", "is_correct": True},
                {"text": "for", "is_correct": True},
                {"text": "two", "is_correct": True},
                {"text": "people,", "is_correct": True},
                {"text": "please.", "is_correct": True},
                {"text": "museum", "is_correct": False},
            ],
        )
        add_exercise(
            db, les.id, 3, "match_pairs",
            prompt_text="Match the café items",
            source_sentence="Tap pairs",
            correct_answer="MATCHED_ALL",
            options=[
                {"text": "El café", "match": "The coffee", "is_correct": True},
                {"text": "El pan", "match": "The bread", "is_correct": True},
                {"text": "La cuenta", "match": "The bill/check", "is_correct": True},
                {"text": "El agua", "match": "The water", "is_correct": True},
            ],
        )
        add_exercise(
            db, les.id, 4, "fill_blank",
            prompt_text="Complete the price question",
            source_sentence="¿Cuánto _____ este pan delicioso?",
            correct_answer="cuesta",
            options=[
                {"text": "cuesta", "is_correct": True},
                {"text": "quiero", "is_correct": False},
                {"text": "habla", "is_correct": False},
                {"text": "somos", "is_correct": False},
            ],
        )
        add_exercise(
            db, les.id, 5, "type_answer",
            prompt_text="Translate into English",
            source_sentence="La cuenta, por favor",
            correct_answer="The check, please|The bill, please|The check please|The bill please",
            audio_text="La cuenta, por favor",
        )

    # Unit 3 Lessons (including Legendary Bonus Boss)
    for sk in [s3_1, s3_2, s3_3]:
        les = Lesson(
            skill_id=sk.id,
            order_index=1,
            title=f"{sk.title} Challenge",
            xp_reward=35 if sk.is_bonus_legendary else 15,
            is_legendary=sk.is_bonus_legendary,
            heart_limit=3 if sk.is_bonus_legendary else 5,
        )
        db.add(les)
        db.flush()
        add_exercise(
            db, les.id, 1, "multiple_choice",
            prompt_text="Translate \"Where is the train station?\"",
            source_sentence="Where is the train station?",
            correct_answer="¿Dónde está la estación de tren?",
            audio_text="¿Dónde está la estación de tren?",
            options=[
                {"text": "¿Dónde está la estación de tren?", "emoji": "🚉", "is_correct": True},
                {"text": "¿Dónde está mi pasaporte?", "emoji": "🛂", "is_correct": False},
                {"text": "El hotel está cerrado", "emoji": "🏨", "is_correct": False},
                {"text": "Quiero comprar un boleto", "emoji": "🎟️", "is_correct": False},
            ],
        )
        add_exercise(
            db, les.id, 2, "word_bank",
            prompt_text="Translate this travel sentence",
            source_sentence="Necesito mi pasaporte y mi boleto para el avión.",
            correct_answer="I need my passport and my ticket for the airplane.|I need my passport and my ticket for the plane",
            audio_text="Necesito mi pasaporte y mi boleto para el avión.",
            options=[
                {"text": "I", "is_correct": True},
                {"text": "need", "is_correct": True},
                {"text": "my", "is_correct": True},
                {"text": "passport", "is_correct": True},
                {"text": "and", "is_correct": True},
                {"text": "my", "is_correct": True},
                {"text": "ticket", "is_correct": True},
                {"text": "for", "is_correct": True},
                {"text": "the", "is_correct": True},
                {"text": "airplane.", "is_correct": True},
            ],
        )
        add_exercise(
            db, les.id, 3, "type_answer",
            prompt_text="Translate into English",
            source_sentence="¿Dónde está el hotel?",
            correct_answer="Where is the hotel?|Where is the hotel",
            audio_text="¿Dónde está el hotel?",
        )

    # Seed French & Japanese starter unit so switching courses works seamlessly
    for extra_course, greeting_word, greeting_trans, lang_code in [
        (fr_course, "Bonjour, comment ça va ?", "Hello, how are you?", "fr-FR"),
        (ja_course, "Konnichiwa, arigatou gozaimasu", "Hello, thank you very much", "ja-JP"),
    ]:
        eu = Unit(
            course_id=extra_course.id,
            order_index=1,
            title=f"Unit 1: {extra_course.title} Foundations",
            description=f"Essential everyday expressions in {extra_course.title}.",
            theme_color="emerald",
            grammar_tip_title=f"{extra_course.title} Core Greetings",
            grammar_tip_markdown=f"Practice speaking and recognizing core phrases in **{extra_course.title}**.",
        )
        db.add(eu)
        db.flush()
        esk = Skill(
            unit_id=eu.id,
            order_index=1,
            slug=f"{extra_course.slug}-basics",
            title=f"{extra_course.title} Basics 1",
            description="Start speaking right away!",
            icon_name="star",
            max_crowns=3,
        )
        db.add(esk)
        db.flush()
        eles = Lesson(skill_id=esk.id, order_index=1, title="Starter Lesson", xp_reward=15)
        db.add(eles)
        db.flush()
        add_exercise(
            db, eles.id, 1, "multiple_choice",
            prompt_text=f"Select the translation for \"{greeting_word}\"",
            source_sentence=greeting_word,
            correct_answer=greeting_trans,
            audio_text=greeting_word,
            audio_lang=lang_code,
            options=[
                {"text": greeting_trans, "emoji": "✨", "is_correct": True},
                {"text": "Where is the library?", "emoji": "📚", "is_correct": False},
                {"text": "One ticket please", "emoji": "🎟️", "is_correct": False},
                {"text": "See you next week", "emoji": "👋", "is_correct": False},
            ],
        )

    # 3. Achievements Catalog
    achievements_data = [
        ("first_lesson", "First Step", "Complete your very first language lesson", "🐣", 1, 25),
        ("streak_3", "Wildfire", "Reach a 3-day learning streak", "🔥", 3, 40),
        ("streak_7", "Unstoppable", "Maintain a 7-day learning streak", "⚡", 7, 100),
        ("perfect_lesson", "Sharpshooter", "Complete a lesson with 100% accuracy", "🎯", 1, 30),
        ("xp_500", "Scholar", "Earn 500 lifetime XP across lessons", "🎓", 500, 60),
        ("crown_collector", "Crown Collector", "Earn 5 skill crowns on the learning path", "👑", 5, 80),
    ]
    ach_objs = {}
    for code, title, desc, emoji, target, reward in achievements_data:
        a = Achievement(
            code=code,
            title=title,
            description=desc,
            icon_emoji=emoji,
            target_value=target,
            gem_reward=reward,
        )
        db.add(a)
        db.flush()
        ach_objs[code] = a

    # 4. Shop Items Catalog
    shop_items_data = [
        ("streak_freeze", "Streak Freeze", "powerup", "Protects your streak if you miss a calendar day of practice.", 100, "🧊"),
        ("xp_boost", "Double XP Potion (15m)", "powerup", "Earn 2x XP on all lessons completed for the next 15 minutes.", 80, "🧪"),
        ("heart_refill", "Full Heart Refill", "powerup", "Instantly restore your hearts back to the maximum of 5.", 50, "❤️"),
        ("outfit_tuxedo", "Golden Gala Tuxedo Dio", "outfit", "Dress Dio in a sharp emerald-trimmed tuxedo for formal study.", 120, "🤵"),
        ("outfit_superhero", "Super Feather Cape", "outfit", "Give Dio a heroic cape that flutters on every streak milestone.", 150, "🦸"),
        ("outfit_pirate", "Captain Polyglot Hat", "outfit", "Sail the seven seas of vocabulary with Captain Dio.", 140, "🏴‍☠️"),
    ]
    for code, name, cat, desc, price, emoji in shop_items_data:
        db.add(ShopItem(code=code, name=name, category=cat, description=desc, price_gems=price, icon_emoji=emoji))
    db.flush()

    # 5. Users: Default Guest Learner + Admin + 10 Leaderboard Competitors
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    guest_user = User(
        email="guest@diolingo.edu",
        username="alex_guest",
        display_name="Alex Rivera (Guest Learner)",
        password_hash=hash_pw("guest1234"),
        avatar_url="/mascot-dio.png",
        equipped_outfit="outfit_superhero",
        role="learner",
        is_guest=True,
        active_course_id=es_course.id,
        daily_xp_goal=20,
    )
    admin_user = User(
        email="admin@diolingo.edu",
        username="sofia_admin",
        display_name="Prof. Sofia (Admin)",
        password_hash=hash_pw("admin1234"),
        avatar_url="/mascot-dio.png",
        equipped_outfit="outfit_tuxedo",
        role="admin",
        is_guest=False,
        active_course_id=es_course.id,
        daily_xp_goal=50,
    )
    db.add_all([guest_user, admin_user])
    db.flush()

    guest_stats = UserStats(
        user_id=guest_user.id,
        xp_total=460,
        xp_today=15,
        streak_count=5,
        longest_streak=9,
        last_active_date=yesterday,  # Ready to increment to 6 on today's first completed lesson!
        hearts=5,
        max_hearts=5,
        gems=240,
        streak_freeze_equipped=True,
        league_tier="Silver",
        lessons_completed_count=6,
        perfect_lessons_count=3,
    )
    admin_stats = UserStats(
        user_id=admin_user.id,
        xp_total=1250,
        xp_today=50,
        streak_count=14,
        longest_streak=21,
        last_active_date=today,
        hearts=5,
        max_hearts=5,
        gems=850,
        streak_freeze_equipped=True,
        league_tier="Gold",
        lessons_completed_count=24,
        perfect_lessons_count=18,
    )
    db.add_all([guest_stats, admin_stats])

    # Pre-seed Guest Learner's skill progress so the winding path shows Completed (Gold Crown), Active, and Locked states
    db.add_all([
        UserSkillProgress(user_id=guest_user.id, skill_id=s1_1.id, crowns=3, lessons_completed=3),
        UserSkillProgress(user_id=guest_user.id, skill_id=s1_2.id, crowns=1, lessons_completed=1),
    ])
    # Pre-seed Guest Achievements & Inventory
    db.add_all([
        UserAchievement(user_id=guest_user.id, achievement_id=ach_objs["first_lesson"].id),
        UserAchievement(user_id=guest_user.id, achievement_id=ach_objs["streak_3"].id),
        UserAchievement(user_id=guest_user.id, achievement_id=ach_objs["perfect_lesson"].id),
        UserInventory(user_id=guest_user.id, item_code="outfit_superhero", quantity=1),
        UserInventory(user_id=guest_user.id, item_code="streak_freeze", quantity=1),
    ])

    # 10 Competing Leaderboard Learners
    competitors = [
        ("mateo_es", "Mateo Vargas", 640, 12, "Silver", True),
        ("lucia_m", "Lucía Mendoza", 580, 9, "Silver", True),
        ("kenji_t", "Kenji Takahashi", 510, 8, "Silver", False),
        ("amelie_p", "Amélie Laurent", 475, 6, "Silver", True),
        ("carlos_r", "Carlos Ruiz", 430, 4, "Silver", False),
        ("priya_s", "Priya Sharma", 390, 7, "Silver", True),
        ("liam_o", "Liam O'Connor", 315, 3, "Silver", False),
        ("elena_k", "Elena Rostova", 260, 2, "Silver", False),
        ("noah_b", "Noah Bennett", 890, 19, "Gold", False),
        ("zara_h", "Zara Al-Mansoor", 195, 2, "Bronze", False),
    ]
    for uname, dname, xp, strk, tier, is_friend in competitors:
        u = User(
            email=f"{uname}@diolingo.edu",
            username=uname,
            display_name=dname,
            password_hash=hash_pw("learner123"),
            role="learner",
            active_course_id=es_course.id,
        )
        db.add(u)
        db.flush()
        db.add(
            UserStats(
                user_id=u.id,
                xp_total=xp,
                xp_today=xp % 45,
                streak_count=strk,
                longest_streak=strk + 3,
                last_active_date=today,
                hearts=5,
                max_hearts=5,
                gems=120,
                league_tier=tier,
                lessons_completed_count=max(2, xp // 50),
            )
        )
        if is_friend:
            db.add(Follow(follower_id=guest_user.id, followed_id=u.id))

    # Also follow Prof. Sofia
    db.add(Follow(follower_id=guest_user.id, followed_id=admin_user.id))

    # 6. Seed Feedback / Bug Reports for Admin Operations
    db.add_all([
        FeedbackReport(
            user_email="mateo_es@diolingo.edu",
            category="content",
            summary="Accept 'el carro' in addition to 'el coche' in Unit 3",
            details="Latin American Spanish speakers frequently use 'carro' instead of 'coche'.",
            status="open",
        ),
        FeedbackReport(
            user_email="lucia_m@diolingo.edu",
            category="suggestion",
            summary="Add slow-playback turtle button on speaking exercises",
            details="The slow TTS playback in listening exercises is super helpful—would love it on speaking cards too!",
            status="open",
        ),
        FeedbackReport(
            user_email="priya_s@diolingo.edu",
            category="bug",
            summary="Heart timer display on mobile safari",
            details="Verified fixed in v1.0 release.",
            status="resolved",
        ),
    ])
    db.commit()

    # Seed 61 world languages catalog
    from seed_languages import seed_languages_catalog
    extra_seeded = seed_languages_catalog(db)

    return {
        "status": "seeded",
        "guest_email": "guest@diolingo.edu",
        "admin_email": "admin@diolingo.edu",
        "world_languages_seeded": extra_seeded,
    }


if __name__ == "__main__":
    with SessionLocal() as session:
        result = seed_database(session)
        print("Diolingo Database Seed Result:", result)
