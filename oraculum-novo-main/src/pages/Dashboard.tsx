import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import EmployeeDashboard from "../components/EmployeeDashboard";
import ManagerDashboard from "../components/ManagerDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      setRole(snap.exists() ? snap.data().role ?? "aluno" : "aluno");
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1F3864]">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  if (role === "manager") return <ManagerDashboard />;
  return <EmployeeDashboard />;
}