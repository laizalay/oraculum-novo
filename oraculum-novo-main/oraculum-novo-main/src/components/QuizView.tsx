import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, query, limit } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, XCircle, ChevronRight, AlertTriangle, Trophy } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: Array<{ text: string; is_correct: boolean }>;
  explanation: string | null;
  category_id: string;
  difficulty: string;
}

interface QuizViewProps {
  onBack: () => void;
}

const LEVEL_LABELS: Record<string, string> = {
  junior: "Júnior", pleno: "Pleno", senior: "Sênior",
};

const DIFFICULTY_ORDER = ["junior", "pleno", "senior"];

function getDemoQuestions(): Question[] {
  return [
    {
      id: "demo-1", category_id: "phishing", difficulty: "junior",
      question_text: "O que é phishing?",
      options: [
        { text: "Um tipo de vírus que se replica automaticamente", is_correct: false },
        { text: "Uma técnica de engenharia social para obter dados sensíveis", is_correct: true },
        { text: "Um firewall de proteção de rede", is_correct: false },
        { text: "Um protocolo de criptografia", is_correct: false },
      ],
      explanation: "Phishing é uma técnica de engenharia social onde atacantes tentam enganar usuários para obter informações confidenciais.",
    },
    {
      id: "demo-2", category_id: "senhas", difficulty: "junior",
      question_text: "Qual é a melhor prática para criar senhas seguras?",
      options: [
        { text: "Usar o nome do pet", is_correct: false },
        { text: "Usar a mesma senha para tudo", is_correct: false },
        { text: "Combinar letras maiúsculas, minúsculas, números e símbolos", is_correct: true },
        { text: "Usar datas de aniversário", is_correct: false },
      ],
      explanation: "Senhas fortes devem ter pelo menos 12 caracteres combinando diferentes tipos.",
    },
    {
      id: "demo-3", category_id: "autenticacao", difficulty: "pleno",
      question_text: "O que é autenticação multifator (MFA)?",
      options: [
        { text: "Usar múltiplas senhas", is_correct: false },
        { text: "Verificar identidade usando dois ou mais fatores diferentes", is_correct: true },
        { text: "Ter vários antivírus instalados", is_correct: false },
        { text: "Acessar de múltiplos dispositivos", is_correct: false },
      ],
      explanation: "MFA combina algo que você sabe, algo que você tem e/ou algo que você é.",
    },
  ];
}

export default function QuizView({ onBack }: QuizViewProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongByCategory, setWrongByCategory] = useState<Record<string, number>>({});
  const [scoresByLevel, setScoresByLevel] = useState<Record<string, { correct: number; total: number }>>({});
  const [finished, setFinished] = useState(false);
  const [determinedLevel, setDeterminedLevel] = useState("junior");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const qSnap = await getDocs(query(collection(db, "questions"), limit(10)));
        const qs: Question[] = [];
        qSnap.forEach(d => qs.push({ id: d.id, ...d.data() } as Question));
        setQuestions(qs.length > 0 ? qs : getDemoQuestions());
      } catch {
        setQuestions(getDemoQuestions());
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    const q = questions[currentIndex];
    const isCorrect = q.options[optionIndex]?.is_correct ?? false;
    if (isCorrect) setScore(s => s + 1);
    else setWrongByCategory(prev => ({ ...prev, [q.category_id]: (prev[q.category_id] ?? 0) + 1 }));
    setScoresByLevel(prev => {
      const s = prev[q.difficulty] || { correct: 0, total: 0 };
      return { ...prev, [q.difficulty]: { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 } };
    });
  };

  const determineLevel = (sc: Record<string, { correct: number; total: number }>) => {
    for (let i = DIFFICULTY_ORDER.length - 1; i >= 0; i--) {
      const diff = DIFFICULTY_ORDER[i];
      const s = sc[diff];
      if (s && s.total > 0 && s.correct / s.total >= 0.6) return diff;
    }
    return "junior";
  };

  const nextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      const level = determineLevel(scoresByLevel);
      setDeterminedLevel(level);
      setFinished(true);
      if (user) {
        await addDoc(collection(db, "quiz_attempts"), {
          user_id: user.uid,
          quiz_type: "leveling",
          score,
          total_questions: questions.length,
          completed_at: new Date().toISOString(),
        });
        await updateDoc(doc(db, "users", user.uid), {
          xp: score * 10,
          level,
          leveling_completed: true,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando quiz...</p>
      </div>
    );
  }

  if (finished) {
    const wrongList = Object.entries(wrongByCategory)
      .map(([cat, count]) => ({ name: cat, count }))
      .sort((a, b) => b.count - a.count);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#F5C518] flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-[#1F3864]" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Quiz Finalizado!</h2>
            <div className="bg-gray-50 rounded-xl p-4 my-4">
              <p className="text-sm text-gray-500 mb-1">Seu nível:</p>
              <p className="text-2xl font-bold text-[#1F3864]">{LEVEL_LABELS[determinedLevel]}</p>
            </div>
          </div>
          {wrongList.length > 0 ? (
            <div className="mt-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="font-semibold text-gray-800 text-sm">Temas para revisar</h3>
              </div>
              <div className="space-y-2">
                {wrongList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-800">{item.name}</span>
                    <span className="text-xs font-medium text-red-500">{item.count} {item.count === 1 ? "erro" : "erros"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-green-600 font-medium">🎉 Perfeito! Você não errou nenhuma questão.</p>
            </div>
          )}
          <button onClick={onBack}
            className="w-full bg-[#F5C518] text-[#1F3864] font-bold py-3 rounded-lg hover:bg-yellow-400 transition">
            Início
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progressPct = Math.round(((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1F3864] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-white">Quiz</h1>
          <p className="text-xs text-white/70">Progresso: {progressPct}%</p>
          <div className="w-full h-1.5 bg-white/20 rounded-full mt-2">
            <div className="h-full bg-[#F5C518] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500 mb-3 inline-block">
            {(LEVEL_LABELS[q.difficulty] ?? q.difficulty).toUpperCase()}
          </span>
          <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">{q.question_text}</h2>
        </div>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let cls = "border-gray-200 bg-white";
            if (showResult && selectedOption === i) cls = opt.is_correct ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
            else if (showResult && opt.is_correct) cls = "border-green-500 bg-green-50";
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={showResult}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${cls} ${!showResult ? "hover:border-[#1F3864]" : ""}`}>
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500 flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-sm text-gray-800">{opt.text}</span>
                {showResult && opt.is_correct && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                {showResult && selectedOption === i && !opt.is_correct && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {showResult && q.explanation && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500"><strong>Explicação:</strong> {q.explanation}</p>
          </div>
        )}

        {showResult && (
          <button onClick={nextQuestion}
            className="w-full mt-6 h-12 bg-[#F5C518] text-[#1F3864] font-bold rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
            {currentIndex < questions.length - 1
              ? <><span>Próxima</span><ChevronRight className="w-4 h-4" /></>
              : "Ver Resultado"}
          </button>
        )}
      </div>
    </div>
  );
}