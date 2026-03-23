import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar proveedores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activos = searchParams.get('activos');
    const tipo = searchParams.get('tipo');

    const where: Record<string, unknown> = {};
    if (activos === 'true') {
      where.activo = true;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    const proveedores = await db.proveedor.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 });
  }
}

// POST - Crear proveedor
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const proveedor = await db.proveedor.create({
      data: {
        nombre: data.nombre,
        cuit: data.cuit || null,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        tipo: data.tipo,
        contacto: data.contacto,
        observaciones: data.observaciones,
        activo: data.activo ?? true,
      }
    });

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 });
  }
}

// PUT - Actualizar proveedor
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const proveedor = await db.proveedor.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        cuit: data.cuit,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        tipo: data.tipo,
        contacto: data.contacto,
        observaciones: data.observaciones,
        activo: data.activo,
      }
    });

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}

// DELETE - Eliminar proveedor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db.proveedor.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 });
  }
}
