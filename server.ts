import 'dotenv/config';
import express from 'express';
import {createServer as createViteServer} from 'vite';
import path from 'node:path';
import gameHandler from './api/game.js';
import metricsHandler from './api/admin/metrics.js';
import exportHandler from './api/admin/export-csv.js';
import deleteRoomHandler from './api/admin/rooms/[code].js';

const app = express();
app.use(express.json({limit:'32kb'}));
app.post('/api/game',gameHandler);
app.get('/api/admin/metrics',metricsHandler);
app.get('/api/admin/export-csv',exportHandler);
app.delete('/api/admin/rooms/:code',(req,res)=>{
 req.query.code=req.params.code;
 return deleteRoomHandler(req,res);
});
async function bootstrap() {
 if (process.env.NODE_ENV !== 'production') {
  const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});
  app.use(vite.middlewares);
 } else {
  const dist=path.resolve(process.cwd(),'dist');
  app.use(express.static(dist));
  app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
 }
 const port=Number(process.env.PORT)||3000;
 app.listen(port,'0.0.0.0',()=>console.log(`[Entre Nós] Servidor rodando na porta ${port}`));
}
bootstrap().catch(error=>{console.error('Falha ao iniciar:',error);process.exitCode=1;});
