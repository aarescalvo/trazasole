import { TIPOS_PESAJE } from './constants'
import type { Pesaje } from './types'

// Logo en base64 (puedes reemplazarlo con el logo real)
const LOGO_BASE64 = `
<svg width="120" height="50" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="50" fill="#1e3a5f"/>
  <text x="60" y="28" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">SOLEMAR</text>
  <text x="60" y="42" text-anchor="middle" fill="#90cdf4" font-family="Arial" font-size="9">ALIMENTARIA</text>
</svg>
`

// Imprimir ticket individual
export function imprimirTicket(pesaje: Pesaje, duplicado: boolean = false) {
  const tipoLabel = TIPOS_PESAJE.find(t => t.id === pesaje.tipo)?.label || pesaje.tipo
  const copia = duplicado ? ' - COPIA' : ''
  
  const printWindow = window.open('', '_blank', 'width=400,height=700')
  if (!printWindow) return
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket #${pesaje.numeroTicket}${copia}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 8mm; max-width: 80mm; }
        .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 8px; margin-bottom: 8px; }
        .logo { margin-bottom: 5px; }
        .empresa { font-size: 14px; font-weight: bold; margin-top: 3px; }
        .direccion { font-size: 9px; color: #333; margin-top: 2px; line-height: 1.3; }
        .ticket { font-size: 18px; font-weight: bold; margin-top: 5px; }
        .row { display: flex; justify-content: space-between; padding: 2px 0; }
        .label { font-weight: bold; }
        .section { border-top: 1px dashed black; padding-top: 6px; margin-top: 6px; }
        .peso { font-size: 12px; font-weight: bold; }
        .firmas { margin-top: 15px; display: flex; justify-content: space-between; gap: 10px; }
        .firma-box { flex: 1; text-align: center; }
        .firma-label { font-size: 9px; margin-bottom: 3px; }
        .firma-linea { border-bottom: 1px solid black; height: 25px; }
        .footer { margin-top: 10px; text-align: center; font-size: 8px; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">${LOGO_BASE64}</div>
        <div class="empresa">SOLEMAR ALIMENTARIA S.A.</div>
        <div class="direccion">
          Ruta Nacional 12 Km 1234 - Corrientes, Argentina<br>
          Tel: (03783) 42-XXXX - CUIT: 30-XXXXXXXX-X
        </div>
        <div style="margin-top: 5px;">TICKET DE PESAJE${copia}</div>
        <div class="ticket">Nº ${String(pesaje.numeroTicket).padStart(6, '0')}</div>
      </div>
      
      <div class="row"><span class="label">Tipo:</span><span>${tipoLabel}</span></div>
      <div class="row"><span class="label">Fecha:</span><span>${new Date(pesaje.fecha).toLocaleDateString('es-AR')}</span></div>
      <div class="row"><span class="label">Hora:</span><span>${new Date(pesaje.fecha).toLocaleTimeString('es-AR')}</span></div>
      ${pesaje.operador ? `<div class="row"><span class="label">Operador:</span><span>${pesaje.operador.nombre}</span></div>` : ''}
      
      <div class="section">
        <div class="row"><span class="label">Patente:</span><span>${pesaje.patenteChasis}</span></div>
        ${pesaje.patenteAcoplado ? `<div class="row"><span class="label">Acoplado:</span><span>${pesaje.patenteAcoplado}</span></div>` : ''}
        ${pesaje.chofer ? `<div class="row"><span class="label">Chofer:</span><span>${pesaje.chofer}</span></div>` : ''}
      </div>
      
      ${pesaje.tipo === 'INGRESO_HACIENDA' && pesaje.tropa ? `
        <div class="section">
          <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">DATOS DE HACIENDA</div>
          <div class="row"><span class="label">Tropa:</span><span style="font-weight: bold;">${pesaje.tropa.codigo}</span></div>
          ${pesaje.tropa.productor ? `<div class="row"><span class="label">Productor:</span><span>${pesaje.tropa.productor.nombre}</span></div>` : ''}
          <div class="row"><span class="label">Usuario Faena:</span><span>${pesaje.tropa.usuarioFaena?.nombre || '-'}</span></div>
          <div class="row"><span class="label">Especie:</span><span>${pesaje.tropa.especie}</span></div>
          <div class="row"><span class="label">Corral:</span><span>${pesaje.tropa.corral || '-'}</span></div>
          ${pesaje.tropa.dte ? `<div class="row"><span class="label">DTE:</span><span>${pesaje.tropa.dte}</span></div>` : ''}
          ${pesaje.tropa.guia ? `<div class="row"><span class="label">Guía:</span><span>${pesaje.tropa.guia}</span></div>` : ''}
          ${pesaje.descripcion ? `<div class="row"><span class="label">Observaciones:</span><span>${pesaje.descripcion}</span></div>` : ''}
        </div>
      ` : ''}
      
      ${pesaje.tipo === 'SALIDA_MERCADERIA' ? `
        <div class="section">
          <div class="row"><span class="label">Destino:</span><span>${pesaje.destino || '-'}</span></div>
          ${pesaje.remito ? `<div class="row"><span class="label">Remito:</span><span>${pesaje.remito}</span></div>` : ''}
        </div>
      ` : ''}
      
      <div class="section">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">PESOS</div>
        <div class="row peso"><span class="label">Bruto:</span><span>${pesaje.pesoBruto?.toLocaleString() || '-'} kg</span></div>
        <div class="row peso"><span class="label">Tara:</span><span>${pesaje.pesoTara?.toLocaleString() || '-'} kg</span></div>
        <div class="row peso" style="font-size: 14px;"><span class="label">NETO:</span><span style="font-weight: bold;">${pesaje.pesoNeto?.toLocaleString() || '-'} kg</span></div>
      </div>
      
      <div class="firmas">
        <div class="firma-box">
          <div class="firma-label">Firma Portero</div>
          <div class="firma-linea"></div>
        </div>
        <div class="firma-box">
          <div class="firma-label">Firma Conforme Chofer</div>
          <div class="firma-linea"></div>
        </div>
      </div>
      
      <div class="footer">
        Este ticket es válido como comprobante de pesaje<br>
        Conservar para cualquier reclamo
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); }
        }
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

