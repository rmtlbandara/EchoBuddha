import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const base='.artifacts/adsense-final-readiness-2026-11/production';
const manifest=JSON.parse(fs.readFileSync(`${base}/artifact/release-manifest.json`,'utf8'));
const expected=process.argv[2];assert.equal(manifest.sha,expected);
const headers=['content-security-policy','strict-transport-security','x-content-type-options','x-frame-options','referrer-policy','permissions-policy','x-permitted-cross-domain-policies'];
const rows=[];const targets=manifest.files.filter(item=>!['dist/_headers','dist/_redirects'].includes(item.path));
let cursor=0;
async function inspect(item){
 const relative=item.path.slice(5);assert.ok(item.path.startsWith('dist/'));
 const route=relative==='404.html'?'/unlisted-final-readiness-probe-404/':relative.endsWith('index.html')?'/'+relative.slice(0,-10):'/'+relative;
 let response,body;
 for(let i=0;i<3;i++){
  try{response=await fetch(`https://echobuddha.com${route}`,{redirect:'error',signal:AbortSignal.timeout(25000),headers:{'user-agent':'EchoBuddha-Authorized-Audit/1.0'}});body=Buffer.from(await response.arrayBuffer());break;}catch(error){if(i===2)throw error;}
 }
 assert.equal(response.status,relative==='404.html'?404:200,route);
 const hash=crypto.createHash('sha256').update(body).digest('hex');
 let edgeTransformation;
 if(relative==='robots.txt'){
  const source=fs.readFileSync(`${base}/artifact/dist/robots.txt`);
  const baseline=fs.readFileSync('.artifacts/adsense-final-readiness-2026-11/baseline-crawl/robots.txt');
  assert.ok(body.subarray(-source.length).equals(source),'Live robots retains exact source bytes');
  assert.ok(baseline.subarray(-source.length).equals(source),'Baseline has the same source policy');
  const prefix=body.subarray(0,-source.length);
  assert.ok(prefix.equals(baseline.subarray(0,-source.length)),'Cloudflare managed prefix is unchanged');
  assert.match(prefix.toString(),/# BEGIN Cloudflare Managed content/);
  assert.match(prefix.toString(),/Content-Signal: search=yes/);
  edgeTransformation='Unchanged Cloudflare managed prefix plus byte-identical source policy';
 }else assert.equal(hash,item.sha256,`${route}: exact artifact bytes`);
 const contacts=[...new Set((body.toString().match(/[a-z0-9._%+-]+@echobuddha\.com/gi)||[]).map(x=>x.toLowerCase()))];assert.ok(contacts.every(x=>x==='info@echobuddha.com'),route);
 assert.ok(!body.toString().toLowerCase().includes('support@echobuddha.com'),route);
 if(relative.endsWith('.html')){for(const key of headers)assert.ok(response.headers.has(key),`${route}: ${key}`);assert.notEqual(response.headers.get('cf-mitigated'),'challenge');assert.doesNotMatch(body.toString(),/pagead2\.googlesyndication|adsbygoogle|google_ad_client/i,route);}
 if(relative==='release.json')assert.equal(JSON.parse(body).sha,expected);
 return {path:item.path,url:`https://echobuddha.com${route}`,status:response.status,bytes:body.length,sha256:hash,artifactSha256:item.sha256,matches:hash===item.sha256,edgeTransformation,contacts,securityHeadersPassed:relative.endsWith('.html')?true:undefined};
}
await Promise.all(Array.from({length:6},async()=>{for(;;){const index=cursor++;if(index>=targets.length)return;rows.push(await inspect(targets[index]));if(rows.length%100===0)console.log(`${rows.length} public files byte-verified`);}}));
rows.sort((a,b)=>a.path.localeCompare(b.path));assert.equal(rows.length,manifest.fileCount-2);
const summary={observedAt:new Date().toISOString(),sha:expected,artifactAggregateSha256:manifest.aggregateSha256,artifactFiles:manifest.fileCount,publicFilesVerified:rows.length,excludedConfigurationFiles:2,htmlVerified:rows.filter(r=>r.path.endsWith('.html')).length,byteIdenticalFiles:rows.filter(r=>r.matches).length,edgeTransformedFiles:rows.filter(r=>r.edgeTransformation).length,allPublicFilesVerified:true,contacts:[...new Set(rows.flatMap(r=>r.contacts))],adsRuntimeAbsentFromHtml:true,securityHeadersAllHtml:true};
fs.writeFileSync(`${base}/full-artifact-live-parity.json`,JSON.stringify({summary,files:rows},null,2)+'\n');console.log(JSON.stringify(summary,null,2));
