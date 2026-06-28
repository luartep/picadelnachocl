import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO (Etapa 3): insertar en tabla `orders` usando @neondatabase/serverless
    // const sql = neon(process.env.DATABASE_URL!);
    // await sql.query(
    //   "INSERT INTO orders (customer_name, order_type, address, branch_id, items, total) VALUES ($1, $2, $3, $4, $5, $6)",
    //   [body.customerName, body.orderType, body.address, body.branchId, JSON.stringify(body.items), body.total]
    // );

    console.log("Pedido recibido (sin DB conectada todavía):", {
      customerName: body.customerName,
      orderType: body.orderType,
      total: body.total,
      itemCount: body.items?.length ?? 0,
    });

    return NextResponse.json({ ok: true, persisted: false });
  } catch (error) {
    console.error("Error al procesar pedido:", error);
    // Nunca rompemos el flujo del cliente: WhatsApp ya se abrió antes de este fetch.
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el pedido en el servidor." },
      { status: 200 }
    );
  }
}
