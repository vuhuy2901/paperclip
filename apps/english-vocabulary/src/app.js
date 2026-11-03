import Fastify from 'fastify';
import { z } from 'zod';
import { vocabulary } from './data.js';
const querySchema=z.object({q:z.string().trim().max(100).optional(),topic:z.enum(['work','travel','daily']).optional(),limit:z.coerce.number().int().min(1).max(50).default(50),offset:z.coerce.number().int().min(0).default(0)});
export function buildApp(){const app=Fastify(); app.get('/health',async()=>({status:'ok'})); app.get('/api/v1/vocabulary',async(req,reply)=>{const parsed=querySchema.safeParse(req.query);if(!parsed.success)return reply.code(400).send({error:'INVALID_QUERY',details:parsed.error.flatten()});const {q,topic,limit,offset}=parsed.data;const needle=q?.toLowerCase();const filtered=vocabulary.filter(v=>(!topic||v.topic===topic)&&(!needle||[v.english,v.vietnamese,v.example].some(x=>x.toLowerCase().includes(needle))));return {data:filtered.slice(offset,offset+limit),meta:{total:filtered.length,limit,offset}}}); return app}
