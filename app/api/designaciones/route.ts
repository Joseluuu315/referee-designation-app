import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  if (Array.isArray(body)) {
    // Bulk assign
    const { data, error } = await supabase
      .from("designaciones")
      .upsert(body, { onConflict: "partido_id,rol" })
      .select("*, arbitro:arbitros(*), partido:partidos(*)")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data })
  }

  // Single assign
  const { data, error } = await supabase
    .from("designaciones")
    .upsert(body, { onConflict: "partido_id,rol" })
    .select("*, arbitro:arbitros(*), partido:partidos(*)")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ data })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  }

  const { error } = await supabase.from("designaciones").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
