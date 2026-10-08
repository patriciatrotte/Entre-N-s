import {handleClientMessage, restore, snapshot} from '../src/game/engine';
import type {ClientMessage} from '../src/types/game';

// Redis REST credentials are server-only. A single lock serializes the small pilot's state.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({error:'Método não permitido'});
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(503).json({error:'Multiplayer ainda não configurado. Use Jogar sozinho.'});
  const redis = async (...command: unknown[]) => {
    const response = await fetch(url, {method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}, body:JSON.stringify(command)});
    const result = await response.json();
    if (!response.ok || result.error) throw new Error('Falha no armazenamento');
    return result.result;
  };
  const lock = crypto.randomUUID();
  let acquired = false;
  try {
    acquired = await redis('SET','entre-nos:lock',lock,'NX','PX',15000) === 'OK';
    if (!acquired) return res.status(409).json({error:'Sala ocupada. Tente novamente.'});
    const saved = await redis('GET','entre-nos:state');
    restore(saved ? JSON.parse(saved) : {rooms:[],tokens:[],evaluations:[],feedback:[]});
    const now = Date.now();
    const data = snapshot();
    data.rooms = data.rooms.filter(([,room]) => now - room.createdAt < 24 * 60 * 60 * 1000);
    const codes = new Set(data.rooms.map(([code]) => code));
    data.tokens = data.tokens.filter(([,entry]) => codes.has(entry.roomCode));
    data.evaluations = data.evaluations.filter(record => now - record.timestamp < 90 * 24 * 60 * 60 * 1000);
    data.feedback = data.feedback.filter(record => now - record.timestamp < 90 * 24 * 60 * 60 * 1000);
    for (const [,room] of data.rooms) {
      for (const p of Object.values(room.players)) if (!p.isBot && p.lastSeenAt && now - p.lastSeenAt > 30000) p.isConnected = false;
    }
    for (const [,room] of data.rooms) {
      if (!room.players[room.hostId]?.isConnected) {
        const next = Object.values(room.players).find(p => p.isConnected && !p.isBot);
        if (next) {for (const p of Object.values(room.players)) p.isHost = p.id === next.id; room.hostId = next.id;}
      }
    }
    restore(data);
    const frames: unknown[] = [];
    const connection = {readyState:1,send: (data: string) => frames.push(JSON.parse(data))};
    const {sessionToken, roomCode, message} = req.body || {};
    if (sessionToken && roomCode) {
      const state = snapshot();
      const entry = state.tokens.find(([key]) => key === sessionToken)?.[1];
      const room = state.rooms.find(([key]) => key === roomCode)?.[1];
      const player = entry && entry.roomCode === roomCode && room?.players[entry.playerId];
      if (!player) return res.status(401).json({error:'Sessão expirada. Entre novamente.'});
      player.lastSeenAt = now;
      handleClientMessage(connection,{type:'JOIN_ROOM',roomCode,sessionToken,nickname:player.nickname,characterId:player.characterId,variantIndex:player.variantIndex});
    } else if (message?.type !== 'CREATE_ROOM' && message?.type !== 'JOIN_ROOM') {
      return res.status(401).json({error:'Sessão necessária'});
    }
    for (let i = frames.length - 1; i >= 0; i--) if ((frames[i] as any).type === 'NOTIFICATION') frames.splice(i,1);
    if (message) handleClientMessage(connection,message as ClientMessage);
    const updated = snapshot();
    for (const frame of frames as any[]) {
      if (frame.type === 'ROOM_JOINED') {
        const room = updated.rooms.find(([code]) => code === frame.roomCode)?.[1];
        if (room?.players[frame.playerId]) room.players[frame.playerId].lastSeenAt = now;
      }
    }
    const stored = await redis('EVAL',"if redis.call('get',KEYS[1]) == ARGV[1] then redis.call('set',KEYS[2],ARGV[2]); return 1 else return 0 end",2,'entre-nos:lock','entre-nos:state',lock,JSON.stringify(updated));
    if (stored !== 1) throw new Error('Conflito de atualização');
    return res.json({frames});
  } catch {
    return res.status(503).json({error:'Não foi possível salvar a partida. Tente novamente.'});
  } finally {
    if (acquired) await redis('EVAL',"if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",1,'entre-nos:lock',lock).catch(()=>{});
  }
}
