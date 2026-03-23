import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const activos = searchParams.get('activos');

    const where: Record<string, unknown> = {};
    if (activos === 'true') {
      where.activo = true;
    }
    if (tipo === 'usuarioFaena') {
      where.esUsuarioFaena = true;
    }
    if (tipo === 'productor') {
      where.esProductor = true;
    }
    if (tipo === 'consignatario') {
      where.esConsignatario = true;
    }

    const usuarios = await db.usuario.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const usuario = await db.usuario.create({
      data: {
        nombre: data.nombre,
        cuit: data.cuit || null,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        esUsuarioFaena: data.esUsuarioFaena ?? false,
        esProductor: data.esProductor ?? false,
        esConsignatario: data.esConsignatario ?? false,
        esProveedor: data.esProveedor ?? false,
        observaciones: data.observaciones,
        activo: data.activo ?? true,
      }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const usuario = await db.usuario.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        cuit: data.cuit,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        esUsuarioFaena: data.esUsuarioFaena,
        esProductor: data.esProductor,
        esConsignatario: data.esConsignatario,
        esProveedor: data.esProveedor,
        observaciones: data.observaciones,
        activo: data.activo,
      }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db.usuario.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
