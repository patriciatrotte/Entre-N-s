import React, { useEffect, useState } from 'react';
import { NarrationControl } from './NarrationControl';
import { MissionDef, RoomState } from '../../types/game';
import { PerspectiveCard } from '../cards/CardView';
import { REGIONS } from '../../data/regions';
import { socketService } from '../../services/socket';
import { HelpCircle, ArrowRight, ArrowLeft, ShieldCheck, BookOpen, Info } from 'lucide-react';

interface MissionSituationProps {
  mission: MissionDef;
  state: RoomState;
  myPlayerId: string;
}

export const MissionSituation: React.FC<MissionSituationProps> = ({
  mission,
  state,
  myPlayerId,
}) => {
  const [step, setStep] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  useEffect(() => { setStep(0); setShowHelp(false); setShowFullText(false); }, [mission.id]);
  const isSolo = Object.values(state.players).filter(p => !p.isBot).length === 1;
  const region = REGIONS[mission.regionId];

  // Perspectives visible to me: either shared with group or assigned privately to me
  const myPlayer = state.players[myPlayerId];
  const myAssignedPerspectives = mission.perspectives.filter(
    (p) => state.perspectiveAssignments?.[p.id] === myPlayerId
  );

  const sharedPerspectives = mission.perspectives.filter((p) =>
    state.sharedPerspectiveIds.includes(p.id)
  );

  const handleShare = (perspId: string) => {
    socketService.send({
      type: 'SHARE_PERSPECTIVE',
      perspectiveId: perspId,
    });
  };

  const handleProceedToExplore = () => {
    // In server, can jump to explore or directly individual choice
    socketService.send({
      type: 'EXPLORE_MISSION'
    });
  };

  const steps = ['A história', 'O que sabemos', 'Outras perspectivas', 'Hora de decidir'];
  const next = () => { setShowHelp(false); setShowFullText(false); setStep(n => Math.min(n + 1, 3)); };
  return (
    <div className="flex flex-col gap-5 w-full max-w-3xl mx-auto text-slate-100">
      <header className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7">
        <p className="text-xs text-teal-300 font-bold uppercase">Missão {mission.code} · {region.name}</p>
        <h1 className="text-2xl sm:text-3xl font-black mt-2">{mission.title}</h1>
        <div className="flex gap-2 mt-5" aria-label={`Etapa ${step + 1} de 4`}>
          {steps.map((label, index) => <div key={label} className={`h-2 rounded-full flex-1 ${index <= step ? 'bg-teal-400' : 'bg-slate-700'}`} />)}
        </div>
        <div className="flex justify-between items-center mt-3 gap-3">
          <span className="text-sm font-semibold text-teal-200">{steps[step]} · {step + 1}/4</span>
          <button type="button" onClick={() => setShowHelp(v => !v)} aria-expanded={showHelp} aria-label="Explicar os símbolos" className="rounded-full border border-slate-600 p-2 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"><Info className="w-5 h-5" /></button>
        </div>
        {showHelp && <div className="mt-3 p-3 bg-slate-950 rounded-xl text-sm text-slate-200" role="note">📖 História: conheça a situação. ◈ Fatos: observe o que sabemos e o que ainda é incerto. 👥 Perspectivas: escute os envolvidos. 💡 Reflexão: pense antes de decidir. Toque no símbolo de informação sempre que quiser rever este guia.</div>}
      </header>
      <NarrationControl text={[mission.situation.context, mission.situation.trigger, ...mission.situation.knownFacts, ...mission.situation.uncertainties].join(" ")} />
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4" aria-live="polite">
        {step === 0 && <>
          <div className="flex items-center gap-3"><BookOpen className="w-7 h-7 text-teal-300" aria-hidden="true"/><span className="text-sm text-teal-300">A história</span></div>
          <p className="text-base leading-relaxed">{mission.situation.context}</p>
          <p className="text-base leading-relaxed border-l-4 border-amber-400 pl-4">{mission.situation.trigger}</p>
        </>}
        {step === 1 && <>
          <div className="flex items-center gap-3"><ShieldCheck className="w-7 h-7 text-teal-300" aria-hidden="true"/><span className="text-sm text-teal-300">O que sabemos</span></div>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">{mission.situation.knownFacts.map((fact, i) => <li key={i}>{fact}</li>)}</ul>
          <details className="rounded-xl bg-slate-950 p-3"><summary className="cursor-pointer text-amber-300 flex gap-2 items-center"><HelpCircle className="w-4 h-4"/> O que ainda não sabemos?</summary><ul className="list-disc pl-5 mt-3 space-y-2 text-sm">{mission.situation.uncertainties.map((item, i) => <li key={i}>{item}</li>)}</ul></details>
        </>}
        {step === 2 && <>
          <div className="flex items-center gap-3"><BookOpen className="w-7 h-7 text-teal-300" aria-hidden="true"/><span className="text-sm text-teal-300">Outras perspectivas</span></div>
          <p className="text-sm text-slate-300">{isSolo ? 'Conheça os diferentes pontos de vista desta situação.' : 'Conheça as perspectivas disponíveis e compartilhe a sua com o grupo.'}</p>
          <div className="space-y-3">{mission.perspectives.map(p => {
            const assigned = state.perspectiveAssignments?.[p.id] === myPlayerId;
            const shared = state.sharedPerspectiveIds.includes(p.id);
            if (!assigned && !shared) return <div key={p.id} className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">🔒 Perspectiva de {p.actorName} ainda não compartilhada</div>;
            return <div key={p.id} className="rounded-xl border border-slate-700 p-3"><PerspectiveCard perspective={p} isPrivateToMe={assigned} isSharedWithGroup={shared} onShareWithGroup={() => handleShare(p.id)}/></div>;
          })}</div>
        </>}
        {step === 3 && <>
          <div className="flex items-center gap-3"><HelpCircle className="w-7 h-7 text-violet-300" aria-hidden="true"/><span className="text-sm text-violet-300">Para refletir</span></div>
          <p className="text-base leading-relaxed">O que você considera importante antes de escolher?</p>
        </>}
        <button type="button" onClick={() => setShowFullText(v => !v)} aria-expanded={showFullText} className="text-sm text-teal-300 underline underline-offset-4">{showFullText ? 'Ocultar conteúdo completo' : 'Consultar conteúdo completo e nota institucional'}</button>
        {showFullText && <div className="space-y-3 rounded-xl bg-slate-950 p-4 text-sm leading-relaxed"><p>{mission.situation.context}</p><p>{mission.situation.trigger}</p><strong>Fatos conhecidos</strong><ul className="list-disc pl-5">{mission.situation.knownFacts.map((x,i)=><li key={i}>{x}</li>)}</ul><strong>Incertezas</strong><ul className="list-disc pl-5">{mission.situation.uncertainties.map((x,i)=><li key={i}>{x}</li>)}</ul><p><strong>Nota institucional:</strong> {mission.situation.institutionalNote}</p><p><strong>Objetivo pedagógico:</strong> {mission.pedagogicalGoal}</p></div>}
      </section>
      <nav className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 border border-slate-800 p-4" aria-label="Navegação do cenário">
        <button type="button" disabled={step === 0} onClick={() => {setStep(n=>Math.max(0,n-1));setShowFullText(false);}} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 disabled:opacity-40"><ArrowLeft className="w-4 h-4"/> Voltar</button>
        {step < 3 ? <button type="button" onClick={next} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 text-slate-950 font-bold">Continuar <ArrowRight className="w-4 h-4"/></button> : <button type="button" onClick={handleProceedToExplore} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 text-slate-950 font-bold">Ir para escolha individual <ArrowRight className="w-4 h-4"/></button>}
      </nav>
    </div>
  );
};
