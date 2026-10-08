import React, { useState, useEffect } from 'react';
import { Shield, Key, Download, Trash2, RefreshCw, BarChart2, Star, Users, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface MetricsResponse {
  totalRooms: number;
  totalPlayers: number;
  totalCompletedMissions: number;
  evaluation: {
    preEvaluationsCount: number;
    postEvaluationsCount: number;
    avgPreScore: string;
    avgPostScore: string;
  };
  feedback: {
    totalFeedback: number;
    avgUsability: string;
    avgClarity: string;
    avgInterest: string;
    recentComments: { comment: string; timestamp: number }[];
  };
  rooms: {
    roomCode: string;
    createdAt: number;
    phase: string;
    playerCount: number;
    completedMissions: number;
    discoveriesCount: number;
  }[];
}

interface OrganizerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ isOpen, onClose }) => {
  const [passkey, setPasskey] = useState(
    localStorage.getItem('guardioes_admin_key') || 'guardioes2026'
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const fetchMetrics = async (keyToUse = passkey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: {
          Authorization: `Bearer ${keyToUse}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Chave de acesso incorreta. Verifique a credencial.');
        }
        throw new Error('Erro ao carregar métricas do servidor.');
      }

      const data: MetricsResponse = await res.json();
      setMetrics(data);
      setIsAuthenticated(true);
      localStorage.setItem('guardioes_admin_key', keyToUse);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMetrics(passkey);
  };

  const handleDeleteRoom = async (roomCode: string) => {
    if (!window.confirm(`Tem certeza que deseja apagar a sala ${roomCode}?`)) return;
    try {
      const res = await fetch(`/api/admin/rooms/${roomCode}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${passkey}`,
        },
      });
      if (res.ok) {
        fetchMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/admin/export-csv', {
        headers: {
          Authorization: `Bearer ${passkey}`,
        },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guardioes_relatorio_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Export CSV error:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Acesso Restrito
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                Painel do Organizador e Pesquisa Pedagógica
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Auth prompt if not authenticated */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="max-w-md mx-auto my-8 space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Insira a chave mestra de autorização para visualizar indicadores agregados e gerenciar salas.
              (Padrão demonstrativo: <code className="text-amber-400 font-mono">guardioes2026</code>)
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-300">Chave do Organizador:</label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                placeholder="Ex: guardioes2026"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Validando...' : 'Acessar Painel do Organizador'}
            </button>
          </form>
        ) : (
          /* Metrics Dashboard */
          <div className="space-y-6">
            {/* Top Bar with export and refresh */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400">
                Política de retenção: salas inativas são limpas automaticamente após 24 horas.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchMetrics()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Dados em CSV</span>
                </button>
              </div>
            </div>

            {/* High-level KPI Cards */}
            {metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-indigo-400">
                    {metrics.totalRooms}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Salas Criadas</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-teal-400">
                    {metrics.totalPlayers}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Guardiões Totais</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">
                    {metrics.totalCompletedMissions}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Missões Concluídas</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-rose-400">
                    {metrics.feedback.totalFeedback}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Avaliações Recebidas</div>
                </div>
              </div>
            )}

            {/* Evaluation and Feedback Summary */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pre / Post Diagnostics */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-teal-400" />
                    Desempenho Formativo (Questões Fundamentadas)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Média Pré-Teste</div>
                      <div className="text-xl font-black text-teal-300 mt-0.5">
                        {metrics.evaluation.avgPreScore} / 2
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {metrics.evaluation.preEvaluationsCount} respostas
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Média Pós-Teste</div>
                      <div className="text-xl font-black text-emerald-300 mt-0.5">
                        {metrics.evaluation.avgPostScore} / 2
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {metrics.evaluation.postEvaluationsCount} respostas
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    * Indicador pedagógico para aprimoramento curricular. Não mede caráter individual de participantes.
                  </p>
                </div>

                {/* UX and Content Satisfaction */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Satisfação dos Participantes (Notas 1 a 5)
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Facilidade de Uso:</span>
                      <strong className="text-amber-400">{metrics.feedback.avgUsability} / 5.0</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Clareza das Orientações:</span>
                      <strong className="text-amber-400">{metrics.feedback.avgClarity} / 5.0</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Interesse em Continuar:</span>
                      <strong className="text-amber-400">{metrics.feedback.avgInterest} / 5.0</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Rooms Table */}
            {metrics && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Salas Ativas no Servidor
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Código</th>
                        <th className="p-3">Fase</th>
                        <th className="p-3">Jogadores</th>
                        <th className="p-3">Missões</th>
                        <th className="p-3">Criada em</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {metrics.rooms.map((r) => (
                        <tr key={r.roomCode} className="hover:bg-slate-900/50">
                          <td className="p-3 font-mono font-bold text-teal-300">{r.roomCode}</td>
                          <td className="p-3">{r.phase}</td>
                          <td className="p-3">{r.playerCount}</td>
                          <td className="p-3">{r.completedMissions}/4</td>
                          <td className="p-3 text-slate-400">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteRoom(r.roomCode)}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40"
                              title="Apagar sala"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {metrics.rooms.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                            Nenhuma sala ativa no momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Anonymized Comments */}
            {metrics && metrics.feedback.recentComments.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-slate-100">
                  Comentários Qualitativos Anônimos
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {metrics.feedback.recentComments.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic">
                      “{c.comment}”
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
