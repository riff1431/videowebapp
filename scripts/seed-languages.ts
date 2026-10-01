import fs from "fs";
import path from "path";
import { pool } from "../src/db";

// Map of PlayTube language columns in langs table to language metadata
const LANGUAGE_META: Record<
  string,
  { displayName: string; iso: string; direction: "ltr" | "rtl"; isDefault?: boolean }
> = {
  english: { displayName: "English", iso: "en", direction: "ltr", isDefault: true },
  arabic: { displayName: "العربية (Arabic)", iso: "ar", direction: "rtl" },
  dutch: { displayName: "Nederlands (Dutch)", iso: "nl", direction: "ltr" },
  french: { displayName: "Français (French)", iso: "fr", direction: "ltr" },
  german: { displayName: "Deutsch (German)", iso: "de", direction: "ltr" },
  russian: { displayName: "Русский (Russian)", iso: "ru", direction: "ltr" },
  spanish: { displayName: "Español (Spanish)", iso: "es", direction: "ltr" },
  turkish: { displayName: "Türkçe (Turkish)", iso: "tr", direction: "ltr" },
  hindi: { displayName: "हिन्दी (Hindi)", iso: "hi", direction: "ltr" },
  chinese: { displayName: "中文 (Chinese)", iso: "zh", direction: "ltr" },
  urdu: { displayName: "اردو (Urdu)", iso: "ur", direction: "rtl" },
  indonesian: { displayName: "Bahasa Indonesia", iso: "id", direction: "ltr" },
  croatian: { displayName: "Hrvatski (Croatian)", iso: "hr", direction: "ltr" },
  hebrew: { displayName: "עברית (Hebrew)", iso: "he", direction: "rtl" },
  bengali: { displayName: "বাংলা (Bengali)", iso: "bn", direction: "ltr" },
  japanese: { displayName: "日本語 (Japanese)", iso: "ja", direction: "ltr" },
  portuguese: { displayName: "Português", iso: "pt", direction: "ltr" },
  italian: { displayName: "Italiano (Italian)", iso: "it", direction: "ltr" },
  persian: { displayName: "فارسی (Persian)", iso: "fa", direction: "rtl" },
  swedish: { displayName: "Svenska (Swedish)", iso: "sv", direction: "ltr" },
  vietnamese: { displayName: "Tiếng Việt", iso: "vi", direction: "ltr" },
  danish: { displayName: "Dansk (Danish)", iso: "da", direction: "ltr" },
  filipino: { displayName: "Filipino", iso: "fil", direction: "ltr" },
};

// Column order in `langs` table:
// (`id`, `lang_key`, `type`, `english`, `arabic`, `dutch`, `french`, `german`, `russian`, `spanish`, `turkish`, `hindi`, `chinese`, `urdu`, `indonesian`, `croatian`, `hebrew`, `bengali`, `japanese`, `portuguese`, `italian`, `persian`, `swedish`, `vietnamese`, `danish`, `filipino`)
const LANG_COLS = [
  "english",
  "arabic",
  "dutch",
  "french",
  "german",
  "russian",
  "spanish",
  "turkish",
  "hindi",
  "chinese",
  "urdu",
  "indonesian",
  "croatian",
  "hebrew",
  "bengali",
  "japanese",
  "portuguese",
  "italian",
  "persian",
  "swedish",
  "vietnamese",
  "danish",
  "filipino",
];

// Parser for SQL row tuple: (id, 'lang_key', 'type', 'val1', 'val2', ...)
function parseSqlValuesRow(rowStr: string): string[] {
  const values: string[] = [];
  let inString = false;
  let current = "";
  let i = 0;

  // Trim outer ( and ) or ),
  let text = rowStr.trim();
  if (text.startsWith("(")) text = text.substring(1);
  if (text.endsWith("),")) text = text.substring(0, text.length - 2);
  else if (text.endsWith(");")) text = text.substring(0, text.length - 2);
  else if (text.endsWith(")")) text = text.substring(0, text.length - 1);

  while (i < text.length) {
    const char = text[i];
    if (char === "'") {
      if (inString) {
        // check escaped quote \' or ''
        if (text[i + 1] === "'") {
          current += "'";
          i += 2;
          continue;
        } else if (text[i - 1] === "\\") {
          current += "'";
          i++;
          continue;
        } else {
          inString = false;
          i++;
          continue;
        }
      } else {
        inString = true;
        i++;
        continue;
      }
    }

    if (char === "\\" && inString) {
      const nextChar = text[i + 1];
      if (nextChar === "'" || nextChar === '"' || nextChar === "\\") {
        current += nextChar;
        i += 2;
        continue;
      }
    }

    if (char === "," && !inString) {
      values.push(current.trim());
      current = "";
      i++;
      continue;
    }

    current += char;
    i++;
  }
  values.push(current.trim());
  return values;
}

