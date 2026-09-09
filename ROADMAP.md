# Roadmap: SimpleBits Clone

Este documento traza el camino para convertir el proyecto actual en un clon fiel de la economía y la experiencia de juego de SimpleBits.

## Estado Actual vs. SimpleBits

| Feature | Estado Actual | Prioridad |
| :--- | :--- | :--- |
| **Economía (2 Monedas)** | ✅ Estandarizado (`tokenBalance`/`boundTokenBalance`) | **Alta** |
| **Login / Registro** | ⚠️ (Auth débil) | **Media** |
| **Faucet con Timer** | ✅ OK | - |
| **Exchange Tokens → Bound** | ✅ 1:1 un solo sentido | **Alta** |
| **Rent Hardware (Fase B)** | ✅ Compra/Maduración/Payout en bound | **Media** |
| **Mining (Inversión/ROI)** | ✅ Incluye hashrate de rentals | **Media** |
| **PTC / Offerwalls** | ⚠️ Estructura / Parcial | **Baja** |

---

## Fases de Desarrollo

### Fase A — Paridad Económica (Imprescindible)
*   [x] Estandarizar saldos: `tokenBalance` y `boundTokenBalance` únicamente.
*   [x] Implementar Exchange definitivo: `Tokens → Bound` (1:1, un solo sentido).
*   [x] Limitar `Withdraw` exclusivamente a `boundTokenBalance`.
*   [x] Asegurar que Faucet/Mining/PTC sumen solo a `tokenBalance`.

### Fase B — Loop de Hardware (El corazón del juego)
*   [x] Implementar sistema de "Rent Hardware":
    *   Compra de planes de minería con `tokenBalance`.
    *   Maduración de planes en X días.
    *   Payout en `boundTokenBalance` con interés (ROI).
*   [x] Refinar Hashrate: Que el hardware del inventario afecte visiblemente la minería.

### Fase C — "Feel" de SimpleBits
*   [ ] PTC con timer real y límite de recompensas.
*   [ ] Energía: Refinamiento de la UI para mostrar el gasto en tiempo real en mining.
*   [ ] Niveles: Aplicar `level bonus` de forma consistente en todas las actividades.
*   [x] Withdrawals: Validaciones de límites por moneda.

### Fase D — Características Avanzadas (Post-MVP)
*   [ ] Sistema de referidos.
*   [ ] Desafíos diarios y logros (Achievements).
*   [ ] Mining Fund / Eventos globales.
*   [ ] Integración real de Offerwalls (partners).

---
*Nota: Este documento es nuestra "fuente de la verdad". Cualquier tarea que iniciemos debe alinearse con estas fases.*
