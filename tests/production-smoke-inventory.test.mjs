import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const releaseSha='a'.repeat(40);
const origin='https://echobuddha.com';
const edition=JSON.parse(fs.readFileSync('docs/audits/editorial-implementation-2026-11-13/EDITION_ACCEPTANCE.json'));
const read=p=>fs.readFileSync(p,'utf8');
function runSmoke(mutate=()=>{}) {
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'echo-smoke-fixture-'));
  try {
    const headers=Object.fromEntries(['content-security-policy','strict-transport-security','x-content-type-options','referrer-policy','x-frame-options','permissions-policy','x-permitted-cross-domain-policies'].map(k=>[k,'fixture']));
    const fixture={
      [origin+'/release.json']:{json:{schemaVersion:1,sha:releaseSha,ref:'refs/heads/main',builtAt:'2026-11-14T03:00:00Z'}},
      [origin+'/']:{body:'<h1>Echo Buddha</h1><div data-consent-panel>It stays off unless you accept</div><meta name="google-adsense-account" content="ca-pub-3911157640549350">',headers},
      [origin+'/robots.txt']:{body:read('public/robots.txt')},
      [origin+'/sitemap.xml']:{body:read('dist/sitemap.xml')},
      [origin+'/learn/four-noble-truths/']:{body:read('dist/learn/four-noble-truths/index.html')},
      [origin+'/search/']:{body:read('dist/search/index.html')},
      [origin+'/search-index.json']:{json:JSON.parse(read('dist/search-index.json')).map(item=>({url:item.url}))},
      [origin+'/ads.txt']:{body:read('public/ads.txt')},
      [origin+'/phase-9-smoke-missing/']:{body:read('dist/404.html'),status:404,headers:{'content-type':'text/html'}},
      ['http://echobuddha.com/']:{body:'',status:301,headers:{location:origin+'/'}},
      ['https://echobuddha.rmtlbandara.workers.dev/']:{body:'fixture',headers:{'x-robots-tag':'noindex, nofollow'}}
    };
    mutate(fixture);
    const fixturePath=path.join(temporary,'fixture.json');fs.writeFileSync(fixturePath,JSON.stringify(fixture));
    const preload=path.join(temporary,'fetch-fixture.mjs');
    fs.writeFileSync(preload,`import fs from 'node:fs'; const fixture=JSON.parse(fs.readFileSync(process.env.ECHO_SMOKE_FIXTURE));globalThis.fetch=async input=>{const url=String(input);const value=fixture[url];if(!value)throw new Error('Unexpected network request: '+url);return value.json ? Response.json(value.json,{status:value.status??200,headers:value.headers}) : new Response(value.body,{status:value.status??200,headers:value.headers});};`);
    const result=spawnSync(process.execPath,['--import',preload,'scripts/production-smoke-check.mjs'],{encoding:'utf8',env:{...process.env,RELEASE_SHA:releaseSha,SMOKE_OUT_DIR:temporary,ECHO_SMOKE_FIXTURE:fixturePath}});
    const report=JSON.parse(read(path.join(temporary,'production-smoke-results.json')));
    return {exit:result.status,report,output:result.stdout+result.stderr};
  } finally {fs.rmSync(temporary,{recursive:true,force:true});}
}

test('production smoke accepts the complete release with twelve approved noindex search permalinks',()=>{
  const {exit,report,output}=runSmoke();assert.equal(exit,0,output);assert.equal(report.passed,15);
  assert.equal(report.failed,0);assert.match(report.checks.find(c=>c.name==='search').evidence,/352\/352/);
  assert.match(report.checks.find(c=>c.name==='sitemap').evidence,/175\/175/);
});

test('production smoke rejects a missing approved permalink even when total search count is unchanged',()=>{
  const {exit,report}=runSmoke(f=>{const search=f[origin+'/search-index.json'].json;search.find(item=>item.url===edition.userPermalinks[0]).url='/unapproved-placeholder/';});
  assert.equal(exit,1);assert.equal(report.checks.find(c=>c.name==='search').pass,false);
});

test('production smoke rejects a noindex permalink leaking into an otherwise correctly sized sitemap',()=>{
  const {exit,report}=runSmoke(f=>{const sitemap=f[origin+'/sitemap.xml'];sitemap.body=sitemap.body.replace('<loc>https://echobuddha.com/</loc>','<loc>'+origin+edition.userPermalinks[0]+'</loc>');});
  assert.equal(exit,1);assert.equal(report.checks.find(c=>c.name==='sitemap').pass,false);
});
