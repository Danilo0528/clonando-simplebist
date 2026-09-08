# 01: Schema & Data Layer para Hardware Rentals

**What to build:** Crear las tablas necesarias en Prisma para gestionar los contratos de alquiler de hardware. Se debe poder registrar quién alquila qué, cuánto pagó, cuánto debe recibir al final y el estado del alquiler.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Actualizar `schema.prisma` con un nuevo modelo `RentalContract`.
- [ ] Ejecutar migraciones para reflejar los cambios en la BD.
- [ ] Crear funciones base en `lib/market.js` (o nuevo módulo) para crear contratos de alquiler.
