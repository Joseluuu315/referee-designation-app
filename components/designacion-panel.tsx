"use client"

import React from "react"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  MapPin,
  UserPlus,
  Zap,
  AlertTriangle,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Car,
  Navigation,
  Timer,
  Shield,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import type {
  Arbitro,
  Partido,
  Designacion,
  TipoPartido,
  RolDesignacion,
  CategoriaArbitro,
} from "@/lib/types"
import { TIPO_LABELS, ROL_LABELS, CATEGORIA_LABELS } from "@/lib/types"
import {
  getTiempoViaje,
  extractLocalidadFromCampo,
  formatTiempo,
  getTravelBurden,
  canMakeItBetweenMatches,
} from "@/lib/distancias-cordoba"

// --- ROLES POR TIPO DE PARTIDO ---
const ROLES_BY_TYPE: Record<TipoPartido, RolDesignacion[]> = {
  futbol_11: ["principal", "asistente_1", "asistente_2"],
  futbol_7: ["principal"],
  futbol_femenino: ["principal", "asistente_1", "asistente_2"],
  futbol_sala: ["principal", "asistente_1"],
}

// --- JERARQUIA DE CATEGORIAS (mayor = mas alta) ---
const CATEGORIA_RANK: Record<CategoriaArbitro, number> = {
  nuevo_ingreso: 1,
  oficial: 2,
  provincial: 3,
  division_honor: 4,
}

// --- REGLAS DE CATEGORIA POR COMPOSICION DE TRIO ---
// Futbol 11 y Femenino (con asistentes):
//   Opcion A: Division Honor (principal) + 2 Provinciales (asistentes)
//   Opcion B: Provincial (principal) + 2 Oficiales (asistentes)
// Futbol Sala (con 1 asistente):
//   Opcion A: Division Honor (principal) + Provincial (asistente)
//   Opcion B: Provincial (principal) + Oficial (asistente)
// Futbol 7 (solo principal): cualquier categoria

interface TrioRule {
  principal: CategoriaArbitro[]
  asistentes: CategoriaArbitro[]
}

