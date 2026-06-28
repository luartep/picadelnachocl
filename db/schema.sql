-- ============================================================
-- La Picá Del Nacho — Schema de base de datos (Neon Postgres)
-- ============================================================
-- Ejecutar este archivo una sola vez al conectar la base de datos.
-- Luego ejecutar seed.sql para cargar el catálogo real de productos.

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS branches (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  active  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price           INTEGER NOT NULL,
  category        TEXT NOT NULL REFERENCES categories(id),
  image           TEXT,
  allows_extras   BOOLEAN NOT NULL DEFAULT false,
  modifier_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  customer_name   TEXT NOT NULL,
  order_type      TEXT NOT NULL, -- 'delivery' | 'retiro'
  address         TEXT,
  branch_id       TEXT REFERENCES branches(id),
  items           JSONB NOT NULL,
  total           INTEGER NOT NULL,
  prep_status     TEXT NOT NULL DEFAULT 'en_preparacion', -- en_preparacion | en_reparto | entregado
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_prep_status ON orders(prep_status);
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
