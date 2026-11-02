import type { Metadata } from "@/demo/types";
import { DemoWorkspace } from "@/components/DemoWorkspace";

export const metadata: Metadata = { title:"Your workspace | CarVet",description:"Follow a sample CarVet request from a buyer brief to an advisor review and decision plan." };
export default async function WorkspacePage({searchParams}:{searchParams:Promise<{request?:string|string[];view?:string|string[]}>}) {
  const params=await searchParams;
  const id=Array.isArray(params.request)?params.request[0]:params.request;
  const view=Array.isArray(params.view)?params.view[0]:params.view;
  return <DemoWorkspace key={`${id||"workspace"}:${view==="advisor"?"advisor":"client"}`} initialRequest={id} initialRole={view==="advisor"?"advisor":"client"} />;
}
