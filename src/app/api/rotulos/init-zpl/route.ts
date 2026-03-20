import { NextResponse } from 'next/server'
import { PrismaClient, TipoRotulo } from '@prisma/client'

const prisma = new PrismaClient()

// Rótulo ZPL por defecto para pesaje individual (10x5 cm)
const ZPL_PESAJE_INDIVIDUAL = `^XA
^FX Rótulo Pesaje Individual - SOLEMAR
^PW400
^LL200
^FO20,20^A0N,30,30^FD**SOLEMAR ALIMENTARIA**^FS
^FO20,60^A0N,40,40^FD#{{NUMERO}}^FS
^FO20,110^A0N,20,20^FDTropa: {{TROPA}}^FS
^FO200,110^A0N,20,20^FDTipo: {{TIPO}}^FS
^FO20,140^A0N,25,25^FD{{PESO}} kg^FS
^FO20,170^BCN,30,Y,Y,N^FD{{CODIGO}}^FS
^XZ`

// Rótulo ZPL para media res (8x12 cm)
const ZPL_MEDIA_RES = `^XA
^FX Rótulo Media Res - SOLEMAR
^PW320
^LL480
^FO10,10^A0N,25,25^FD**ROTULO DEFINITIVO**^FS
^FO10,40^A0N,20,20^FDSOLEMAR ALIMENTARIA^FS
^FO10,70^A0N,18,18^FDEst. N 3986^FS
^FO10,100^A0N,30,30^FD{{PRODUCTO}}^FS
^FO10,140^A0N,18,18^FDFecha: {{FECHA}}^FS
^FO160,140^A0N,18,18^FDTropa: {{TROPA}}^FS
^FO10,170^A0N,18,18^FDLado: {{LADO}}^FS
^FO160,170^A0N,18,18^FDPeso: {{PESO}} kg^FS
^FO10,210^A0N,15,15^FDConsumir antes: {{FECHA_VENC}}^FS
^FO10,250^BCN,50,Y,Y,N^FD{{CODIGO_BARRAS}}^FS
^XZ`

// Rótulo ZPL para menudencias (6x8 cm)
const ZPL_MENUDENCIA = `^XA
^FX Rótulo Menudencia - SOLEMAR
^PW240
^LL320
^FO10,10^A0N,20,20^FDSOLEMAR ALIMENTARIA^FS
^FO10,40^A0N,25,25^FD{{PRODUCTO}}^FS
^FO10,80^A0N,15,15^FDFecha: {{FECHA}}^FS
^FO130,80^A0N,15,15^FD{{PESO}}kg^FS
^FO10,110^A0N,12,12^FDVto: {{FECHA_VENC}}^FS
^FO10,150^BCN,40,Y,Y,N^FD{{CODIGO_BARRAS}}^FS
^XZ`

// Variables soportadas por cada rótulo
const VARIABLES_PESAJE = [
  { variable: '{{NUMERO}}', campo: 'numero', descripcion: 'Número de animal' },
  { variable: '{{TROPA}}', campo: 'tropa', descripcion: 'Código de tropa' },
  { variable: '{{TIPO}}', campo: 'tipoAnimal', descripcion: 'Tipo de animal' },
  { variable: '{{PESO}}', campo: 'pesoVivo', descripcion: 'Peso vivo' },
  { variable: '{{CODIGO}}', campo: 'codigo', descripcion: 'Código del animal' },
  { variable: '{{RAZA}}', campo: 'raza', descripcion: 'Raza' },
  { variable: '{{CARAVANA}}', campo: 'caravana', descripcion: 'Caravana' },
]

