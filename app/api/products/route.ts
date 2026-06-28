import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Base de datos no conectada todavía." },
        { status: 200 }
      );
    }

    const sql = getDb();

    const categories = await sql.query(
      "SELECT id, label, sort_order AS \"sortOrder\" FROM categories ORDER BY sort_order ASC",
      []
    );
    const branches = await sql.query(
      "SELECT id, name, active FROM branches WHERE active = $1 ORDER BY id ASC",
      [true]
    );
    const products = await sql.query(
      `SELECT
         id, name, description, price, category, image,
         allows_extras AS "allowsExtras",
         modifier_groups AS "modifierGroups",
         sort_order AS "sortOrder",
         active
       FROM products
       WHERE active = $1
       ORDER BY category ASC, sort_order ASC`,
      [true]
    );

    return NextResponse.json({
      ok: true,
      categories,
      branches,
      products,
    });
  } catch (error) {
    console.error("Error al cargar productos desde la base de datos:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo cargar el catálogo desde la base de datos." },
      { status: 200 }
    );
  }
}
