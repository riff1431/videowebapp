import { pool, db } from "../src/db";
import { categories, subCategories } from "../src/db/schema";
import { eq } from "drizzle-orm";

const SEED_CATEGORIES = [
  {
    key: "film",
    name: "Film & Animation",
    sortOrder: 1,
    translations: JSON.stringify({
      english: "Film & Animation",
      arabic: "فيلم والرسوم المتحركة",
      dutch: "Film & Animatie",
      french: "Film et animation",
      german: "Film & Animation",
      russian: "Фильмы и анимация",
      spanish: "Película y animación",
      turkish: "Film ve Animasyon",
      hindi: "फिल्म और एनीमेशन",
      chinese: "电影与动画",
      urdu: "فلم اور حرکت پذیری",
      indonesian: "Film & Animasi",
      croatian: "Film i animacija",
      hebrew: "סרטים ואנימציה",
      bengali: "চলচ্চিত্র ও অ্যানিমেশন",
      japanese: "映画とアニメーション",
      portuguese: "Filme e Animação",
      italian: "Film e animazione",
      persian: "فیلم و انیمیشن",
      swedish: "Film och animering",
      vietnamese: "Phim & Hoạt hình",
      danish: "Film og animation",
      filipino: "Pelikula at Animasyon",
    }),
  },
  {
    key: "cars",
    name: "Cars & Vehicles",
    sortOrder: 2,
    translations: JSON.stringify({
      english: "Cars & Vehicles",
      arabic: "السيارات والسيارات",
      french: "Voitures et véhicules",
      spanish: "Autos y vehículos",
    }),
  },
  {
    key: "music",
    name: "Music",
    sortOrder: 3,
    translations: JSON.stringify({
      english: "Music",
      arabic: "موسيقى",
      dutch: "Muziek",
      french: "La musique",
      german: "Musik",
      russian: "Музыка",
      spanish: "Música",
      turkish: "Müzik",
      hindi: "संगीत",
      chinese: "音乐",
      urdu: "موسیقی",
      indonesian: "Musik",
      bengali: "সঙ্গীত",
      japanese: "音楽",
      portuguese: "Música",
      italian: "Musica",
    }),
  },
  {
    key: "pets",
    name: "Pets & Animals",
    sortOrder: 4,
    translations: JSON.stringify({
      english: "Pets & Animals",
      arabic: "الحيوانات الأليفة الحيوانات",
      french: "Animaux et animaux",
      spanish: "Mascotas y animales",
      german: "Haustiere & Tiere",
    }),
  },
  {
    key: "sports",
    name: "Sports",
    sortOrder: 5,
    translations: JSON.stringify({
      english: "Sports",
      arabic: "رياضات",
      french: "Des sports",
      spanish: "Deportes",
      german: "Sport",
    }),
  },
  {
    key: "travel",
    name: "Travel & Events",
    sortOrder: 6,
    translations: JSON.stringify({
      english: "Travel & Events",
      arabic: "السفر والأحداث",
      french: "Voyages et événements",
      spanish: "Viajes y eventos",
    }),
  },
  {
    key: "gaming",
    name: "Gaming",
    sortOrder: 7,
    translations: JSON.stringify({
      english: "Gaming",
      arabic: "الألعاب",
      french: "Gaming",
      spanish: "Juegos",
      german: "Gaming",
    }),
  },
  {
    key: "people",
    name: "People & Blogs",
    sortOrder: 8,
    translations: JSON.stringify({
      english: "People & Blogs",
      arabic: "الناس والمدونات",
      french: "Personnes et Blogs",
      spanish: "Personas y blogs",
    }),
  },
  {
    key: "comedy",
    name: "Comedy",
    sortOrder: 9,
    translations: JSON.stringify({
      english: "Comedy",
      arabic: "كوميديا",
      french: "Comédie",
      spanish: "Comedia",
      german: "Komödie",
    }),
  },
  {
    key: "entertainment",
    name: "Entertainment",
    sortOrder: 10,
    translations: JSON.stringify({
      english: "Entertainment",
      arabic: "وسائل الترفيه",
      french: "Divertissement",
      spanish: "Entretenimiento",
      german: "Unterhaltung",
    }),
  },
  {
    key: "news",
    name: "News & Politics",
    sortOrder: 11,
    translations: JSON.stringify({
      english: "News & Politics",
      arabic: "الأخبار والسياسة",
      french: "Nouvelles et politique",
      spanish: "Noticias y política",
      german: "Nachrichten & Politik",
    }),
  },
  {
    key: "howto",
    name: "How-to & Style",
    sortOrder: 12,
    translations: JSON.stringify({
      english: "How-to & Style",
      arabic: "كيف تصمم",
      french: "Comment styliser",
      spanish: "Cómo y estilo",
    }),
  },
  {
    key: "nonprofit",
    name: "Non-profits & Activism",
    sortOrder: 13,
    translations: JSON.stringify({
      english: "Non-profits & Activism",
      arabic: "غير الربحية والنشاط",
      french: "Organismes à but non lucratif et activisme",
      spanish: "Sin fines de lucro y activismo",
    }),
  },
  {
    key: "tech",
    name: "Science & Technology",
    sortOrder: 14,
    translations: JSON.stringify({
      english: "Science & Technology",
      arabic: "العلوم والتكنولوجيا",
      french: "Science et technologie",
      spanish: "Ciencia y tecnología",
      german: "Wissenschaft & Technik",
    }),
  },
  {
    key: "education",
    name: "Education",
    sortOrder: 15,
    translations: JSON.stringify({
      english: "Education",
      arabic: "تعليم",
      french: "Éducation",
      spanish: "Educación",
      german: "Bildung",
    }),
  },
  {
    key: "stock",
    name: "Stock Videos",
    sortOrder: 16,
    translations: JSON.stringify({
      english: "Stock Videos",
      arabic: "فيديوهات الأسهم",
      french: "Vidéos de stock",
      spanish: "Videos de archivo",
    }),
  },
  {
    key: "other",
    name: "Other",
    sortOrder: 99,
    translations: JSON.stringify({
      english: "Other",
      arabic: "آخر",
      french: "Autre",
      spanish: "Otro",
      german: "Sonstiges",
    }),
  },
];

