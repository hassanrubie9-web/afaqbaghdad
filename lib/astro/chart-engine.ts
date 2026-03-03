// lib/astro/chart-engine.ts
import { pickKey } from "@/lib/env/keys";
import type { NatalChart, HouseSystem, ZodiacType } from "@/types/global";

// NatalChartData is an alias for NatalChart (kept for backward compat)
export type NatalChartData = NatalChart;

type ComputeInput = {
  birthDate: string;      // YYYY-MM-DD
  birthTime: string;      // HH:mm
  birthTimezone: string;  // IANA TZ e.g. Asia/Baghdad
  lat: number;
  lng: number;
  houseSystem: HouseSystem;
  zodiacType: ZodiacType; // "tropical" | "sidereal"
  city?: string;
  countryCode?: string;  // ISO2 e.g. "IQ"
};

// ============================================================
// Zodiac helpers
// ============================================================
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  "North Node": "☊", "South Node": "☋", Chiron: "⚷",
  Ascendant: "AC", Midheaven: "MC",
};

/** Convert ecliptic longitude (0-360) → { sign, degree (0-29.99), minute } */
function lonToSignDeg(lon: number): { sign: string; degree: number; minute: number } {
  const normalized = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(normalized / 30);
  const degInSign = normalized % 30;
  const degree = Math.floor(degInSign);
  const minute = Math.floor((degInSign - degree) * 60);
  return { sign: ZODIAC_SIGNS[signIdx] ?? "Aries", degree, minute };
}

// ============================================================
// Parsers
// ============================================================
function parseDateParts(date: string) {
  const [y, m, d] = date.split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error("Invalid birthDate format (expected YYYY-MM-DD)");
  }
  return { year: y, month: m, day: d };
}

function parseTimeParts(time: string) {
  const [hh, mm] = time.split(":").map((x) => Number(x));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    throw new Error("Invalid birthTime format (expected HH:mm)");
  }
  return { hour: hh, minute: mm, second: 0 };
}

function mapHouseSystemToApi(hs: HouseSystem): string {
  switch (hs) {
    case "placidus":      return "P";
    case "koch":          return "K";
    case "regiomontanus": return "R";
    case "porphyry":      return "O";
    case "equal":         return "E";
    case "whole_sign":    return "W";
    default:              return "P";
  }
}

function mapZodiacTypeToApi(z: ZodiacType): string {
  return z === "sidereal" ? "Sidereal" : "Tropic";
}

function safeJsonParse(text: string) {
  try { return JSON.parse(text); }
  catch { return null; }
}

