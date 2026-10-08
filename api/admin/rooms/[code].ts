import {authorized} from '../../../src/server/analytics';
export default async function handler(req:any,res:any) {
 if (!authorized(req)) return res.status(401).json({error:'Não autorizado'});
 if (req.method !== 'DELETE') return res.status(405).json({error:'Método não permitido'});
 const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if (!url || !token) return res.status(503).json({error:'Armazenamento não configurado'});
 const redis=async (...command:unknown[])=>{const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command)});const data=await response.json();if(!response.ok || data.error) throw new Error();return data.result;};
 try {
  const raw=await redis('GET','entre-nos:state');
  if (!raw) return res.status(404).json({error:'Sala não encontrada'});
  const data=JSON.parse(raw),code=req.query.code;
  if (!data.rooms.some(([key]:[string,unknown])=>key===code)) return res.status(404).json({error:'Sala não encontrada'});
  data.rooms=data.rooms.filter(([key]:[string,unknown])=>key!==code);
  data.tokens=data.tokens.filter(([,entry]:[string,{roomCode:string}])=>entry.roomCode!==code);
  const saved=await redis('EVAL',"if redis.call('exists',KEYS[2]) == 0 and redis.call('get',KEYS[1]) == ARGV[1] then redis.call('set',KEYS[1],ARGV[2]); return 1 else return 0 end",2,'entre-nos:state','entre-nos:lock',raw,JSON.stringify(data));
  if(saved!==1) return res.status(409).json({error:'Partida em atualização. Tente novamente.'});
  return res.json({success:true});
 } catch {return res.status(503).json({error:'Armazenamento indisponível'});}
}
