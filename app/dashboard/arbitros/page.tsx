import { createClient } from "@/lib/supabase/server"
import { ArbitrosManager } from "@/components/arbitros-manager"

export default async function ArbitrosPage() {
  const supabase = await createClient()
  const { data: arbitros } = await supabase
    .from("arbitros")
    .select("*")
    .order("nombre", { ascending: true })

  return <ArbitrosManager initialArbitros={arbitros ?? []} />
}