async function seedLanguages() {
  console.log("=== Seeding Languages & Translations from PlayTube SQL ===");
  const sqlPath = path.resolve(
    process.cwd(),
    "existing-videowebsite/Script/playtube.sql"
  );

  if (!fs.existsSync(sqlPath)) {
    console.error(`PlayTube SQL file not found at: ${sqlPath}`);
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    // 1. Seed `languages` metadata table
    console.log("Syncing `languages` table...");
    for (const [langName, meta] of Object.entries(LANGUAGE_META)) {
      await client.query(
        `
        INSERT INTO languages (name, display_name, iso, direction, status, is_default)
        VALUES ($1, $2, $3, $4, 'active', $5)
        ON CONFLICT (name) DO UPDATE 
        SET display_name = EXCLUDED.display_name,
            iso = EXCLUDED.iso,
            direction = EXCLUDED.direction,
            is_default = EXCLUDED.is_default;
      `,
        [langName, meta.displayName, meta.iso, meta.direction, meta.isDefault || false]
      );
    }
    console.log(`[OK] ${Object.keys(LANGUAGE_META).length} languages registered.`);

    // 2. Read and extract langs lines from playtube.sql
    console.log("Reading playtube.sql rows for langs table...");
    const fileContent = fs.readFileSync(sqlPath, "utf-8");
    const lines = fileContent.split(/\r?\n/);

    let inLangsInsert = false;
    const extractedRows: { key: string; translations: Record<string, string> }[] = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      if (line.includes("INSERT INTO `langs`")) {
        inLangsInsert = true;
        continue;
      }

      if (inLangsInsert) {
        if (line.trim().startsWith("--") || line.trim().startsWith("CREATE TABLE")) {
          inLangsInsert = false;
          break;
        }

        const trimmed = line.trim();
        if (!trimmed.startsWith("(")) continue;

        const parsed = parseSqlValuesRow(trimmed);
        if (parsed.length >= 4) {
          const key = parsed[1].replace(/^'|'$/g, "").trim();
          if (!key) continue;

          const translations: Record<string, string> = {};
          // parsed[0]=id, parsed[1]=lang_key, parsed[2]=type, parsed[3..]=languages
          LANG_COLS.forEach((colName, idx) => {
            const rawVal = parsed[3 + idx];
            if (rawVal !== undefined) {
              let val = rawVal.replace(/^'|'$/g, "");
              // unescape \'
              val = val.replace(/\\'/g, "'").replace(/\\"/g, '"');
              translations[colName] = val;
            }
          });

          extractedRows.push({ key, translations });
        }

        if (trimmed.endsWith(";")) {
          inLangsInsert = false;
        }
      }
    }

    console.log(`[OK] Found ${extractedRows.length} language keys from PlayTube SQL.`);

    // 3. Insert language keys and batch insert translations into PostgreSQL
    console.log("Batch inserting translations into PostgreSQL...");

    // Also populate language_keys table
    for (const item of extractedRows) {
      await client.query(
        `
        INSERT INTO language_keys (key_name)
        VALUES ($1)
        ON CONFLICT (key_name) DO NOTHING;
      `,
        [item.key]
      );
    }

    // Insert translations in batches of 500 records
    const BATCH_SIZE = 500;
    let batchValues: any[] = [];
    let batchQueryPlaceholders: string[] = [];
    let totalInserted = 0;

    const flushBatch = async () => {
      if (batchValues.length === 0) return;
      const query = `
        INSERT INTO language_translations (key, lang, value)
        VALUES ${batchQueryPlaceholders.join(", ")}
        ON CONFLICT (key, lang) DO UPDATE
        SET value = EXCLUDED.value;
      `;
      await client.query(query, batchValues);
      totalInserted += batchQueryPlaceholders.length;
      batchValues = [];
      batchQueryPlaceholders = [];
    };

    // Deduplicate (key, lang) pairs so identical keys in the SQL don't conflict in the same batch
    const uniqueMap = new Map<string, { key: string; lang: string; value: string }>();
    for (const item of extractedRows) {
      for (const [langName, value] of Object.entries(item.translations)) {
        if (!value) continue;
        const mapKey = `${item.key}:::${langName}`;
        uniqueMap.set(mapKey, { key: item.key, lang: langName, value });
      }
    }

    console.log(`Unique translation entries to insert: ${uniqueMap.size}`);

    for (const entry of uniqueMap.values()) {
      const p1 = `$${batchValues.length + 1}`;
      const p2 = `$${batchValues.length + 2}`;
      const p3 = `$${batchValues.length + 3}`;

      batchQueryPlaceholders.push(`(${p1}, ${p2}, ${p3})`);
      batchValues.push(entry.key, entry.lang, entry.value);

      if (batchQueryPlaceholders.length >= BATCH_SIZE) {
        await flushBatch();
      }
    }

    await flushBatch();
    console.log(`[SUCCESS] Inserted/updated ${totalInserted} translations!`);
  } catch (err) {
    console.error("Error seeding languages:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedLanguages();
