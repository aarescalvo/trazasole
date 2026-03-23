// Funciones de impresión para Pesaje Individual
// Frigorífico "Solemar Alimentaria"

import type { Animal } from './types'
import type { Tropa } from './types'

// Tipo para datos de romaneo individuales
interface RomaneoData {
  garron: number
  numeroAnimal?: number
  raza?: string
  denticion?: string
  clasificacion?: string
  caravana?: string
  pesoVivo?: number
  pesoMediaIzq?: number
  pesoMediaDer?: number
  pesoTotal?: number
  rinde?: number
}

interface ImprimirRotuloOptions {
  animal: Animal
  tropaCodigo: string
}

interface ImprimirTicketPesajeOptions {
  tropa: Tropa
  animales: Animal[]
  choferNombre?: string
  patente?: string
}

/**
 * Formatea la fecha en formato argentino
 */
function formatFecha(): string {
  const fecha = new Date()
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const año = fecha.getFullYear()
  const hora = String(fecha.getHours()).padStart(2, '0')
  const min = String(fecha.getMinutes()).padStart(2, '0')
  return `${dia}/${mes}/${año} ${hora}:${min}`
}

function formatFechaLarga(): string {
  const fecha = new Date()
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
}

/**
 * ETIQUETA ANIMAL EN PIE - 10cm x 5cm (HORIZONTAL/LANDSCAPE)
 * Layout: Tropa arriba | N° Animal, KG Vivos, Código de barras abajo
 */
