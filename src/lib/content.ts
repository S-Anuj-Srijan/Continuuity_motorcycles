import imported from '../content/pages.json';
export interface Section {key:string;Heading?:string;Body?:string;Eyebrow?:string;CTA?:string;Camel?:string;Messerschmitt?:string;'Camel card'?:string;'Messerschmitt card'?:string;}
export interface Page {route:string;title:string;description:string;hero:Record<string,string|undefined>;sections:Section[];faq:{q:string;a:string}[];status:string[][];article:{type:string;text:string}[];legal:{heading:string;body:string}[];isArticle:boolean;isLegal:boolean;}
export const pages:Page[]=imported;
export const paragraphs = (text?: string) => (text || '').split('\n\n').filter(Boolean);
export const nav = [['C-01','/c-01'],['Engineering','/engineering'],['Design','/design'],['Development','/development'],['Journal','/journal'],['About','/about']];
export function linkFor(text: string) {
  if (/Messerschmitt/.test(text)) return '/c-01/messerschmitt';
  if (/Camel/.test(text)) return '/c-01/camel';
  if (/engineering|architecture/i.test(text)) return '/engineering';
  if (/design philosophy/i.test(text)) return '/design';
  if (/development status/i.test(text)) return '/development';
  if (/machine/i.test(text)) return '#form';
  if (/Follow|access/i.test(text)) return '#early-access';
  return '/c-01';
}
