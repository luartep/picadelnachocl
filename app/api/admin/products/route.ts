import { NextRequest, NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Base de datos no conectada todavía." },
        { status: 200 }
      );
    }

    const sql = getDb();
    const categories = await sql.query(
      'SELECT id, label, sort_order AS "sortOrder" FROM categories ORDER BY sort_order ASC',
      []
    );
    const products = await sql.query(
      `SELECT
         id, name, description, price, category, image,
         allows_extras AS "allowsExtras",
         modifier_groups AS "modifierGroups",
         sort_order AS "sortOrder",
         active
       FROM products
       ORDER BY category ASC, sort_order ASC`,
      []
    );

    return NextResponse.json({ ok: true, categories, products });
  } catch (error) {
    console.error("Error al listar productos (admin):", error);
    return NextResponse.json(
      { ok: false, error: "No se pudieron cargar los productos." },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      id,
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

    if (!id || !name || !category || typeof price !== "number") {
      return NextResponse.json(
        { ok: false, error: "Faltan campos requeridos (id, name, category, price)." },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql.query(
      `INSERT INTO products
         (id, name, description, price, category, image, allows_extras, modifier_groups, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        name,
        description ?? "",
        price,
        category,
        image ?? null,
        Boolean(allowsExtras),
        JSON.stringify(modifierGroups ?? []),
        sortOrder ?? 0,
        active ?? true,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo crear el producto." },
      { status: 500 }
    );
  }
}
