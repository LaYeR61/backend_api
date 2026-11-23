import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { compararPassword, generarToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, mensaje: "email y password son obligatorios" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    const usuario = rows[0];

    const passwordValida = usuario && (await compararPassword(password, usuario.password));
    if (!passwordValida) {
      return NextResponse.json(
        { ok: false, mensaje: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const token = generarToken(usuario);

    return NextResponse.json({
      ok: true,
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, mensaje: "Error en el servidor" }, { status: 500 });
  }
}