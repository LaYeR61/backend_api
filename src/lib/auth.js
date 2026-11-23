import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

// ---------- Contraseñas ----------
export async function encriptarPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function compararPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ---------- Tokens JWT ----------
export function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function obtenerUsuarioDelToken(request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [tipo, token] = authHeader.split(" ");

  if (tipo !== "Bearer" || !token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ---------- Respuestas reutilizables ----------
export function noAutorizado(mensaje = "Token no enviado o inválido") {
  return NextResponse.json({ ok: false, mensaje }, { status: 401 });
}

export function prohibido(mensaje = "No tienes permisos para esta acción") {
  return NextResponse.json({ ok: false, mensaje }, { status: 403 });
}