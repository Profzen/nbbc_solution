// pages/api/auth/login.js

import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { user, pass } = req.body;
  const ADMIN_USER     = process.env.ADMIN_USER;
  const ADMIN_PASS     = process.env.ADMIN_PASS;
  const COOKIE_SECRET  = process.env.ADMIN_COOKIE_SECRET;

  // Vérification simple en clair (static credentials)
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    // Un mini‐token JSON
    const token = JSON.stringify({ user });

    // Sérialisation du cookie
    const cookie = serialize("auth", token, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",              // ← disponible sur tout le site
      maxAge: 60 * 60,        // 1 heure
      secret: COOKIE_SECRET,
    });

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, message: "Identifiants invalides" });
}
