# Entre Nós — Guardiões da Convivência

Jogo cooperativo sobre dilemas cotidianos, com quatro missões por jornada.

## Desenvolvimento

Node.js 24, `npm ci`, `npm test`, `npm run lint`, `npm run build`.
`npm run dev` inicia o aplicativo. Copie `.env.example` para `.env` para configurar o multiplayer.

## Modos

- **Jogar sozinho:** roda no navegador com três companheiros virtuais de preferências distintas. Não usa IA generativa ou gabaritos para escolher. Salva na aba atual e recupera após recarregar. Fechar a aba encerra essa persistência. As avaliações locais não são enviadas ao painel.
- **Criar/entrar em sala:** API HTTP com atualização a cada 1,5 segundo; compartilha estado entre dispositivos por Redis. Um único participante em uma sala online recebe companheiros virtuais ao iniciar. Somente respostas humanas entram nas métricas.

## Vercel

Conecte o repositório e crie uma integração Upstash Redis no projeto. Configure `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` e uma chave forte `ADMIN_PASSKEY` em Production e Preview. Use bancos distintos para esses ambientes. Faça novo deployment após configurar. Nunca use prefixo `VITE_` nessas chaves. Sem Redis, o modo solo funciona e o multiplayer informa que precisa de configuração.

O painel e a exportação CSV usam os registros persistidos. As avaliações são vinculadas a identificadores de sessão, portanto não são estritamente anônimas. Não inclua dados pessoais ou relatos identificáveis nos comentários.

## Limites deste piloto

A persistência usa um documento compartilhado e um bloqueio distribuído com gravação condicionada ao bloqueio. Foi projetada para um piloto pequeno; antes de ampliar a carga, separe os dados por sala, adicione limites de requisições e faça teste de carga. Salas e credenciais expiram após 24 horas; registros de avaliação e feedback são removidos após 90 dias durante as operações de jogo. O conteúdo pedagógico está no bundle do navegador: o sigilo das escolhas entre participantes é aplicado pelo servidor, mas o aplicativo não é uma plataforma de provas protegidas.

A avaliação antes/depois mostra respostas a situações e não mede isoladamente mudança de comportamento. A métrica adicional de diferença usa apenas avaliações pareadas. Companheiros virtuais são identificados como computador e não substituem participantes reais na evidência do concurso.

## Verificação antes do piloto

Teste a versão publicada em celular; conclua uma partida solo e outra em dois dispositivos; recarregue no meio da missão; confira sigilo das escolhas; confira resultados e CSV no painel. A configuração real de Redis e o teste do deployment precisam ser concluídos antes de anunciar o multiplayer como disponível.
