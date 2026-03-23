import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { EstadoFactura } from '@prisma/client'

// GET - Listar aplicaciones de pagos a facturas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagoId = searchParams.get('pagoId')
    const facturaId = searchParams.get('facturaId')

    const where: Record<string, unknown> = {}

    if (pagoId) {
      where.pagoId = pagoId
    }

    if (facturaId) {
      where.facturaId = facturaId
    }

    const aplicaciones = await db.pagoFactura.findMany({
      where,
      include: {
        pago: {
          include: {
            formaPago: true,
            cheque: true
          }
        },
        factura: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                cuit: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: aplicaciones
    })
  } catch (error) {
    console.error('Error al obtener aplicaciones de pagos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener aplicaciones de pagos' },
      { status: 500 }
    )
  }
}

// POST - Aplicar pago a factura
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validaciones
    if (!data.pagoId) {
      return NextResponse.json(
        { success: false, error: 'El pago es requerido' },
        { status: 400 }
      )
    }
    if (!data.facturaId) {
      return NextResponse.json(
        { success: false, error: 'La factura es requerida' },
        { status: 400 }
      )
    }
    if (!data.monto || data.monto <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el pago existe y no está anulado
    const pago = await db.pago.findUnique({
      where: { id: data.pagoId }
    })
    if (!pago) {
      return NextResponse.json(
        { success: false, error: 'Pago no encontrado' },
        { status: 404 }
      )
    }
    if (pago.estado === 'ANULADO') {
      return NextResponse.json(
        { success: false, error: 'No se puede aplicar un pago anulado' },
        { status: 400 }
      )
    }

    // Verificar que la factura existe y no está anulada
    const factura = await db.factura.findUnique({
      where: { id: data.facturaId },
      include: {
        pagosAplicados: {
          include: { pago: true }
        }
      }
    })
    if (!factura) {
      return NextResponse.json(
        { success: false, error: 'Factura no encontrada' },
        { status: 404 }
      )
    }
    if (factura.estado === 'ANULADA') {
      return NextResponse.json(
        { success: false, error: 'No se puede aplicar un pago a una factura anulada' },
        { status: 400 }
      )
    }

    // Verificar que no existe ya esta aplicación
    const existente = await db.pagoFactura.findUnique({
      where: {
        pagoId_facturaId: {
          pagoId: data.pagoId,
          facturaId: data.facturaId
        }
      }
    })
    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Este pago ya está aplicado a esta factura' },
        { status: 400 }
      )
    }

    // Calcular el total ya pagado
    const totalPagadoActual = factura.pagosAplicados
      .filter(pf => pf.pago.estado !== 'ANULADO')
      .reduce((sum, pf) => sum + pf.monto, 0)

    // Verificar que no se exceda el total de la factura
    const nuevoTotalPagado = totalPagadoActual + Number(data.monto)
    if (nuevoTotalPagado > factura.total) {
      return NextResponse.json(
        { success: false, error: `El monto excede el saldo de la factura. Saldo pendiente: $${(factura.total - totalPagadoActual).toFixed(2)}` },
        { status: 400 }
      )
    }

    // Crear la aplicación de pago
    const aplicacion = await db.pagoFactura.create({
      data: {
        pagoId: data.pagoId,
        facturaId: data.facturaId,
        monto: Number(data.monto)
      },
      include: {
        pago: {
          include: {
            formaPago: true,
            cheque: true
          }
        },
        factura: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                cuit: true
              }
            }
          }
        }
      }
    })

    // Actualizar estado de la factura automáticamente
    const nuevoEstado: EstadoFactura = nuevoTotalPagado >= factura.total ? 'PAGADA' : 'EMITIDA'
    
    await db.factura.update({
      where: { id: data.facturaId },
      data: {
        estado: nuevoEstado,
        fechaPago: nuevoEstado === 'PAGADA' ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: aplicacion,
      message: nuevoEstado === 'PAGADA' 
        ? 'Pago aplicado. Factura pagada completamente.' 
        : `Pago aplicado. Saldo pendiente: $${(factura.total - nuevoTotalPagado).toFixed(2)}`
    })
  } catch (error) {
    console.error('Error al aplicar pago a factura:', error)
    return NextResponse.json(
      { success: false, error: 'Error al aplicar pago a factura' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar monto de aplicación
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar que existe
    const existente = await db.pagoFactura.findUnique({
      where: { id: data.id },
      include: {
        pago: true,
        factura: {
          include: {
            pagosAplicados: {
              include: { pago: true }
            }
          }
        }
      }
    })
    if (!existente) {
      return NextResponse.json(
        { success: false, error: 'Aplicación no encontrada' },
        { status: 404 }
      )
    }

    // No permitir modificar si el pago está anulado
    if (existente.pago.estado === 'ANULADO') {
      return NextResponse.json(
        { success: false, error: 'No se puede modificar una aplicación de un pago anulado' },
        { status: 400 }
      )
    }

    const nuevoMonto = Number(data.monto)

    // Calcular el total pagado sin esta aplicación
    const totalOtrosPagos = existente.factura.pagosAplicados
      .filter(pf => pf.pago.estado !== 'ANULADO' && pf.id !== data.id)
      .reduce((sum, pf) => sum + pf.monto, 0)

    // Verificar que no se exceda el total de la factura
    const nuevoTotalPagado = totalOtrosPagos + nuevoMonto
    if (nuevoTotalPagado > existente.factura.total) {
      return NextResponse.json(
        { success: false, error: `El monto excede el saldo de la factura. Saldo pendiente: $${(existente.factura.total - totalOtrosPagos).toFixed(2)}` },
        { status: 400 }
      )
    }

    // Actualizar la aplicación
    const aplicacion = await db.pagoFactura.update({
      where: { id: data.id },
      data: { monto: nuevoMonto },
      include: {
        pago: {
          include: {
            formaPago: true,
            cheque: true
          }
        },
        factura: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                cuit: true
              }
            }
          }
        }
      }
    })

    // Actualizar estado de la factura
    const nuevoEstado: EstadoFactura = nuevoTotalPagado >= existente.factura.total ? 'PAGADA' : 'EMITIDA'
    
    await db.factura.update({
      where: { id: existente.facturaId },
      data: {
        estado: nuevoEstado,
        fechaPago: nuevoEstado === 'PAGADA' ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: aplicacion
    })
  } catch (error) {
    console.error('Error al actualizar aplicación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar aplicación' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar aplicación de pago
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar que existe
    const aplicacion = await db.pagoFactura.findUnique({
      where: { id },
      include: {
        factura: {
          include: {
            pagosAplicados: {
              include: { pago: true }
            }
          }
        }
      }
    })
    if (!aplicacion) {
      return NextResponse.json(
        { success: false, error: 'Aplicación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la aplicación
    await db.pagoFactura.delete({
      where: { id }
    })

    // Calcular el nuevo total pagado
    const totalPagado = aplicacion.factura.pagosAplicados
      .filter(pf => pf.pago.estado !== 'ANULADO' && pf.id !== id)
      .reduce((sum, pf) => sum + pf.monto, 0)

    // Actualizar estado de la factura
    const nuevoEstado: EstadoFactura = totalPagado >= aplicacion.factura.total ? 'PAGADA' : 
                                       totalPagado > 0 ? 'EMITIDA' : 'EMITIDA'

    await db.factura.update({
      where: { id: aplicacion.facturaId },
      data: {
        estado: nuevoEstado,
        fechaPago: nuevoEstado === 'PAGADA' ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Aplicación de pago eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar aplicación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar aplicación' },
      { status: 500 }
    )
  }
}
