import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { obtenerUsuarioDelToken, noAutorizado } from "@/lib/auth";

export async function GET(request) {
  const datosToken = obtenerUsuarioDelToken(request);
  if (!datosToken) return noAutorizado();

  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, descripcion, precio, stock, usuario_id, creado_en FROM productos ORDER BY id"
    );
    return NextResponse.json({ ok: true, total: rows.length, productos: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, mensaje: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(request) {
  const datosToken = obtenerUsuarioDelToken(request);
  if (!datosToken) return noAutorizado();

  try {
    const { nombre, descripcion, precio, stock } = await request.json();

    if (typeof nombre !== "string" || nombre.trim() === "") {
      return NextResponse.json(
        { ok: false, mensaje: "El nombre es obligatorio" },
        { status: 400 }
      );
    }
    const precioNum = Number(precio);
    if (precio === undefined || precio === "" || Number.isNaN(precioNum) || precioNum < 0) {
      return NextResponse.json(
        { ok: false, mensaje: "El precio es obligatorio y debe ser un número mayor o igual a 0" },
        { status: 400 }
      );
    }
    const stockNum = stock === undefined ? 0 : Number(stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { ok: false, mensaje: "El stock debe ser un entero mayor o igual a 0" },
        { status: 400 }
      );
    }

    const [resultado] = await pool.query(
      "INSERT INTO productos (nombre, descripcion, precio, stock, usuario_id) VALUES (?, ?, ?, ?, ?)",
      [nombre.trim(), descripcion ?? null, precioNum, stockNum, datosToken.id]
    );

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Producto creado correctamente",
        producto: {
          id: resultado.insertId,
          nombre: nombre.trim(),
          descripcion: descripcion ?? null,
          precio: precioNum,
          stock: stockNum,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, mensaje: "Error en el servidor" }, { status: 500 });
  }
}