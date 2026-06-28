import json


def sql_escape(value: str) -> str:
    """Escapa comillas simples para literales SQL."""
    return value.replace("'", "''")


def sql_str(value: str) -> str:
    return f"'{sql_escape(value)}'"


def sql_bool(value: bool) -> str:
    return "true" if value else "false"


with open("/home/claude/lapica-menu/data/menu_data.json", encoding="utf-8") as f:
    data = json.load(f)

lines = []
lines.append("-- ============================================================")
lines.append("-- La Picá Del Nacho — Seed de datos reales (carta original)")
lines.append("-- ============================================================")
lines.append("-- Ejecutar DESPUÉS de schema.sql. Carga categorías, sucursales y")
lines.append("-- los 129 productos reales extraídos de la carta del food truck.")
lines.append("")
lines.append("-- Limpiar datos previos (idempotente: se puede correr más de una vez)")
lines.append("TRUNCATE TABLE orders, products, branches, categories CASCADE;")
lines.append("")

# Categorías
lines.append("-- Categorías")
lines.append("INSERT INTO categories (id, label, sort_order) VALUES")
cat_rows = []
for c in sorted(data["categories"], key=lambda x: x["sortOrder"]):
    cat_rows.append(f"  ({sql_str(c['id'])}, {sql_str(c['label'])}, {c['sortOrder']})")
lines.append(",\n".join(cat_rows) + ";")
lines.append("")

# Sucursales
lines.append("-- Sucursales")
lines.append("INSERT INTO branches (id, name, active) VALUES")
branch_rows = []
for b in data["branches"]:
    branch_rows.append(
        f"  ({sql_str(b['id'])}, {sql_str(b['name'])}, {sql_bool(b['active'])})"
    )
lines.append(",\n".join(branch_rows) + ";")
lines.append("")

# Productos
lines.append("-- Productos (129 items reales de la carta)")
lines.append(
    "INSERT INTO products (id, name, description, price, category, image, "
    "allows_extras, modifier_groups, sort_order, active) VALUES"
)
prod_rows = []
for p in data["products"]:
    image_val = sql_str(p["image"]) if p["image"] else "NULL"
    modifiers_json = json.dumps(p["modifierGroups"], ensure_ascii=False)
    modifiers_sql = f"{sql_str(modifiers_json)}::jsonb"
    prod_rows.append(
        "  (" +
        ", ".join([
            sql_str(p["id"]),
            sql_str(p["name"]),
            sql_str(p["description"]),
            str(p["price"]),
            sql_str(p["category"]),
            image_val,
            sql_bool(p["allowsExtras"]),
            modifiers_sql,
            str(p["sortOrder"]),
            sql_bool(p["active"]),
        ]) +
        ")"
    )
lines.append(",\n".join(prod_rows) + ";")
lines.append("")

with open("/home/claude/lapica-menu/db/seed.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"seed.sql generado con {len(data['products'])} productos, "
      f"{len(data['categories'])} categorías, {len(data['branches'])} sucursales.")
