import { useState, useEffect } from "react";
import { connectToDatabase } from "../lib/mongodb";
import Transaction from "../models/Transaction";
import Link from "next/link";

export async function getServerSideProps() {
  await connectToDatabase();
  const transactions = await Transaction.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const data = transactions.map(tx => ({
    ...tx,
    _id: tx._id.toString(),
    createdAt: tx.createdAt.toISOString().split("T")[0],
    status: tx.status || "en attente",
  }));

  return { props: { transactions: data } };
}

export default function History({ transactions }) {
  const [searchId, setSearchId] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  useEffect(() => {
    if (searchId.trim() === "") {
      setFilteredTransactions(transactions);
    } else {
      const lower = searchId.toLowerCase();
      setFilteredTransactions(
        transactions.filter(tx => tx._id.toLowerCase().includes(lower))
      );
    }
  }, [searchId, transactions]);

  return (
    <div className="min-h-screen bg-secondary p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Historique des transactions
      </h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par ID de transaction"
          className="w-full md:w-1/2 border p-3 rounded-lg"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
      </div>

      <table className="w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3">Date</th>
            {/*<th className="p-3">Client</th>*/}
            <th className="p-3">De → Vers</th>
            <th className="p-3">Montant</th>
            <th className="p-3">Équivalent</th>
            <th className="p-3">État</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                Aucune transaction trouvée.
              </td>
            </tr>
          ) : (
            filteredTransactions.map(tx => (
              <tr key={tx._id} className="border-t">
                <td className="p-3">{tx.createdAt}</td>
                {/*<td className="p-3">
                  {tx.firstName} {tx.lastName}
                  <br />
                  {tx.email}
                </td>*/}
                <td className="p-3">{tx.from} → {tx.to}</td>
                <td className="p-3">{tx.amount}</td>
                <td className="p-3">{tx.converted}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold 
                    ${tx.status === "validé" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-6 text-center">
        <Link href="/" className="text-accent hover:underline">← Retour à l’accueil</Link>
      </div>
    </div>
  );
}
