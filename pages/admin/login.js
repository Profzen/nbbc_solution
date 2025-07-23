// pages/admin/login.js

import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async e => {
    e.preventDefault();
    // ---- on inclut credentials pour accepter les Set-Cookie ----
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",           // ← essentiel pour stocker le cookie
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Identifiants invalides");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Connexion Admin</h2>
        {error && <div className="text-red-600 mb-3 text-center">{error}</div>}
        <label className="block mb-1">Utilisateur</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4"
          value={user}
          onChange={e => setUser(e.target.value)}
          required
        />
        <label className="block mb-1">Mot de passe</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-6"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-orange-600 "
          
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
