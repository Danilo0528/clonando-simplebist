import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { 
  getMarketItems, 
  purchaseMarketItem, 
  getUserInventory,
  createMarketItem,
  updateMarketItem,
  deleteMarketItem
} from '../../../lib/market';

// ✅ GET: Obtener items del mercado o inventario del usuario
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const mockReq = {
      headers: {
        authorization: authHeader,
        cookie: cookieHeader,
      },
    };

    const user = await getUserFromRequest(mockReq);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Verificar si es solicitud de inventario
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');

    if (view === 'inventory') {
      // Obtener inventario del usuario
      const inventory = await getUserInventory(user.id);
      return NextResponse.json(inventory);
    }

    // Por defecto, obtener items del mercado
    const items = await getMarketItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in market GET:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ POST: Comprar un item del mercado
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const mockReq = {
      headers: {
        authorization: authHeader,
        cookie: cookieHeader,
      },
    };

    const user = await getUserFromRequest(mockReq);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity < 1) {
      return NextResponse.json(
        { message: 'Invalid item ID or quantity' },
        { status: 400 }
      );
    }

    // ✅ Ejecutar compra con transacción ACID
    try {
      const result = await purchaseMarketItem(user.id, parseInt(itemId), parseInt(quantity));
      return NextResponse.json(result);
    } catch (error) {
      // Si es error de saldo insuficiente, devolver 400
      if (error.message.includes('Insufficient balance')) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
      // Si el item no existe
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { message: error.message },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in market POST:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ PUT: Actualizar un item del mercado (admin)
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const mockReq = {
      headers: {
        authorization: authHeader,
        cookie: cookieHeader,
      },
    };

    const user = await getUserFromRequest(mockReq);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Verificar que es admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { message: 'Admin privileges required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId, ...updateData } = body;

    if (!itemId) {
      return NextResponse.json(
        { message: 'Item ID is required' },
        { status: 400 }
      );
    }

    const updatedItem = await updateMarketItem(parseInt(itemId), updateData);
    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Error in market PUT:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Eliminar un item del mercado (admin)
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const mockReq = {
      headers: {
        authorization: authHeader,
        cookie: cookieHeader,
      },
    };

    const user = await getUserFromRequest(mockReq);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Verificar que es admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { message: 'Admin privileges required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { message: 'Item ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteMarketItem(parseInt(itemId));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in market DELETE:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
