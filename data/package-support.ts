export type PackageSupportLevel = "review" | "scanner" | "live" | "buying-day";

export type PackageSupport = {
  scannerIncluded: boolean;
  liveSupport: boolean;
  buyingDay: boolean;
  level: PackageSupportLevel;
  label: string;
};

const review: PackageSupport = {
  scannerIncluded: false,
  liveSupport: false,
  buyingDay: false,
  level: "review",
  label: "Review & next steps",
};

const scanner: PackageSupport = {
  scannerIncluded: true,
  liveSupport: false,
  buyingDay: false,
  level: "scanner",
  label: "A scanner to keep",
};

const live: PackageSupport = {
  scannerIncluded: true,
  liveSupport: true,
  buyingDay: false,
  level: "live",
  label: "Online live support",
};

const buyingDay: PackageSupport = {
  scannerIncluded: true,
  liveSupport: true,
  buyingDay: true,
  level: "buying-day",
  label: "Buying-day support",
};

const supportBySlug: Record<string, PackageSupport> = {
  "listing-risk-scan": review,
  "listing-shortlist-scan": review,
  "serious-candidate-review": scanner,
  "top-3-decision-review": scanner,
  "find-me-options": scanner,
  "30-day-market-watch": live,
  "viewing-support": live,
  "viewing-day-support": buyingDay,
};

/** Proposed package benefits only. This does not place an order or ship hardware. */
export function getPackageSupport(slug: string): PackageSupport {
  return { ...(supportBySlug[slug] || review) };
}