// ============================================================
// Transform API response → NatalChart (fixed shape)
// ============================================================
function transformApiResponse(raw: any, debugMode = false): NatalChart & { _debug?: any } {
  const root = raw?.chart_data ?? raw?.data ?? raw;

  // ── Collect raw arrays ──────────────────────────────────────
  const planetsRaw: any[] =
    root?.planets ?? root?.points ?? root?.planets_positions ?? root?.planetsData ?? [];
  const housesRaw: any[] =
    root?.houses ?? root?.house_cusps ?? root?.housesData ?? [];
  const aspectsRaw: any[] =
    root?.aspects ?? root?.aspectsData ?? [];
  const anglesRaw = root?.angles ?? root?.points_angles ?? {};

  // ── Ascendant ───────────────────────────────────────────────
  // May come as: { degree, sign } object, a number (ecliptic lon), or nested in angles
  const ascRaw =
    anglesRaw?.ascendant ?? anglesRaw?.ASC ??
    root?.ascendant ?? root?.ASC ?? null;

  let ascendant: NatalChart["ascendant"];
  if (ascRaw !== null && typeof ascRaw === "object") {
    // Object shape: { degree, sign } or { lon, sign }
    const lon = Number(ascRaw?.longitude ?? ascRaw?.lon ?? ascRaw?.degree ?? 0);
    const signFromObj = String(ascRaw?.sign ?? ascRaw?.zodiac_sign ?? "");
    if (signFromObj) {
      const degRaw = Number(ascRaw?.degree_in_sign ?? ascRaw?.degree ?? lon % 30);
      ascendant = { sign: signFromObj, degree: degRaw };
    } else {
      // lon is ecliptic longitude 0-360
      const { sign, degree } = lonToSignDeg(lon);
      ascendant = { sign, degree };
    }
  } else if (ascRaw !== null) {
    // Plain number: ecliptic longitude
    const { sign, degree } = lonToSignDeg(Number(ascRaw));
    ascendant = { sign, degree };
  } else {
    ascendant = { sign: "Aries", degree: 0 };
  }

  // ── Midheaven ──────────────────────────────────────────────
  const mcRaw =
    anglesRaw?.midheaven ?? anglesRaw?.MC ??
    root?.midheaven ?? root?.MC ?? null;

  let midheaven: NatalChart["midheaven"];
  if (mcRaw !== null && typeof mcRaw === "object") {
    const lon = Number(mcRaw?.longitude ?? mcRaw?.lon ?? mcRaw?.degree ?? 0);
    const signFromObj = String(mcRaw?.sign ?? mcRaw?.zodiac_sign ?? "");
    if (signFromObj) {
      const degRaw = Number(mcRaw?.degree_in_sign ?? mcRaw?.degree ?? lon % 30);
      midheaven = { sign: signFromObj, degree: degRaw };
    } else {
      const { sign, degree } = lonToSignDeg(lon);
      midheaven = { sign, degree };
    }
  } else if (mcRaw !== null) {
    const { sign, degree } = lonToSignDeg(Number(mcRaw));
    midheaven = { sign, degree };
  } else {
    midheaven = { sign: "Capricorn", degree: 0 };
  }

  // ── Planets ────────────────────────────────────────────────
  const planets: NatalChart["planets"] = Array.isArray(planetsRaw)
    ? planetsRaw.map((p: any) => {
        const nameRaw = String(p?.name ?? p?.planet ?? "");
        // Try to get ecliptic longitude for fallback sign computation
        const lon = Number(p?.longitude ?? p?.lon ?? -1);
        const hasLon = lon >= 0;

        const signRaw = String(p?.sign ?? p?.zodiac_sign ?? "");
        const degRaw  = Number(p?.degree ?? p?.degree_in_sign ?? (hasLon ? lon % 30 : 0));
        const minRaw  = Number(p?.minute ?? p?.minute_in_sign ?? Math.floor((degRaw % 1) * 60));

        let sign = signRaw;
        let degree = Math.floor(degRaw);
        let minute = Math.floor(minRaw);

        // Fallback: if sign missing but we have ecliptic longitude, derive it
        if (!sign && hasLon) {
          const derived = lonToSignDeg(lon);
          sign   = derived.sign;
          degree = derived.degree;
          minute = derived.minute;
        }

        return {
          name: nameRaw,
          symbol: PLANET_SYMBOLS[nameRaw] ?? "✦",
          sign: sign || "Aries",
          degree,
          minute,
          house:      Number(p?.house ?? p?.house_number ?? 1),
          retrograde: Boolean(p?.retrograde ?? p?.is_retrograde ?? false),
        };
      })
    : [];

  // ── Houses ─────────────────────────────────────────────────
  // NOTE: UI expects { number, sign, degree } — old code used "house" key (bug!)
  const houses: NatalChart["houses"] = Array.isArray(housesRaw)
    ? housesRaw.map((h: any, idx: number) => {
        const lon = Number(h?.longitude ?? h?.lon ?? h?.degree ?? 0);
        const signRaw = String(h?.sign ?? h?.zodiac_sign ?? "");
        const { sign: derivedSign, degree: derivedDeg } = lonToSignDeg(lon);
        return {
          number: Number(h?.house ?? h?.house_number ?? h?.number ?? idx + 1),
          sign:   signRaw || derivedSign,
          degree: signRaw ? Number(h?.degree ?? derivedDeg) : derivedDeg,
        };
      })
    : [];

  // ── Aspects ────────────────────────────────────────────────
  // NOTE: UI expects { planet1, planet2, aspect, orb, exact_degree }
  // Old code used p1/p2/type keys (bug!)
  const aspects: NatalChart["aspects"] = Array.isArray(aspectsRaw)
    ? aspectsRaw.map((a: any) => ({
        planet1:      String(a?.planet1 ?? a?.p1 ?? a?.from ?? ""),
        planet2:      String(a?.planet2 ?? a?.p2 ?? a?.to   ?? ""),
        aspect:       String(a?.aspect  ?? a?.type ?? a?.aspect_name ?? ""),
        orb:          Number(a?.orb ?? 0),
        exact_degree: Number(a?.exact_degree ?? a?.exact ?? 0),
      }))
    : [];

  // ── Dominants ─────────────────────────────────────────────
  const dominant_element  = String(root?.dominant_element  ?? root?.dominants?.element  ?? "");
  const dominant_modality = String(root?.dominant_modality ?? root?.dominants?.modality ?? "");
  const chart_ruler       = String(root?.chart_ruler       ?? root?.ruler ?? "");

  const result: NatalChart & { _debug?: any } = {
    ascendant,
    midheaven,
    planets,
    houses,
    aspects,
    dominant_element,
    dominant_modality,
    chart_ruler,
  };

  if (debugMode) {
    result._debug = {
      rawShapeKeys: Object.keys(raw ?? {}),
      rootShapeKeys: Object.keys(root ?? {}),
      mappingUsed: "v3-chart-engine",
      planetsCount: planets.length,
      housesCount:  houses.length,
      aspectsCount: aspects.length,
      ascRawType: typeof ascRaw,
      mcRawType:  typeof mcRaw,
    };
  }

  return result;
}

