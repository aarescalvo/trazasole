import { NextResponse } from 'next/server'
import { PrismaClient, TipoRotulo } from '@prisma/client'

const prisma = new PrismaClient()

// ==================== PLANTILLAS ZEBRA (ZPL) ====================
// Optimizadas para Zebra ZT410 (300 DPI) y ZT230 (203 DPI)

// Rótulo ZPL para pesaje individual - 10x5 cm (ZT410/ZT230)
const ZPL_PESAJE_INDIVIDUAL_203 = `^XA
^FX Rótulo Pesaje Individual - SOLEMAR - 203 DPI
^PW400
^LL200
^CI28
^FO20,15^A0N,28,28^FD**SOLEMAR ALIMENTARIA**^FS
^FO20,50^A0N,48,48^FD#{{NUMERO}}^FS
^FO20,105^A0N,18,18^FDTropa: {{TROPA}}^FS
^FO200,105^A0N,18,18^FDTipo: {{TIPO}}^FS
^FO20,130^A0N,22,22^FD{{PESO}} kg^FS
^FO150,130^A0N,16,16^FD{{RAZA}}^FS
^FO20,160^BCN,30,Y,Y,N^FD{{CODIGO}}^FS
^XZ`

// Rótulo ZPL para pesaje individual - 300 DPI (ZT410)
const ZPL_PESAJE_INDIVIDUAL_300 = `^XA
^FX Rótulo Pesaje Individual - SOLEMAR - 300 DPI
^PW590
^LL295
^CI28
^FO30,22^A0N,42,42^FD**SOLEMAR ALIMENTARIA**^FS
^FO30,74^A0N,72,72^FD#{{NUMERO}}^FS
^FO30,155^A0N,27,27^FDTropa: {{TROPA}}^FS
^FO300,155^A0N,27,27^FDTipo: {{TIPO}}^FS
^FO30,192^A0N,33,33^FD{{PESO}} kg^FS
^FO225,192^A0N,24,24^FD{{RAZA}}^FS
^FO30,236^BCN,45,Y,Y,N^FD{{CODIGO}}^FS
^XZ`

// Rótulo ZPL para media res - 8x12 cm
const ZPL_MEDIA_RES_203 = `^XA
^FX Rótulo Media Res - SOLEMAR - 203 DPI
^PW320
^LL480
^CI28
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
^FO10,320^A0N,12,12^FDConservar a -1.5C a 4C^FS
^XZ`

// Rótulo ZPL para menudencias - 6x8 cm
const ZPL_MENUDENCIA_203 = `^XA
^FX Rótulo Menudencia - SOLEMAR - 203 DPI
^PW240
^LL320
^CI28
^FO10,10^A0N,20,20^FDSOLEMAR ALIMENTARIA^FS
^FO10,40^A0N,25,25^FD{{PRODUCTO}}^FS
^FO10,80^A0N,15,15^FDFecha: {{FECHA}}^FS
^FO130,80^A0N,15,15^FD{{PESO}}kg^FS
^FO10,110^A0N,12,12^FDVto: {{FECHA_VENC}}^FS
^FO10,150^BCN,40,Y,Y,N^FD{{CODIGO_BARRAS}}^FS
^FO10,210^A0N,10,10^FDConservar a -1.5C a 4C^FS
^XZ`

// ==================== PLANTILLAS DATAMAX (DPL) ====================
// Optimizadas para Datamax Mark II

// Rótulo DPL para pesaje individual - 10x5 cm (Datamax Mark II)
const DPL_PESAJE_INDIVIDUAL = `<STX>C
<STX>E
<STX>H10
<STX>O0220
<STX>f320
<STX>c0400
<STX>d1
<STX>D
<STX>191100401000025SOLEMAR ALIMENTARIA
<STX>191100601500050#{{NUMERO}}
<STX>191100401000105Tropa: {TROPA}
<STX>191100402000105Tipo: {TIPO}
<STX>191100401000130{{PESO}} kg
<STX>191100401500130{RAZA}
<STX>1e000200001600080{{CODIGO}}
<ETX>`

// Rótulo DPL para media res - 8x12 cm (Datamax Mark II)
const DPL_MEDIA_RES = `<STX>C
<STX>E
<STX>H10
<STX>O0220
<STX>f480
<STX>c0320
<STX>d1
<STX>D
<STX>191100201000010ROTULO DEFINITIVO
<STX>191100201000040SOLEMAR ALIMENTARIA
<STX>191100201000070Est. N 3986
<STX>191100301000100{PRODUCTO}
<STX>191100201000140Fecha: {FECHA}
<STX>191100201600140Tropa: {TROPA}
<STX>191100201000170Lado: {LADO}
<STX>191100201600170Peso: {PESO} kg
<STX>191100151000210Consumir antes: {FECHA_VENC}
<STX>1e00020000100250080{CODIGO_BARRAS}
<ETX>`

