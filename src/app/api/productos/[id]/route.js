import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { obtenerUsuarioDelToken, noAutorizado, prohibido } from "@/lib/auth";

// Busca un producto por id. Devuelve la fila o undefined si no existe.
async function buscarProducto(id) {
  const [rows] = await pool.query(
    "SELECT id, nombre, descripcion, precio, stock, usuario_id, creado_en FROM productos WHERE id = ?",
    [id]
  );
  return rows[0];
}

// Solo el dueño del producto o un admin pueden modificarlo o eliminarlo
function puedeGestionar(datosToken, producto) {
  return datosToken.rol === "admin" || datosToken.id === producto.usuario_id;
}

// Validaciones del PUT. Devuelve { error } o { datos } ya limpios.
function validarProducto({ nombre, descripcion, precio, stock }) {
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return { error: "El nombre es obligatorio" };
  }
  const precioNum = Number(precio);
  if (precio === undefined || precio === null || precio === "" || Number.isNaN(precioNum) || precioNum < 0) {
    return { error: "El precio es obligatorio y debe ser un número mayor o igual a 0" };
  }
  const stockNum = Number(stock);
  if (stock === undefined || stock === null || stock === "" || !Number.isInteger(stockNum) || stockNum < 0) {
    return { error: "El stock es obligatorio y debe ser un entero mayor o igual a 0" };
  }
  return {
    datos: {
      nombre: nombre.trim(),
      descripcion: descripcion ?? null,
      precio: precioNum,
      stock: stockNum,
    },
  };
}

// GET /api/productos/:id  →  consulta un producto
export async function GET(request, { params }) {
  const datosToken = obtenerUsuarioDelToken(request);
  if (!datosToken) return noAutorizado();

  try {
    const { id } = await params; // en Next 15+ params es una promesa
    const producto = await buscarProducto(id);
    if (!producto) {
      return NextResponse.json({ ok: false, mensaje: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, producto });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, mensaje: "Error en el servidor" }, { status: 500 });
  }
}

// PUT /api/productos/:id  →  modifica un producto (envía todos los campos)
export async function PUT(request, { params }) {
  const datosToken = obtenerUsuarioDelToken(request);
  if (!datosToken) return noAutorizado();

  try {
    const { id } = await params;

    // 1. ¿Existe?
    const producto = await buscarProducto(id);
    if (!producto) {
      return NextResponse.json({ ok: false, mensaje: "Producto no encontrado" }, { status: 404 });
    }

    // 2. ¿Tiene permiso?
    if (!puedeGestionar(datosToken, producto)) return prohibido();

    // 3. Validar los datos nuevos
    const { error, datos } = validarProducto(await request.json());
    if (error) {
      return NextResponse.json({ ok: false, mensaje: error }, { status: 400 });
    }

    // 4. Actualizar
    await pool.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?",
      [datos.nombre, datos.descripcion, datos.precio, datos.stock, id]
    );

    return NextResponse.json({
      ok: true,
      mensaje: "Producto actualizado correctamente",
      producto: { id: producto.id, ...datos },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, mensaje: "Error en el servidor" }, { status: 500 });
  }
}

// DELETE /api/productos/:id  →  elimina un producto
export async function DELETE(request, { params }) {
  const datosToken = obtenerUsuarioDelToken(request);
  if (!datosToken) return noAutorizado();

  try {
    const { id } = await params;

    const producto = await buscarProducto(id);
    if (!producto) {
      return NextResponse.json({ ok: false, mensaje: "Producto no encontrado" }, { status: 404 });
    }

    if (!puedeGestionar(datosToken, producto)) return prohibido();

    await pool.query("DELETE FROM productos WHERE id = ?", [id]);

    return NextResponse.json({ ok: true, mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, mensaje: "Error en el servidor" }, { status: 500 });
  }
}