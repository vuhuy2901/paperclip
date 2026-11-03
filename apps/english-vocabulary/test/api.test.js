import test from 'node:test'; import assert from 'node:assert/strict'; import {buildApp} from '../src/app.js';
const app=buildApp();
test('returns 50 validated vocabulary records',async()=>{const r=await app.inject('/api/v1/vocabulary');assert.equal(r.statusCode,200);const b=r.json();assert.equal(b.data.length,50);assert.equal(new Set(b.data.map(x=>x.topic)).size,3);for(const x of b.data)for(const k of ['id','english','vietnamese','phonetic','example','topic'])assert.ok(x[k]);});
test('filters by topic and search',async()=>{const r=await app.inject('/api/v1/vocabulary?topic=travel&q=airport');assert.equal(r.statusCode,200);assert.equal(r.json().data.length,1);assert.equal(r.json().data[0].english,'airport');});
test('rejects invalid query',async()=>{const r=await app.inject('/api/v1/vocabulary?topic=invalid');assert.equal(r.statusCode,400);assert.equal(r.json().error,'INVALID_QUERY');});
