import React from 'react';
import { X, BookOpen, Users, Compass, Award, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { CHARACTER_LIST } from '../../data/characters';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Manual do Guardião
              </span>
              <h2 id="rules-title" className="text-xl font-black text-slate-100">
                Regras e Dinâmica de “Entre Nós”
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1: Objective */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-teal-300 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              1. O Cenário: Vila dos Encontros
            </h3>
            <p>
              A Vila dos Encontros representa uma instituição pública fictícia onde servidores e cidadãos convivem diariamente. A proposta é cooperativa: o grupo vence junto ao desvendar quatro missões éticas, explorando perspectivas plurais e deliberando sobre decisões que impactam a sociedade. Partidas duram de 15 a 25 minutos.
            </p>
          </div>

          {/* Section 2: Flow of each mission */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-teal-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              2. As 10 Etapas de Cada Missão
            </h3>
            <ol className="space-y-1.5 list-decimal list-inside bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300">
              <li><strong>Cenário & Fatos:</strong> Apresentação do dilema, fatos conhecidos e incertezas.</li>
              <li><strong>Perspectivas Privadas:</strong> Distribuição de visões dos atores entre os guardiões, que decidem compartilhá-las.</li>
              <li><strong>Exploração & Poderes:</strong> Uso facultativo de poderes únicos dos personagens para desvendar novos dados.</li>
              <li><strong>Escolha Individual em Sigilo:</strong> Cada participante define sua ação em privado.</li>
              <li><strong>Revelação Simultânea:</strong> As escolhas de todos aparecem juntas na tela.</li>
              <li><strong>Conversa da Equipe:</strong> Discussão oral ou em chamada a partir de roteiro reflexivo guiado.</li>
              <li><strong>Votação Coletiva:</strong> O grupo vota na ação da instituição, podendo reconsiderar.</li>
              <li><strong>Tratamento de Empates:</strong> Rodada extra; se persistir, ambos os caminhos são analisados sem favorecer ninguém.</li>
              <li><strong>Consequência & Descoberta:</strong> Desdobramentos narrativos, retorno pedagógico e conquista de pilar ético.</li>
              <li><strong>Retorno ao Mapa:</strong> O grupo escolhe o próximo território até cumprir 4 missões.</li>
            </ol>
          </div>

          {/* Section 3: Characters and Powers */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-teal-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              3. Personagens e Poderes Únicos (Uso Único por Partida)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHARACTER_LIST.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-slate-100">{c.name}, {c.title}:</strong>
                  <div className="text-amber-400 font-semibold text-xs mt-0.5">Poder “{c.powerName}”</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{c.powerDescription}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * O servidor valida o consumo único de cada poder. Poderes ampliam informações e reflexões; não garantem superioridade moral e todas as missões continuam resolvíveis sem eles.
            </p>
          </div>

          {/* Section 4: Pedagogical Principles */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-teal-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              4. Diretrizes Éticas Essenciais
            </h3>
            <ul className="space-y-1 list-disc list-inside bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 text-xs">
              <li><strong>Sem ranking de virtude:</strong> O jogo avalia a construção de consenso e a exploração de perspectivas, não pontua moral individual.</li>
              <li><strong>Diferenciação clara:</strong> Em <em>questões fundamentadas</em>, há conduta recomendada clara; em <em>questões reflexivas</em>, diferentes caminhos têm méritos e desafios legítimos.</li>
              <li><strong>Competências institucionais:</strong> A Comissão de Ética não substitui a Corregedoria, Ouvidoria ou RH. Cada canal tem limites e fluxos próprios.</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition-colors"
          >
            Entendido, Vamos Jogar!
          </button>
        </div>
      </div>
    </div>
  );
};
