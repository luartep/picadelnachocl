import { NextRequest, NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Base de datos no conectada todavía." },
        { status: 200 }
      );
    }

    const sql = getDb();
    const statusFilter = request.nextUrl.searchParams.get("status");
    const branchFilter = request.nextUrl.searchParams.get("branchId");

    let query = "SELECT * FROM orders WHERE 1=1";
    const params: unknown[] = [];

    if (statusFilter && statusFilter !== "todos") {
      params.push(statusFilter);
      query += ` AND prep_status = $${params.length}`;
    }
    if (branchFilter) {
      params.push(branchFilter);
      query += ` AND branch_id = $${params.length}`;
    }
    query += " ORDER BY created_at DESC";

    const rows = await sql.query(query, params);
    return NextResponse.json({ ok: true, orders: rows });
  } catch (error) {
    console.error("Error al listar pedidos:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudieron cargar los pedidos." },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isDatabaseConfigured()) {
      console.log("Pedido recibido (DB no conectada todavía):", {
        customerName: body.customerName,
        orderType: body.orderType,
        total: body.total,
        itemCount: body.items?.length ?? 0,
      });
      return NextResponse.json({ ok: true, persisted: false });
    }

    const sql = getDb();
    await sql.query(
      `INSERT INTO orders (customer_name, order_type, address, branch_id, items, total)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        body.customerName,
        body.orderType,
        body.address ?? null,
        body.branchId ?? null,
        JSON.stringify(body.items ?? []),
        body.total,
      ]
    );

    return NextResponse.json({ ok: true, persisted: true });
  } catch (error) {
    console.error("Error al procesar pedido:", error);
    // Nunca rompemos el flujo del cliente: WhatsApp ya se abrió antes de este fetch.
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el pedido en el servidor." },
      { status: 200 }
    );
  }
}
