# La Picá Del Nacho — Menú Digital

**Etapa 1 completada**: Menú público con todos los productos reales extraídos de la carta (PDF), mobile-first, sin zoom accidental en inputs/gestos.

## Qué incluye esta etapa

- Navbar fijo con logo de marca y carrito (contador de items).
- Hero con la identidad visual del food truck.
- Navegación de categorías en pills horizontales, sticky, con scroll-spy (resalta la categoría visible) y scroll suave al hacer click.
- Grid de productos por categoría (129 productos reales, sin inventar ninguno).
- Modal de personalización por producto, para productos con modificadores (carne a elección, vegetales a elección).
- Carrito tipo drawer/bottom-sheet con modalidad (Delivery/Retiro), nombre, dirección, y botón "Enviar Pedido por WhatsApp" — ya con la apertura síncrona de `window.open` antes de cualquier `await`, según especificado.
- Endpoint `/api/orders` ya armado (todavía sin DB conectada — esto llega en Etapa 3).

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Decisiones que tomé (avísame si quieres que cambie algo)

1. **Completos (N°1-26)**: como confirmaste, cada sabor se separó en hasta 4 productos según tipo de vienesa/carne (R. Abuelo, Pacel, Llanquihue, Carne). El Hot Dog no tiene versión "Carne" porque la carta no la incluye. Total: 70 productos solo en Completos (Normal + XL).
2. **N°31 Vegetariano**: armé un modificador "Elige 5 vegetales" con 15 opciones vegetarianas de la lista de Agregados (excluí carnes, vienesa, tocino, salsa cheddar de ese grupo específico).
3. **Promociones (N°60-64)**: categoría propia con modificadores de selección para elegir el completo/sándwich del combo y el bebestible.
4. **Precios corregidos**: el PDF original tiene varios errores de tipeo evidentes (ej. "$8.50000", "$6.00000"). Los normalicé a sus valores correctos ($8.500, $6.000) sin alterar el valor real.
5. **Recargo por defecto sobre extras**: usé $1.000 CLP como recargo por unidad excedente en grupos de modificadores, tal como indica el prompt cuando no se especifica monto.
6. **Tipografía**: Bebas Neue (display, estilo letrero pintado) + Inter (texto), auto-hospedadas como archivos locales — no dependen de Google Fonts en build time.

## Siguiente paso

Cuando confirmes que el menú público se ve bien, sigo con:
- **Etapa 2**: revisar a fondo el sistema de modificadores.
- **Etapa 3**: conectar Neon Postgres + persistencia real de pedidos.
- **Etapa 4**: panel de administración (`/admin`).
