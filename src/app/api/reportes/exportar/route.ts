import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, datos, resumen, fechaDesde, fechaHasta, camaras } = body

    if (!tipo || !datos || datos.length === 0) {
      return NextResponse.json({ success: false, error: 'Datos insuficientes' }, { status: 400 })
    }

    // Create exports directory
    const exportsDir = path.join(process.cwd(), 'public', 'exports')
    if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true })

    const outputPath = path.join(exportsDir, `${tipo}_${Date.now()}.xlsx`)

    // Generate Python script
    let pythonCode = `
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import json

datos = ${JSON.stringify(datos)}
resumen = ${JSON.stringify(resumen)}
fecha_desde = "${fechaDesde || ''}"
fecha_hasta = "${fechaHasta || ''}"

wb = Workbook()
ws = wb.active
ws.title = "Datos"

# Title
ws['A1'] = "Reporte de ${tipo.toUpperCase()}"
ws['A1'].font = Font(bold=True, size=16)
ws['A2'] = f"Periodo: {fecha_desde} - {fecha_hasta}"
ws['A2'].font = Font(italic=True, size=11)

# Headers style
header_fill = PatternFill(start_color="D4A574", end_color="D4A574", fill_type="solid")
header_font = Font(bold=True, color="FFFFFF")
thin_border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)

# Write data
if datos:
    df = pd.DataFrame(datos)
    start_row = 4
    
    # Write headers
    for col, header in enumerate(df.columns, 1):
        cell = ws.cell(row=start_row, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center')
        cell.border = thin_border
    
    # Write data rows
    for r_idx, row in enumerate(df.values, start_row + 1):
        for c_idx, value in enumerate(row, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=value)
            cell.border = thin_border
            if isinstance(value, (int, float)):
                cell.alignment = Alignment(horizontal='right')

    # Adjust column widths
    for col in ws.columns:
        max_length = 0
        column = col[0].column_letter
        for cell in col:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        ws.column_dimensions[column].width = min(max_length + 2, 30)

wb.save("${outputPath}")
`

    if (tipo === 'stock' && camaras) {
      pythonCode = `
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

datos = ${JSON.stringify(datos)}
camaras = ${JSON.stringify(camaras)}
resumen = ${JSON.stringify(resumen)}

wb = Workbook()
ws = wb.active
ws.title = "Stock"

ws['A1'] = "Reporte de Stock de Camaras"
ws['A1'].font = Font(bold=True, size=16)
ws['A2'] = f"Fecha: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}"
ws['A2'].font = Font(italic=True, size=11)

header_fill = PatternFill(start_color="D4A574", end_color="D4A574", fill_type="solid")
header_font = Font(bold=True, color="FFFFFF")
thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

ws['A4'] = "Estado de Camaras"
ws['A4'].font = Font(bold=True, size=12)

camara_headers = ['Nombre', 'Tipo', 'Stock', 'Capacidad', 'Ocupacion %']
for col, header in enumerate(camara_headers, 1):
    cell = ws.cell(row=5, column=col, value=header)
    cell.fill = header_fill
    cell.font = header_font
    cell.border = thin_border

for r_idx, camara in enumerate(camaras, 6):
    ws.cell(row=r_idx, column=1, value=camara['nombre']).border = thin_border
    ws.cell(row=r_idx, column=2, value=camara['tipo']).border = thin_border
    ws.cell(row=r_idx, column=3, value=camara['stockActual']).border = thin_border
    ws.cell(row=r_idx, column=4, value=camara['capacidad']).border = thin_border
    ws.cell(row=r_idx, column=5, value=round(camara['porcentajeOcupacion'], 1)).border = thin_border

ws2 = wb.create_sheet("Detalle")
if datos:
    df = pd.DataFrame(datos)
    start_row = 1
    for col, header in enumerate(df.columns, 1):
        cell = ws2.cell(row=start_row, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.border = thin_border
    
    for r_idx, row in enumerate(df.values, start_row + 1):
        for c_idx, value in enumerate(row, 1):
            cell = ws2.cell(row=r_idx, column=c_idx, value=value)
            cell.border = thin_border

wb.save("${outputPath}")
`
    }

    // Write and execute Python script
    const scriptPath = path.join(process.cwd(), 'scripts', `export_${tipo}_${Date.now()}.py`)
    const scriptsDir = path.dirname(scriptPath)
    if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir, { recursive: true })
    
    fs.writeFileSync(scriptPath, pythonCode)
    await execAsync(`python3 "${scriptPath}"`)
    
    // Clean up script
    fs.unlinkSync(scriptPath)

    // Return public URL
    const publicPath = `/exports/${path.basename(outputPath)}`
    
    return NextResponse.json({ 
      success: true, 
      archivo: publicPath 
    })
  } catch (error) {
    console.error('Error exportando:', error)
    return NextResponse.json({ success: false, error: 'Error al exportar' }, { status: 500 })
  }
}