// Rótulo DPL para menudencias - 6x8 cm (Datamax Mark II)
const DPL_MENUDENCIA = `<STX>C
<STX>E
<STX>H10
<STX>O0220
<STX>f320
<STX>c0240
<STX>d1
<STX>D
<STX>191100201000010SOLEMAR ALIMENTARIA
<STX>191100251000040{PRODUCTO}
<STX>191100151000080Fecha: {FECHA}
<STX>191100151300080{PESO}kg
<STX>191100121000110Vto: {FECHA_VENC}
<STX>1e00020000100150070{CODIGO_BARRAS}
<ETX>`

// ==================== VARIABLES SOPORTADAS ====================
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

const VARIABLES_MENUDENCIA = [
  { variable: '{{PRODUCTO}}', campo: 'nombreProducto', descripcion: 'Producto' },
  { variable: '{{FECHA}}', campo: 'fechaFaena', descripcion: 'Fecha' },
  { variable: '{{PESO}}', campo: 'peso', descripcion: 'Peso' },
  { variable: '{{FECHA_VENC}}', campo: 'fechaVencimiento', descripcion: 'Vencimiento' },
  { variable: '{{CODIGO_BARRAS}}', campo: 'codigoBarras', descripcion: 'Código barras' },
]

// Variables DPL (sin dobles llaves)
const VARIABLES_PESAJE_DPL = [
  { variable: '{NUMERO}', campo: 'numero', descripcion: 'Número de animal' },
  { variable: '{TROPA}', campo: 'tropa', descripcion: 'Código de tropa' },
  { variable: '{TIPO}', campo: 'tipoAnimal', descripcion: 'Tipo de animal' },
  { variable: '{PESO}', campo: 'pesoVivo', descripcion: 'Peso vivo' },
  { variable: '{CODIGO}', campo: 'codigo', descripcion: 'Código del animal' },
  { variable: '{RAZA}', campo: 'raza', descripcion: 'Raza' },
  { variable: '{CARAVANA}', campo: 'caravana', descripcion: 'Caravana' },
]

const VARIABLES_MEDIA_RES_DPL = [
  { variable: '{PRODUCTO}', campo: 'nombreProducto', descripcion: 'Nombre del producto' },
  { variable: '{FECHA}', campo: 'fechaFaena', descripcion: 'Fecha de faena' },
  { variable: '{TROPA}', campo: 'tropa', descripcion: 'Código de tropa' },
  { variable: '{LADO}', campo: 'ladoMedia', descripcion: 'Lado (I/D)' },
  { variable: '{PESO}', campo: 'peso', descripcion: 'Peso' },
  { variable: '{FECHA_VENC}', campo: 'fechaVencimiento', descripcion: 'Fecha vencimiento' },
  { variable: '{CODIGO_BARRAS}', campo: 'codigoBarras', descripcion: 'Código de barras' },
]

