import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            {children}
            <button
              onClick={onClose}
              className="mt-4 text-sm text-gray-500 hover:underline"
            >
              Annuler
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TradeForm() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [preview, setPreview] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [address, setAddress] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencies = ["BTC", "ETH", "USDT", "USD", "EUR", "XOF"];
  const [rates, setRates] = useState(null);

  useEffect(() => {
    if (rates === null) {
      fetch("/api/rates")
        .then((r) => r.json())
        .then(({ rates }) => setRates(rates));
      return;
    }

    if (!amount || isNaN(amount)) {
      setPreview(null);
      return;
    }

    const result =
      (parseFloat(amount) * rates[fromCurrency]) / rates[toCurrency];
    setPreview(result.toFixed(2));
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleConvert = () => {
    const cryptoList = ["BTC", "ETH", "USDT"];
    const isCryptoToFiat =
      cryptoList.includes(fromCurrency) && !cryptoList.includes(toCurrency);

    setModalType(isCryptoToFiat ? "crypto2fiat" : "fiat2crypto");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("amount", amount);
    data.append("from", fromCurrency);
    data.append("to", toCurrency);
    data.append("converted", preview);
    data.append("firstName", firstName);
    data.append("lastName", lastName);
    data.append("phone", phone);
    data.append("email", email);
    data.append("country", country);
    if (modalType === "crypto2fiat") {
      data.append("paymentMethod", paymentMethod);
      data.append("paymentDetails", paymentDetails);
    } else {
      data.append("address", address);
    }
    data.append("proof", proofFile);

    try {
      await fetch("/api/send-transaction-email", {
        method: "POST",
        body: data,
      });
    } catch (err) {
      console.error("Erreur envoi email :", err);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
    setIsConfirmOpen(true);
  };

  const handleFinish = () => {
    setIsConfirmOpen(false);
    router.push("/history");
  };

  return (
    <div className="container mx-auto p-8">
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-gray-700">De</label>
            <select
              className="w-full border rounded-lg p-3"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-gray-700">Montant</label>
            <input
              type="number"
              className="w-full border rounded-lg p-3"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-gray-700">Vers</label>
            <select
              className="w-full border rounded-lg p-3"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
        </div>

        {preview && (
          <p className="mt-4 text-center text-lg text-gray-600">
            Équivalent : <strong>{preview} {toCurrency}</strong>
          </p>
        )}

        <button
          onClick={handleConvert}
          className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
        >
          Convertir
        </button>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Finalisez votre transaction"
      >
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Prénom</label>
          <input
            type="text"
            required
            className="w-full border rounded-lg p-2 mb-3"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label className="block mb-2">Nom</label>
          <input
            type="text"
            required
            className="w-full border rounded-lg p-2 mb-3"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label className="block mb-2">Téléphone</label>
          <input
            type="tel"
            required
            className="w-full border rounded-lg p-2 mb-3"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="block mb-2">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded-lg p-2 mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block mb-2">Pays</label>
          <input
            type="text"
            required
            className="w-full border rounded-lg p-2 mb-4"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          {modalType === "crypto2fiat" ? (
            <>
              <label className="block mb-2">Moyen de paiement</label>
              <select
                className="w-full border rounded-lg p-2 mb-2"
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Sélectionnez...</option>
                <option value="bank">Virement bancaire</option>
                <option value="mobile">Mobile Money</option>
                <option value="card">Carte bancaire</option>
              </select>

              <label className="block mb-2">Numéro ou compte de paiement</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Ex: numéro mobile ou RIB"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className="block mb-2">Adresse crypto</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Votre adresse de réception"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          )}

          <label className="block mb-2">
            Preuve ({modalType === "crypto2fiat" ? "crypto envoyée" : "paiement fiat"})
          </label>
          <input
            type="file"
            accept="image/*"
            required
            className="block mb-4"
            onChange={(e) => setProofFile(e.target.files[0])}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-accent text-white font-semibold py-2 rounded-lg flex justify-center items-center ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <div className="loader border-t-2 border-white rounded-full w-5 h-5 animate-spin"></div>
            ) : (
              "Valider la transaction"
            )}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Transaction prise en compte"
      >
        <p className="mb-4">
          Votre demande a bien été prise en compte et sera traitée dans les plus brefs délais.
        </p>
        <button
          onClick={handleFinish}
          className="w-full bg-primary text-white font-bold py-2 rounded-lg"
        >
          Terminé
        </button>
      </Modal>

      <style jsx>{`
        .loader {
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
