'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  BarChart3, TrendingUp, TrendingDown, Beef, Scale, Truck, 
  Warehouse, Package, AlertTriangle, CheckCircle, Calendar,
  DollarSign, Users, Activity, Target, Clock
} from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Line, LineChart, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart } from "recharts"

// Interfaces
interface KPIs {
  cabezasFaenadas: number
  kgProducidos: number
  rindePromedio: number
  despachos: number
  kgDespachados: number
  facturacion: number
  tropasProcesadas: number
  animalesEnCorral: number
  mediasEnCamara: number
  cuartosEnCamara: number
}

interface FaenaDiaria {
  fecha: string
  cabezas: number
  kg: number
  rinde: number
}

interface RendimientoComparativo {
  periodo: string
  actual: number
  anterior: number
  variacion: number
}

interface Alerta {
  id: string
  tipo: 'warning' | 'error' | 'info'
  modulo: string
  mensaje: string
  fecha: string
}

interface Props {
  operador: {
    id: string
    nombre: string
    rol: string
  }
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']

const chartConfig = {
  cabezas: { label: "Cabezas", color: "#f59e0b" },
  kg: { label: "KG", color: "#10b981" },
  rinde: { label: "Rinde %", color: "#3b82f6" },
} satisfies ChartConfig

export function DashboardEjecutivo({ operador }: Props) {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<KPIs>({
    cabezasFaenadas: 0,
    kgProducidos: 0,
    rindePromedio: 0,
    despachos: 0,
    kgDespachados: 0,
    facturacion: 0,
    tropasProcesadas: 0,
    animalesEnCorral: 0,
    mediasEnCamara: 0,
    cuartosEnCamara: 0
  })
  const [faenaDiaria, setFaenaDiaria] = useState<FaenaDiaria[]>([])
  const [rendimiento, setRendimiento] = useState<RendimientoComparativo[]>([])
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [periodo, setPeriodo] = useState('mes')

  useEffect(() => {
    fetchData()
  }, [periodo])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Cargar KPIs generales
      const resDashboard = await fetch('/api/dashboard')
      const dataDashboard = await resDashboard.json()
      
      if (dataDashboard.success) {
        setKpis({
          cabezasFaenadas: dataDashboard.data.tropasActivas * 25 || 0, // aproximación
          kgProducidos: dataDashboard.data.enCamara * 250 || 0,
          rindePromedio: 52.5,
          despachos: 0,
          kgDespachados: 0,
          facturacion: 0,
          tropasProcesadas: dataDashboard.data.tropasActivas || 0,
          animalesEnCorral: dataDashboard.data.enPesaje || 0,
          mediasEnCamara: dataDashboard.data.enCamara || 0,
          cuartosEnCamara: 0
        })
      }

      // Simular datos de faena diaria (en producción vendría de API)
      const ultimos7Dias = generarDatosFaenaDiaria()
      setFaenaDiaria(ultimos7Dias)

      // Generar rendimiento comparativo
      setRendimiento([
        { periodo: 'Enero', actual: 52.5, anterior: 51.8, variacion: 1.35 },
        { periodo: 'Febrero', actual: 53.1, anterior: 52.0, variacion: 2.12 },
        { periodo: 'Marzo', actual: 52.8, anterior: 51.5, variacion: 2.52 },
        { periodo: 'Abril', actual: 53.5, anterior: 52.8, variacion: 1.33 },
        { periodo: 'Mayo', actual: 54.2, anterior: 53.1, variacion: 2.07 },
        { periodo: 'Junio', actual: 53.8, anterior: 52.5, variacion: 2.48 },
      ])

      // Generar alertas
      setAlertas([
        { id: '1', tipo: 'warning', modulo: 'Stock', mensaje: '5 productos próximos a vencer (7 días)', fecha: new Date().toISOString() },
        { id: '2', tipo: 'info', modulo: 'Faena', mensaje: 'Tropa B 2026 0128 pendiente de procesar', fecha: new Date().toISOString() },
        { id: '3', tipo: 'warning', modulo: 'Corrales', mensaje: 'Corral 3 al 90% de capacidad', fecha: new Date().toISOString() },
      ])

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const generarDatosFaenaDiaria = (): FaenaDiaria[] => {
    const datos = []
    const hoy = new Date()
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      datos.push({
        fecha: fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
        cabezas: Math.floor(Math.random() * 20) + 15,
        kg: Math.floor(Math.random() * 5000) + 4000,
        rinde: Math.random() * 5 + 50
      })
    }
    return datos
  }

  const formatNumber = (num: number) => num.toLocaleString('es-AR')
  const formatCurrency = (num: number) => `$${num.toLocaleString('es-AR')}`

