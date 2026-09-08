# 02: Lógica de Negocio: Rent vs Purchase

**What to build:** Implementar la lógica para que los usuarios puedan elegir entre "Comprar" (estilo actual) y "Alquilar" (nuevo estilo) un item del mercado. La opción de alquiler debe restar tokens, crear el contrato (Ticket 01) y definir la fecha de vencimiento.

**Blocked by:** 01-rental-schema.md

**Status:** ready-for-agent

- [ ] Modificar `purchaseMarketItem` para manejar lógica de `rent`.
- [ ] Implementar validación de saldo para el alquiler.
- [ ] Crear la transacción atómica que registra el alquiler.
