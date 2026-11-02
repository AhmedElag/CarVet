import sampleInventory from "./sample-inventory.json" with { type: "json" };

/** Public, synthetic display data only. The trained server engine is not imported. */
export type SampleVehicle = (typeof sampleInventory)[number] & {
  score: number;
  reasons: string[];
  tradeoff: string;
};
export type SampleConstraints = {
  budget: number; max_mileage: number; min_seats: number;
  body?: string; powertrain?: string; awd?: boolean;
  clean_only?: boolean; exclude_electric?: boolean;
};
export type SampleMatchResult = {
  results: SampleVehicle[]; total_matches: number; inventory_count: number;
  constraints: SampleConstraints;
};

const bodies = ["sedan", "hatchback", "suv", "truck", "wagon", "coupe", "minivan"];
const powertrains = ["gas", "hybrid", "electric", "diesel"];
const money = (value: number) => `C$${value.toLocaleString("en-CA", { maximumFractionDigits: 0 })}`;
const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);

function numberField(raw: Record<string, unknown>, key: string, fallback: number, min: number, max: number, integer = true) {
  const input = raw[key];
  const value = input === undefined || input === null || input === "" ? fallback : typeof input === "number" || typeof input === "string" ? Number(input) : NaN;
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new Error(`Please enter a valid ${key === "budget" ? "maximum price" : key === "max_mileage" ? "maximum odometer" : "seat count"}.`);
  }
  return value;
}

function choice(raw: Record<string, unknown>, key: string, allowed: string[], inferred?: string) {
  const value = raw[key];
  if (value === undefined || value === null || value === "" || value === "any") return inferred;
  if (typeof value !== "string" || !allowed.includes(value)) throw new Error(`Please choose a valid ${key}.`);
  return value;
}

function flag(raw: Record<string, unknown>, key: string, fallback = false) {
  if (raw[key] === undefined || raw[key] === null) return fallback;
  if (typeof raw[key] !== "boolean") throw new Error(`Please choose a valid ${key} option.`);
  return raw[key];
}

/** Deliberately small, transparent demo rules. Form fields always take precedence. */
export function matchSampleVehicles(value: unknown): SampleMatchResult {
  if (!record(value)) throw new Error("Please enter your sample requirements.");
  const textValue = value.text ?? "";
  if (typeof textValue !== "string" || textValue.length > 4000) throw new Error("Keep your story under 4,000 characters.");
  const text = textValue.toLowerCase().replace(/[’‘]/g, "'");
  // Remove simple explicitly negated phrases before detecting a positive preference.
  const positive = text.replace(/\b(?:no|not|avoid|without|don't want|do not want)\s+(?:an?\s+)?(?:electric|ev|hybrid|gas|diesel|sedans?|hatchbacks?|suvs?|trucks?|wagons?|coupes?|minivans?)\b/g, " ");
  const noElectric = /\b(?:no|not|avoid|without|don't want|do not want)\s+(?:an?\s+)?(?:electric|ev)\b/.test(text);
  const inferredBody = bodies.find(body => new RegExp(`\\b${body}s?\\b`).test(positive));
  const inferredPowertrain = /\b(electric|ev)\b/.test(positive) ? "electric" : powertrains.find(item => new RegExp(`\\b${item}\\b`).test(positive));
  const powertrain = choice(value, "powertrain", powertrains, inferredPowertrain);
  // An explicit powertrain field also supersedes a contradictory free-text preference.
  const explicitPowertrain = typeof value.powertrain === "string" && powertrains.includes(value.powertrain);
  const constraints: SampleConstraints = {
    budget: numberField(value, "budget", 35000, 1, 2000000, false),
    max_mileage: numberField(value, "max_mileage", 120000, 0, 2000000),
    min_seats: numberField(value, "min_seats", 5, 1, 12),
    body: choice(value, "body", bodies, inferredBody),
    powertrain,
    awd: flag(value, "awd"),
    clean_only: flag(value, "clean_only"),
    exclude_electric: explicitPowertrain ? false : noElectric,
  };
  const matches = sampleInventory.filter(car =>
    car.price_cad <= constraints.budget &&
    car.mileage_km <= constraints.max_mileage &&
    car.seats >= constraints.min_seats &&
    (!constraints.body || car.body === constraints.body) &&
    (!constraints.powertrain || car.powertrain === constraints.powertrain) &&
    (!constraints.awd || car.drivetrain === "AWD" || car.drivetrain === "4WD") &&
    (!constraints.clean_only || car.accident_history === "none_reported") &&
    (!constraints.exclude_electric || car.powertrain !== "electric")
  ).sort((a, b) => a.price_cad - b.price_cad || a.mileage_km - b.mileage_km || a.id.localeCompare(b.id));
  const results = matches.slice(0, 5).map(car => ({
    ...car,
    score: Math.round((1 - car.price_cad / constraints.budget) * 1000) / 10,
    reasons: [
      `${money(car.price_cad)} is within your ${money(constraints.budget)} maximum.`,
      `${car.seats} seats; ${car.mileage_km.toLocaleString("en-CA")} km in this sample listing.`,
      "Demo order: lowest asking price first, then lower odometer. No condition rating is calculated.",
    ],
    tradeoff: "Request independent history, maintenance records, and an inspection before deciding.",
  }));
  return { results, total_matches: matches.length, inventory_count: sampleInventory.length, constraints };
}

/** The Pages demo runs completely in the browser and never calls a server. */
export async function requestSampleMatch(brief: unknown): Promise<SampleMatchResult> {
  return matchSampleVehicles(brief);
}
