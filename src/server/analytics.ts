import type {snapshot} from '../game/engine';
export async function loadAnalytics() {
 const url=process.env.UPSTASH_REDIS_REST_URL, token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if (!url || !token) throw new Error('Armazenamento não configurado');
 const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(['GET','entre-nos:state'])});
 const result=await response.json();
 if (!response.ok || result.error) throw new Error('Falha no armazenamento');
 return (result.result ? JSON.parse(result.result) : {rooms:[],tokens:[],evaluations:[],feedback:[]}) as ReturnType<typeof snapshot>;
}
export function authorized(req:any) {return !!process.env.ADMIN_PASSKEY && req.headers.authorization === `Bearer ${process.env.ADMIN_PASSKEY}`;}
export function metrics(data:ReturnType<typeof snapshot>) {
 const avg=(values:number[])=>values.length ? (values.reduce((a,b)=>a+b,0)/values.length).toFixed(2) : '0';
 const pre=data.evaluations.filter(e=>e.preTestScore!==undefined).map(e=>e.preTestScore!);
 const post=data.evaluations.filter(e=>e.postTestScore!==undefined).map(e=>e.postTestScore!);
 const paired=data.evaluations.filter(e=>e.preTestScore!==undefined && e.postTestScore!==undefined);
 return {totalRooms:data.rooms.length,totalPlayers:data.evaluations.length,totalCompletedMissions:data.rooms.reduce((n,[,r])=>n+r.completedMissionIds.length,0),evaluation:{preEvaluationsCount:pre.length,postEvaluationsCount:post.length,avgPreScore:avg(pre),avgPostScore:avg(post),pairedCount:paired.length,pairedAverageChange:avg(paired.map(e=>e.postTestScore!-e.preTestScore!))},feedback:{totalFeedback:data.feedback.length,avgUsability:avg(data.feedback.map(f=>f.usability)),avgClarity:avg(data.feedback.map(f=>f.clarity)),avgInterest:avg(data.feedback.map(f=>f.interest)),recentComments:data.feedback.filter(f=>f.comment).slice(-20).map(f=>({comment:f.comment,timestamp:f.timestamp}))},rooms:data.rooms.map(([,r])=>({roomCode:r.roomCode,createdAt:r.createdAt,phase:r.phase,playerCount:Object.values(r.players).filter(p=>!p.isBot).length,completedMissions:r.completedMissionIds.length,discoveriesCount:r.unlockedDiscoveries.length}))};
}
export function exportCsv(data:ReturnType<typeof snapshot>) {
 const cell=(v:unknown)=>`"${String(v ?? '').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')}"`;
 const rows:unknown[][]=[['Timestamp','Tipo','RoomCode','PlayerId','PreScore','PostScore','Usabilidade','Clareza','Interesse','Comentario']];
 for (const e of data.evaluations) rows.push([new Date(e.timestamp).toISOString(),'Avaliacao',e.roomCode,e.playerId,e.preTestScore,e.postTestScore,'','','','']);
 for (const f of data.feedback) rows.push([new Date(f.timestamp).toISOString(),'Feedback',f.roomCode,f.playerId,'','',f.usability,f.clarity,f.interest,f.comment]);
 return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\n');
}
