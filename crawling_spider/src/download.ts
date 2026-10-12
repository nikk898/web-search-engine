import { createWriteStream } from "node:fs";
import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from "node:stream/promises";
import { gunzipSync } from 'node:zlib';

const headers = { 'User-agent': 'search-engine-prototype/0.1 (thenc1116@gmail.com)' };

const crawls = (await (await fetch('https://index.commoncrawl.org/collinfo.json',
  { headers })).json()) as { id: string }[];

const crawlId = crawls[0].id;
console.log('Most recent crawl:', crawlId);

const pathRes = await fetch(`https://data.commoncrawl.org/crawl-data/${crawlId}/wet.paths.gz`,
  { headers });

const paths = gunzipSync(Buffer.from(await pathRes.arrayBuffer())).toString().trim().split('\n');
const wetPath = paths[0];
console.log(`${paths.length} files WET found; Downloading: ${wetPath}`);

await mkdir('data', { recursive: true });
const res = await fetch(`https://data.commoncrawl.org/crawl-data/${crawlId}/wet.paths.gz`,
  { headers });
if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
await pipeline(Readable.fromWeb(res.body as any), createWriteStream('data/sample.warc.wet.gz'));
console.log('Saved in data/sample.warc.wet.gz');