function getTrioRules(tipo: TipoPartido): TrioRule[] {
  if (tipo === "futbol_11" || tipo === "futbol_femenino") {
    return [
      { principal: ["division_honor"], asistentes: ["provincial"] },
      { principal: ["provincial"], asistentes: ["oficial"] },
    ]
  }
  if (tipo === "futbol_sala") {
    return [
      { principal: ["division_honor"], asistentes: ["provincial"] },
      { principal: ["provincial"], asistentes: ["oficial"] },
    ]
  }
  // futbol_7: solo principal, cualquier categoria
  return [
    {
      principal: [
        "division_honor",
        "provincial",
        "oficial",
        "nuevo_ingreso",
      ],
      asistentes: [],
    },
  ]
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

// --- DURACION ESTIMADA POR TIPO ---
function getMatchDuration(tipo: TipoPartido): number {
  switch (tipo) {
    case "futbol_11":
      return 110 // 90 min + descanso + calentamiento
    case "futbol_femenino":
      return 110
    case "futbol_7":
      return 75
    case "futbol_sala":
      return 70
    default:
      return 105
  }
}

// --- HORA MAXIMA PARA MENORES (20:30 = no pueden volver muy tarde) ---
const HORA_LIMITE_MENOR = 20 * 60 + 30 // 20:30

export function DesignacionPanel({
  tipo,
  partidos,
  arbitros,
  designaciones: initialDesignaciones,
}: {
  tipo: TipoPartido
  partidos: Partido[]
  arbitros: Arbitro[]
  designaciones: Designacion[]
}) {
  const router = useRouter()
  const [designaciones, setDesignaciones] = useState(initialDesignaciones)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [assignDialog, setAssignDialog] = useState<{
    partido: Partido
    rol: RolDesignacion
  } | null>(null)
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [autoAssignLog, setAutoAssignLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  const roles = ROLES_BY_TYPE[tipo]
  const trioRules = getTrioRules(tipo)
  const matchDuration = getMatchDuration(tipo)

  const activeArbitros = useMemo(
    () => arbitros.filter((a) => a.estado === "activo"),
    [arbitros]
  )

  const getDesignacionesForPartido = useCallback(
    (partidoId: string) => designaciones.filter((d) => d.partido_id === partidoId),
    [designaciones]
  )

  // --- CONFLICTOS: incluye viaje ---
  const getArbitroConflicts = useCallback(
    (arbitroId: string, partido: Partido, excludeDesigId?: string) => {
      const conflicts: string[] = []
      const warnings: string[] = []
      const arb = arbitros.find((a) => a.id === arbitroId)
      if (!arb) return { conflicts, warnings }

      const otherDesigs = designaciones.filter(
        (d) => d.arbitro_id === arbitroId && d.id !== excludeDesigId
      )

      for (const d of otherDesigs) {
        const otherPartido = d.partido
        if (!otherPartido) continue

        if (partido.fecha !== otherPartido.fecha) continue

        const result = canMakeItBetweenMatches(
          arb.localidad,
          partido.campo,
          partido.hora,
          otherPartido.campo,
          otherPartido.hora,
          partido.fecha,
          otherPartido.fecha,
          matchDuration
        )

        if (!result.canMakeIt) {
          conflicts.push(
            `No llega: ${otherPartido.equipo_local} vs ${otherPartido.equipo_visitante} (${otherPartido.hora}) - Necesita ${result.travelMinutes}min viaje, solo ${result.availableMinutes}min disponibles`
          )
        } else if (result.availableMinutes - result.travelMinutes < 30) {
          warnings.push(
            `Justo de tiempo: ${otherPartido.equipo_local} vs ${otherPartido.equipo_visitante} (${otherPartido.hora}) - ${result.availableMinutes - result.travelMinutes}min margen`
          )
        }
      }

      // Check travel from home
      const travel = getTravelBurden(arb.localidad, partido.campo)
      if (travel.ida > 90) {
        warnings.push(
          `Desplazamiento largo: ${formatTiempo(travel.ida)} desde ${arb.localidad}`
        )
      }

      // Minor restrictions
      if (arb.es_menor) {
        const partidoEnd = timeToMinutes(partido.hora) + matchDuration
        const returnTime = partidoEnd + travel.vuelta
        if (returnTime > 23 * 60) {
          conflicts.push(
            `Menor: llegaria a casa despues de las 23:00 (${formatTiempo(travel.vuelta)} de vuelta)`
          )
        } else if (timeToMinutes(partido.hora) >= HORA_LIMITE_MENOR) {
          warnings.push("Menor: partido en horario tarde-noche")
        }
      }

      // No car + far away
      if (!arb.tiene_coche && travel.ida > 20) {
        warnings.push(
          `Sin coche: necesita transporte a ${extractLocalidadFromCampo(partido.campo)} (${formatTiempo(travel.ida)})`
        )
      }

      return { conflicts, warnings }
    },
    [designaciones, arbitros, matchDuration]
  )

  // --- LISTA DE ARBITROS FILTRADA PARA EL DIALOGO DE ASIGNACION ---
  const availableArbitros = useMemo(() => {
    if (!assignDialog) return []
    const { partido, rol } = assignDialog
    const currentDesigs = getDesignacionesForPartido(partido.id)
    const alreadyAssigned = new Set(currentDesigs.map((d) => d.arbitro_id))

    // Determine allowed categories for this role based on trio rules
    // If principal is already assigned, filter assistants by the matching rule
    const principalDesig = currentDesigs.find((d) => d.rol === "principal")
    let allowedCategories: CategoriaArbitro[] | null = null

    if (rol !== "principal" && principalDesig?.arbitro) {
      const principalCat = principalDesig.arbitro.categoria
      for (const rule of trioRules) {
        if (rule.principal.includes(principalCat)) {
          allowedCategories = rule.asistentes
          break
        }
      }
    } else if (rol === "principal") {
      // For principal, collect all allowed principal categories
      allowedCategories = trioRules.flatMap((r) => r.principal)
    }

    return activeArbitros
      .filter((a) => {
        if (alreadyAssigned.has(a.id)) return false
        if (allowedCategories && !allowedCategories.includes(a.categoria))
          return false
        return true
      })
      .map((a) => {
        const { conflicts, warnings } = getArbitroConflicts(a.id, partido)
        const travel = getTravelBurden(a.localidad, partido.campo)
        return { ...a, conflicts, warnings, travel }
      })
      .sort((a, b) => {
        // Hard conflicts first (push to bottom)
        if (a.conflicts.length !== b.conflicts.length)
          return a.conflicts.length - b.conflicts.length
        // Then by travel time (shorter = better)
        return a.travel.ida - b.travel.ida
      })
  }, [
    assignDialog,
    activeArbitros,
    getDesignacionesForPartido,
    getArbitroConflicts,
    trioRules,
  ])

  // --- ASIGNAR ARBITRO ---
  const handleAssign = useCallback(
    async (arbitroId: string, partido: Partido, rol: RolDesignacion) => {
      const res = await fetch("/api/designaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partido_id: partido.id,
          arbitro_id: arbitroId,
          rol,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        setDesignaciones((prev) => {
          const filtered = prev.filter(
            (d) => !(d.partido_id === partido.id && d.rol === rol)
          )
          return [...filtered, result.data]
        })
        toast.success("Arbitro designado correctamente")
        setAssignDialog(null)
        router.refresh()
      } else {
        toast.error(result.error || "Error al designar")
      }
    },
    [router]
  )

  // --- ELIMINAR DESIGNACION ---
  const handleRemoveDesig = useCallback(
    async (desigId: string) => {
      const res = await fetch(`/api/designaciones?id=${desigId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDesignaciones((prev) => prev.filter((d) => d.id !== desigId))
        toast.success("Designacion eliminada")
        router.refresh()
      } else {
        toast.error("Error al eliminar designacion")
      }
    },
    [router]
  )

  // ================================================================
  // AUTO-DESIGNACION INTELIGENTE
  // ================================================================
  const handleAutoAssign = useCallback(async () => {
    setAutoAssigning(true)
    const log: string[] = []
    log.push("=== INICIO AUTO-DESIGNACION ===")
    log.push(`Tipo: ${TIPO_LABELS[tipo]}`)
    log.push(`Arbitros activos: ${activeArbitros.length}`)
    log.push(`Partidos: ${partidos.length}`)
    log.push("")

    const assignments: {
      partido_id: string
      arbitro_id: string
      rol: RolDesignacion
    }[] = []

    // Track all assignment state (existing + new)
    const arbitroSchedule: Map<
      string,
      { fecha: string; hora: string; campo: string; tipo: TipoPartido }[]
    > = new Map()

    // Initialize with existing designations
    for (const d of designaciones) {
      if (d.partido) {
        const times = arbitroSchedule.get(d.arbitro_id) || []
        times.push({
          fecha: d.partido.fecha,
          hora: d.partido.hora,
          campo: d.partido.campo,
          tipo: d.partido.tipo as TipoPartido,
        })
        arbitroSchedule.set(d.arbitro_id, times)
      }
    }

    // Sort matches: higher category first, then by date/time
    const sortedPartidos = [...partidos].sort((a, b) => {
      const dateComp = a.fecha.localeCompare(b.fecha)
      if (dateComp !== 0) return dateComp
      return a.hora.localeCompare(b.hora)
    })

    for (const partido of sortedPartidos) {
      const existingDesigs = designaciones.filter(
        (d) => d.partido_id === partido.id
      )
      const newAssignmentsForMatch = assignments.filter(
        (a) => a.partido_id === partido.id
      )
      const allAssignedIds = new Set([
        ...existingDesigs.map((d) => d.arbitro_id),
        ...newAssignmentsForMatch.map((a) => a.arbitro_id),
      ])

      // Check if principal is already set (existing or just assigned)
      let principalCat: CategoriaArbitro | null = null
      const existingPrincipal = existingDesigs.find(
        (d) => d.rol === "principal"
      )
      if (existingPrincipal?.arbitro) {
        principalCat = existingPrincipal.arbitro.categoria
      }

      log.push(
        `--- ${partido.equipo_local} vs ${partido.equipo_visitante} (${partido.fecha} ${partido.hora}, ${partido.campo}) ---`
      )

      // Determine the best trio rule to apply
      let selectedRule: TrioRule | null = null

      if (principalCat) {
        // Principal already assigned - find matching rule
        for (const rule of trioRules) {
          if (rule.principal.includes(principalCat)) {
            selectedRule = rule
            break
          }
        }
      } else if (tipo !== "futbol_7") {
        // Need to pick the best rule based on available referees
        // Prefer Division Honor + 2 Provinciales if we have them
        for (const rule of trioRules) {
          const availablePrincipals = activeArbitros.filter(
            (a) =>
              rule.principal.includes(a.categoria) &&
              !allAssignedIds.has(a.id)
          )
          const neededAssistants = roles.length - 1
          const availableAssistants = activeArbitros.filter(
            (a) =>
              rule.asistentes.includes(a.categoria) &&
              !allAssignedIds.has(a.id)
          )

          if (
            availablePrincipals.length > 0 &&
            availableAssistants.length >= neededAssistants
          ) {
            // Check that at least some can make it (no hard conflict + reasonable travel)
            const viablePrincipals = availablePrincipals.filter((p) => {
              const schedule = arbitroSchedule.get(p.id) || []
              return !schedule.some((s) => {
                if (s.fecha !== partido.fecha) return false
                const result = canMakeItBetweenMatches(
                  p.localidad,
                  s.campo,
                  s.hora,
                  partido.campo,
                  partido.hora,
                  s.fecha,
                  partido.fecha,
                  matchDuration
                )
                return !result.canMakeIt
              })
            })

            if (viablePrincipals.length > 0) {
              selectedRule = rule
              log.push(
                `  Regla seleccionada: ${rule.principal.join("/")} + ${rule.asistentes.join("/")}`
              )
              break
            }
          }
        }

        if (!selectedRule && trioRules.length > 0) {
          selectedRule = trioRules[trioRules.length - 1]
          log.push(
            `  Regla fallback: ${selectedRule.principal.join("/")} + ${selectedRule.asistentes.join("/")}`
          )
        }
      }

      // Now assign each role
      for (const rol of roles) {
        if (
          existingDesigs.some((d) => d.rol === rol) ||
          newAssignmentsForMatch.some((a) => a.rol === rol)
        ) {
          log.push(`  [${ROL_LABELS[rol]}] Ya asignado, saltando`)
          continue
        }

        // Determine allowed categories for this role
        let allowedCats: CategoriaArbitro[]
        if (!selectedRule) {
          // futbol_7 or no rule
          allowedCats = [
            "division_honor",
            "provincial",
            "oficial",
            "nuevo_ingreso",
          ]
        } else if (rol === "principal") {
          allowedCats = selectedRule.principal
        } else {
          allowedCats = selectedRule.asistentes
        }

        // Filter and score candidates
        const candidates = activeArbitros
          .filter((arb) => {
            if (allAssignedIds.has(arb.id)) return false
            if (!allowedCats.includes(arb.categoria)) return false

            // Check time/travel conflicts
            const schedule = arbitroSchedule.get(arb.id) || []
            for (const s of schedule) {
              if (s.fecha !== partido.fecha) continue
              const result = canMakeItBetweenMatches(
                arb.localidad,
                s.campo,
                s.hora,
                partido.campo,
                partido.hora,
                s.fecha,
                partido.fecha,
                matchDuration
              )
              if (!result.canMakeIt) return false
            }

            // Minor restrictions: can't return home too late
            if (arb.es_menor) {
              const travel = getTravelBurden(arb.localidad, partido.campo)
              const partidoEnd =
                timeToMinutes(partido.hora) + matchDuration
              const returnTime = partidoEnd + travel.vuelta
              if (returnTime > 23 * 60) return false
            }

            return true
          })
          .map((arb) => {
            const travel = getTravelBurden(arb.localidad, partido.campo)
            const schedule = arbitroSchedule.get(arb.id) || []

            // --- SCORING ---
            let score = 100

            // 1. TRAVEL: strongly prefer closer referees (biggest factor)
            //    0 min = +50, 30 min = +35, 60 min = +20, 90 min = +5, 120+ = 0
            score += Math.max(0, 50 - Math.floor(travel.ida * 0.55))

            // 2. CATEGORY PRIORITY for the specific role
            if (rol === "principal") {
              score += CATEGORIA_RANK[arb.categoria] * 8
            } else {
              // For assistants, exact category match is important
              score += CATEGORIA_RANK[arb.categoria] * 5
            }

            // 3. LOAD BALANCING: fewer matches = higher score
            score -= schedule.length * 12

            // 4. CAR: important for far away venues
            if (arb.tiene_coche) {
              score += travel.ida > 30 ? 15 : 5
            } else if (travel.ida > 20) {
              score -= 20 // penalty for no car + far
            }

            // 5. MINOR penalty for late matches
            if (arb.es_menor && timeToMinutes(partido.hora) >= 19 * 60) {
              score -= 25
            }

            // 6. Tight schedule penalty
            for (const s of schedule) {
              if (s.fecha !== partido.fecha) continue
              const result = canMakeItBetweenMatches(
                arb.localidad,
                s.campo,
                s.hora,
                partido.campo,
                partido.hora,
                s.fecha,
                partido.fecha,
                matchDuration
              )
              if (result.canMakeIt) {
                const margin = result.availableMinutes - result.travelMinutes
                if (margin < 30) score -= 15
                else if (margin < 45) score -= 8
              }
            }

            return { arb, score, travel }
          })
          .sort((a, b) => b.score - a.score)

        if (candidates.length > 0) {
          const best = candidates[0]
          assignments.push({
            partido_id: partido.id,
            arbitro_id: best.arb.id,
            rol,
          })
          allAssignedIds.add(best.arb.id)

          const times = arbitroSchedule.get(best.arb.id) || []
          times.push({
            fecha: partido.fecha,
            hora: partido.hora,
            campo: partido.campo,
            tipo,
          })
          arbitroSchedule.set(best.arb.id, times)

          // Track principal category for subsequent assistant assignments
          if (rol === "principal") {
            principalCat = best.arb.categoria
            // Re-select the rule based on assigned principal
            if (tipo !== "futbol_7") {
              for (const rule of trioRules) {
                if (rule.principal.includes(principalCat)) {
                  selectedRule = rule
                  break
                }
              }
            }
          }

          log.push(
            `  [${ROL_LABELS[rol]}] ${best.arb.nombre} (${CATEGORIA_LABELS[best.arb.categoria]}, ${best.arb.localidad}) - Viaje: ${formatTiempo(best.travel.ida)}, Score: ${best.score}`
          )
        } else {
          log.push(
            `  [${ROL_LABELS[rol]}] SIN CANDIDATO DISPONIBLE - Cats permitidas: ${allowedCats.map((c) => CATEGORIA_LABELS[c]).join(", ")}`
          )
        }
      }
      log.push("")
    }

    log.push(`=== RESULTADO: ${assignments.length} designaciones ===`)
    setAutoAssignLog(log)

    if (assignments.length === 0) {
      toast.info(
        "Todos los partidos ya estan designados o no hay arbitros disponibles"
      )
      setAutoAssigning(false)
      setShowLog(true)
      return
    }

    // Save all assignments
    const res = await fetch("/api/designaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assignments),
    })

    const result = await res.json()
    setAutoAssigning(false)

    if (res.ok) {
      toast.success(
        `${assignments.length} designaciones realizadas automaticamente`
      )
      setDesignaciones((prev) => [...prev, ...(result.data || [])])
      setShowLog(true)
      router.refresh()
    } else {
      toast.error(result.error || "Error en auto-designacion")
    }
  }, [
    partidos,
    activeArbitros,
    designaciones,
    roles,
    router,
    tipo,
    trioRules,
    matchDuration,
  ])

  // --- STATS ---
  const partidoCompleteness = useMemo(() => {
    const map: Record<string, { filled: number; total: number }> = {}
    for (const p of partidos) {
      const desigs = getDesignacionesForPartido(p.id)
      map[p.id] = { filled: desigs.length, total: roles.length }
    }
    return map
  }, [partidos, roles, getDesignacionesForPartido])

  const totalDesignados = Object.values(partidoCompleteness).filter(
    (v) => v.filled === v.total
  ).length

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Designaciones - {TIPO_LABELS[tipo]}
            </h1>
            <p className="text-sm text-muted-foreground">
              {partidos.length} partidos | {totalDesignados} completamente
              designados
            </p>
            {tipo !== "futbol_7" && (
              <p className="mt-1 text-xs text-muted-foreground">
                <Shield className="mr-1 inline h-3 w-3" />
                Reglas: Div. Honor + 2 Provinciales o Provincial + 2 Oficiales
                {tipo === "futbol_sala" &&
                  " (1 asistente)"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddMatch(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Partido
            </Button>
            {autoAssignLog.length > 0 && (
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => setShowLog(true)}
              >
                <Info className="h-4 w-4" />
                Ver Log
              </Button>
            )}
            <Button
              onClick={handleAutoAssign}
              disabled={autoAssigning}
              className="gap-2 bg-[hsl(40,90%,50%)] text-[hsl(40,90%,12%)] hover:bg-[hsl(40,90%,45%)]"
            >
              <Zap className="h-4 w-4" />
              {autoAssigning ? "Designando..." : "Auto-Designar"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Partidos</p>
                <p className="text-lg font-bold text-foreground">
                  {partidos.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Check className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Completos</p>
                <p className="text-lg font-bold text-foreground">
                  {totalDesignados}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Pendientes</p>
                <p className="text-lg font-bold text-foreground">
                  {partidos.length - totalDesignados}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Arbitros Activos
                </p>
                <p className="text-lg font-bold text-foreground">
                  {activeArbitros.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Cards */}
        <div className="flex flex-col gap-4">
          {partidos.map((partido) => {
            const desigs = getDesignacionesForPartido(partido.id)
            const isComplete = desigs.length === roles.length
            const isExpanded = expandedMatch === partido.id
            const localidadPartido = extractLocalidadFromCampo(partido.campo)

            return (
              <Card
                key={partido.id}
                className={
                  isComplete
                    ? "border-primary/30 bg-primary/5"
                    : "border-border"
                }
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">
                          {partido.equipo_local} vs{" "}
                          {partido.equipo_visitante}
                        </h3>
                        {isComplete ? (
                          <Badge className="bg-primary/15 text-primary">
                            <Check className="mr-1 h-3 w-3" />
                            Completo
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/15 text-destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {desigs.length}/{roles.length}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {partido.fecha}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {partido.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {partido.campo}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          <Navigation className="mr-1 h-3 w-3" />
                          {localidadPartido}
                        </Badge>
                      </div>
                      {partido.jornada && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {partido.categoria_partido} - {partido.jornada}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        setExpandedMatch(isExpanded ? null : partido.id)
                      }
                      aria-label={isExpanded ? "Contraer" : "Expandir"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="px-4 pb-4 pt-2">
                    <div className="flex flex-col gap-2">
                      {roles.map((rol) => {
                        const desig = desigs.find((d) => d.rol === rol)
                        const arb = desig?.arbitro
                        const travel = arb
                          ? getTravelBurden(arb.localidad, partido.campo)
                          : null

                        return (
                          <div
                            key={rol}
                            className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs font-medium"
                              >
                                {ROL_LABELS[rol]}
                              </Badge>
                              {arb ? (
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {arb.nombre}
                                  </p>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {CATEGORIA_LABELS[arb.categoria]}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="h-3 w-3" />
                                      {arb.localidad}
                                    </span>
                                    {travel && travel.ida > 0 && (
                                      <span className="flex items-center gap-0.5">
                                        <Navigation className="h-3 w-3" />
                                        {formatTiempo(travel.ida)}
                                      </span>
                                    )}
                                    {arb.tiene_coche && (
                                      <span className="flex items-center gap-0.5">
                                        <Car className="h-3 w-3" />
                                        Coche
                                      </span>
                                    )}
                                    {arb.es_menor && (
                                      <Badge
                                        variant="outline"
                                        className="px-1 py-0 text-[10px]"
                                      >
                                        Menor
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm italic text-muted-foreground">
                                  Sin asignar
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {desig ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleRemoveDesig(desig.id)
                                  }
                                  aria-label="Eliminar designacion"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-primary"
                                  onClick={() =>
                                    setAssignDialog({ partido, rol })
                                  }
                                  aria-label="Asignar arbitro"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}

          {partidos.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No hay partidos de {TIPO_LABELS[tipo]} esta semana
                </p>
                <Button
                  onClick={() => setShowAddMatch(true)}
                  className="mt-4 gap-2 bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Anadir Partido
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Assign Dialog */}
        <AssignArbitroDialog
          open={!!assignDialog}
          onClose={() => setAssignDialog(null)}
          partido={assignDialog?.partido ?? null}
          rol={assignDialog?.rol ?? "principal"}
          arbitros={availableArbitros}
          onAssign={(arbitroId) => {
            if (assignDialog) {
              handleAssign(
                arbitroId,
                assignDialog.partido,
                assignDialog.rol
              )
            }
          }}
        />

        {/* Add Match Dialog */}
        <AddMatchDialog
          open={showAddMatch}
          onClose={() => setShowAddMatch(false)}
          tipo={tipo}
          onAdded={() => {
            router.refresh()
          }}
        />

        {/* Auto-Assign Log Dialog */}
        <Dialog open={showLog} onOpenChange={setShowLog}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log de Auto-Designacion</DialogTitle>
            </DialogHeader>
            <div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
              {autoAssignLog.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.startsWith("===")
                      ? "font-bold text-primary"
                      : line.startsWith("---")
                        ? "mt-2 font-semibold text-foreground"
                        : line.includes("SIN CANDIDATO")
                          ? "text-destructive"
                          : line.includes("Regla")
                            ? "text-[hsl(40,90%,40%)]"
                            : "text-muted-foreground"
                  }
                >
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// ============================================================
// DIALOG: ASIGNAR ARBITRO MANUALMENTE
// ============================================================
function AssignArbitroDialog({
  open,
  onClose,
  partido,
  rol,
  arbitros,
  onAssign,
}: {
  open: boolean
  onClose: () => void
  partido: Partido | null
  rol: RolDesignacion
  arbitros: (Arbitro & {
    conflicts: string[]
    warnings: string[]
    travel: { ida: number; vuelta: number; total: number }
  })[]
  onAssign: (arbitroId: string) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = arbitros.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.localidad.toLowerCase().includes(search.toLowerCase()) ||
      CATEGORIA_LABELS[a.categoria]
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span>Asignar {ROL_LABELS[rol]}</span>
            {partido && (
              <span className="text-sm font-normal text-muted-foreground">
                {partido.equipo_local} vs {partido.equipo_visitante} -{" "}
                {partido.fecha} {partido.hora}
              </span>
            )}
            {partido && (
              <span className="text-xs font-normal text-muted-foreground">
                <MapPin className="mr-1 inline h-3 w-3" />
                {partido.campo}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Buscar por nombre, localidad o categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        <div className="mb-2 text-xs text-muted-foreground">
          {filtered.length} arbitros disponibles para esta posicion
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((arb) => (
            <button
              key={arb.id}
              onClick={() =>
                arb.conflicts.length === 0 && onAssign(arb.id)
              }
              disabled={arb.conflicts.length > 0}
              className={`flex items-start justify-between rounded-lg border p-3 text-left transition-colors ${
                arb.conflicts.length > 0
                  ? "cursor-not-allowed border-destructive/20 bg-destructive/5 opacity-60"
                  : "border-border hover:bg-muted"
              }`}
              type="button"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {arb.nombre}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORIA_LABELS[arb.categoria]}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {arb.localidad}
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {formatTiempo(arb.travel.ida)}
                  </span>
                  {arb.tiene_coche && (
                    <span className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      Coche
                    </span>
                  )}
                  {arb.es_menor && (
                    <Badge variant="outline" className="text-[10px]">
                      Menor
                    </Badge>
                  )}
                </div>
                {arb.conflicts.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    {arb.conflicts.map((c, i) => (
                      <span
                        key={i}
                        className="flex items-start gap-1 text-xs text-destructive"
                      >
                        <X className="mt-0.5 h-3 w-3 shrink-0" />
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {arb.warnings.length > 0 && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    {arb.warnings.map((w, i) => (
                      <span
                        key={i}
                        className="flex items-start gap-1 text-xs text-[hsl(40,90%,40%)]"
                      >
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {arb.conflicts.length === 0 && (
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay arbitros disponibles para esta posicion
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// DIALOG: ANADIR PARTIDO
// ============================================================
function AddMatchDialog({
  open,
  onClose,
  tipo,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  tipo: TipoPartido
  onAdded: (p: Partido) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      tipo,
      equipo_local: fd.get("equipo_local") as string,
      equipo_visitante: fd.get("equipo_visitante") as string,
      fecha: fd.get("fecha") as string,
      hora: fd.get("hora") as string,
      campo: fd.get("campo") as string,
      categoria_partido: fd.get("categoria_partido") as string,
      jornada: (fd.get("jornada") as string) || null,
    }

    const res = await fetch("/api/partidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    setLoading(false)

    if (res.ok) {
      toast.success("Partido creado")
      onAdded(result.data)
      onClose()
    } else {
      toast.error(result.error || "Error al crear partido")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Partido - {TIPO_LABELS[tipo]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="equipo_local">Equipo Local</Label>
              <Input id="equipo_local" name="equipo_local" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="equipo_visitante">Equipo Visitante</Label>
              <Input
                id="equipo_visitante"
                name="equipo_visitante"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" name="hora" type="time" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="campo">
              Campo (incluir localidad entre parentesis)
            </Label>
            <Input
              id="campo"
              name="campo"
              required
              placeholder="Ej: Estadio Municipal (Lucena)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoria_partido">Categoria</Label>
              <Input
                id="categoria_partido"
                name="categoria_partido"
                required
                placeholder="Ej: Tercera RFEF"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jornada">Jornada</Label>
              <Input
                id="jornada"
                name="jornada"
                placeholder="Ej: Jornada 22"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground"
            >
              {loading ? "Creando..." : "Crear Partido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
