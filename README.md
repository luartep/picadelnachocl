# La Picá Del Nacho — Menú Digital + Panel de Administración

Proyecto Next.js 16 (App Router) + TypeScript + Tailwind. Menú público con
carrito por WhatsApp, persistencia de pedidos en Neon Postgres, y panel de
administración para editar productos sin tocar código.

## Estado del proyecto

- ✅ **Etapa 1** — Menú público completo (129 productos reales de la carta).
- ✅ **Etapa 2** — Sistema de modificadores (carne a elección, vegetales a elección, etc.)
- ✅ **Etapa 3** — Base de datos Neon Postgres + persistencia de pedidos.
- ✅ **Etapa 4** — Panel de administración (`/admin`) — solo gestión de productos.

## Cómo correrlo localmente

```bash
npm install
cp .env.local.example .env.local   # completa los valores reales
npm run dev
```

Abre http://localhost:3000 para el menú público, o http://localhost:3000/admin
para el panel de administración.

## Panel de administración (`/admin`)

**Acceso:**
- Usuario: `lapicadelnacho`
- Clave: `lapicadelnacho123`

(Puedes cambiar estos valores en `ADMIN_USERNAME` / `ADMIN_PASSWORD` en tus
variables de entorno — ver más abajo.)

**Qué incluye:**
- Login con sesión firmada (cookie HMAC-SHA256 vía Web Crypto API, expira a
  los 7 días).
- Lista de productos agrupados por categoría.
- Crear, editar y eliminar productos: nombre, descripción, precio, categoría,
  si permite adicionales, y si está activo (visible en el menú público).
- Editor de modificadores embebido en el editor de producto: para cada grupo
  puedes cambiar el label, cuántas opciones vienen incluidas sin costo
  ("Incluye"), y agregar/editar/eliminar opciones individuales con su precio.

**Qué NO incluye (a propósito):** este panel no tiene gestión de pedidos ni
impresión de comandas — solo se usa para mantener el catálogo actualizado.
Los pedidos de todas formas se siguen guardando en la tabla `orders` de la
base de datos vía `/api/orders`, por si más adelante quieres revisarlos
directamente desde el SQL Editor de Neon o agregar esa vista en el futuro.

**Si la base de datos no está conectada:** el panel muestra un mensaje claro
("Base de datos no conectada todavía") con un botón para reintentar, en vez
de quedarse cargando indefinidamente.

## Conectar la base de datos Neon desde Vercel

1. En tu proyecto de Vercel, ve a **Storage → Create Database → Postgres (Neon)**.
2. Sigue el flujo de creación. Vercel conecta el proyecto automáticamente e
   inyecta la variable `DATABASE_URL` en todos los entornos (Production,
   Preview, Development) — no necesitas copiarla a mano.
3. Para desarrollo local, copia esa misma cadena de conexión desde
   **Storage → tu base de datos → .env.local** (botón "Show secret") y
   pégala en tu archivo `.env.local`.

## Cargar el esquema y los datos (schema.sql + seed.sql)

Con la base de datos ya conectada, ejecuta los dos archivos SQL **en este
orden**, usando el SQL Editor del dashboard de Neon:

1. **`db/schema.sql`** — crea las tablas `categories`, `branches`, `products`
   y `orders`, más sus índices.
2. **`db/seed.sql`** — carga las categorías, la sucursal y los 129 productos
   reales extraídos de la carta. Es idempotente (usa `TRUNCATE` antes de
   insertar), así que es seguro re-ejecutarlo si necesitas resetear el
   catálogo a los valores originales.

Pasos en el dashboard de Neon:
1. Entra a [console.neon.tech](https://console.neon.tech) → tu proyecto.
2. Ve a **SQL Editor**.
3. Pega el contenido completo de `db/schema.sql`, ejecuta.
4. Pega el contenido completo de `db/seed.sql`, ejecuta.
5. Verifica con: `SELECT count(*) FROM products;` → debería devolver `129`.

## Variables de entorno

Configúralas en **Vercel → Project Settings → Environment Variables**
(o en tu `.env.local` para desarrollo):

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a Neon. Se inyecta sola si conectaste Neon desde el dashboard de Vercel. |
| `ADMIN_USERNAME` | Usuario para entrar a `/admin`. Valor actual: `lapicadelnacho` |
| `ADMIN_PASSWORD` | Clave para entrar a `/admin`. Valor actual: `lapicadelnacho123` |
| `ADMIN_SESSION_SECRET` | Secreto para firmar la cookie de sesión del admin. Genera uno propio con `openssl rand -hex 32`. |

Mira `.env.local.example` para el formato exacto. **Importante:** si
`ADMIN_SESSION_SECRET` no está configurada, el login del panel admin
responderá con un error claro en vez de un crash — pero no podrás entrar
hasta configurarla.

## Desplegar

1. Sube el contenido de este proyecto a un repositorio de GitHub (puedes
   arrastrar los archivos desde la interfaz web de GitHub si no usas
   terminal — "Add file → Upload files").
2. En Vercel, **Add New → Project** → importa ese repositorio.
3. Vercel detecta Next.js automáticamente, no necesitas tocar nada en
   "Build & Output Settings".
4. Conecta Neon como se explica arriba (paso que inyecta `DATABASE_URL`).
5. Agrega `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` en
   Environment Variables.
6. Deploy. Cuando termine, corre `schema.sql` y `seed.sql` como se explicó.

## Detalles técnicos de esta etapa (Etapa 4)

- `proxy.ts`: protege todas las rutas `/admin/*` excepto `/admin/login`.
  (En Next.js 16, el archivo `middleware.ts` fue renombrado a `proxy.ts` —
  la lógica es la misma, solo cambió el nombre del archivo y de la función
  exportada).
- `lib/admin-session.ts`: cookie de sesión firmada con HMAC-SHA256 usando
  **Web Crypto API** (`crypto.subtle`), no el módulo `crypto` de Node — esto
  la hace compatible tanto con Node.js runtime como con Edge Runtime. La
  verificación de sesión nunca lanza una excepción no controlada: si falta
  `ADMIN_SESSION_SECRET`, simplemente devuelve "no autorizado", nunca un
  error 500.
- `app/api/admin/login/route.ts`: verifica usuario/clave (una sola
  credencial fija, sin tabla de usuarios ni NextAuth) y setea la cookie.
- `app/api/admin/products/route.ts` y `[id]/route.ts`: CRUD completo de
  productos, protegido por sesión en cada endpoint (no solo por el proxy).
- `components/admin/ProductEditorModal.tsx`: el editor de modificadores
  vive embebido dentro del editor de producto, como se pidió.

## Decisiones que tomé en etapas anteriores

1. **Completos (N°1-26)**: cada sabor se separó en hasta 4 productos según
   tipo de vienesa/carne (R. Abuelo, Pacel, Llanquihue, Carne). El Hot Dog
   no tiene versión "Carne" porque la carta no la incluye.
2. **N°31 Vegetariano**: modificador "Elige 5 vegetales" con 15 opciones
   vegetarianas de la lista de Agregados.
3. **Promociones (N°60-64)**: categoría propia con modificadores de
   selección para elegir el completo/sándwich del combo y el bebestible.
4. **Precios corregidos**: el PDF original tiene errores de tipeo evidentes
   (ej. "$8.50000", "$6.00000"). Los normalicé a sus valores correctos.
5. **Recargo por defecto sobre extras**: $1.000 CLP por unidad excedente,
   como indica el prompt cuando no se especifica un monto.