const VARIABLES_MEDIA_RES = [
  { variable: '{{PRODUCTO}}', campo: 'nombreProducto', descripcion: 'Nombre del producto' },
  { variable: '{{FECHA}}', campo: 'fechaFaena', descripcion: 'Fecha de faena' },
  { variable: '{{TROPA}}', campo: 'tropa', descripcion: 'Código de tropa' },
  { variable: '{{LADO}}', campo: 'ladoMedia', descripcion: 'Lado (I/D)' },
  { variable: '{{PESO}}', campo: 'peso', descripcion: 'Peso' },
  { variable: '{{FECHA_VENC}}', campo: 'fechaVencimiento', descripcion: 'Fecha vencimiento' },
  { variable: '{{CODIGO_BARRAS}}', campo: 'codigoBarras', descripcion: 'Código de barras' },
]

// POST - Inicializar rótulos ZPL por defecto
export async function POST() {
  try {
    // Verificar si ya existen rótulos
    const existentes = await prisma.rotulo.count()
    if (existentes > 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Ya existen rótulos en la base de datos',
        total: existentes 
      })
    }

    // Crear rótulos ZPL por defecto
    const rotulosDefault = [
      {
        nombre: 'Pesaje Individual - Estándar',
        codigo: 'PESAJE_IND_DEFAULT',
        tipo: TipoRotulo.PESAJE_INDIVIDUAL,
        categoria: 'PESAJE_INDIVIDUAL',
        tipoImpresora: 'ZEBRA',
        ancho: 100,
        alto: 50,
        dpi: 203,
        contenido: ZPL_PESAJE_INDIVIDUAL,
        variables: JSON.stringify(VARIABLES_PESAJE),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: true
      },
      {
        nombre: 'Media Res - Estándar',
        codigo: 'MEDIA_RES_DEFAULT',
        tipo: TipoRotulo.MEDIA_RES,
        categoria: 'MEDIA_RES',
        tipoImpresora: 'ZEBRA',
        ancho: 80,
        alto: 120,
        dpi: 203,
        contenido: ZPL_MEDIA_RES,
        variables: JSON.stringify(VARIABLES_MEDIA_RES),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: true
      },
      {
        nombre: 'Menudencia - Estándar',
        codigo: 'MENUDENCIA_DEFAULT',
        tipo: TipoRotulo.MENUDENCIA,
        categoria: 'MENUDENCIA',
        tipoImpresora: 'ZEBRA',
        ancho: 60,
        alto: 80,
        dpi: 203,
        contenido: ZPL_MENUDENCIA,
        variables: JSON.stringify([
          { variable: '{{PRODUCTO}}', campo: 'nombreProducto', descripcion: 'Producto' },
          { variable: '{{FECHA}}', campo: 'fechaFaena', descripcion: 'Fecha' },
          { variable: '{{PESO}}', campo: 'peso', descripcion: 'Peso' },
          { variable: '{{FECHA_VENC}}', campo: 'fechaVencimiento', descripcion: 'Vencimiento' },
          { variable: '{{CODIGO_BARRAS}}', campo: 'codigoBarras', descripcion: 'Código barras' },
        ]),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: true
      }
    ]

    let creados = 0
    for (const rotulo of rotulosDefault) {
      try {
        await prisma.rotulo.create({ data: rotulo })
        creados++
      } catch (e) {
        console.error(`Error creando rótulo ${rotulo.codigo}:`, e)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Rótulos ZPL inicializados correctamente',
      total: creados 
    })
  } catch (error) {
    console.error('Error al inicializar rótulos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al inicializar rótulos' },
      { status: 500 }
    )
  }
}

// GET - Verificar estado de rótulos
export async function GET() {
  try {
    const total = await prisma.rotulo.count()
    const activos = await prisma.rotulo.count({ where: { activo: true } })
    const defaults = await prisma.rotulo.count({ where: { esDefault: true } })
    
    const porCategoria = await prisma.rotulo.groupBy({
      by: ['categoria'],
      _count: { id: true },
      where: { activo: true }
    })

    return NextResponse.json({
      success: true,
      total,
      activos,
      defaults,
      porCategoria: porCategoria.map(p => ({
        categoria: p.categoria,
        cantidad: p._count.id
      }))
    })
  } catch (error) {
    console.error('Error al obtener estado de rótulos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estado' },
      { status: 500 }
    )
  }
}
