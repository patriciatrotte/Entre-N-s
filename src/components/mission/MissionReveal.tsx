import React from 'react';
import { MissionDef, SanitizedRoomState } from '../../types/game';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { PerspectiveCard } from '../cards/CardView';
import { socketService } from '../../services/socket';
import { Users, MessageSquareQuote, Vote, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

interface MissionRevealProps {
  mission: MissionDef;
  state: SanitizedRoomState;
  myPlayerId: string;
}

export const MissionReveal: React.FC<MissionRevealProps> = ({
  mission,
  state,
  myPlayerId,
}) => {
  const isHost = state.hostId === myPlayerId;
  const revealedChoices: Record<string, string> = state.revealedIndividualChoices || {};

  // Group players by chosen action
  const choicesByAction: Record<string, string[]> = {};
  mission.actions.forEach((a) => (choicesByAction[a.id] = []));

  Object.entries(revealedChoices).forEach(([pid, actId]) => {
    const actionKey = String(actId);
    if (choicesByAction[actionKey]) {
      choicesByAction[actionKey].push(pid);
    }
  });

  const handleStartCollectiveVoting = () => {
    socketService.send({
      type: 'OPEN_COLLECTIVE_VOTE',
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Fase 3 de 4 • Revelação e Reflexão Dialogada
          </span>
          <span className="text-xs text-slate-400">
            {mission.title}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
          As Escolhas Individuais do Grupo
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Vejam como cada guardião se posicionou inicialmente. Divergências revelam nuances diferentes da situação; aproveitem o momento para debater abertamente.
        </p>

        {/* Guided Discussion Box (Structured reflection cues) */}
        <div className="mt-5 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-indigo-300 mb-2">
            <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
            Roteiro Sugerido para a Conversa da Equipe (Presencial ou Chamada de Áudio):
          </div>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              Quem optou por caminhos diferentes: <em>quais preocupações imediatas motivaram a sua escolha?</em>
            </li>
            <li>
              Como as perspectivas dos atores ouvidos (servidores, cidadãos, gestores) impactam o desfecho?
            </li>
            <li>
              Existe algum ponto em que o grupo pode convergir para uma ação coletiva mais justa?
            </li>
          </ul>
        </div>
      </div>

      {/* Grid of Actions with chosen avatars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mission.actions.map((action) => {
          const playerIds = choicesByAction[action.id] || [];
          const count = playerIds.length;

          return (
            <div
              key={action.id}
              className={`flex flex-col bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-xl transition-all ${
                count > 0 ? 'border-teal-500/60 ring-1 ring-teal-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {action.actionType}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {count} {count === 1 ? 'escolha' : 'escolhas'}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-100 mb-2">
                {action.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {action.description}
              </p>

              {/* Roster of players who chose this */}
              <div className="mt-auto pt-3 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">
                  Guardiões que escolheram:
                </div>

                {playerIds.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">
                    Nenhum guardião escolheu esta alternativa.
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {playerIds.map((pid) => {
                      const p = state.players[pid];
                      if (!p) return null;
                      return (
                        <div
                          key={pid}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                        >
                          <CharacterAvatar
                            characterId={p.characterId}
                            variantIndex={p.variantIndex}
                            size="sm"
                            showBadge={false}
                          />
                          <span className="font-medium">{p.nickname}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Actor Perspectives Reference for Deliberation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          Relembrar Perspectivas Reveladas dos Atores
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mission.perspectives.map((persp) => (
            <PerspectiveCard
              key={persp.id}
              perspective={persp}
              isSharedWithGroup={true}
            />
          ))}
        </div>
      </div>

      {/* Footer bar to move to Collective Voting */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          Após a conversa em equipe, realizem a{' '}
          <strong className="text-teal-300">votação da ação coletiva da Vila</strong>.
        </div>

        <button
          onClick={handleStartCollectiveVoting}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Vote className="w-4 h-4" />
          <span>Iniciar Votação Coletiva da Equipe</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
