// pages/api/send-sms.js
export default async function handler(req, res) {
  console.log("[send-sms] entrée dans le handler, méthode:", req.method);
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    console.log("[send-sms] méthode non autorisée :", req.method);
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    // Log du corps reçu
    console.log("[send-sms] payload reçu:", req.body);

    const {
      transactionId,
      firstName,
      lastName,
      email,
      phone,
      country,
      from,
      to,
      amount,
      converted,
      status,
    } = req.body || {};

    if (!transactionId) {
      console.warn("[send-sms] transactionId manquant");
      return res.status(400).json({ message: "ID de transaction manquant" });
    }

    // Vérification des variables d'environnement
    const missingEnv = [];
    if (!process.env.KINGSMS_APIKEY) missingEnv.push("KINGSMS_APIKEY");
    if (!process.env.KINGSMS_CLIENTID) missingEnv.push("KINGSMS_CLIENTID");
    if (!process.env.ADMIN_SMS_NUMBER) missingEnv.push("ADMIN_SMS_NUMBER");
    if (missingEnv.length) {
      console.error("[send-sms] variables d'environnement manquantes:", missingEnv);
      return res.status(500).json({ message: "Configuration SMS invalide", missing: missingEnv });
    }

    // Compose le message
    const message = [
      "Nouvelle transaction initiée :",
      `ID: ${transactionId}`,
      `Client: ${firstName || "-"} ${lastName || "-"}`,
      `Email: ${email || "-"}`,
      `Téléphone: ${phone || "-"}`,
      `Pays: ${country || "-"}`,
      `Conversion: ${amount || "-"} ${from || "-"} → ${converted || "-"} ${to || "-"}`,
      `Statut: ${status || "-"}`,
    ].join("\n");

    // Prépare le payload pour King SMS Pro
    const kingPayload = {
      from: (process.env.KINGSMS_FROM || "Nexchang").slice(0, 11),
      to: process.env.ADMIN_SMS_NUMBER,
      message,
      type: 0,
      dlr: "yes",
    };

    const endpoint = "https://edok-api.kingsmspro.com/api/v1/sms/send";
    console.log("[send-sms] envoi vers King SMS Pro, endpoint:", endpoint);
    console.log("[send-sms] headers:", {
      APIKEY: process.env.KINGSMS_APIKEY ? "****" : null,
      CLIENTID: process.env.KINGSMS_CLIENTID ? "****" : null,
      "Content-Type": "application/json",
    });
    console.log("[send-sms] payload King SMS Pro:", kingPayload);

    let attempt = 0;
    const maxAttempts = 2;
    let lastError = null;
    let kingResponseParsed = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        console.log(`[send-sms] tentative ${attempt} d'envoi SMS`);
        const kingRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            APIKEY: process.env.KINGSMS_APIKEY,
            CLIENTID: process.env.KINGSMS_CLIENTID,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(kingPayload),
        });

        const rawText = await kingRes.text();
        console.log(`[send-sms] réponse brute King SMS Pro (tentative ${attempt}):`, rawText.slice(0, 1000));

        try {
          kingResponseParsed = JSON.parse(rawText);
        } catch (parseErr) {
          lastError = {
            message: "Réponse non JSON de King SMS Pro",
            raw: rawText.slice(0, 1000),
          };
          console.warn(`[send-sms] échec parsing JSON (tentative ${attempt}):`, parseErr.message);
          if (attempt >= maxAttempts) break;
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        if (!kingRes.ok) {
          lastError = {
            message: "Erreur retournée par King SMS Pro",
            details: kingResponseParsed,
          };
          console.warn(`[send-sms] King SMS Pro a renvoyé un statut non ok (tentative ${attempt}):`, kingResponseParsed);
          if (attempt >= maxAttempts) break;
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        // Succès
        console.log("[send-sms] SMS envoyé avec succès, réponse parsée:", kingResponseParsed);
        return res.status(200).json({
          message: "SMS envoyé avec succès",
          kingResponse: kingResponseParsed,
          attempts: attempt,
        });
      } catch (err) {
        lastError = { message: "Erreur requête vers King SMS Pro", error: err.message };
        console.error(`[send-sms] erreur lors de la tentative ${attempt}:`, err);
        if (attempt >= maxAttempts) break;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }

    console.error("[send-sms] toutes les tentatives ont échoué, dernier erreur:", lastError);
    return res.status(502).json({
      message: "Impossible d'envoyer le SMS après plusieurs tentatives",
      lastError,
    });
  } catch (err) {
    console.error("Erreur interne /api/send-sms :", err);
    return res.status(500).json({ message: "Erreur interne lors de l'envoi du SMS" });
  }
}