// ============================================================
// Main export
// ============================================================
export async function computeNatalChart(
  input: ComputeInput
): Promise<NatalChart> {
  const debugMode = process.env.DEBUG_CHART === "1";

  const apiKey = pickKey("ASTROLOGY_API_KEY");
  if (!apiKey) {
    throw new Error("Missing ASTROLOGY_API_KEY_* environment variables");
  }

  const { year, month, day } = parseDateParts(input.birthDate);
  const { hour, minute, second } = parseTimeParts(input.birthTime);

  const url = "https://api.astrology-api.io/api/v3/charts/natal";

  const payload: any = {
    subject: {
      name: "User",
      birth_data: {
        year, month, day, hour, minute, second,
        city:         input.city || null,
        country_code: input.countryCode || null,
        latitude:     input.lat,
        longitude:    input.lng,
        timezone:     input.birthTimezone,
      },
    },
    options: {
      house_system: mapHouseSystemToApi(input.houseSystem),
      zodiac_type:  mapZodiacTypeToApi(input.zodiacType),
      language:     "AR",
    },
  };

  const res  = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept:         "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  // ── Defensive: detect HTML response ──────────────────────
  if (text.trimStart().startsWith("<")) {
    const snippet = text.slice(0, 240).replace(/</g, "&lt;");
    throw new Error(
      `Astrology API returned HTML (not JSON). HTTP ${res.status}. Snippet: ${snippet}`
    );
  }

  const json = safeJsonParse(text);

  if (!res.ok) {
    const snippet = (text || "").slice(0, 240);
    const apiMsg  =
      json?.detail ?? json?.message ?? json?.error ?? `HTTP ${res.status}`;
    throw new Error(`Astrology API error: ${apiMsg} | body: ${snippet}`);
  }

  if (!json) {
    throw new Error(
      `Astrology API returned non-JSON response: ${(text || "").slice(0, 240)}`
    );
  }

  return transformApiResponse(json, debugMode);
}
