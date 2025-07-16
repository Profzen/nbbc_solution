// pages/api/auth/logout.js

import { serialize } from "cookie";

export default function handler(req, res) {
  const cookie = serialize("auth", "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/admin",
    expires: new Date(0),
  });
  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}
