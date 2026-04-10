import prisma from './prisma';

// ✅ NUEVO: Transacción ACID para compra de hardware en el mercado
export const purchaseMarketItem = async (userId, itemId, quantity = 1) => {
  try {
    // Iniciar transacción atómica (ACID)
    const result = await prisma.$transaction(async (tx) => {
      // PASO 1: Obtener el item del mercado y verificar que existe y está activo
      const marketItem = await tx.marketItem.findUnique({
        where: { id: itemId },
      });

      if (!marketItem) {
        throw new Error('Market item not found');
      }

      if (!marketItem.isActive) {
        throw new Error('This item is no longer available');
      }

      // PASO 2: Verificar que el usuario tiene saldo suficiente
      const user = await tx.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          balance: true,
          tokenBalance: true,
          hashpowerVirtual: true,
          totalHashrate: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const totalCost = marketItem.price * quantity;

      // Verificar saldo suficiente
      if (user.tokenBalance < totalCost) {
        throw new Error(`Insufficient balance. Required: ${totalCost} SBT, Available: ${user.tokenBalance.toFixed(2)} SBT`);
      }

      // PASO 3: Descontar el saldo del usuario (SOLO tokenBalance)
      const updatedUser = await tx.user.update({
        where: { id: parseInt(userId) },
        data: {
          tokenBalance: { decrement: totalCost },
        },
      });

      // PASO 4: Añadir el item al inventario del usuario
      // Verificar si ya tiene este item en inventario para stackear
      const existingInventory = await tx.inventoryItem.findFirst({
        where: {
          userId: parseInt(userId),
          itemId: itemId,
          // Solo stackear si no tiene fecha de expiración
          expiresAt: null,
        },
      });

      if (existingInventory) {
        // Si ya existe, actualizar cantidad
        await tx.inventoryItem.update({
          where: { id: existingInventory.id },
          data: {
            quantity: { increment: quantity },
          },
        });
      } else {
        // Si no existe, crear nuevo registro
        await tx.inventoryItem.create({
          data: {
            userId: parseInt(userId),
            itemId: itemId,
            itemName: marketItem.name,
            itemType: marketItem.type,
            hashrate: marketItem.hashrate,
            quantity: quantity,
          },
        });
      }

      // PASO 5: Actualizar el total_hashrate del perfil si es hardware
      if (marketItem.type === 'hardware' && marketItem.hashrate > 0) {
        const totalHashrateToAdd = marketItem.hashrate * quantity;
        await tx.user.update({
          where: { id: parseInt(userId) },
          data: {
            totalHashrate: { increment: totalHashrateToAdd },
            hashpowerVirtual: { increment: totalHashrateToAdd },
          },
        });
      }

      // Retornar información de la compra
      return {
        user: updatedUser,
        item: marketItem,
        quantity,
        totalCost,
        newBalance: updatedUser.tokenBalance,
      };
    }, {
      // Timeout de 10 segundos para la transacción
      timeout: 10000,
    });

    // Si llegamos aquí, la transacción fue exitosa
    return {
      success: true,
      message: `Successfully purchased ${result.quantity}x ${result.item.name} for ${result.totalCost} SBT`,
      itemName: result.item.name,
      quantity: result.quantity,
      totalCost: result.totalCost,
      newBalance: result.newBalance,
    };
  } catch (error) {
    // ✅ Si algún paso falla, la transacción se revierte automáticamente (ROLLBACK)
    console.error('Market purchase failed (rolled back):', error);
    throw error;
  }
};

// ✅ NUEVO: Obtener lista de items del mercado
export const getMarketItems = async (activeOnly = true) => {
  try {
    const items = await prisma.marketItem.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { price: 'asc' },
    });

    return items;
  } catch (error) {
    console.error('Error fetching market items:', error);
    throw error;
  }
};

// ✅ NUEVO: Obtener inventario del usuario
export const getUserInventory = async (userId) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      where: {
        userId: parseInt(userId),
        quantity: { gt: 0 }, // Solo items con cantidad > 0
      },
      orderBy: { purchasedAt: 'desc' },
    });

    // Calcular hashrate total del inventario
    const totalHashrate = inventory.reduce((sum, item) => {
      return sum + (item.hashrate * item.quantity);
    }, 0);

    return {
      items: inventory,
      totalItems: inventory.length,
      totalHashrate,
    };
  } catch (error) {
    console.error('Error fetching user inventory:', error);
    throw error;
  }
};

// ✅ NUEVO: Crear un item en el mercado (admin)
export const createMarketItem = async (itemData) => {
  try {
    const newItem = await prisma.marketItem.create({
      data: {
        name: itemData.name,
        description: itemData.description || null,
        price: itemData.price,
        type: itemData.type,
        hashrate: itemData.hashrate || 0,
        image: itemData.image || null,
        isActive: itemData.isActive !== undefined ? itemData.isActive : true,
      },
    });

    return newItem;
  } catch (error) {
    console.error('Error creating market item:', error);
    throw error;
  }
};

// ✅ NUEVO: Actualizar un item del mercado (admin)
export const updateMarketItem = async (itemId, updateData) => {
  try {
    const updatedItem = await prisma.marketItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return updatedItem;
  } catch (error) {
    console.error('Error updating market item:', error);
    throw error;
  }
};

// ✅ NUEVO: Eliminar un item del mercado (admin)
export const deleteMarketItem = async (itemId) => {
  try {
    await prisma.marketItem.delete({
      where: { id: itemId },
    });

    return { success: true, message: 'Item deleted successfully' };
  } catch (error) {
    console.error('Error deleting market item:', error);
    throw error;
  }
};
