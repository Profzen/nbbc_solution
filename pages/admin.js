// pages/admin.js
import { parse } from "cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";

// Modal de détails
function DetailModal({ isOpen, onClose, tx }) {
  if (!isOpen || !tx) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Détails de la transaction</h3>
        <ul className="space-y-2 text-sm">
          <li><strong>ID :</strong> {tx._id}</li>
          <li><strong>Date :</strong> {format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm:ss")}</li>
          <li><strong>Client :</strong> {tx.firstName} {tx.lastName}</li>
          <li><strong>Email :</strong> {tx.email}</li>
          <li><strong>Téléphone :</strong> {tx.phone}</li>
          <li><strong>Pays :</strong> {tx.country}</li>
          <li><strong>De → Vers :</strong> {tx.from} → {tx.to}</li>
          <li><strong>Montant :</strong> {tx.amount}</li>
          <li><strong>Équivalent :</strong> {tx.converted}</li>
          <li><strong>Statut :</strong> {tx.status}</li>
          {tx.paymentDetails && <li><strong>Détails paiement :</strong> {tx.paymentDetails}</li>}
          {tx.address        && <li><strong>Adresse crypto :</strong> {tx.address}</li>}
          {tx.proofFilename && (
  <li className="mt-3">
    <strong>Preuve : |{" "}
    <a
      href={`/uploads/${encodeURIComponent(tx.proofFilename)}`}
      download
      className="text-green-600 underline text-sm"
    >
      Télécharger
    </a></strong><br />

  </li>
)}

        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// Protection SSR de la page Admin
export async function getServerSideProps({ req }) {
  const cookies = parse(req.headers.cookie || "");
  if (!cookies.auth) {
    return {
      redirect: { destination: "/admin/login", permanent: false },
    };
  }
  let auth;
  try {
    auth = JSON.parse(cookies.auth);
  } catch {
    auth = null;
  }
  if (!auth || auth.user !== process.env.ADMIN_USER) {
    return {
      redirect: { destination: "/admin/login", permanent: false },
    };
  }
  return { props: {} };
}

export default function AdminPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchId, setSearchId] = useState("");
  const [detailTx, setDetailTx] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [rates, setRates] = useState({});
  const [editingRates, setEditingRates] = useState({});

  useEffect(() => {
    fetch("/api/admin/transactions", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setFiltered(data);
      });

    fetch("/api/admin/rates", { credentials: "include" })
      .then(r => r.json())
      .then(({ rates }) => {
        setRates(rates);
        setEditingRates(rates);
      });
  }, []);

  useEffect(() => {
    let data = [...transactions];
    if (searchId.trim()) {
      data = data.filter(tx => tx._id === searchId.trim());
    } else {
      if (statusFilter !== "all") {
        data = data.filter(tx => tx.status === statusFilter);
      }
      if (dateFrom) {
        data = data.filter(tx => new Date(tx.createdAt) >= new Date(dateFrom));
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        data = data.filter(tx => new Date(tx.createdAt) <= toDate);
      }
    }
    setFiltered(data);
  }, [transactions, statusFilter, dateFrom, dateTo, searchId]);

  const updateStatus = async (id, newStatus) => {
    const res = await fetch("/api/admin/update-status", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      setTransactions(txns =>
        txns.map(tx => tx._id === id ? { ...tx, status: newStatus } : tx)
      );
    }
  };

  const exportFiltered = (format) => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    window.location.href = `/api/admin/export?format=${format}&${params.toString()}`;
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { credentials: "include" });
    router.push("/admin/login");
  };

  const saveRates = async () => {
    await fetch("/api/admin/rates", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rates: editingRates }),
    });
    setRates(editingRates);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Tableau de bord Admin</h1>
        <button
          onClick={handleLogout}
          className="ml-auto bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded"
        >
          Déconnexion
        </button>
      </div>

      {/* GESTION DES TAUX */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-3">⚙️ Taux d’échange</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(editingRates).map(([cur, val]) => (
            <div key={cur}>
              <label className="block mb-1 text-sm">{cur}</label>
              <input
                type="number"
                step="any"
                className="w-full border rounded px-2 py-1"
                value={val}
                onChange={(e) =>
                  setEditingRates({
                    ...editingRates,
                    [cur]: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveRates}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Enregistrer les taux
        </button>
      </div>

      {/* Filtres + Recherche + Export */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div>
            <label className="block mb-1 text-sm">Recherche par ID</label>
            <input
              type="text"
              placeholder="Entrez l'ID"
              className="border rounded px-3 py-2"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Filtre statut</label>
            <select
              className="border rounded px-3 py-2"
              disabled={!!searchId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous</option>
              <option value="en attente">En attente</option>
              <option value="validé">Validé</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Du</label>
            <input
              type="date"
              disabled={!!searchId}
              className="border rounded px-3 py-2"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Au</label>
            <input
              type="date"
              disabled={!!searchId}
              className="border rounded px-3 py-2"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => exportFiltered("csv")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportFiltered("pdf")}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Client</th>
              <th className="p-3">Montant</th>
              <th className="p-3">Équivalent</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx._id} className="border-t">
                <td className="p-3">{format(new Date(tx.createdAt), "yyyy-MM-dd")}</td>
                <td className="p-3">
                  <strong>{tx.firstName} {tx.lastName}</strong><br />
                  <small>{tx.email}</small>
                </td>
                <td className="p-3">{tx.amount} {tx.from}</td>
                <td className="p-3">{tx.converted} {tx.to}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    tx.status === "validé"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={tx.status}
                    onChange={(e) => updateStatus(tx._id, e.target.value)}
                  >
                    <option value="en attente">En attente</option>
                    <option value="validé">Validé</option>
                  </select>
                  <button
                    onClick={() => { setDetailTx(tx); setIsDetailOpen(true); }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-6">
                  Aucun résultat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Détails */}
      <DetailModal
        isOpen={isDetailOpen}
        tx={detailTx}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
