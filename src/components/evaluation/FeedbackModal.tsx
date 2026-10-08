import React, { useState } from 'react';
import { socketService } from '../../services/socket';
import { Star, MessageSquare, CheckCircle2, ShieldAlert, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [usability, setUsability] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [interest, setInterest] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socketService.send({
      type: 'SUBMIT_FEEDBACK',
      usability,
      clarity,
      interest,
      comment: comment.trim() || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const renderStarRating = (value: number, onChange: (val: number) => void, label: string) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-slate-200">{label}</label>
        <span className="text-xs font-bold text-amber-400">{value}/5</span>
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-2 rounded-xl border transition-all ${
              star <= value
                ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            title={`${star} estrelas`}
          >
            <Star className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-slate-100">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Avaliação de Experiência
              </span>
              <h2 className="text-xl font-black text-slate-100 mt-0.5">
                O que você achou do jogo?
              </h2>
              <p className="text-xs text-slate-400">
                Sua avaliação anônima apoia o aprimoramento pedagógico da ferramenta.
              </p>
            </div>

            {/* 3 ratings 1 to 5 */}
            <div className="space-y-4">
              {renderStarRating(
                usability,
                setUsability,
                '1. Facilidade de uso da plataforma e navegação'
              )}

              {renderStarRating(
                clarity,
                setClarity,
                '2. Clareza das orientações éticas e dos dilemas'
              )}

              {renderStarRating(
                interest,
                setInterest,
                '3. Interesse em continuar utilizando em capacitações'
              )}
            </div>

            {/* Optional Comment */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                Comentário ou Sugestão Opcional:
              </label>

              {/* Explicit warning required by prompt */}
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso:</strong> Para sua segurança e privacidade,{' '}
                  <u>não insira nomes de pessoas reais nem casos institucionais identificáveis</u>.
                </span>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Compartilhe suas impressões de forma anônima e geral..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Pular
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Avaliação</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Avaliação enviada com sucesso!</h3>
            <p className="text-xs text-slate-400">Obrigado por ajudar a aprimorar a Vila dos Encontros.</p>
          </div>
        )}
      </div>
    </div>
  );
};
