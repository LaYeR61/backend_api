import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { encriptarPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    const { nombre, email, password } = await request.json();

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { ok: false, mensaje: "nombre, email y password son obligatorios" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, mensaje: "La contraseña debe tener mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    const [existe] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return NextResponse.json(
        { ok: false, mensaje: "El email ya está registrado" },
        { status: 409 }
      );
    }

    const hash = await encriptarPassword(password);
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hash]
    );

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Usuario registrado correctamente",
        usuario: { id: resultado.insertId, nombre, email, rol: "usuario" },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, mensaje: "Error en el servidor" }, { status: 500 });
  }
}