export function imprimirRotulo({ animal, tropaCodigo }: ImprimirRotuloOptions) {
  const printWindow = window.open('', '_blank', 'width=400,height=200')
  if (!printWindow) return
  
  const pesoFormateado = animal.pesoVivo?.toLocaleString('es-AR') || '0'
  const codigoCompleto = animal.codigo || `${tropaCodigo}-${String(animal.numero).padStart(3, '0')}`
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Etiqueta ${codigoCompleto}</title>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
      <style>
        @page { 
          size: 100mm 50mm landscape;
          margin: 0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: Arial, sans-serif;
          width: 100mm;
          height: 50mm;
          background: white;
          display: flex;
        }
        
        .etiqueta {
          border: 2px solid #000;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        /* Tropa arriba - ANCHO COMPLETO */
        .campo-tropa-top {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2mm 4mm;
          border-bottom: 2px solid #000;
          background: #f0f0f0;
        }
        
        .tropa-label {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          color: #333;
        }
        
        .tropa-value {
          font-size: 22px;
          font-weight: 900;
          color: #000;
        }
        
        /* Fila inferior con 3 campos */
        .fila-inferior {
          flex: 1;
          display: flex;
          flex-direction: row;
        }
        
        .campo {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-right: 2px solid #000;
          padding: 2mm;
        }
        
        .campo:last-child {
          border-right: none;
        }
        
        .campo-label {
          font-size: 8px;
          font-weight: bold;
          text-transform: uppercase;
          color: #333;
          margin-bottom: 1mm;
        }
        
        .campo-value {
          font-size: 16px;
          font-weight: 900;
          text-align: center;
        }
        
        /* Campo Número */
        .campo-numero .campo-value {
          font-size: 24px;
        }
        
        /* Campo Peso */
        .campo-peso {
          background: #000;
          color: #fff;
        }
        
        .campo-peso .campo-label {
          color: #ccc;
        }
        
        .campo-peso .campo-value {
          color: #fff;
          font-size: 18px;
        }
        
        .campo-peso .peso-unit {
          font-size: 10px;
          font-weight: bold;
        }
        
        /* Campo Código */
        .campo-codigo {
          flex: 1.3;
        }
        
        .barcode {
          font-family: 'Libre Barcode 39 Text', cursive;
          font-size: 26px;
          line-height: 1;
        }
        
        .barcode-text {
          font-family: 'Courier New', monospace;
          font-size: 7px;
          font-weight: bold;
          letter-spacing: 0.5px;
          margin-top: 1mm;
        }
        
        @media print { 
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="etiqueta">
        <!-- Tropa arriba - ANCHO COMPLETO -->
        <div class="campo-tropa-top">
          <div class="tropa-label">TROPA</div>
          <div class="tropa-value">${tropaCodigo.replace(/\s/g, '')}</div>
        </div>
        
        <!-- Fila inferior con 3 campos -->
        <div class="fila-inferior">
          <!-- N° Animal -->
          <div class="campo campo-numero">
            <div class="campo-label">N° Animal</div>
            <div class="campo-value">${String(animal.numero).padStart(3, '0')}</div>
          </div>
          
          <!-- KG Vivos -->
          <div class="campo campo-peso">
            <div class="campo-label">KG Vivos</div>
            <div class="campo-value">${pesoFormateado} <span class="peso-unit">kg</span></div>
          </div>
          
          <!-- Código de barras -->
          <div class="campo campo-codigo">
            <div class="barcode">*${codigoCompleto}*</div>
            <div class="barcode-text">${codigoCompleto}</div>
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() { 
          setTimeout(function() {
            window.print(); 
            window.onafterprint = function() { window.close(); }
          }, 300);
        }
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

/**
 * TICKET DE PESAJE - Hoja A4
 * Incluye: Logo, datos empresa, detalle de tropa, listado de animales, firma chofer
 */
export function imprimirTicketPesajeA4({ tropa, animales, choferNombre, patente }: ImprimirTicketPesajeOptions) {
  const printWindow = window.open('', '_blank', 'width=800,height=1100')
  if (!printWindow) return
  
  const fecha = formatFecha()
  const fechaLarga = formatFechaLarga()
  const totalKg = animales.reduce((acc, a) => acc + (a.pesoVivo || 0), 0)
  const promedio = animales.length > 0 ? Math.round(totalKg / animales.length) : 0
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket de Pesaje - Tropa ${tropa.codigo}</title>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
      <style>
        @page { 
          size: A4;
          margin: 10mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Arial', sans-serif;
          width: 190mm;
          min-height: 277mm;
          background: white;
          padding: 5mm;
        }
        
        /* Header con logo */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #1a365d;
          padding-bottom: 5mm;
          margin-bottom: 5mm;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 5mm;
        }
        
        .logo-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        
        .logo-placeholder {
          width: 60px;
          height: 60px;
          border: 2px solid #1a365d;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
          color: white;
        }
        
        .empresa-info h1 {
          font-size: 24px;
          font-weight: 900;
          color: #1a365d;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .empresa-info p {
          font-size: 10px;
          color: #555;
        }
        
        .ticket-info {
          text-align: right;
        }
        
        .ticket-info h2 {
          font-size: 18px;
          color: #1a365d;
        }
        
        .ticket-info .fecha {
          font-size: 12px;
          color: #333;
          margin-top: 2mm;
        }
        
        /* Datos de la tropa */
        .tropa-datos {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3mm;
          margin-bottom: 5mm;
          padding: 4mm;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 3mm;
        }
        
        .dato-box {
          text-align: center;
          padding: 2mm;
        }
        
        .dato-box .label {
          font-size: 9px;
          color: #718096;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .dato-box .value {
          font-size: 16px;
          font-weight: bold;
          color: #1a365d;
        }
        
        /* Tabla de animales */
        .tabla-section {
          margin-bottom: 5mm;
        }
        
        .tabla-section h3 {
          font-size: 14px;
          color: #1a365d;
          margin-bottom: 3mm;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 2mm;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        
        th {
          background: #1a365d;
          color: white;
          padding: 3mm 2mm;
          text-align: left;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        td {
          padding: 2mm;
          border-bottom: 1px solid #e2e8f0;
        }
        
        tr:nth-child(even) {
          background: #f7fafc;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .font-mono {
          font-family: 'Courier New', monospace;
        }
        
        /* Totales */
        .totales {
          display: flex;
          justify-content: flex-end;
          gap: 10mm;
          margin-bottom: 8mm;
          padding: 4mm;
          background: #edf2f7;
          border-radius: 3mm;
        }
        
        .total-box {
          text-align: center;
          padding: 0 5mm;
        }
        
        .total-box .label {
          font-size: 10px;
          color: #718096;
        }
        
        .total-box .value {
          font-size: 20px;
          font-weight: bold;
          color: #1a365d;
        }
        
        /* Firma */
        .firma-section {
          margin-top: auto;
          padding-top: 10mm;
          border-top: 1px solid #e2e8f0;
        }
        
        .firma-container {
          display: flex;
          justify-content: space-between;
          margin-top: 10mm;
        }
        
        .firma-box {
          width: 80mm;
          text-align: center;
        }
        
        .firma-line {
          border-top: 1px solid #000;
          padding-top: 3mm;
          margin-top: 15mm;
        }
        
        .firma-label {
          font-size: 10px;
          font-weight: bold;
        }
        
        .firma-claro {
          font-size: 9px;
          color: #718096;
        }
        
        /* Footer */
        .footer {
          margin-top: 10mm;
          padding-top: 3mm;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 9px;
          color: #718096;
        }
        
        @media print { 
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <div class="logo-placeholder">SA</div>
          <div class="empresa-info">
            <h1>Solemar Alimentaria</h1>
            <p>Ruta Provincial N° 11 - Km 45.5 | San Martín, Mendoza</p>
            <p>CUIT: 23-12345678-9 | Tel: (0263) 442-1234</p>
            <p>N° Establecimiento: 12-0345</p>
          </div>
        </div>
        <div class="ticket-info">
          <h2>TICKET DE PESAJE</h2>
          <div class="fecha">${fechaLarga}</div>
          <div style="margin-top: 3mm; font-weight: bold;">Tropa: ${tropa.codigo}</div>
        </div>
      </div>
      
      <!-- Datos de la tropa -->
      <div class="tropa-datos">
        <div class="dato-box">
          <div class="label">Especie</div>
          <div class="value">${tropa.especie}</div>
        </div>
        <div class="dato-box">
          <div class="label">Usuario Faena</div>
          <div class="value">${tropa.usuarioFaena?.nombre || '-'}</div>
        </div>
        <div class="dato-box">
          <div class="label">DTE</div>
          <div class="value font-mono">${tropa.dte || '-'}</div>
        </div>
        <div class="dato-box">
          <div class="label">Corral</div>
          <div class="value">${typeof tropa.corral === 'object' ? tropa.corral?.nombre : tropa.corral || '-'}</div>
        </div>
        ${patente ? `
        <div class="dato-box">
          <div class="label">Patente</div>
          <div class="value font-mono">${patente}</div>
        </div>
        ` : ''}
        <div class="dato-box">
          <div class="label">Total Cabezas</div>
          <div class="value">${animales.length}</div>
        </div>
        <div class="dato-box">
          <div class="label">Peso Total</div>
          <div class="value">${totalKg.toLocaleString('es-AR')} kg</div>
        </div>
        <div class="dato-box">
          <div class="label">Promedio</div>
          <div class="value">${promedio.toLocaleString('es-AR')} kg/cab</div>
        </div>
      </div>
      
      <!-- Tabla de animales -->
      <div class="tabla-section">
        <h3>Detalle de Animales Pesados</h3>
        <table>
          <thead>
            <tr>
              <th class="text-center">N°</th>
              <th>Código</th>
              <th>Tipo</th>
              <th>Caravana</th>
              <th>Raza</th>
              <th class="text-right">Peso (kg)</th>
            </tr>
          </thead>
          <tbody>
            ${animales.map(a => `
              <tr>
                <td class="text-center font-mono">${a.numero}</td>
                <td class="font-mono">${a.codigo}</td>
                <td>${a.tipoAnimal}</td>
                <td>${a.caravana || '-'}</td>
                <td>${a.raza || '-'}</td>
                <td class="text-right font-mono"><strong>${a.pesoVivo?.toLocaleString('es-AR') || '-'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Totales -->
      <div class="totales">
        <div class="total-box">
          <div class="label">Animales Pesados</div>
          <div class="value">${animales.length}</div>
        </div>
        <div class="total-box">
          <div class="label">Peso Total</div>
          <div class="value">${totalKg.toLocaleString('es-AR')} kg</div>
        </div>
        <div class="total-box">
          <div class="label">Peso Promedio</div>
          <div class="value">${promedio.toLocaleString('es-AR')} kg</div>
        </div>
      </div>
      
      <!-- Firma -->
      <div class="firma-section">
        <p style="font-size: 11px; font-weight: bold; text-align: center;">
          Declaro haber recibido los animales detallados en este ticket en conformidad
        </p>
        
        <div class="firma-container">
          <div class="firma-box">
            <div class="firma-line"></div>
            <div class="firma-label">Firma Operador</div>
            <div class="firma-claro">Pesaje Individual</div>
          </div>
          
          <div class="firma-box">
            <div class="firma-line"></div>
            <div class="firma-label">Firma Conforme Chofer</div>
            <div class="firma-claro">${choferNombre || 'Aclarar: __________________'}</div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>Este documento es válido como constancia de pesaje individual de animales</p>
        <p>Sistema de Trazabilidad - Solemar Alimentaria - ${formatFecha()}</p>
      </div>
      
      <script>
        window.onload = function() { 
          setTimeout(function() {
            window.print(); 
            window.onafterprint = function() { window.close(); }
          }, 500);
        }
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

/**
 * Vista previa del rótulo para diálogo
 */
export function getRotuloPreviewHTML(animal: Animal, tropaCodigo: string): string {
  const pesoFormateado = animal.pesoVivo?.toLocaleString('es-AR') || '0'
  const codigoCompleto = animal.codigo || `${tropaCodigo}-${String(animal.numero).padStart(3, '0')}`
  
  return `
    <div class="border-2 border-black p-2 bg-white" style="width: 180px; height: 360px; display: flex; flex-direction: column;">
      <!-- Tropa -->
      <div class="text-center border-b-2 border-black pb-1 mb-1">
        <div class="text-[8px] font-bold uppercase">Tropa</div>
        <div class="text-2xl font-black">${tropaCodigo.replace(/\s/g, '')}</div>
      </div>
      
      <!-- N° Animal -->
      <div class="text-center border-b-2 border-black pb-1 mb-1">
        <div class="text-[7px] font-bold uppercase">N° Animal</div>
        <div class="text-3xl font-black">${animal.numero}</div>
      </div>
      
      <!-- Peso -->
      <div class="text-center bg-black text-white py-2 mb-1">
        <div class="text-[7px] font-bold uppercase">KG Vivos</div>
        <div class="text-2xl font-black">${pesoFormateado}<span class="text-sm">kg</span></div>
      </div>
      
      <!-- Código de barras -->
      <div class="flex-1 flex flex-col justify-center items-center">
        <div class="text-xl" style="font-family: 'Libre Barcode 39 Text', cursive;">*${codigoCompleto}*</div>
        <div class="text-[8px] font-mono font-bold">${codigoCompleto}</div>
      </div>
    </div>
  `
}

/**
 * PLANILLA 01 - Individual Tropa Weighing Ticket
 * Formato A4 profesional basado en Excel de Romaneo
 */
interface ImprimirPlanilla01Options {
  tropa: Tropa & {
    productor?: { nombre: string }
    usuarioFaena?: { nombre: string; cuit?: string }
    dte?: string
    guia?: string
    matriculaUsuarioFaena?: string
  }
  animales: Animal[]
  romaneos: RomaneoData[]
  fechaFaena: Date | string
}

export function imprimirPlanilla01({ tropa, animales, romaneos, fechaFaena }: ImprimirPlanilla01Options) {
  const printWindow = window.open('', '_blank', 'width=800,height=1100')
  if (!printWindow) return

  // Formatear fecha de faena
  const fechaFaenaDate = typeof fechaFaena === 'string' ? new Date(fechaFaena) : fechaFaena
  const fechaFaenaFormateada = fechaFaenaDate 
    ? `${String(fechaFaenaDate.getDate()).padStart(2, '0')}/${String(fechaFaenaDate.getMonth() + 1).padStart(2, '0')}/${fechaFaenaDate.getFullYear()}`
    : '-'

  // Calcular totales
  const totalKgVivo = romaneos.reduce((acc, r) => acc + (r.pesoVivo || 0), 0)
  const totalKgMedias = romaneos.reduce((acc, r) => acc + (r.pesoTotal || 0), 0)
  const totalMediaIzq = romaneos.reduce((acc, r) => acc + (r.pesoMediaIzq || 0), 0)
  const totalMediaDer = romaneos.reduce((acc, r) => acc + (r.pesoMediaDer || 0), 0)
  const cantidadCabezas = romaneos.length
  
  // Calcular rinde total
  const rindeTotal = totalKgVivo > 0 ? (totalKgMedias / totalKgVivo) : 0
  const promedioPeso = cantidadCabezas > 0 ? totalKgMedias / cantidadCabezas : 0

  // Contar clasificaciones (cuartos)
  const clasificaciones: Record<string, { cantidad: number; kg: number }> = {
    VQ: { cantidad: 0, kg: 0 },
    NT: { cantidad: 0, kg: 0 },
    NO: { cantidad: 0, kg: 0 },
    TO: { cantidad: 0, kg: 0 },
    VA: { cantidad: 0, kg: 0 },
    MEJ: { cantidad: 0, kg: 0 }
  }

  romaneos.forEach(r => {
    const clas = r.clasificacion?.toUpperCase()
    if (clas && clasificaciones[clas]) {
      clasificaciones[clas].cantidad++
      clasificaciones[clas].kg += r.pesoTotal || 0
    }
  })

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Planilla 01 - Tropa ${tropa.numero}</title>
      <style>
        @page { 
          size: A4;
          margin: 8mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Arial', sans-serif;
          width: 194mm;
          min-height: 282mm;
          background: white;
          font-size: 9px;
          line-height: 1.3;
        }
        
        /* Header del establecimiento */
        .header-estab {
          text-align: right;
          margin-bottom: 3mm;
          font-size: 8px;
        }
        
        .header-estab .empresa {
          font-size: 11px;
          font-weight: bold;
        }
        
        /* Sección de datos básicos */
        .datos-basicos {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4mm;
        }
        
        .datos-basicos .left {
          width: 45%;
        }
        
        .datos-basicos .right {
          width: 45%;
          text-align: right;
        }
        
        .datos-basicos .dato-row {
          display: flex;
          margin-bottom: 1mm;
        }
        
        .datos-basicos .dato-label {
          font-weight: bold;
          min-width: 35mm;
        }
        
        .datos-basicos .dato-value {
          font-weight: normal;
        }
        
        /* Sección central con datos de tropa */
        .datos-tropa {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4mm;
          padding: 3mm;
          border: 1px solid #000;
          background: #f9f9f9;
        }
        
        .datos-tropa .col {
          width: 48%;
        }
        
        .datos-tropa .col-right {
          width: 25%;
          text-align: center;
        }
        
        .datos-tropa .dato-item {
          display: flex;
          justify-content: space-between;
          padding: 1mm 0;
          border-bottom: 1px dotted #ccc;
        }
        
        .datos-tropa .dato-item:last-child {
          border-bottom: none;
        }
        
        .datos-tropa .dato-item .label {
          font-weight: bold;
        }
        
        .datos-tropa .dato-item .value {
          font-weight: normal;
        }
        
        /* Rinde/Promedio box */
        .rinde-box {
          border: 2px solid #000;
          padding: 2mm;
        }
        
        .rinde-box .header-rinde {
          font-weight: bold;
          text-align: center;
          border-bottom: 1px solid #000;
          padding-bottom: 1mm;
          margin-bottom: 2mm;
          font-size: 9px;
        }
        
        .rinde-row {
          display: flex;
          justify-content: space-between;
          padding: 1mm 0;
        }
        
        .rinde-row .label {
          font-weight: bold;
          width: 15mm;
        }
        
        .rinde-row .value {
          font-weight: normal;
          text-align: right;
          flex: 1;
        }
        
        /* Cuartos Summary */
        .cuartos-section {
          margin-bottom: 4mm;
        }
        
        .cuartos-title {
          font-weight: bold;
          font-size: 10px;
          margin-bottom: 2mm;
        }
        
        .cuartos-table {
          width: 50%;
          border-collapse: collapse;
          font-size: 8px;
        }
        
        .cuartos-table th,
        .cuartos-table td {
          border: 1px solid #000;
          padding: 2mm 3mm;
          text-align: center;
        }
        
        .cuartos-table th {
          background: #333;
          color: white;
          font-weight: bold;
        }
        
        /* Main Table */
        .main-table-container {
          width: 100%;
          overflow-x: auto;
        }
        
        .main-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7px;
        }
        
        .main-table th {
          background: #000;
          color: white;
          padding: 2mm 1mm;
          text-align: center;
          font-weight: bold;
          font-size: 7px;
          border: 1px solid #000;
        }
        
        .main-table td {
          padding: 1.5mm 1mm;
          border: 1px solid #000;
          text-align: center;
        }
        
        .main-table tbody tr:nth-child(even) {
          background: #f5f5f5;
        }
        
        .main-table .text-right {
          text-align: right;
        }
        
        .main-table .text-left {
          text-align: left;
        }
        
        /* Totales row */
        .main-table .totales-row {
          background: #e0e0e0;
          font-weight: bold;
        }
        
        .main-table .totales-row td {
          font-weight: bold;
        }
        
        /* Footer */
        .footer {
          margin-top: 5mm;
          padding-top: 2mm;
          border-top: 1px solid #000;
          text-align: center;
          font-size: 8px;
          color: #666;
        }
        
        @media print { 
          body { 
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header del Establecimiento -->
      <div class="header-estab">
        <div class="empresa">Estab. Faenador: Solemar Alimentaria S.A.</div>
        <div>Matrícula: 300</div>
        <div>Nº SENASA: 3986</div>
      </div>
      
      <!-- Datos básicos izquierda/derecha -->
      <div class="datos-basicos">
        <div class="left">
          <div class="dato-row">
            <span class="dato-label">Usuario/Matarife:</span>
            <span class="dato-value">${tropa.usuarioFaena?.nombre || '-'}</span>
          </div>
          <div class="dato-row">
            <span class="dato-label">Matrícula:</span>
            <span class="dato-value">${tropa.usuarioFaena?.cuit || tropa.matriculaUsuarioFaena || '-'}</span>
          </div>
        </div>
        <div class="right">
          <div class="dato-row" style="justify-content: flex-end;">
            <span class="dato-label">Productor:</span>
            <span class="dato-value">${tropa.productor?.nombre || '-'}</span>
          </div>
          <div class="dato-row" style="justify-content: flex-end;">
            <span class="dato-label">Nº DTE:</span>
            <span class="dato-value">${tropa.dte || '-'}</span>
          </div>
          <div class="dato-row" style="justify-content: flex-end;">
            <span class="dato-label">Nº Guía:</span>
            <span class="dato-value">${tropa.guia || '-'}</span>
          </div>
        </div>
      </div>
      
      <!-- Datos de tropa + Cuartos + Rinde/Promedio -->
      <div class="datos-tropa">
        <div class="col">
          <div class="dato-item">
            <span class="label">Fecha Faena:</span>
            <span class="value">${fechaFaenaFormateada}</span>
          </div>
          <div class="dato-item">
            <span class="label">Nº Tropa:</span>
            <span class="value">${tropa.numero}</span>
          </div>
          <div class="dato-item">
            <span class="label">Cantidad Cabeza:</span>
            <span class="value">${cantidadCabezas}</span>
          </div>
          <div class="dato-item">
            <span class="label">Kg Vivo entrada:</span>
            <span class="value">${totalKgVivo.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </div>
          <div class="dato-item">
            <span class="label">Kg 1/2 Res:</span>
            <span class="value">${totalKgMedias.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </div>
          <div class="dato-item">
            <span class="label">Rinde:</span>
            <span class="value">${(rindeTotal * 100).toFixed(2)}%</span>
          </div>
          <div class="dato-item">
            <span class="label">Promedio:</span>
            <span class="value">${promedioPeso.toFixed(1)}</span>
          </div>
        </div>
        
        <!-- Cuartos Table -->
        <div class="col">
          <table class="cuartos-table">
            <thead>
              <tr>
                <th>Cuartos</th>
                <th>Cantidad</th>
                <th>Kg</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>VQ</strong></td>
                <td>${clasificaciones.VQ.cantidad > 0 ? clasificaciones.VQ.cantidad * 2 : '-'}</td>
                <td>${clasificaciones.VQ.kg > 0 ? clasificaciones.VQ.kg.toFixed(1) : '-'}</td>
              </tr>
              <tr>
                <td><strong>NT</strong></td>
                <td>${clasificaciones.NT.cantidad > 0 ? clasificaciones.NT.cantidad * 2 : '-'}</td>
                <td>${clasificaciones.NT.kg > 0 ? clasificaciones.NT.kg.toFixed(1) : '-'}</td>
              </tr>
              <tr>
                <td><strong>NO</strong></td>
                <td>${clasificaciones.NO.cantidad > 0 ? clasificaciones.NO.cantidad * 2 : '-'}</td>
                <td>${clasificaciones.NO.kg > 0 ? clasificaciones.NO.kg.toFixed(1) : '-'}</td>
              </tr>
              <tr>
                <td><strong>TO</strong></td>
                <td>${clasificaciones.TO.cantidad > 0 ? clasificaciones.TO.cantidad * 2 : '-'}</td>
                <td>${clasificaciones.TO.kg > 0 ? clasificaciones.TO.kg.toFixed(1) : '-'}</td>
              </tr>
              <tr>
                <td><strong>VA</strong></td>
                <td>${clasificaciones.VA.cantidad > 0 ? clasificaciones.VA.cantidad * 2 : '-'}</td>
                <td>${clasificaciones.VA.kg > 0 ? clasificaciones.VA.kg.toFixed(1) : '-'}</td>
              </tr>
              <tr>
                <td><strong>MEJ</strong></td>
                <td>${clasificaciones.MEJ.cantidad > 0 ? clasificaciones.MEJ.cantidad * 2 : '-'}</td>
                <td>${clasificaciones.MEJ.kg > 0 ? clasificaciones.MEJ.kg.toFixed(1) : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Rinde/Promedio Box -->
        <div class="col-right">
          <div class="rinde-box">
            <div class="header-rinde">RESUMEN</div>
            <div class="rinde-row">
              <span class="label">RINDE</span>
              <span class="value">${(rindeTotal * 100).toFixed(2)}%</span>
            </div>
            <div class="rinde-row">
              <span class="label">PROM.</span>
              <span class="value">${promedioPeso.toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Animals Table -->
      <div class="main-table-container">
        <table class="main-table">
          <thead>
            <tr>
              <th style="width: 12mm;">Nº<br>GARRON</th>
              <th style="width: 14mm;">Nº<br>ANIMAL</th>
              <th style="width: 12mm;">RAZA</th>
              <th style="width: 18mm;">DENTICION</th>
              <th style="width: 18mm;">CLASIFICA-<br>CION</th>
              <th style="width: 18mm;">Nº<br>CARAVANA</th>
              <th style="width: 16mm;">KG<br>ENTRADA</th>
              <th style="width: 16mm;">KG 1/2 A</th>
              <th style="width: 16mm;">KG 1/2 B</th>
              <th style="width: 16mm;">TOTAL KG</th>
              <th style="width: 18mm;">RINDE<br>FAENA</th>
            </tr>
          </thead>
          <tbody>
            ${romaneos.map(r => `
              <tr>
                <td><strong>${r.garron}</strong></td>
                <td>${r.numeroAnimal || '-'}</td>
                <td>${r.raza || '-'}</td>
                <td>${r.denticion || '-'}</td>
                <td><strong>${r.clasificacion || '-'}</strong></td>
                <td>${r.caravana || '-'}</td>
                <td class="text-right">${r.pesoVivo ? r.pesoVivo.toLocaleString('es-AR') : '-'}</td>
                <td class="text-right">${r.pesoMediaIzq ? r.pesoMediaIzq.toFixed(1) : '-'}</td>
                <td class="text-right">${r.pesoMediaDer ? r.pesoMediaDer.toFixed(1) : '-'}</td>
                <td class="text-right"><strong>${r.pesoTotal ? r.pesoTotal.toFixed(1) : '-'}</strong></td>
                <td class="text-right">${r.rinde ? (r.rinde * 100).toFixed(2) + '%' : '-'}</td>
              </tr>
            `).join('')}
            <!-- Totales Row -->
            <tr class="totales-row">
              <td colspan="1"></td>
              <td><strong>${cantidadCabezas}</strong></td>
              <td colspan="4"></td>
              <td class="text-right"><strong>${totalKgVivo.toLocaleString('es-AR')}</strong></td>
              <td class="text-right"><strong>${totalMediaIzq.toFixed(1)}</strong></td>
              <td class="text-right"><strong>${totalMediaDer.toFixed(1)}</strong></td>
              <td class="text-right"><strong>${totalKgMedias.toFixed(1)}</strong></td>
              <td class="text-right"><strong>${(rindeTotal * 100).toFixed(2)}%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>Solemar Alimentaria S.A. - Matrícula 300 - Nº SENASA 3986</p>
        <p>Planilla 01 - Individual Tropa Weighing Ticket</p>
      </div>
      
      <script>
        window.onload = function() { 
          setTimeout(function() {
            window.print(); 
            window.onafterprint = function() { window.close(); }
          }, 500);
        }
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}
