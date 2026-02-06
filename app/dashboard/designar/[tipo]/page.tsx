import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { DesignacionPanel } from "@/components/designacion-panel"
import type { TipoPartido } from "@/lib/types"

const VALID_TIPOS: TipoPartido[] = [
  "futbol_11",
  "futbol_7",
  "futbol_femenino",
  "futbol_sala",
]

export default async function DesignarPage({
  params,
}: {
  params: Promise<{ tipo: string }>
}) {
  const { tipo } = await params

  if (!VALID_TIPOS.includes(tipo as TipoPartido)) {
    notFound()
  }

  const supabase = await createClient()

  const [partidosRes, arbitrosRes, designacionesRes] = await Promise.all([
    supabase
      .from("partidos")
      .select("*")
      .eq("tipo", tipo)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true }),
    supabase
      .from("arbitros")
      .select("*")
      .eq("estado", "activo")
      .order("nombre", { ascending: true }),
    supabase
      .from("designaciones")
      .select("*, arbitro:arbitros(*), partido:partidos(*)")
  ])

  return (
    <DesignacionPanel
      tipo={tipo as TipoPartido}
      partidos={partidosRes.data ?? []}
      arbitros={arbitrosRes.data ?? []}
      designaciones={designacionesRes.data ?? []}
    />
  )
}