// POST - Inicializar rótulos por defecto (Zebra y Datamax)
export async function POST() {
  try {
    // Verificar si ya existen rótulos
    const existentes = await prisma.rotulo.count()
    
    // Rótulos ZPL (Zebra ZT410/ZT230)
    const rotulosZebra = [
      {
        nombre: 'Pesaje Individual - Zebra ZT230 (203dpi)',
        codigo: 'PESAJE_IND_ZEBRA_203',
        tipo: TipoRotulo.PESAJE_INDIVIDUAL,
        categoria: 'PESAJE_INDIVIDUAL',
        tipoImpresora: 'ZEBRA',
        modeloImpresora: 'ZT230',
        ancho: 100,
        alto: 50,
        dpi: 203,
        contenido: ZPL_PESAJE_INDIVIDUAL_203,
        variables: JSON.stringify(VARIABLES_PESAJE),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: true
      },
      {
        nombre: 'Pesaje Individual - Zebra ZT410 (300dpi)',
        codigo: 'PESAJE_IND_ZEBRA_300',
        tipo: TipoRotulo.PESAJE_INDIVIDUAL,
        categoria: 'PESAJE_INDIVIDUAL',
        tipoImpresora: 'ZEBRA',
        modeloImpresora: 'ZT410',
        ancho: 100,
        alto: 50,
        dpi: 300,
        contenido: ZPL_PESAJE_INDIVIDUAL_300,
        variables: JSON.stringify(VARIABLES_PESAJE),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: false
      },
      {
        nombre: 'Media Res - Zebra ZT230 (203dpi)',
        codigo: 'MEDIA_RES_ZEBRA_203',
        tipo: TipoRotulo.MEDIA_RES,
        categoria: 'MEDIA_RES',
        tipoImpresora: 'ZEBRA',
        modeloImpresora: 'ZT230',
        ancho: 80,
        alto: 120,
        dpi: 203,
        contenido: ZPL_MEDIA_RES_203,
        variables: JSON.stringify(VARIABLES_MEDIA_RES),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: true
      },
      {
        nombre: 'Menudencia - Zebra ZT230 (203dpi)',
        codigo: 'MENUDENCIA_ZEBRA_203',
        tipo: TipoRotulo.MENUDENCIA,
        categoria: 'MENUDENCIA',
        tipoImpresora: 'ZEBRA',
        modeloImpresora: 'ZT230',
        ancho: 60,
        alto: 80,
        dpi: 203,
        contenido: ZPL_MENUDENCIA_203,
        variables: JSON.stringify(VARIABLES_MENUDENCIA),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: true
      }
    ]

    // Rótulos DPL (Datamax Mark II)
    const rotulosDatamax = [
      {
        nombre: 'Pesaje Individual - Datamax Mark II',
        codigo: 'PESAJE_IND_DATAMAX',
        tipo: TipoRotulo.PESAJE_INDIVIDUAL,
        categoria: 'PESAJE_INDIVIDUAL',
        tipoImpresora: 'DATAMAX',
        modeloImpresora: 'MARK_II',
        ancho: 100,
        alto: 50,
        dpi: 203,
        contenido: DPL_PESAJE_INDIVIDUAL,
        variables: JSON.stringify(VARIABLES_PESAJE_DPL),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: false
      },
      {
        nombre: 'Media Res - Datamax Mark II',
        codigo: 'MEDIA_RES_DATAMAX',
        tipo: TipoRotulo.MEDIA_RES,
        categoria: 'MEDIA_RES',
        tipoImpresora: 'DATAMAX',
        modeloImpresora: 'MARK_II',
        ancho: 80,
        alto: 120,
        dpi: 203,
        contenido: DPL_MEDIA_RES,
        variables: JSON.stringify(VARIABLES_MEDIA_RES_DPL),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: false
      },
      {
        nombre: 'Menudencia - Datamax Mark II',
        codigo: 'MENUDENCIA_DATAMAX',
        tipo: TipoRotulo.MENUDENCIA,
        categoria: 'MENUDENCIA',
        tipoImpresora: 'DATAMAX',
        modeloImpresora: 'MARK_II',
        ancho: 60,
        alto: 80,
        dpi: 203,
        contenido: DPL_MENUDENCIA,
        variables: JSON.stringify([
          { variable: '{PRODUCTO}', campo: 'nombreProducto', descripcion: 'Producto' },
          { variable: '{FECHA}', campo: 'fechaFaena', descripcion: 'Fecha' },
          { variable: '{PESO}', campo: 'peso', descripcion: 'Peso' },
          { variable: '{FECHA_VENC}', campo: 'fechaVencimiento', descripcion: 'Vencimiento' },
          { variable: '{CODIGO_BARRAS}', campo: 'codigoBarras', descripcion: 'Código barras' },
        ]),
        diasConsumo: 30,
        temperaturaMax: 5.0,
        activo: true,
        esDefault: false
      }
    ]

    const todosRotulos = [...rotulosZebra, ...rotulosDatamax]
    let creados = 0
    let actualizados = 0

    for (const rotulo of todosRotulos) {
      try {
        // Verificar si ya existe por código
        const existente = await prisma.rotulo.findUnique({
          where: { codigo: rotulo.codigo }
        })
        
        if (existente) {
          // Actualizar contenido
          await prisma.rotulo.update({
            where: { codigo: rotulo.codigo },
            data: { 
              contenido: rotulo.contenido,
              variables: rotulo.variables
            }
          })
          actualizados++
        } else {
          await prisma.rotulo.create({ data: rotulo })
          creados++
        }
      } catch (e) {
        console.error(`Error procesando rótulo ${rotulo.codigo}:`, e)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Rótulos inicializados correctamente',
      creados,
      actualizados,
      total: creados + actualizados,
      impresorasSoportadas: [
        { marca: 'Zebra', modelos: ['ZT410 (300 DPI)', 'ZT230 (203 DPI)'], formato: 'ZPL' },
        { marca: 'Datamax', modelos: ['Mark II'], formato: 'DPL' }
      ]
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
    
    const zebra = await prisma.rotulo.count({ where: { tipoImpresora: 'ZEBRA' } })
    const datamax = await prisma.rotulo.count({ where: { tipoImpresora: 'DATAMAX' } })
    
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
      porTipoImpresora: {
        zebra,
        datamax
      },
      impresorasSoportadas: [
        { marca: 'Zebra', modelos: ['ZT410', 'ZT230'], formato: 'ZPL', dpi: [203, 300] },
        { marca: 'Datamax', modelos: ['Mark II'], formato: 'DPL', dpi: [203] }
      ],
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