  // Solo administradores pueden ver este dashboard
  if (operador.rol !== 'ADMINISTRADOR') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6 flex items-center justify-center">
        <Card className="max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold text-stone-800 mb-2">Acceso Restringido</h2>
            <p className="text-stone-500">Este dashboard está disponible solo para administradores.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-amber-500" />
              Dashboard Ejecutivo
            </h1>
            <p className="text-stone-500 mt-1">
              Panel de control para supervisión y análisis
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mes</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="anio">Este año</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm py-1.5">
              <Clock className="w-3 h-3 mr-1" />
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Badge>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 uppercase">Cabezas Faenadas</p>
                  <p className="text-2xl font-bold text-amber-600">{formatNumber(kpis.cabezasFaenadas)}</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Beef className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">+12%</span>
                <span className="text-stone-400">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 uppercase">KG Producidos</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatNumber(kpis.kgProducidos)}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Scale className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">+8.5%</span>
                <span className="text-stone-400">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 uppercase">Rinde Promedio</p>
                  <p className="text-2xl font-bold text-blue-600">{kpis.rindePromedio.toFixed(1)}%</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">+0.5%</span>
                <span className="text-stone-400">meta: 52%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 uppercase">Tropas Procesadas</p>
                  <p className="text-2xl font-bold text-purple-600">{formatNumber(kpis.tropasProcesadas)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <Activity className="w-3 h-3 text-blue-500" />
                <span className="text-stone-400">Este {periodo}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faena Diaria */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-stone-50 rounded-t-lg pb-2">
              <CardTitle className="text-lg">Faena Últimos 7 Días</CardTitle>
              <CardDescription>Cabezas faenadas y rinde por día</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={faenaDiaria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="cabezas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rinde" stroke="#3b82f6" strokeWidth={2} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Tendencia de Rendimiento */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-stone-50 rounded-t-lg pb-2">
              <CardTitle className="text-lg">Tendencia de Rendimiento</CardTitle>
              <CardDescription>Comparativa mensual (%)</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ChartContainer config={chartConfig} className="h-64">
                <AreaChart data={rendimiento}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                  <YAxis domain={[48, 56]} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="actual" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                  <Line type="monotone" dataKey="anterior" stroke="#94a3b8" strokeDasharray="5 5" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila de KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">En Corral</p>
                  <p className="text-xl font-bold">{formatNumber(kpis.animalesEnCorral)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 p-2 rounded-lg">
                  <Warehouse className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">Medias en Cámara</p>
                  <p className="text-xl font-bold">{formatNumber(kpis.mediasEnCamara)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">Cuartos Stock</p>
                  <p className="text-xl font-bold">{formatNumber(kpis.cuartosEnCamara)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-stone-100 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">Facturación</p>
                  <p className="text-xl font-bold">{formatCurrency(kpis.facturacion)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y Accesos Rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alertas */}
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader className="bg-stone-50 rounded-t-lg pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {alertas.length === 0 ? (
                <div className="p-6 text-center text-stone-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                  <p>No hay alertas pendientes</p>
                </div>
              ) : (
                <div className="divide-y">
                  {alertas.map((alerta) => (
                    <div key={alerta.id} className="p-3 flex items-center gap-3 hover:bg-stone-50">
                      <div className={`p-2 rounded-full ${
                        alerta.tipo === 'error' ? 'bg-red-100' :
                        alerta.tipo === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        {alerta.tipo === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : alerta.tipo === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Activity className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alerta.mensaje}</p>
                        <p className="text-xs text-stone-400">{alerta.modulo}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(alerta.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen del Día */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-stone-50 rounded-t-lg pb-2">
              <CardTitle className="text-lg">Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Faena programada</span>
                  <span className="font-bold">25 cabezas</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Romaneo completado</span>
                  <span className="font-bold">20/25</span>
                </div>
                <Progress value={80} className="h-2 bg-stone-100 [&>div]:bg-emerald-500" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Despachos</span>
                  <span className="font-bold">3 realizados</span>
                </div>
                <Progress value={60} className="h-2 bg-stone-100 [&>div]:bg-blue-500" />
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-amber-600">3</p>
                    <p className="text-xs text-stone-500">Tropas activas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">2</p>
                    <p className="text-xs text-stone-500">En proceso</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta de Rendimiento */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-stone-50 rounded-t-lg pb-2">
            <CardTitle className="text-lg">Cumplimiento de Metas</CardTitle>
            <CardDescription>Indicadores clave de rendimiento</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rinde Meta (52%)</span>
                  <span className="font-bold text-green-600">103%</span>
                </div>
                <Progress value={103} className="h-3" />
                <p className="text-xs text-stone-400">Actual: 53.5%</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Merma Máxima (25%)</span>
                  <span className="font-bold text-green-600">OK</span>
                </div>
                <Progress value={20} className="h-3 bg-red-100 [&>div]:bg-green-500" />
                <p className="text-xs text-stone-400">Actual: 20%</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ocupación Cámaras</span>
                  <span className="font-bold text-amber-600">75%</span>
                </div>
                <Progress value={75} className="h-3" />
                <p className="text-xs text-stone-400">750/1000 ganchos</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stock Mínimo</span>
                  <span className="font-bold text-green-600">OK</span>
                </div>
                <Progress value={100} className="h-3 bg-stone-100 [&>div]:bg-green-500" />
                <p className="text-xs text-stone-400">Sin alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardEjecutivo
