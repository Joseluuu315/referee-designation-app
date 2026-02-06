"use client"

import { Users, Calendar, ClipboardCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Arbitro, Partido, Designacion } from "@/lib/types"
import { TIPO_LABELS, CATEGORIA_LABELS } from "@/lib/types"

export function DashboardOverview({
  arbitros,
  partidos,
  designaciones,
}: {
  arbitros: Arbitro[]
  partidos: Partido[]
  designaciones: Designacion[]
}) {
  const activos = arbitros.filter((a) => a.estado === "activo").length
  const enBaja = arbitros.filter((a) => a.estado === "baja" || a.estado === "permiso").length
  const totalPartidos = partidos.length
  const designados = new Set(designaciones.map((d) => d.partido_id)).size
  const sinDesignar = totalPartidos - designados

  const porTipo = {
    futbol_11: partidos.filter((p) => p.tipo === "futbol_11").length,
    futbol_7: partidos.filter((p) => p.tipo === "futbol_7").length,
    futbol_femenino: partidos.filter((p) => p.tipo === "futbol_femenino").length,
    futbol_sala: partidos.filter((p) => p.tipo === "futbol_sala").length,
  }

  const porCategoria = {
    nuevo_ingreso: arbitros.filter((a) => a.categoria === "nuevo_ingreso").length,
    oficial: arbitros.filter((a) => a.categoria === "oficial").length,
    provincial: arbitros.filter((a) => a.categoria === "provincial").length,
    division_honor: arbitros.filter((a) => a.categoria === "division_honor").length,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">
          Resumen general del sistema de designaciones
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arbitros Activos</p>
              <p className="text-2xl font-bold text-foreground">{activos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(40,90%,50%)]/10">
              <Calendar className="h-6 w-6 text-[hsl(40,90%,50%)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partidos Semana</p>
              <p className="text-2xl font-bold text-foreground">{totalPartidos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designados</p>
              <p className="text-2xl font-bold text-foreground">{designados}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sin Designar</p>
              <p className="text-2xl font-bold text-foreground">{sinDesignar}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partidos por Modalidad</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(Object.entries(porTipo) as [keyof typeof TIPO_LABELS, number][]).map(
              ([tipo, count]) => (
                <div key={tipo} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{TIPO_LABELS[tipo]}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${totalPartidos > 0 ? (count / totalPartidos) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-foreground">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Arbitros por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(
              Object.entries(porCategoria) as [keyof typeof CATEGORIA_LABELS, number][]
            ).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {CATEGORIA_LABELS[cat]}
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-[hsl(40,90%,50%)]"
                      style={{
                        width: `${arbitros.length > 0 ? (count / arbitros.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-foreground">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Estado de Arbitros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">
                  Activos: <span className="font-semibold text-foreground">{activos}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">
                  Baja/Permiso:{" "}
                  <span className="font-semibold text-foreground">{enBaja}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
