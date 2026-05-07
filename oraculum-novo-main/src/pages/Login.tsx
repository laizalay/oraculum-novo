import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1F3864] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#F5C518] rounded-full p-4 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1F3864]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">Oraculum BB</h1>
          <p className="text-white/70 text-sm">Avaliação de Cibersegurança</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-[#1F3864] font-semibold text-lg mb-4">Entrar</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
              <input type="email" placeholder="seu.email@bb.com.br" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Senha</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Sua senha"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864] pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <Link to="/forgot-password" className="text-xs text-[#1F3864] hover:underline mt-1 block">
                Esqueci minha senha
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#F5C518] text-[#1F3864] font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Não tem conta?{" "}
            <Link to="/register" className="text-[#1F3864] font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
        <p className="text-center text-white/50 text-xs mt-6">Patrocinado pelo Banco do Brasil</p>
      </div>
    </div>
  );
}