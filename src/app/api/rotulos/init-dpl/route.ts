import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST - Crear rótulos DPL por defecto para Datamax Mark II
 * Crea rótulos para pesaje individual con formato 5x10cm
 */
export async function POST(request: NextRequest) {
  try {
    const rotulosCreados = []

    // ========================================
    // RÓTULO PESAJE INDIVIDUAL - 5cm x 10cm
    // ========================================
    const rotuloPesajeIndividual = `
<STX>L
D11
H14
PG
C0010

; NÚMERO DE ANIMAL - MUY GRANDE Y RESALTADO
1K0180
1V0030
2f330
3c0000
eANIMAL #{NUMERO}

; TROPA
1K0180
1V0140
2f220
3c0000
eTROPA: {TROPA}

; PESO - DESTACADO
1K0180
1V0200
2f280
3c0000
ePESO: {PESO} kg

; FECHA
1K0180
1V0290
2f140
3c0000
e{FECHA}

; Fin de etiqueta
E
`.trim()

    // Verificar si ya existe
    const existentePesaje = await db.rotulo.findFirst({
      where: { 
        codigo: 'PESAJE_INDIVIDUAL_DPL',
        tipoImpresora: 'DATAMAX'
      }
    })

    if (!existentePesaje) {
      const nuevoRotulo = await db.rotulo.create({
        data: {
          nombre: 'Rótulo Pesaje Individual - Datamax 5x10cm',
          codigo: 'PESAJE_INDIVIDUAL_DPL',
          tipo: 'PESAJE_INDIVIDUAL',
          tipoImpresora: 'DATAMAX',
          modeloImpresora: 'MARK_II',
          contenido: rotuloPesajeIndividual,
          ancho: 100,  // 10cm
          alto: 50,    // 5cm
          dpi: 203,
          activo: true,
          esDefault: true,
          descripcion: 'Rótulo para pesaje individual - formato 5x10cm para Datamax Mark II. Muestra número de animal (resaltado), tropa y peso.',
          variables: JSON.stringify([
            { variable: 'NUMERO', campo: 'numero', descripcion: 'Número de animal' },
            { variable: 'TROPA', campo: 'tropa', descripcion: 'Código de tropa' },
            { variable: 'PESO', campo: 'peso', descripcion: 'Peso en kg' },
            { variable: 'FECHA', campo: 'fecha', descripcion: 'Fecha actual' }
          ])
        }
      })
      rotulosCreados.push(nuevoRotulo)
    }

    // ========================================
    // RÓTULO PESAJE INDIVIDUAL - Versión Compacta
    // ========================================
    const rotuloPesajeCompacto = `
<STX>L
D11
H14
PG
C0002

; Número animal GRANDE
1K0020
1V0020
2f440
3c0000
e{NUMERO}

; Tropa y Peso lado a lado
1K0020
1V0240
2f180
3c0000
eT:{TROPA}

1K0380
1V0240
2f180
3c0000
e{PESO}kg

E
`.trim()

    const existenteCompacto = await db.rotulo.findFirst({
      where: { 
        codigo: 'PESAJE_INDIVIDUAL_COMPACTO_DPL',
        tipoImpresora: 'DATAMAX'
      }
    })

    if (!existenteCompacto) {
      const nuevoRotulo = await db.rotulo.create({
        data: {
          nombre: 'Rótulo Pesaje Individual Compacto - Datamax',
          codigo: 'PESAJE_INDIVIDUAL_COMPACTO_DPL',
          tipo: 'PESAJE_INDIVIDUAL',
          tipoImpresora: 'DATAMAX',
          modeloImpresora: 'MARK_II',
          contenido: rotuloPesajeCompacto,
          ancho: 100,
          alto: 50,
          dpi: 203,
          activo: true,
          esDefault: false,
          descripcion: 'Rótulo compacto - Número grande al centro, tropa y peso en smaller.',
          variables: JSON.stringify([
            { variable: 'NUMERO', campo: 'numero', descripcion: 'Número de animal' },
            { variable: 'TROPA', campo: 'tropa', descripcion: 'Código de tropa' },
            { variable: 'PESO', campo: 'peso', descripcion: 'Peso en kg' }
          ])
        }
      })
      rotulosCreados.push(nuevoRotulo)
    }

    // ========================================
    // RÓTULO MEDIA RES - Para faena
    // ========================================
    const rotuloMediaRes = `
<STX>L
D11
H14
PG
C0010

; Header
1K0200
1V0010
2f180
3c0000
eSOLEMAR ALIMENTARIA

; Código de barras grande
1K0050
1V0050
2f280
3c0000
e{CODIGO}

; Número Garrón
1K0250
1V0120
2f220
3c0000
eGarron: {GARRON}

; Tropa
1K0250
1V0180
2f180
3c0000
eTropa: {TROPA}

; Peso
1K0250
1V0240
2f220
3c0000
ePeso: {PESO} kg

; Fecha
1K0250
1V0300
2f140
3c0000
e{FECHA} - Vence: {FECHA_VENC}

E
`.trim()

    const existenteMediaRes = await db.rotulo.findFirst({
      where: { 
        codigo: 'MEDIA_RES_DPL',
        tipoImpresora: 'DATAMAX'
      }
    })

    if (!existenteMediaRes) {
      const nuevoRotulo = await db.rotulo.create({
        data: {
          nombre: 'Rótulo Media Res - Datamax',
          codigo: 'MEDIA_RES_DPL',
          tipo: 'MEDIA_RES',
          tipoImpresora: 'DATAMAX',
          modeloImpresora: 'MARK_II',
          contenido: rotuloMediaRes,
          ancho: 80,
          alto: 120,
          dpi: 203,
          activo: true,
          esDefault: true,
          diasConsumo: 30,
          descripcion: 'Rótulo para medias reses con código, tropa, peso y fecha de vencimiento.',
          variables: JSON.stringify([
            { variable: 'CODIGO', campo: 'codigo', descripcion: 'Código completo' },
            { variable: 'GARRON', campo: 'garron', descripcion: 'Número de garrón' },
            { variable: 'TROPA', campo: 'tropa', descripcion: 'Código de tropa' },
            { variable: 'PESO', campo: 'peso', descripcion: 'Peso en kg' },
            { variable: 'FECHA', campo: 'fecha', descripcion: 'Fecha de faena' },
            { variable: 'FECHA_VENC', campo: 'fecha_venc', descripcion: 'Fecha de vencimiento' }
          ])
        }
      })
      rotulosCreados.push(nuevoRotulo)
    }

    return NextResponse.json({
      success: true,
      message: `${rotulosCreados.length} rótulos DPL creados para Datamax Mark II`,
      rotulos: rotulosCreados.map(r => ({
        id: r.id,
        nombre: r.nombre,
        codigo: r.codigo,
        tipo: r.tipo,
        tipoImpresora: r.tipoImpresora,
        esDefault: r.esDefault
      }))
    })

  } catch (error) {
    console.error('Error al crear rótulos DPL:', error)
    return NextResponse.json(
      { error: 'Error al crear rótulos DPL', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET - Listar rótulos DPL disponibles
 */
export async function GET() {
  try {
    const rotulos = await db.rotulo.findMany({
      where: {
        tipoImpresora: 'DATAMAX',
        activo: true
      },
      orderBy: [
        { tipo: 'asc' },
        { esDefault: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      count: rotulos.length,
      rotulos: rotulos.map(r => ({
        id: r.id,
        nombre: r.nombre,
        codigo: r.codigo,
        tipo: r.tipo,
        modeloImpresora: r.modeloImpresora,
        ancho: r.ancho,
        alto: r.alto,
        esDefault: r.esDefault
      }))
    })
  } catch (error) {
    console.error('Error al listar rótulos DPL:', error)
    return NextResponse.json(
      { error: 'Error al listar rótulos DPL' },
      { status: 500 }
    )
  }
}
