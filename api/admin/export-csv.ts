import {authorized,loadAnalytics,exportCsv} from '../../src/server/analytics';
export default async function handler(req:any,res:any) {
 if (!authorized(req)) return res.status(401).json({error:'Não autorizado'});
 if (req.method!=='GET') return res.status(405).json({error:'Método não permitido'});
 try {const data=await loadAnalytics();res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="entre-nos_metricas.csv"');return res.send(exportCsv(data));} catch {return res.status(503).json({error:'Armazenamento indisponível'});}
}
