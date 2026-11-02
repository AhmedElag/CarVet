import type { Metadata } from "@/demo/types";
import { ClientDemo } from "@/components/ClientDemo";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Client demo | CarVet",
  description: "Try a sample CarVet request, shortlist, buyer review, and decision plan.",
};

export default async function DemoPage({ searchParams }: {
  searchParams: Promise<{ service?: string | string[]; scenario?: string | string[] }>;
}) {
  const params = await searchParams;
  const value = Array.isArray(params.service) ? params.service[0] : params.service;
  const aliases: Record<string, string> = {
    "serious-candidate": "serious-candidate-review",
    "top-3-decision": "top-3-decision-review",
  };
  const slug = value ? aliases[value] || value : undefined;
  const service = services.find(item => item.slug === slug);
  const scenarioValue = Array.isArray(params.scenario) ? params.scenario[0] : params.scenario;
  const scenario = scenarioValue && ["family", "commute", "electric"].includes(scenarioValue) ? scenarioValue : undefined;
  return <ClientDemo key={`${service?.slug || "choose"}:${scenario || "own"}`} initialService={service?.slug} initialScenario={scenario} />;
}
