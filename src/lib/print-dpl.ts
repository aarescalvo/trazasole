/**
 * Utilidad de impresión DPL para impresoras Datamax Mark II
 * Formato de rótulo: 5cm x 10cm (203 DPI)
 * 
 * DPL (Datamax Programming Language) - Comandos básicos:
 * ^L = Inicio de formato de etiqueta
 * E = Fin de formato y impresión
 * H = Posición horizontal (en dots)
 * V = Posición vertical (en dots)
 * n = Tamaño de texto pequeño
 * N = Tamaño de texto mediano
 * W = Tamaño de texto grande
 * B = Código de barras
 */

// Dimensiones del rótulo 5x10cm a 203 DPI
const LABEL_WIDTH_MM = 100 // 10 cm = 100mm
const LABEL_HEIGHT_MM = 50  // 5 cm = 50mm
const DPI = 203

// Conversión mm a dots (203 DPI)
const mmToDots = (mm: number) => Math.round(mm * DPI / 25.4)

interface DatosRotulo {
  tropa: string
  numeroAnimal: number | string
  peso: number | string
  fecha?: string
}

/**
 * Genera código DPL para imprimir rótulo de pesaje individual
 * Formato: 5cm alto x 10cm ancho (etiqueta horizontal)
 * Contenido:
 *   - Número de animal (RESALTADO - tamaño grande)
 *   - Número de tropa
 *   - Peso en kg
 */
export function generarRotuloDPL(datos: DatosRotulo): string {
  const labelWidth = mmToDots(LABEL_WIDTH_MM)   // ~800 dots
  const labelHeight = mmToDots(LABEL_HEIGHT_MM) // ~400 dots
  
  const tropa = datos.tropa || ''
  const numero = String(datos.numeroAnimal || '0')
  const peso = String(datos.peso || '0')
  const fecha = datos.fecha || new Date().toLocaleDateString('es-AR')

  // Código DPL para Datamax Mark II
  // Usamos comandos DPL estándar
  let dpl = ''

  // Iniciar formato de etiqueta
  dpl += '\x02L\n'           // STX + L = Inicio de formato
  dpl += 'D11\n'             // Configuración de dimensiones
  dpl += 'H15\n'             // Velocidad de impresión
  dpl += 'PC\n'              // Print configuration
  dpl += 'ySPM\n'            // Modo de impresión
  
  // ===== NÚMERO DE ANIMAL (RESALTADO - MUY GRANDE) =====
  // Centrado horizontalmente, grande y visible
  const numeroY = 50         // Posición vertical (arriba)
  const numeroX = 150        // Posición horizontal (izquierda centrada)
  
  // Texto grande para el número de animal - usando fuente 5 (grande)
  dpl += `1${String(numeroX).padStart(4, '0')}\n`  // Posición X
  dpl += `1${String(numeroY).padStart(3, '0')}\n`  // Posición Y
  dpl += 'f320\n'            // Fuente grande
  dpl += 'c0000\n'           // Color negro
  dpl += 'N\n'               // Sin rotación
  dpl += `eANIMAL #${numero}\n`  // Texto del número

  // ===== TROPA =====
  const tropaY = 150
  const tropaX = 150
  
  dpl += `1${String(tropaX).padStart(4, '0')}\n`
  dpl += `1${String(tropaY).padStart(3, '0')}\n`
  dpl += 'f220\n'            // Fuente mediana
  dpl += 'c0000\n'
  dpl += 'N\n'
  dpl += `eTROPA: ${tropa}\n`

  // ===== PESO =====
  const pesoY = 220
  const pesoX = 150
  
  dpl += `1${String(pesoX).padStart(4, '0')}\n`
  dpl += `1${String(pesoY).padStart(3, '0')}\n`
  dpl += 'f270\n'            // Fuente grande para peso
  dpl += 'c0000\n'
  dpl += 'N\n'
  dpl += `ePESO: ${peso} kg\n`

  // ===== FECHA (opcional) =====
  const fechaY = 300
  const fechaX = 150
  
  dpl += `1${String(fechaX).padStart(4, '0')}\n`
  dpl += `1${String(fechaY).padStart(3, '0')}\n`
  dpl += 'f140\n'            // Fuente pequeña
  dpl += 'c0000\n'
  dpl += 'N\n'
  dpl += `e${fecha}\n`

  // Finalizar y imprimir 1 copia
  dpl += 'E\n'               // End - imprime la etiqueta

  return dpl
}

/**
 * Versión alternativa más simple usando comandos DPL básicos
 * Compatible con la mayoría de las impresoras Datamax
 */
export function generarRotuloDPLSimple(datos: DatosRotulo): string {
  const tropa = datos.tropa || 'N/A'
  const numero = String(datos.numeroAnimal || '0')
  const peso = String(datos.peso || '0')

  // DPL Simple Format
  let dpl = ''
  
  // <STX>L = Start label format
  dpl += String.fromCharCode(2) + 'L\n'
  dpl += 'D11\n'              // Set label dimensions
  dpl += 'H14\n'              // Print speed 4 ips
  dpl += 'PG\n'               // Print mode: gap
  
  // Número de animal - GRANDE y CENTRADO
  // Formato: [comando][parametros]\n
  dpl += '1911' + '000000' + '0100' + numero + '\n'  // Texto grande
  
  // Tropa
  dpl += '1911' + '000000' + '0250' + 'Tropa: ' + tropa + '\n'
  
  // Peso
  dpl += '1911' + '000000' + '0370' + 'Peso: ' + peso + ' kg\n'
  
  // End format and print
  dpl += 'E\n'
  
  return dpl
}

