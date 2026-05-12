import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Shield, LogOut, CheckCircle2 } from "lucide-react";
import QuizView from "./QuizView";
import LevelingOnboarding from "./LevelingOnboarding";

const levelConfig: Record<string, { label: string; color: string }> = {
  junior: { label: "Júnior", color: "bg-yellow-400" },
  pleno: { label: "Pleno", color: "bg-blue-500" },
  senior: { label: "Sênior", color: "bg-green-500" },
};

interface Profile {
  full_name: string;
  name: string;
  level: string;
  leveling_completed: boolean;
}

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "quiz" | "leveling_intro">("home");
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    const profileSnap = await getDoc(doc(db, "users", user.uid));
    if (profileSnap.exists()) {
      const prof = profileSnap.data() as Profile;
      setProfile(prof);
      if (!prof.leveling_completed) setActiveTab("leveling_intro");
    }
    const attemptsSnap = await getDocs(query(collection(db, "quiz_attempts"), where("user_id", "==", user.uid)));
    setQuizAttempts(attemptsSnap.size);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (activeTab === "leveling_intro") return <LevelingOnboarding onStart={() => setActiveTab("quiz")} />;
  if (activeTab === "quiz") return <QuizView onBack={async () => { setActiveTab("home"); await loadData(); }} />;

  const level = (profile?.level ?? "junior") as string;
  const config = levelConfig[level] ?? levelConfig.junior;
  const quizCompleted = profile?.leveling_completed ?? false;
  const displayName = profile?.name || profile?.full_name || user?.displayName || "Usuário";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1F3864] px-4 pt-6 pb-16">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5C518] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#1F3864]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Oraculum BB</h1>
              <p className="text-xs text-white/70">Cibersegurança</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-10 pb-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#F5C518] flex items-center justify-center text-2xl font-bold text-[#1F3864]">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">{displayName}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progresso</span>
              <span>{quizCompleted ? "100%" : "0%"}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#F5C518] rounded-full transition-all duration-500"
                style={{ width: quizCompleted ? "100%" : "0%" }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
          {quizCompleted ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Quiz finalizado</p>
                <p className="text-xs text-gray-500">Você concluiu o quiz de nivelamento.</p>
              </div>
            </>
          ) : (
            <>
              <Shield className="w-6 h-6 text-[#1F3864] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Quiz pendente</p>
                <p className="text-xs text-gray-500">Complete o quiz para descobrir seu nível.</p>
              </div>
              <button onClick={() => setActiveTab("leveling_intro")}
                className="ml-auto bg-[#F5C518] text-[#1F3864] text-xs font-bold px-3 py-1.5 rounded-lg">
                Iniciar
              </button>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm text-center text-sm text-gray-500">
          {quizAttempts} quiz(zes) realizado(s)
        </div>
      </div>
    </div>
  );
}