async function seedCategories() {
  console.log("Seeding categories into DB...");

  for (const cat of SEED_CATEGORIES) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.key, cat.key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(categories)
        .set({
          name: cat.name,
          sortOrder: cat.sortOrder,
          translations: cat.translations,
        })
        .where(eq(categories.key, cat.key));
    } else {
      await db.insert(categories).values(cat);
    }
  }

  console.log("Seeding initial sub-categories...");
  const initialSubs = [
    {
      categoryKey: "film",
      key: "action_film",
      name: "Action",
      translations: JSON.stringify({ english: "Action", french: "Action" }),
    },
    {
      categoryKey: "film",
      key: "animated_shorts",
      name: "Animated Shorts",
      translations: JSON.stringify({ english: "Animated Shorts" }),
    },
    {
      categoryKey: "music",
      key: "pop_music",
      name: "Pop",
      translations: JSON.stringify({ english: "Pop" }),
    },
    {
      categoryKey: "music",
      key: "rock_music",
      name: "Rock",
      translations: JSON.stringify({ english: "Rock" }),
    },
    {
      categoryKey: "gaming",
      key: "esports",
      name: "eSports",
      translations: JSON.stringify({ english: "eSports" }),
    },
  ];

  for (const sub of initialSubs) {
    const existing = await db
      .select({ id: subCategories.id })
      .from(subCategories)
      .where(eq(subCategories.key, sub.key))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(subCategories).values(sub);
    }
  }

  console.log("Categories & SubCategories seed finished successfully!");
  await pool.end();
}

seedCategories().catch(console.error);
