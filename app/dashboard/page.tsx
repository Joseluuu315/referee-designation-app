import { createClient } from "@/lib/supabase/server"
import { DashboardOverview } from "@/components/dashboard-overview"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [arbitrosRes, partidosRes, designacionesRes] = await Promise.all([
    supabase.from("arbitros").select("*"),
    supabase.from("partidos").select("*"),
    supabase.from("designaciones").select("*, arbitro:arbitros(*), partido:partidos(*)"),
  ])

  const arbitros = arbitrosRes.data ?? []
  const partidos = partidosRes.data ?? []
  const designaciones = designacionesRes.data ?? []

  return (
    <DashboardOverview
      arbitros={arbitros}
      partidos={partidos}
      designaciones={designaciones}
    />
  )
}
