import sharp from 'sharp';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';
const text=readFileSync('website_struct/continuity_asset_map.txt','utf8').replace(/\r/g,'');
const blocks=text.split(/={20,}/);
const assets={};
const updates=[];
for(const block of blocks){
 const id=block.match(/STABLE ASSET ID:\n(.+)/)?.[1];
 if(!id)continue;
 const original=block.match(/CURRENT FILE:\n(.+)/)?.[1];
 const filename=block.match(/RECOMMENDED FINAL FILE:\n(.+)/)?.[1];
 const alt=block.match(/ALT TEXT:\n(.+)/)?.[1];
 const product=id.startsWith('camel')?'camel':id.startsWith('messerschmitt')?'messerschmitt':null;
 const folder=product?`public/assets/products/c01/${product}`:'public/assets/brand';
 const src=product?`assets/${product==='camel'?'C-01_Camel':'C-01_MesserSchmidt'}/${original}`:`assets/${original}`;
 mkdirSync(folder,{recursive:true});
 if(!existsSync(src))throw new Error(`Missing source image: ${src}`);
 const meta=await sharp(src).metadata();
 const path=`${folder.slice(6)}/${filename}`;
 assets[id]={id,product,alt,path,width:meta.width,height:meta.height,widths:[]};
 if(!product){copyFileSync(src,`${folder}/${filename}`);continue;}
 const base=filename.replace('.avif','');
 const widths=[480,768,1280,1920].filter(w=>w<meta.width); widths.push(meta.width);
 assets[id].widths=widths;
 for(const width of widths){
   for(const format of ['avif','webp']){
    const target=`${folder}/${base}-${width}.${format}`;
    if(!existsSync(target))await sharp(src).resize({width,withoutEnlargement:true}).toFormat(format,{quality:format==='avif'?58:82}).toFile(target);
   }
 }
 for(const format of ['avif','webp'])copyFileSync(`${folder}/${base}-${meta.width}.${format}`,`${folder}/${base}.${format}`);
 console.log(`Optimized ${id}: ${widths.join(', ')}w`);
}
mkdirSync('src/content',{recursive:true});
writeFileSync('src/content/assets.json',JSON.stringify(assets,null,2)+'\n');
for(const a of Object.values(assets))updates.push(`UPDATE assets SET path='${a.path}', alt_text='${a.alt.replaceAll("'","''")}' WHERE asset_id='${a.id}';`);
writeFileSync('migrations/0002_asset_paths.sql','-- Align baseline asset paths and alt text with the authoritative asset map.\n'+updates.join('\n')+'\n');
