import { db, pool } from "@/db";
import {
  categories,
  users,
  videos,
  articles,
  watchHistory,
  likesDislikes,
  subscriptions,
  transactions,
  siteConfig,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  console.log("=== Seeding PlayTube with Comprehensive Real Data ===");

  // 1. Default Categories
  const defaultCategories = [
    { key: "film", name: "Film & Animation", sortOrder: 1 },
    { key: "music", name: "Music", sortOrder: 2 },
    { key: "gaming", name: "Gaming", sortOrder: 3 },
    { key: "entertainment", name: "Entertainment", sortOrder: 4 },
    { key: "news", name: "News & Politics", sortOrder: 5 },
    { key: "education", name: "Education", sortOrder: 6 },
    { key: "tech", name: "Science & Technology", sortOrder: 7 },
    { key: "stock", name: "Stock Videos", sortOrder: 8 },
    { key: "other", name: "Other", sortOrder: 9 },
  ];

  for (const cat of defaultCategories) {
    await db
      .insert(categories)
      .values(cat)
      .onConflictDoNothing({ target: categories.key });
  }

  // 2. Verified Creators & Channels
  const creators = [
    {
      name: "PlayTube Official",
      username: "admin",
      email: "admin@playtube.local",
      role: "admin",
      isAdmin: true,
      emailVerified: true,
      verified: true,
      points: 4850,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
      about: "Official PlayTube channel for platform updates, new feature spotlights, and community announcements.",
    },
    {
      name: "CinemaScope Studios",
      username: "cinemascope",
      email: "cinema@playtube.local",
      role: "user",
      isAdmin: false,
      emailVerified: true,
      verified: true,
      points: 12400,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
      about: "Independent cinema collective producing award-winning sci-fi, documentary, and open-source CGI films.",
    },
    {
      name: "TechForge Digital",
      username: "techforge",
      email: "tech@playtube.local",
      role: "user",
      isAdmin: false,
      emailVerified: true,
      verified: true,
      points: 9820,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
      cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80",
      about: "Deep dives into artificial intelligence, modern engineering, graphics architecture, and developer gear.",
    },
    {
      name: "Aura Soundscapes",
      username: "aurasound",
      email: "music@playtube.local",
      role: "user",
      isAdmin: false,
      emailVerified: true,
      verified: true,
      points: 8640,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80",
      about: "Cinematic instrumental music, acoustic melodies, and relaxing soundscapes recorded live in studio.",
    },
    {
      name: "WildEarth Explorers",
      username: "wildearth",
      email: "wild@playtube.local",
      role: "user",
      isAdmin: false,
      emailVerified: true,
      verified: true,
      points: 15300,
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
      cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
      about: "Breathtaking 4K drone cinematography capturing wildlife, national parks, and extreme terrain across 7 continents.",
    },
    {
      name: "PixelForge VFX",
      username: "pixelforge",
      email: "vfx@playtube.local",
      role: "user",
      isAdmin: false,
      emailVerified: true,
      verified: true,
      points: 7120,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80",
      about: "3D animation breakdowns, Blender geometry nodes masterclasses, and visual effects breakdowns.",
    },
  ];

  const userMap: Record<string, number> = {};

  for (const c of creators) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, c.username))
      .limit(1);

    if (existing[0]) {
      userMap[c.username] = existing[0].id;
      await db
        .update(users)
        .set({
          name: c.name,
          avatar: c.avatar,
          cover: c.cover,
          verified: c.verified,
          about: c.about,
        })
        .where(eq(users.id, existing[0].id));
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          name: c.name,
          username: c.username,
          email: c.email,
          role: c.role,
          isAdmin: c.isAdmin,
          emailVerified: c.emailVerified,
          verified: c.verified,
          avatar: c.avatar,
          cover: c.cover,
          about: c.about,
        })
        .returning();
      if (inserted) {
        userMap[c.username] = inserted.id;
      }
    }
  }

  const adminId = userMap["admin"] || 1;
  const cinemaId = userMap["cinemascope"] || adminId;
  const techId = userMap["techforge"] || adminId;
  const auraId = userMap["aurasound"] || adminId;
  const wildId = userMap["wildearth"] || adminId;
  const vfxId = userMap["pixelforge"] || adminId;

  // 3. Subscriptions between creators
  const subPairs = [
    { subscriberId: adminId, channelId: cinemaId },
    { subscriberId: adminId, channelId: techId },
    { subscriberId: adminId, channelId: wildId },
    { subscriberId: techId, channelId: cinemaId },
    { subscriberId: cinemaId, channelId: vfxId },
    { subscriberId: auraId, channelId: cinemaId },
    { subscriberId: wildId, channelId: cinemaId },
  ];

  for (const pair of subPairs) {
    await db
      .insert(subscriptions)
      .values(pair)
      .onConflictDoNothing();
  }

  // 4. Real Video Dataset (Spread across time ranges so All Time, This Year, This Month, This Week, Today all have data!)
  const now = Date.now();
  const HOUR = 3600 * 1000;
  const DAY = 24 * HOUR;

  const realVideos = [
    // -------------------------------------------------------------
    // 1. Film & Animation (categoryId: "film")
    // -------------------------------------------------------------
    {
      videoId: "cinematic-aurora-borealis-4k",
      userId: wildId,
      title: "Arctic Symphony: 4K Ultra HD Drone Expedition in Northern Norway",
      description: "Filmed over 30 days under the Arctic polar night in Tromso and the Lofoten archipelago. Experience the northern lights in ultra high definition color fidelity.",
      thumbnail: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      duration: "08:42",
      views: 29120,
      categoryId: "film",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 8 * HOUR),
    },
    {
      videoId: "tears-of-steel-open-movie",
      userId: cinemaId,
      title: "Tears of Steel — Full Sci-Fi VFX Short Film (4K Remaster)",
      description: "Set in a dystopian future Amsterdam, a group of scientists and soldiers attempt to stage a crucial event in the past to save the world from destructive robots.",
      thumbnail: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/Tears-of-Steel/tears_of_steel_720p.mp4",
      duration: "12:14",
      views: 142000,
      categoryId: "film",
      privacy: 0,
      isMovie: true,
      movieRelease: "2024",
      rating: 4.9,
      producer: "Ton Roosendaal",
      stars: "Derek de Lint, Sergio Hasselbaink, Rogier Schippers",
      quality: "4K UHD",
      featured: true,
      price: 0,
      createdAt: new Date(now - 2 * DAY),
    },
    {
      videoId: "big-buck-bunny-remastered",
      userId: cinemaId,
      title: "Big Buck Bunny: 60 FPS 4K Remastered Animation Classic",
      description: "A large and lovable rabbit deals with bullying forest creatures in this legendary open-source animated film by the Blender Foundation.",
      thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      duration: "09:56",
      views: 312000,
      categoryId: "film",
      privacy: 0,
      isMovie: true,
      movieRelease: "2023",
      rating: 4.9,
      producer: "Sacha Goedegebure",
      stars: "Bunny, Rinky, Gamera, Frank",
      quality: "4K UHD",
      featured: true,
      price: 0,
      createdAt: new Date(now - 12 * DAY),
    },
    {
      videoId: "sintel-the-dragon-hunter",
      userId: cinemaId,
      title: "Sintel — Fantasy Epic Short Film & Behind The Scenes",
      description: "The poignant journey of a young woman named Sintel searching for her pet dragon Scales through treacherous lands, bandits, and forgotten temples.",
      thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/Sintel/sintel-2048-surround.mp4",
      duration: "14:48",
      views: 245000,
      categoryId: "film",
      privacy: 0,
      isMovie: true,
      movieRelease: "2023",
      rating: 4.8,
      producer: "Colin Levy",
      stars: "Halina Reijn, Thom Hoffman",
      quality: "4K UHD",
      featured: true,
      price: 4.99,
      monetization: true,
      createdAt: new Date(now - 18 * DAY),
    },
    {
      videoId: "elephants-dream-movie",
      userId: cinemaId,
      title: "Elephants Dream — Surrealist Sci-Fi Feature (HDR Edition)",
      description: "Proog and Emo explore the strange mechanical and organic depths of an infinite machine, navigating contrasting visions of reality.",
      thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/ElephantsDream/ed_hd.mp4",
      duration: "10:53",
      views: 198000,
      categoryId: "film",
      privacy: 0,
      isMovie: true,
      movieRelease: "2022",
      rating: 4.7,
      producer: "Bassam Kurdali",
      stars: "Tygo Gernandt, Cas Jansen",
      quality: "4K UHD",
      featured: true,
      price: 2.99,
      monetization: true,
      createdAt: new Date(now - 45 * DAY),
    },

    // -------------------------------------------------------------
    // 2. Science & Technology (categoryId: "tech")
    // -------------------------------------------------------------
    {
      videoId: "quantum-ai-revolution-2026",
      userId: techId,
      title: "The Quantum AI Leap: What Next-Gen Silicon Means for Real-Time Neural Networks",
      description: "We analyze the revolutionary leap in photonic compute architectures, optical interconnects, and what sub-millisecond LLM latency means for autonomous engineering systems.",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "14:28",
      views: 38450,
      categoryId: "tech",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 4 * HOUR),
    },
    {
      videoId: "deep-ocean-bioluminescence",
      userId: wildId,
      title: "Creatures of the Midnight Zone: 4K Submersible Deep Sea Dive",
      description: "Descend 3,000 meters into the Mariana Trench with our scientific research vessel. Stunning footage of siphonophores, anglerfish, and glowing deep-sea corals.",
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "18:22",
      views: 178000,
      categoryId: "tech",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 22 * DAY),
    },
    {
      videoId: "autonomous-robotics-bipedal",
      userId: techId,
      title: "Next-Gen Humanoid Robotics: Reinforcement Learning in Real-World Locomotion",
      description: "How end-to-end neural networks trained in simulated physics environments achieve human-level agility across rough terrains and balance disruptions.",
      thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/bunny/movie.mp4",
      duration: "16:15",
      views: 52400,
      categoryId: "tech",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 3 * DAY),
    },
    {
      videoId: "silicon-nanoscale-architecture",
      userId: techId,
      title: "Sub-2nm Gate All Around Transistors: Inside Extreme Ultraviolet Lithography",
      description: "A tour of how modern cleanrooms etch Billions of transistors using High-NA EUV optics and GAAFET architecture.",
      thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/video/movie_300.mp4",
      duration: "21:04",
      views: 41800,
      categoryId: "tech",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "HD",
      createdAt: new Date(now - 9 * DAY),
    },

    // -------------------------------------------------------------
    // 3. Music (categoryId: "music")
    // -------------------------------------------------------------
    {
      videoId: "ambient-acoustic-reverie",
      userId: auraId,
      title: "Deep Focus Ambient Guitar: 1 Hour of Live Studio Soundscapes",
      description: "Gentle analog delays, warm tape saturation, and melodic ambient acoustic guitar movements designed for deep creative focus and relaxation.",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "45:10",
      views: 18900,
      categoryId: "music",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "HD",
      createdAt: new Date(now - 14 * HOUR),
    },
    {
      videoId: "analog-modular-synth-session",
      userId: auraId,
      title: "Eurorack Modular Synth Live Jam: Ambient Techno & Polyphonic Textures",
      description: "Patch breakdown and uninterrupted 30-minute improvisational analog jam utilizing patchable oscillators, spring reverb, and Buchla waveshaping.",
      thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "32:18",
      views: 31200,
      categoryId: "music",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 2 * DAY),
    },
    {
      videoId: "cinematic-orchestra-live-recording",
      userId: auraId,
      title: "Live Symphony Orchestra: Performing 'Dawn Over Valhalla'",
      description: "Full 70-piece symphonic orchestra recorded in Vienna. Rich brass fanfares, soaring string melodies, and deep acoustic percussion.",
      thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      duration: "07:54",
      views: 64100,
      categoryId: "music",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 11 * DAY),
    },
    {
      videoId: "lofi-beats-rainy-cafe",
      userId: auraId,
      title: "Rainy Cafe Lo-Fi Chill Beats to Study and Code To",
      description: "Soothing vinyl crackle, warm Fender Rhodes chords, and mellow boom-bap percussion for late night productivity.",
      thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "58:00",
      views: 88500,
      categoryId: "music",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "HD",
      createdAt: new Date(now - 20 * DAY),
    },

    // -------------------------------------------------------------
    // 4. Gaming (categoryId: "gaming")
    // -------------------------------------------------------------
    {
      videoId: "unreal-5-cyberpunk-gameplay",
      userId: vfxId,
      title: "Next-Gen Unreal Engine 5.5 Open World Gameplay Showcase",
      description: "Photorealistic lighting in a sprawling cyberpunk metropolis running at native 4K 60FPS on high-end hardware.",
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/Tears-of-Steel/tears_of_steel_720p.mp4",
      duration: "18:40",
      views: 95400,
      categoryId: "gaming",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 1 * DAY),
    },
    {
      videoId: "speedrun-world-record-retrospective",
      userId: adminId,
      title: "The Impossible 0.02s Glitch: The Complete History of Any% Speedrunning",
      description: "An investigative documentary on how frame-perfect subpixel inputs cracked the toughest platforming records of the decade.",
      thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
      duration: "34:12",
      views: 124000,
      categoryId: "gaming",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 6 * DAY),
    },
    {
      videoId: "esports-grand-finals-highlights",
      userId: adminId,
      title: "Championship Grand Finals: The Greatest 1v5 Clutch in Esports History",
      description: "Live crowd reaction, pro-caster commentary, and split-second precision gameplay that decided the world trophy.",
      thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/video/movie_300.mp4",
      duration: "12:05",
      views: 78900,
      categoryId: "gaming",
      privacy: 0,
      featured: true,
      rating: 4.7,
      quality: "HD",
      createdAt: new Date(now - 16 * DAY),
    },
    {
      videoId: "sim-racing-24h-nurburgring",
      userId: vfxId,
      title: "24 Hours of Nurburgring: Rain, Night Stints & Direct Drive Force Feedback",
      description: "Full onboard cockpit perspective in triple-screen 144Hz simulator tackling the world's most treacherous green hell.",
      thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "22:15",
      views: 43200,
      categoryId: "gaming",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 28 * DAY),
    },

    // -------------------------------------------------------------
    // 5. Entertainment (categoryId: "entertainment")
    // -------------------------------------------------------------
    {
      videoId: "supercar-canyon-run-gt3",
      userId: adminId,
      title: "Twin-Turbo Mountain Pass Run: Pure Exhaust Sound & Telemetry",
      description: "Early sunrise run through the alpine passes of Switzerland. Raw telemetry overlay, dual onboard audio recording, and high-speed cornering dynamics.",
      thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
      duration: "09:35",
      views: 89400,
      categoryId: "entertainment",
      privacy: 0,
      featured: true,
      rating: 4.7,
      quality: "4K UHD",
      createdAt: new Date(now - 5 * DAY),
    },
    {
      videoId: "subaru-world-tour-cinema",
      userId: adminId,
      title: "See The World: Off-Road Overlanding Cinema Across The Americas",
      description: "From the glacial tundra of Alaska to the red rock canyons of Patagonia: a four-part expedition documenting overland vehicular endurance.",
      thumbnail: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/bunny/movie.mp4",
      duration: "16:40",
      views: 94000,
      categoryId: "entertainment",
      privacy: 0,
      isMovie: true,
      movieRelease: "2024",
      rating: 4.8,
      producer: "Drive Cinema Co.",
      stars: "Markus Thorne, Elena Rostova",
      quality: "4K UHD",
      featured: false,
      price: 3.99,
      monetization: true,
      createdAt: new Date(now - 60 * DAY),
    },
    {
      videoId: "extreme-mountain-biking-redbull",
      userId: wildId,
      title: "Utah Red Bull Rampage Line: 70ft Canyon Gap GoPro POV",
      description: "Raw helmet cam footage riding steep vertical ridges, cliffs, and huge sender jumps in Virgin, Utah.",
      thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      duration: "11:20",
      views: 167000,
      categoryId: "entertainment",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 13 * DAY),
    },
    {
      videoId: "street-food-tokyo-night-market",
      userId: adminId,
      title: "Midnight Street Food Tour in Osaka: Sizzling Takoyaki & Wagyu Skewers",
      description: "Immersive 4K binaural ASMR food tour through the alleyways of Dotonbori with master chefs.",
      thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "25:30",
      views: 112000,
      categoryId: "entertainment",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 24 * DAY),
    },

    // -------------------------------------------------------------
    // 6. News & Politics (categoryId: "news")
    // -------------------------------------------------------------
    {
      videoId: "global-clean-energy-summit-2026",
      userId: techId,
      title: "Global Clean Energy Summit: The Trillion-Dollar Grid Transformation",
      description: "World leaders and energy ministers outline target milestones for commercial nuclear fusion and next-gen battery storage deployments.",
      thumbnail: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "28:10",
      views: 45200,
      categoryId: "news",
      privacy: 0,
      featured: true,
      rating: 4.6,
      quality: "HD",
      createdAt: new Date(now - 10 * HOUR),
    },
    {
      videoId: "space-station-lunar-gateway-update",
      userId: techId,
      title: "Deep Space Gateway Assembly: NASA & ESA Mission Briefing",
      description: "Detailed press conference on lunar orbit module docking tests, Artemis astronauts training, and deep space communication arrays.",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/bunny/movie.mp4",
      duration: "19:45",
      views: 61400,
      categoryId: "news",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 4 * DAY),
    },
    {
      videoId: "economic-forum-tech-regulations",
      userId: adminId,
      title: "Global Tech Antitrust & AI Sovereignty: Key Takeaways from Brussels",
      description: "Policy analysts break down newly enacted digital governance accords and international cross-border cloud standards.",
      thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
      duration: "15:20",
      views: 29800,
      categoryId: "news",
      privacy: 0,
      featured: false,
      rating: 4.5,
      quality: "HD",
      createdAt: new Date(now - 14 * DAY),
    },

    // -------------------------------------------------------------
    // 7. Education (categoryId: "education")
    // -------------------------------------------------------------
    {
      videoId: "blender-geometry-nodes-mastery",
      userId: vfxId,
      title: "Blender 4.2 Geometry Nodes: Procedural World Building from Scratch",
      description: "Learn how to build infinite procedural terrain, dynamic rock dispersion, and photorealistic foliage systems using the latest nodes pipeline in Blender.",
      thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/video/movie_300.mp4",
      duration: "24:50",
      views: 67300,
      categoryId: "education",
      privacy: 0,
      featured: true,
      rating: 4.8,
      quality: "4K UHD",
      createdAt: new Date(now - 4 * DAY),
    },
    {
      videoId: "linear-algebra-machine-learning-visualized",
      userId: techId,
      title: "Eigenvectors & Dimensionality Reduction: Visual Intuition Guide",
      description: "A geometric journey through matrices, eigenvalues, SVD, and latent manifold projections with high-res interactive 3D visualizations.",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "31:40",
      views: 84300,
      categoryId: "education",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 8 * DAY),
    },
    {
      videoId: "astrophysics-black-hole-simulation",
      userId: wildId,
      title: "Gravitational Lensing & Event Horizons: General Relativity Explained",
      description: "How ray-tracing relativistic curved spacetime reveals the mesmerizing photon ring around supermassive black holes.",
      thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      duration: "27:14",
      views: 119000,
      categoryId: "education",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 17 * DAY),
    },
    {
      videoId: "modern-fullstack-architecture-masterclass",
      userId: techId,
      title: "Distributed System Design: Building for 100M Requests Per Second",
      description: "Caching patterns, database sharding, edge routing, read replicas, and zero-downtime database schema migrations.",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "42:30",
      views: 93400,
      categoryId: "education",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 25 * DAY),
    },

    // -------------------------------------------------------------
    // 8. Stock Videos (categoryId: "stock")
    // -------------------------------------------------------------
    {
      videoId: "stock-aerial-ocean-waves-4k",
      userId: wildId,
      title: "Free 4K Stock: Turquoise Pacific Ocean Waves Breaking on Golden Beach",
      description: "Royalty free stock footage shot at 60 FPS in ProRes 422. Commercial usage permitted with creative commons attribution.",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "00:55",
      views: 34100,
      categoryId: "stock",
      privacy: 0,
      quality: "4K UHD",
      createdAt: new Date(now - 15 * DAY),
    },
    {
      videoId: "stock-tokyo-night-timelapse",
      userId: techId,
      title: "Free 4K Stock: Tokyo Shibuya Scramble Night Light Trails Timelapse",
      description: "Hyperlapse sequence of Tokyo traffic, neon billboards, and pedestrian crossing dynamics.",
      thumbnail: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/bunny/trailer.mp4",
      duration: "01:10",
      views: 45600,
      categoryId: "stock",
      privacy: 0,
      quality: "4K UHD",
      createdAt: new Date(now - 20 * DAY),
    },
    {
      videoId: "stock-foggy-pine-forest-drone",
      userId: wildId,
      title: "Free 4K Stock: Misty Morning Pine Forest Drone Flyover in Pacific Northwest",
      description: "Atmospheric mountain evergreen canopy shrouded in morning cloud and golden morning sun rays.",
      thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
      duration: "00:48",
      views: 28900,
      categoryId: "stock",
      privacy: 0,
      quality: "4K UHD",
      createdAt: new Date(now - 12 * DAY),
    },
    {
      videoId: "stock-abstract-data-particles-4k",
      userId: vfxId,
      title: "Free 4K Stock: Glowing Cybernetic Particle Field & Plexus Waves",
      description: "Seamless looping motion graphic background for technology intros, presentations, and livestream overlays.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "00:30",
      views: 39400,
      categoryId: "stock",
      privacy: 0,
      quality: "4K UHD",
      createdAt: new Date(now - 26 * DAY),
    },

    // -------------------------------------------------------------
    // 9. Other (categoryId: "other")
    // -------------------------------------------------------------
    {
      videoId: "woodworking-japanese-joinery",
      userId: adminId,
      title: "Traditional Japanese Woodworking: Hand-Carved Kanawa Tsugi Joinery",
      description: "No nails or glue: master carpenter crafts traditional interlocking cedar timber beams using razor-sharp Japanese hand planes and chisels.",
      thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      duration: "21:30",
      views: 73200,
      categoryId: "other",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 7 * DAY),
    },
    {
      videoId: "pottery-wheel-ceramic-vase",
      userId: auraId,
      title: "Throwing Porcelain on the Wheel: Calming Artisanal Pottery ASMR",
      description: "Centering raw white porcelain clay, pulling tall walls, and trimming fine curves in an open sunlit studio.",
      thumbnail: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "16:45",
      views: 48900,
      categoryId: "other",
      privacy: 0,
      featured: false,
      rating: 4.8,
      quality: "HD",
      createdAt: new Date(now - 19 * DAY),
    },
    {
      videoId: "bonsai-tree-styling-masterclass",
      userId: wildId,
      title: "Centuries-Old Juniper Bonsai: Pruning, Wiring & Deadwood Carving",
      description: "A master bonsai artist demonstrates the delicate jin and shari deadwood techniques on a 150-year-old shimpaku juniper.",
      thumbnail: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=1280&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/bunny/movie.mp4",
      duration: "28:00",
      views: 54100,
      categoryId: "other",
      privacy: 0,
      featured: true,
      rating: 4.9,
      quality: "4K UHD",
      createdAt: new Date(now - 35 * DAY),
    },

    // -------------------------------------------------------------
    // 10. Vertical Shorts (isShort: true)
    // -------------------------------------------------------------
    {
      videoId: "short-cyberpunk-neon-vibes",
      userId: vfxId,
      title: "Blade Runner Aesthetics in Unreal Engine 5 #Shorts",
      description: "Cyberpunk rainy alleyway environment built in 30 minutes using Nanite & Lumen.",
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=720&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "00:45",
      views: 89000,
      categoryId: "gaming",
      privacy: 0,
      isShort: true,
      rating: 4.9,
      createdAt: new Date(now - 1 * DAY),
    },
    {
      videoId: "short-fpv-drone-waterfall-dive",
      userId: wildId,
      title: "Powerlooping a 300ft Icelandic Waterfall with 6S FPV Drone! #Shorts",
      description: "Insane proximity flight diving through the spray of Skogafoss in Iceland.",
      thumbnail: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=720&auto=format&fit=crop&q=80",
      videoLocation: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "00:32",
      views: 125000,
      categoryId: "film",
      privacy: 0,
      isShort: true,
      rating: 4.9,
      createdAt: new Date(now - 3 * DAY),
    },
    {
      videoId: "short-synth-arpeggio-hack",
      userId: auraId,
      title: "Instant 80s Stranger Things Synth Bassline Secret #Shorts",
      description: "How to tune a dual-oscillator saw wave with stereo chorus in under 30 seconds.",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=720&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      duration: "00:28",
      views: 74200,
      categoryId: "music",
      privacy: 0,
      isShort: true,
      rating: 4.8,
      createdAt: new Date(now - 6 * DAY),
    },
    {
      videoId: "short-blender-speed-sculpt",
      userId: vfxId,
      title: "Dragon Creature Sculpt in 60 Seconds #Shorts",
      description: "Dyntopo speed sculpting in Blender with matcap shading.",
      thumbnail: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=720&auto=format&fit=crop&q=80",
      videoLocation: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: "00:58",
      views: 104000,
      categoryId: "film",
      privacy: 0,
      isShort: true,
      rating: 4.9,
      createdAt: new Date(now - 2 * DAY),
    },
    {
      videoId: "short-ocean-whale-breach",
      userId: wildId,
      title: "Humpback Whale Massive Surface Breach Close Up! #Shorts",
      description: "40-ton humpback launches completely out of the water in Monterey Bay.",
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=720&auto=format&fit=crop&q=80",
      videoLocation: "https://vjs.zencdn.net/v/oceans.mp4",
      duration: "00:24",
      views: 215000,
      categoryId: "tech",
      privacy: 0,
      isShort: true,
      rating: 5.0,
      createdAt: new Date(now - 5 * DAY),
    },
    {
      videoId: "short-coding-keyboard-sound",
      userId: techId,
      title: "Custom Mechanical Keyboard Typing Sound Test ASMR #Shorts",
      description: "Lubed linear switches, brass plate, and double-shot keycaps typing at 130 WPM.",
      thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=720&auto=format&fit=crop&q=80",
      videoLocation: "https://media.w3.org/2010/05/bunny/trailer.mp4",
      duration: "00:35",
      views: 92000,
      categoryId: "education",
      privacy: 0,
      isShort: true,
      rating: 4.8,
      createdAt: new Date(now - 8 * DAY),
    },
  ];

  const videoRecordMap: Record<string, number> = {};

  for (const v of realVideos) {
    const existing = await db
      .select()
      .from(videos)
      .where(eq(videos.videoId, v.videoId))
      .limit(1);

    if (existing[0]) {
      videoRecordMap[v.videoId] = existing[0].id;
      await db
        .update(videos)
        .set({
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          videoLocation: v.videoLocation,
          duration: v.duration,
          views: v.views,
          categoryId: v.categoryId,
          isMovie: (v as any).isMovie ?? false,
          isShort: (v as any).isShort ?? false,
          movieRelease: (v as any).movieRelease,
          rating: (v as any).rating ?? 4.5,
          producer: (v as any).producer,
          stars: (v as any).stars,
          price: (v as any).price ?? 0,
          monetization: (v as any).monetization ?? false,
          featured: (v as any).featured ?? false,
          quality: (v as any).quality ?? "HD",
          createdAt: v.createdAt,
        })
        .where(eq(videos.id, existing[0].id));
    } else {
      const [inserted] = await db
        .insert(videos)
        .values({
          videoId: v.videoId,
          userId: v.userId,
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          videoLocation: v.videoLocation,
          duration: v.duration,
          views: v.views,
          categoryId: v.categoryId,
          isMovie: (v as any).isMovie ?? false,
          isShort: (v as any).isShort ?? false,
          movieRelease: (v as any).movieRelease,
          rating: (v as any).rating ?? 4.5,
          producer: (v as any).producer,
          stars: (v as any).stars,
          price: (v as any).price ?? 0,
          monetization: (v as any).monetization ?? false,
          featured: (v as any).featured ?? false,
          quality: (v as any).quality ?? "HD",
          createdAt: v.createdAt,
        })
        .returning();
      if (inserted) {
        videoRecordMap[v.videoId] = inserted.id;
      }
    }
  }

  // 5. Watch History for User 1 (Admin & Demo visitor)
  const historyVideoIds = Object.values(videoRecordMap).slice(0, 6);
  for (let i = 0; i < historyVideoIds.length; i++) {
    const vidId = historyVideoIds[i];
    await db
      .insert(watchHistory)
      .values({
        userId: adminId,
        videoId: vidId,
        viewedAt: new Date(now - i * 3 * HOUR),
      })
      .onConflictDoNothing();
  }

  // 6. Liked Videos for User 1
  for (const vidId of Object.values(videoRecordMap).slice(0, 8)) {
    await db
      .insert(likesDislikes)
      .values({
        userId: adminId,
        videoId: vidId,
        type: 1, // Like
      })
      .onConflictDoNothing();
  }

  // 7. Real Transactions (Purchases & Rentals) for User 1
  const demoTransactions = [
    {
      userId: adminId,
      type: "purchase",
      amount: 4.99,
      currency: "USD",
      status: "completed",
      description: "Purchased Movie: Sintel (4K HDR)",
      createdAt: new Date(now - 10 * DAY),
    },
    {
      userId: adminId,
      type: "rent",
      amount: 2.99,
      currency: "USD",
      status: "completed",
      description: "Rented Movie: Elephants Dream",
      createdAt: new Date(now - 3 * DAY),
    },
    {
      userId: adminId,
      type: "purchase",
      amount: 14.99,
      currency: "USD",
      status: "completed",
      description: "Purchased Video: Quantum AI Architecture Masterclass",
      createdAt: new Date(now - 5 * DAY),
    },
    {
      userId: adminId,
      type: "rent",
      amount: 1.99,
      currency: "USD",
      status: "completed",
      description: "Rented Video: Arctic Symphony High-Bitrate Stream",
      createdAt: new Date(now - 1 * DAY),
    },
  ];

  for (const tx of demoTransactions) {
    await db
      .insert(transactions)
      .values(tx)
      .onConflictDoNothing();
  }

  // 8. Real High-Fidelity Articles
  const realArticles = [
    {
      userId: techId,
      title: "The Architecture of Real-Time Video Streaming: From RTMP to WebRTC & HLS",
      description: "A deep dive into video codec engineering, packet loss recovery, and low-latency chunk distribution across global edge CDNs.",
      category: "tech",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&auto=format&fit=crop&q=80",
      tags: "streaming, architecture, webrtc, hls, cdn",
      views: 18450,
      shared: 420,
      active: true,
      text: `<h2>Modern Streaming Protocols at Scale</h2>
<p>Modern video streaming platforms demand sub-second latency while delivering high bitrates to millions of concurrent viewers. Understanding the trade-offs between traditional chunked HTTP Live Streaming (HLS) and low-latency WebRTC is essential for any modern media engineer.</p>
<h3>1. Chunk Optimization and Segment Duration</h3>
<p>By tuning HLS segment durations down to 1–2 seconds and employing chunked transfer encoding (CMAF), round-trip latency can drop from 30 seconds to near-broadcast benchmarks of 3 seconds.</p>
<h3>2. Multi-Codec Transcoding</h3>
<p>Implementing adaptive bitrate ladders with AV1, VP9, and HEVC fallbacks ensures maximum compression efficiency without sacrificing browser compatibility on legacy clients.</p>`,
    },
    {
      userId: cinemaId,
      title: "Open Source in Hollywood VFX: Why Studios are Adopting Blender & OpenUSD",
      description: "How universal scene descriptions and Blender's Cycles engine have dismantled the proprietary software monopoly in visual effects production.",
      category: "film",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80",
      tags: "blender, openusd, vfx, cinema, hollywood",
      views: 24300,
      shared: 680,
      active: true,
      text: `<h2>The Open Source VFX Revolution</h2>
<p>For decades, major studios relied exclusively on proprietary closed systems with enterprise licensing models. Today, OpenUSD (Universal Scene Description) and Blender have permanently shifted this landscape.</p>
<h3>Seamless Pipeline Interoperability</h3>
<p>OpenUSD provides a unified interchange format for geometry, shading, lighting, and animation caches, allowing distributed artists across time zones to collaborate synchronously on the exact same digital asset sets.</p>`,
    },
    {
      userId: wildId,
      title: "Filming the Aurora Borealis: Cold Weather Camera Gear & Exposure Techniques",
      description: "Practical field guide to extreme winter cinematography, lens heating bands, and high-ISO sensor noise mitigation under polar skies.",
      category: "film",
      image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1280&auto=format&fit=crop&q=80",
      tags: "photography, aurora, drone, arctic, nature",
      views: 14200,
      shared: 310,
      active: true,
      text: `<h2>Surviving -30°C on Location</h2>
<p>Capturing the ephemeral dance of the aurora borealis requires specialized hardware preparations. Standard lithium batteries lose up to 70% of their operational capacity when exposed to sub-zero winds.</p>
<h3>Exposure Triangle in the Dark</h3>
<p>Wide open apertures (f/1.4 to f/2.0), shutter speeds strictly under 4 seconds to avoid star trailing, and modern dual-native ISO sensors form the baseline for crisp northern lights capture.</p>`,
    },
    {
      userId: auraId,
      title: "Analog Warmth in Digital Audio: Tape Saturation, Tubes, and Harmonics",
      description: "Why music producers and audiophiles continue to gravitate toward vintage harmonic distortion in a world of clinical digital precision.",
      category: "music",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1280&auto=format&fit=crop&q=80",
      tags: "audio, music, analog, sounddesign, studio",
      views: 9800,
      shared: 195,
      active: true,
      text: `<h2>The Psychology of Harmonic Saturation</h2>
<p>Digital audio recording is mathematically pristine, but the human ear perceives subtle even-order and odd-order harmonic distortions as pleasant, musical, and warm.</p>
<h3>Tape Compression & Transient Smoothing</h3>
<p>Magnetic tape compresses rapid transients naturally through magnetic hysteresis, giving snare drums, vocals, and acoustic guitars a glued, cohesive presentation that algorithm plugins strive to emulate.</p>`,
    },
    {
      userId: vfxId,
      title: "Real-Time Volumetric Lighting in Unreal Engine 5: Lumen vs Path Tracing",
      description: "Analyzing light bounce performance, god rays, and atmosphere scattering for interactive cinematic sequences.",
      category: "gaming",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&auto=format&fit=crop&q=80",
      tags: "unrealengine, lighting, vfx, gaming, lumen",
      views: 16700,
      shared: 512,
      active: true,
      text: `<h2>Lighting Without Offline Precomputations</h2>
<p>Unreal Engine 5’s Lumen architecture revolutionized real-time lighting by calculating infinite diffuse bounces and specular reflections at interactive framerates.</p>
<p>Coupled with volumetric fog height scattering and directional sun cascades, creators can produce cinematic atmospheric depth previously reserved for overnight offline render farms.</p>`,
    },
  ];

  for (const art of realArticles) {
    const existing = await db
      .select()
      .from(articles)
      .where(eq(articles.title, art.title))
      .limit(1);

    if (existing[0]) {
      await db
        .update(articles)
        .set(art)
        .where(eq(articles.id, existing[0].id));
    } else {
      await db.insert(articles).values(art);
    }
  }

  // 9. Site Configuration
  await db
    .insert(siteConfig)
    .values([
      { name: "site_name", value: "PlayTube" },
      { name: "site_title", value: "PlayTube - Video Sharing Platform" },
      { name: "theme", value: "youplay" },
      { name: "upload_system", value: "on" },
    ])
    .onConflictDoNothing({ target: siteConfig.name });

  console.log("[OK] Comprehensive PlayTube real data seeding completed!");
}

if (require.main === module) {
  seedDatabase()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
