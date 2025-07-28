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
            className="bg-white rounded-xl p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto break-words"
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

  const [rates, setRates] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [receiveMethod, setReceiveMethod] = useState("");
  const [receiveDetails, setReceiveDetails] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencies = ["BTC", "ETH", "USDT", "USD", "EUR", "XOF"];

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        setRates(data.rates);
        console.log("Rates:", data.rates);
      } catch (err) {
        console.error("Erreur lors du chargement des taux:", err);
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    if (!rates || !amount || isNaN(amount)) {
      setPreview(null);
      return;
    }

    const raw = (parseFloat(amount) * rates[fromCurrency]) / rates[toCurrency];
    const cryptoList = ["BTC", "ETH", "USDT"];
    const isFiatToCrypto =
      cryptoList.includes(toCurrency) && !cryptoList.includes(fromCurrency);
    const adjusted = isFiatToCrypto ? raw / 1.05 : raw;
    setPreview(adjusted.toFixed(2));
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleConvert = () => {
    const cryptoList = ["BTC", "ETH", "USDT"];
    const isCryptoToFiat =
      cryptoList.includes(fromCurrency) && !cryptoList.includes(toCurrency);
    const isFiatToCrypto =
      cryptoList.includes(toCurrency) && !cryptoList.includes(fromCurrency);
    const type = isCryptoToFiat
      ? "crypto2fiat"
      : isFiatToCrypto
      ? "fiat2crypto"
      : "fiat2fiat";
    setModalType(type);
    setPaymentMethod("");
    setPaymentDetails("");
    setReceiveMethod("");
    setReceiveDetails("");
    setProofFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append("amount", amount);
    form.append("from", fromCurrency);
    form.append("to", toCurrency);
    form.append("converted", preview);
    form.append("firstName", firstName);
    form.append("lastName", lastName);
    form.append("phone", phone);
    form.append("email", email);
    form.append("country", country);

    form.append("paymentMethod", paymentMethod);
    form.append("paymentDetails", paymentDetails);

    if (modalType === "fiat2fiat") {
      form.append("receiveMethod", receiveMethod);
      form.append("receiveDetails", receiveDetails);
    } else if (modalType === "fiat2crypto") {
      form.append("address", receiveDetails);
    }

    form.append("proof", proofFile);

    await fetch("/api/send-transaction-email", {
      method: "POST",
      body: form,
    }).catch(console.error);

    setIsSubmitting(false);
    setIsModalOpen(false);
    setIsConfirmOpen(true);
  };

  const handleFinish = () => {
    setIsConfirmOpen(false);
    router.push("/history");
  };

  const paymentInstructions = {
    Ecobank: "N°compte Ecobank : 141134502002",
    "Moov money": "Moov Money : 96843308",
    "Mix by yas": "Lancez un retrais Mix by Yas au Point De Vente 3186328(ETS ASSIMA)",
    Mtn: "MTN Money : Veuillez nous contacter au +22898901032 pour les details",
    Paypal: "PayPal : ficho8822@gmail.com",
    Wave: "Wave : Veuillez nous contacter au +22898901032 pour les details",
    zelle: "Zelle : Veuillez nous contacter au +22898901032 pour les details",
  };

  const defaultCryptoAddress = "0xAbC1234Def5678GhI9012jKlm3456NoPq7890rs";

  return (
    <div className="container mx-auto p-8">
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1">De</label>
            <select
              className="w-full border rounded-lg p-3"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1">Montant</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full border rounded-lg p-3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Vers</label>
            <select
              className="w-full border rounded-lg p-3"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        {preview && (
          <p className="mt-4 text-center text-lg text-gray-600">
            Équivalent : <strong>{preview} {toCurrency} <br/> 
            Svp Veuillez bien retenir le montant que vous avez entré pour la conversion <br/>
            Vous devrais envoyé exatement ce montant a nun numéro ou adresse qui vous sera indiqué
            </strong>
          </p>
        )}
        <button
          onClick={handleConvert}
          className="mt-6 w-full bg-primary text-white py-3 rounded-lg hover:bg-orange-600"
        >
          Convertir
        </button>
      </motion.div>

      {/* -- MODAL -- */}
      <Modal
        isOpen={isModalOpen}
        onClose={()=>!isSubmitting&&setIsModalOpen(false)}
        title="Finalisez votre transaction"
      >
        <form onSubmit={handleSubmit}>
          {/* infos perso */}
          {[
            ["Prénom",firstName,setFirstName],
            ["Nom",lastName,setLastName],
            ["Téléphone",phone,setPhone],
            ["Email",email,setEmail],
            ["Pays",country,setCountry],
          ].map(([label,val,set])=>(
            <div key={label}>
              <label className="block mb-2">{label}</label>
              <input
                type={label==="Email"?"email":"text"}
                required
                className="w-full border rounded-lg p-2 mb-3"
                value={val}
                onChange={e=>set(e.target.value)}
              />
            </div>
          ))}

          {modalType==="crypto2fiat" && (
            <>
              <p className="mb-4 text-sm italic text-gray-700">
                Envoyez vos crypto à l’adresse BEP20 :
                <code className="block bg-gray-100 p-2 rounded my-2 break-all">
                  {defaultCryptoAddress}
                </code>
              </p>
              <label className="block mb-2">Moyen de réception (fiat)</label>
              <select
                className="w-full border rounded-lg p-2 mb-2"
                required
                value={paymentMethod}
                onChange={e=>setPaymentMethod(e.target.value)}
              >
                <option value="">Sélectionnez…</option>
                {Object.keys(paymentInstructions).map(m=>(
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              
              <label className="block mb-2">Compte / Numéro pour paiement</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Ex : RIB ou mobile"
                value={paymentDetails}
                onChange={e=>setPaymentDetails(e.target.value)}
              />
            </>
          )}

          {modalType==="fiat2crypto" && (
            <>
              <label className="block mb-2">Moyen de paiement (fiat)</label>
              <select
                className="w-full border rounded-lg p-2 mb-2"
                required
                value={paymentMethod}
                onChange={e=>setPaymentMethod(e.target.value)}
              >
                <option value="">Sélectionnez…</option>
                {Object.keys(paymentInstructions).map(m=>(
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {paymentMethod && (
                <p className="mb-3 text-sm italic text-gray-700">
                  {paymentInstructions[paymentMethod]}
                </p>
              )}
              <label className="block mb-2">Adresse BEP20 de réception</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Votre adresse crypto"
                value={receiveDetails}
                onChange={e=>setReceiveDetails(e.target.value)}
              />
            </>
          )}

          {modalType==="fiat2fiat" && (
            <>
              {/* paiement */}
              <label className="block mb-2">Moyen de paiement</label>
              <select
                className="w-full border rounded-lg p-2 mb-2"
                required
                value={paymentMethod}
                onChange={e=>setPaymentMethod(e.target.value)}
              >
                <option value="">Sélectionnez…</option>
                {Object.keys(paymentInstructions).map(m=>(
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {paymentMethod && (
                <p className="mb-3 text-sm italic text-gray-700">
                  {paymentInstructions[paymentMethod]}
                </p>
              )}

              {/* réception */}
              <label className="block mb-2 mt-4">Moyen de réception</label>
              <select
                className="w-full border rounded-lg p-2 mb-2"
                required
                value={receiveMethod}
                onChange={e=>setReceiveMethod(e.target.value)}
              >
                <option value="">Sélectionnez…</option>
                {Object.keys(paymentInstructions).map(m=>(
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <label className="block mb-2">Compte / Numéro (réception)</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Ex : RIB ou mobile"
                value={receiveDetails}
                onChange={e=>setReceiveDetails(e.target.value)}
              />
            </>
          )}

          <label className="block mb-2">
            Preuve ({modalType==="crypto2fiat" ?"crypto envoyée":"paiement fiat"})
          </label>
          <input
            type="file" accept="image/*"
            required
            className="block mb-4"
            onChange={e=>setProofFile(e.target.files[0])}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-accent text-white py-2 rounded-lg flex justify-center items-center ${
              isSubmitting?"opacity-50 cursor-not-allowed":""
            }`}
          >
            {isSubmitting
              ? <div className="loader border-t-2 border-white rounded-full w-5 h-5 animate-spin" />
              : "Valider la transaction"}
          </button>
        </form>
      </Modal>

      {/* confirmation */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={()=>setIsConfirmOpen(false)}
        title="Transaction prise en compte"
      >
        <p className="mb-4">
          Votre demande a bien été prise en compte et sera traitée dans les plus brefs délais.
        </p>
        <button
          onClick={handleFinish}
          className="w-full bg-primary text-white py-2 rounded-lg"
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