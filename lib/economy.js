import prisma from './prisma.mjs';

/**
 * Módulo de Economía: Gestión unificada de balances (SimpleBits Style)
 * 
 * Reglas:
 * - tokenBalance: Tokens ganados y usados en el juego.
 * - boundTokenBalance: Tokens bloqueados para retiro.
 * - balance: DEPRECATED (no usar).
 */

/** Suma Tokens (faucet, mining, PTC...) */
export async function creditTokens(userId, amount, tx = prisma) {
  return tx.user.update({
    where: { id: userId },
    data: { tokenBalance: { increment: amount } },
  });
}

/** Resta Tokens (market) — falla si no hay saldo */
export async function debitTokens(userId, amount, tx = prisma) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true },
  });
  if (!user || user.tokenBalance < amount) {
    throw new Error('Insufficient token balance');
  }
  return tx.user.update({
    where: { id: userId },
    data: { tokenBalance: { decrement: amount } },
  });
}

/** Tokens → Bound Tokens (1:1, solo un sentido) */
export async function convertToBound(userId, amount) {
  return prisma.$transaction(async (tx) => {
    await debitTokens(userId, amount, tx);
    return tx.user.update({
      where: { id: userId },
      data: { boundTokenBalance: { increment: amount } },
    });
  });
}

/** Retiro: solo Bound */
export async function debitBound(userId, amount, tx = prisma) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { boundTokenBalance: true },
  });
  if (!user || user.boundTokenBalance < amount) {
    throw new Error('Insufficient bound token balance');
  }
  return tx.user.update({
    where: { id: userId },
    data: { boundTokenBalance: { decrement: amount } },
  });
}

/** Retorno de Retiro: solo Bound */
export async function creditBound(userId, amount, tx = prisma) {
  return tx.user.update({
    where: { id: userId },
    data: { boundTokenBalance: { increment: amount } },
  });
}
