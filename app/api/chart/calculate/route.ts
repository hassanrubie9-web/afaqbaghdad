// app/api/chart/calculate/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function jsonOk(data: any, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}
function jsonErr(message: string, status = 500, extra?: any) {
  return NextResponse.json({ ok: false, message, ...(extra ? { extra } : {}) }, { status });
}

function deepGet(obj: any, keys: string[]) {
  for (const k of keys) {
    const parts = k.split(".");
    let cur = obj;
    let ok = true;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = (cur as any)[p];
      else { ok = false; break; }
    }
    if (ok && cur != null) return cur;
  }
  return null;
}

function normalizeInput(body: any) {
  const birthDate = String(
    deepGet(body, ["birth_date", "birthDate", "date", "birth.date"]) ?? ""
  ).trim();
  const birthTime = String(
    deepGet(body, ["birth_time", "birthTime", "time", "birth.time"]) ?? ""
  ).trim();
  const birthTimezone = String(
    deepGet(body, ["birth_timezone", "birthTimezone", "timezone", "tz"]) ?? ""
  ).trim();

  const latRaw = deepGet(body, ["lat", "latitude", "geo.lat"]);
  const lngRaw = deepGet(body, ["lng", "lon", "longitude", "geo.lng"]);
  const lat = latRaw == null ? null : Number(latRaw);
  const lng = lngRaw == null ? null : Number(lngRaw);

  const traditionRaw = String(deepGet(body, ["tradition", "zodiac_tradition"]) ?? "western_tropical");
  const zodiacType = traditionRaw.toLowerCase().includes("sidereal") ? "sidereal" : "tropical";

  const houseSystemRaw = String(deepGet(body, ["house_system", "houseSystem"]) ?? "placidus").toLowerCase();
  const allowedHouseSystems = new Set(["placidus","whole_sign","equal","porphyry","regiomontanus","koch"]);
  const houseSystem = allowedHouseSystems.has(houseSystemRaw) ? houseSystemRaw : "placidus";

  const city        = String(deepGet(body, ["city", "city_name"])                        ?? "").trim();
  const country     = String(deepGet(body, ["country", "country_name"])                  ?? "").trim();
  const countryCode = String(deepGet(body, ["countryCode", "country_code", "geo.countryCode"]) ?? "").trim();

  return {
    birthDate, birthTime, birthTimezone,
    lat: Number.isFinite(lat as any) ? (lat as number) : null,
    lng: Number.isFinite(lng as any) ? (lng as number) : null,
    zodiacType, houseSystem, city, country, countryCode,
  };
}

export async function POST(req: Request) {
  const debugMode = process.env.DEBUG_CHART === "1";

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonErr("المدخلات غير صحيحة (JSON غير صالح).", 400);
    }

    const input = normalizeInput(body);

    const missing: string[] = [];
    if (!input.birthDate     || input.birthDate.length  < 8) missing.push("birth_date");
    if (!input.birthTime     || input.birthTime.length  < 3) missing.push("birth_time");
    if (!input.birthTimezone || input.birthTimezone.length < 3) missing.push("birth_timezone");
    if (!(typeof input.lat === "number")) missing.push("lat");
    if (!(typeof input.lng === "number")) missing.push("lng");

    if (missing.length) {
      return jsonErr("المدخلات غير مكتملة.", 400, { missing, received: input });
    }

    const mod = await import("@/lib/astro/chart-engine");
    const computeNatalChart = (mod as any).computeNatalChart;

    if (typeof computeNatalChart !== "function") {
      return jsonErr("محرك حساب الخريطة غير متوفر (computeNatalChart غير موجود).", 500);
    }

    const chart = await computeNatalChart({
      birthDate:     input.birthDate,
      birthTime:     input.birthTime,
      birthTimezone: input.birthTimezone,
      lat:           input.lat!,
      lng:           input.lng!,
      houseSystem:   input.houseSystem,
      zodiacType:    input.zodiacType,
      city:          input.city     || undefined,
      countryCode:   input.countryCode || undefined,
    });

    const response: any = {
      chart,
      meta: {
        birth_date:     input.birthDate,
        birth_time:     input.birthTime,
        birth_timezone: input.birthTimezone,
        lat:            input.lat,
        lng:            input.lng,
        house_system:   input.houseSystem,
        zodiac_type:    input.zodiacType,
        city:           input.city    || null,
        country:        input.country || null,
        countryCode:    input.countryCode || null,
      },
    };

    // Debug mode: include safe diagnostic fields (no API keys)
    if (debugMode) {
      response._debug = {
        debugMode: true,
        rawShapeKeys: chart?._debug?.rawShapeKeys ?? [],
        rootShapeKeys: chart?._debug?.rootShapeKeys ?? [],
        mappingUsed: chart?._debug?.mappingUsed ?? "unknown",
        planetsCount: chart?.planets?.length ?? 0,
        housesCount:  chart?.houses?.length  ?? 0,
        aspectsCount: chart?.aspects?.length ?? 0,
        ascendantShape: typeof chart?.ascendant,
        midheavenShape: typeof chart?.midheaven,
      };
      // Strip _debug from chart itself to keep chart clean
      if (response.chart?._debug) delete response.chart._debug;
    }

    return jsonOk(response);
  } catch (e: any) {
    const errMsg = String(e?.message ?? e);
    // Detect HTML leak in error message — sanitize snippet
    const safeMsg = errMsg.replace(/<[^>]*>/g, "[HTML]").slice(0, 500);
    return jsonErr("حدث خطأ داخلي غير متوقع.", 500, {
      error: safeMsg,
      ...(debugMode ? { debugMode: true } : {}),
    });
  }
}
