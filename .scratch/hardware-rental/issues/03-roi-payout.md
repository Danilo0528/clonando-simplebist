# 03: Motor de Payout (ROI)

**What to build:** Un mecanismo para procesar los alquileres vencidos y entregar las ganancias (Bound Tokens + interés) a los usuarios. Esto debe ser automático o invocable mediante un endpoint admin/cron.

**Blocked by:** 02-rental-logic.md

**Status:** ready-for-agent

- [ ] Crear función `processRentalPayouts` en `lib/market.js` (o `economy.js`).
- [ ] Implementar lógica para calcular el ROI (Token original + X% interés).
- [ ] Asegurar que el pago se realiza en `boundTokenBalance`.
- [ ] Marcar el contrato de alquiler como `completed`.
