import { Target, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

interface LevelingOnboardingProps {
  onStart: () => void;
  userName?: string;
}

export default function LevelingOnboarding({ onStart, userName }: LevelingOnboardingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F5C518] flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-[#1F3864]" />
        </div>

        {userName && (
          <p className="text-center text-sm text-[#1F3864] font-semibold mb-1">
            Olá, {userName}! 👋
          </p>
        )}

        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
          Bem-vindo ao Quiz de Nivelamento!
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Antes de começar, vamos descobrir o seu nível atual em cibersegurança.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#1F3864]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Avalia seu conhecimento</p>
              <p className="text-xs text-gray-500">Perguntas de diferentes níveis: Júnior, Pleno e Sênior.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Identifica pontos de melhoria</p>
              <p className="text-xs text-gray-500">Veja quais temas você precisa reforçar.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Define seu nível</p>
              <p className="text-xs text-gray-500">Receba uma classificação personalizada ao final.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-6">
          <p className="text-xs text-gray-500 text-center">
            ⏱️ Dura em média 5 minutos. Responda com calma — não há tempo limite.
          </p>
        </div>

        <button onClick={onStart}
          className="w-full h-12 bg-[#F5C518] text-[#1F3864] font-bold rounded-lg hover:bg-yellow-400 transition">
          Começar Quiz
        </button>
      </div>
    </div>
  );
}
