import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Shield, Users, LogOut, BarChart3, Download, TrendingDown, Search, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface EmployeeData {
  user_id: string;
  name: string;
  full_name: string;
  level: string;
  department: string | null;
  leveling_completed: boolean;
  role: string;
}

interface AttemptData {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];
const levelLabels: Record<string, string> = { junior: "Júnior", pleno: "Pleno", senior: "Sênior" };

export default function ManagerDashboard() {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "employees">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [usersSnap, attemptsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "quiz_attempts")),
      ]);
      const allUsers: EmployeeData[] = [];
      usersSnap.forEach(d => allUsers.push({ user_id: d.id, ...d.data() } as EmployeeData));
      setEmployees(allUsers.filter(u => u.role !== "manager"));
      const allAttempts: AttemptData[] = [];
      attemptsSnap.forEach(d => allAttempts.push({ id: d.id, ...d.data() } as AttemptData));
      setAttempts(allAttempts);
      setLoading(false);
    };
    loadData();
  }, []);

  const levelDistribution = ["junior", "pleno", "senior"].map(level => ({
    name: levelLabels[level],
    value: employees.filter(e => e.level === level).length,
  }));

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / attempts.length)
    : 0;

  const filteredEmployees = employees.filter(e =>
    (e.name ?? e.full_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = "Nome,Nível\n";
    const rows = employees.map(e => `"${e.name ?? e.full_name}","${levelLabels[e.level] ?? e.level}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_oraculum.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1F3864] px-4 pt-6 pb-16">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5C518] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#1F3864]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Oraculum BB</h1>
              <p className="text-xs text-white/70">Painel do Gestor</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 -mt-10 pb-8 space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">Carregando dados...</div>
        ) : (
          <>
            <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-lg">
              {[{ id: "overview", label: "Visão Geral", icon: <BarChart3 className="w-4 h-4" /> },
                { id: "employees", label: "Funcionários", icon: <Users className="w-4 h-4" /> }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as "overview" | "employees")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? "bg-[#1F3864] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}>
                  {tab.icon}<span>{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Users className="w-5 h-5 text-[#1F3864]" />, value: employees.length, label: "Funcionários" },
                    { icon: <BarChart3 className="w-5 h-5 text-yellow-500" />, value: attempts.length, label: "Quizzes" },
                    { icon: <TrendingDown className="w-5 h-5 text-green-500" />, value: `${avgScore}%`, label: "Acerto Médio" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="mb-2">{stat.icon}</div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Distribuição por Nível</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={levelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {levelDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <button onClick={exportCSV}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#1F3864] text-[#1F3864] font-semibold rounded-xl hover:bg-[#1F3864] hover:text-white transition">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </>
            )}

            {activeTab === "employees" && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Buscar funcionário..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/50" />
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">{filteredEmployees.length} Funcionários</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">Nenhum funcionário encontrado</div>
                    ) : filteredEmployees.map(emp => {
                      const empAttempts = attempts.filter(a => a.user_id === emp.user_id);
                      const empAvg = empAttempts.length > 0
                        ? Math.round(empAttempts.reduce((s, a) => s + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / empAttempts.length)
                        : 0;
                      const isExpanded = expandedEmployee === emp.user_id;
                      const displayName = emp.name ?? emp.full_name ?? "Sem nome";
                      return (
                        <div key={emp.user_id}>
                          <button onClick={() => setExpandedEmployee(isExpanded ? null : emp.user_id)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
                            <div className="w-10 h-10 rounded-full bg-[#F5C518] flex items-center justify-center text-sm font-bold text-[#1F3864] flex-shrink-0">
                              {(displayName[0] ?? "?").toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">{displayName}</p>
                              <p className="text-xs text-gray-500">{empAvg}% acerto</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white bg-blue-500">
                              {levelLabels[emp.level] ?? emp.level ?? "Júnior"}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 bg-gray-50">
                              <p className="text-xs text-gray-500 pt-2">
                                {empAttempts.length === 0 ? "Funcionário ainda não realizou o quiz." : `${empAttempts.length} quiz(zes) realizado(s). Acerto médio: ${empAvg}%`}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
      }