// Imprimir reporte por rango de fechas
export function imprimirReporte(pesajes: Pesaje[], fechaDesde: string, fechaHasta: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) return
  
  const totalBruto = pesajes.reduce((acc, p) => acc + (p.pesoBruto || 0), 0)
  const totalTara = pesajes.reduce((acc, p) => acc + (p.pesoTara || 0), 0)
  const totalNeto = pesajes.reduce((acc, p) => acc + (p.pesoNeto || 0), 0)
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Pesajes</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .totals { margin-top: 20px; padding: 10px; background: #f9f9f9; }
        .totals p { margin: 5px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>SOLEMAR ALIMENTARIA S.A. - Reporte de Pesajes</h1>
      <p style="text-align: center; font-size: 12px; color: #666;">
        Ruta Nacional 12 Km 1234 - Corrientes, Argentina
      </p>
      <p><strong>Período:</strong> ${fechaDesde ? new Date(fechaDesde).toLocaleDateString('es-AR') : 'Inicio'} - ${fechaHasta ? new Date(fechaHasta).toLocaleDateString('es-AR') : 'Hoy'}</p>
      <p><strong>Generado:</strong> ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}</p>
      
      <table>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Patente</th>
            <th>Tropa</th>
            <th>Bruto (kg)</th>
            <th>Tara (kg)</th>
            <th>Neto (kg)</th>
          </tr>
        </thead>
        <tbody>
          ${pesajes.map(p => `
            <tr>
              <td>#${String(p.numeroTicket).padStart(6, '0')}</td>
              <td>${new Date(p.fecha).toLocaleDateString('es-AR')}</td>
              <td>${TIPOS_PESAJE.find(t => t.id === p.tipo)?.label || p.tipo}</td>
              <td>${p.patenteChasis}</td>
              <td>${p.tropa?.codigo || '-'}</td>
              <td>${p.pesoBruto?.toLocaleString() || '-'}</td>
              <td>${p.pesoTara?.toLocaleString() || '-'}</td>
              <td><strong>${p.pesoNeto?.toLocaleString() || '-'}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <p>Total de pesajes: ${pesajes.length}</p>
        <p>Total Bruto: ${totalBruto.toLocaleString()} kg</p>
        <p>Total Tara: ${totalTara.toLocaleString()} kg</p>
        <p>Total Neto: ${totalNeto.toLocaleString()} kg</p>
      </div>
      
      <script>
        window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}
