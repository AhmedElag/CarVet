import type {Metadata} from '@/demo/types';
import {TestDriveDemo} from '@/components/TestDriveDemo';
import {services} from '@/data/services';
export const metadata:Metadata={title:'Your test drive | CarVet scanner experience',description:'Explore a sample CarVet scanner journey: a scanner you keep, a recorded test-drive replay, evidence review, and planned support levels.'};
export default async function TestDrivePage({searchParams}:{searchParams:Promise<{service?:string|string[];tab?:string|string[]}>}){
  const params=await searchParams;
  const serviceValue=Array.isArray(params.service)?params.service[0]:params.service;
  const service=services.find(item=>item.slug===serviceValue)?.slug||'top-3-decision-review';
  const tabValue=Array.isArray(params.tab)?params.tab[0]:params.tab;
  const tab=tabValue==='support'||tabValue==='buying-day'?tabValue:undefined;
  return <TestDriveDemo key={`${service}:${tab||'journey'}`} initialService={service} initialTab={tab}/>;
}
