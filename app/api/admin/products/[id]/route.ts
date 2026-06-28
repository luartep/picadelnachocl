import { NextRequest, NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Base de datos no conectada todavía." },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      image,
      allowsExtras,
      modifierGroups,
      sortOrder,
      active,
    } = body;

    if (!name || !category || typeof price !== "number") {
      return NextResponse.json(
        { ok: false, error: "Faltan campos requeridos (name, category, price)." },
        { status: 400 }
      );
    }

    const sql = getDb();
    const result = await sql.query(
      `UPDATE products SET
         name = $1,
         description = $2,
         price = $3,
         category = $4,
         image = $5,
         allows_extras = $6,
         modifier_groups = $7,
         sort_order = $8,
         active = $9,
         updated_at = now()
       WHERE id = $10
       RETURNING id`,
      [
        name,
        description ?? "",
        price,
        category,
        image ?? null,
        Boolean(allowsExtras),
        JSON.stringify(modifierGroups ?? []),
        sortOrder ?? 0,
        active ?? true,
        id,
      ]
    );

    if (Array.isArray(result) && result.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al editar producto:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el producto." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Base de datos no conectada todavía." },
        { status: 503 }
      );
    }

    const { id } = await params;
    const sql = getDb();
    await sql.query("DELETE FROM products WHERE id = $1", [id]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo eliminar el producto." },
      { status: 500 }
    );
  }
}