/**
 * Formato ZPL alternativo para Zebra (compatibilidad)
 * Si la Datamax tiene emulación ZPL
 */
export function generarRotuloZPL(datos: DatosRotulo): string {
  const tropa = datos.tropa || 'N/A'
  const numero = String(datos.numeroAnimal || '0')
  const peso = String(datos.peso || '0')

  // ZPL para etiqueta 5x10cm (approx 394 x 787 dots a 203 DPI)
  let zpl = '^XA\n'
  
  // Configurar tamaño de etiqueta
  zpl += '^PW787\n'          // Print width: 10cm
  zpl += '^LL394\n'          // Label length: 5cm
  
  // Márgenes
  zpl += '^LH20,20\n'        // Label home

  // NÚMERO DE ANIMAL - MUY GRANDE Y RESALTADO
  zpl += '^FO30,30\n'
  zpl += '^A0N,80,80\n'      // Fuente muy grande
  zpl += `^FDANIMAL #${numero}^FS\n`

  // Tropa
  zpl += '^FO30,130\n'
  zpl += '^A0N,40,40\n'      // Fuente mediana
  zpl += `^FDTROPA: ${tropa}^FS\n`

  // Peso
  zpl += '^FO30,190\n'
  zpl += '^A0N,50,50\n'      // Fuente grande
  zpl += `^FDPESO: ${peso} kg^FS\n`

  // Fecha
  zpl += '^FO30,260\n'
  zpl += '^A0N,25,25\n'      // Fuente pequeña
  zpl += `^FD${new Date().toLocaleDateString('es-AR')}^FS\n`

  // Fin de etiqueta
  zpl += '^XZ\n'

  return zpl
}

/**
 * Enviar código de impresión a la impresora via TCP/IP
 * Puerto estándar: 9100
 */
export async function enviarAImpresora(
  ip: string, 
  puerto: number, 
  codigo: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/imprimir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip,
        puerto,
        codigo
      })
    })

    const data = await response.json()
    
    if (data.success) {
      return { success: true }
    } else {
      return { success: false, error: data.error || 'Error de impresión' }
    }
  } catch (error) {
    console.error('Error al enviar a impresora:', error)
    return { success: false, error: 'Error de conexión con la impresora' }
  }
}

/**
 * Imprimir rótulo por duplicado
 */
export async function imprimirRotuloDuplicado(
  datos: DatosRotulo,
  impresoraIp: string = '192.168.1.100',
  impresoraPuerto: number = 9100
): Promise<{ success: boolean; error?: string }> {
  const codigoDPL = generarRotuloDPLSimple(datos)
  
  // Enviar 2 copias
  const codigoDuplicado = codigoDPL + '\n' + codigoDPL
  
  return await enviarAImpresora(impresoraIp, impresoraPuerto, codigoDuplicado)
}

/**
 * Imprimir usando el sistema de rótulos configurado en la base de datos
 * Busca el rótulo default para PESAJE_INDIVIDUAL y lo usa
 */
export async function imprimirRotuloDesdeConfig(
  datos: DatosRotulo,
  cantidadCopias: number = 2
): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar rótulo configurado
    const rotuloRes = await fetch('/api/rotulos?tipo=PESAJE_INDIVIDUAL&esDefault=true')
    const rotuloData = await rotuloRes.json()
    
    if (!rotuloData.success || !rotuloData.data || rotuloData.data.length === 0) {
      // No hay rótulo configurado, usar DPL por defecto
      const codigoDPL = generarRotuloDPLSimple(datos)
      const codigoMultiplicado = Array(cantidadCopias).fill(codigoDPL).join('\n')
      
      // Imprimir en impresora default
      return await enviarAImpresora('192.168.1.100', 9100, codigoMultiplicado)
    }

    const rotulo = rotuloData.data[0]

    // Enviar a imprimir usando la API de rótulos
    const printRes = await fetch('/api/rotulos/imprimir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rotuloId: rotulo.id,
        datos: {
          NUMERO: datos.numeroAnimal,
          TROPA: datos.tropa,
          PESO: datos.peso
        },
        cantidad: cantidadCopias
      })
    })

    const printData = await printRes.json()
    
    return { 
      success: printData.success, 
      error: printData.error 
    }
  } catch (error) {
    console.error('Error al imprimir:', error)
    return { success: false, error: 'Error al imprimir rótulo' }
  }
}

export default {
  generarRotuloDPL,
  generarRotuloDPLSimple,
  generarRotuloZPL,
  enviarAImpresora,
  imprimirRotuloDuplicado,
  imprimirRotuloDesdeConfig
}
