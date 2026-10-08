import {authorized,loadAnalytics,metrics} from '../../src/server/analytics';
export default async function handler(req:any,res:any) {
 if (!authorized(req)) return res.status(401).json({error:'Não autorizado'});
 if (req.method!=='GET') return res.status(405).json({error:'Método não permitido'});
 res.setHeader('Cache-Control','no-store');
 try {return res.json(metrics(await loadAnalytics()));} catch {return res.status(503).json({error:'Armazenamento indisponível'});}
}
