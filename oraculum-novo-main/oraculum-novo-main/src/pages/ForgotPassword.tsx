import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Se o e-mail estiver cadastrado, você receberá um link de redefinição em breve.");
    } catch {
      setError("Não foi possível enviar o e-mail. Verifique o endereço informado.");
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
          <p className="text-white/70 text-sm">Recuperar senha</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-[#1F3864] font-semibold text-lg mb-1">Recuperar Senha</h2>
          <p className="text-gray-500 text-sm mb-4">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">{message}</div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
              <input type="email" placeholder="seu.email@bb.com.br" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#F5C518] text-[#1F3864] font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50">
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-[#1F3864] font-semibold hover:underline">Voltar ao login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}