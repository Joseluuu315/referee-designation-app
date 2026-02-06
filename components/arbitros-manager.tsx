"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  Car,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { Arbitro, CategoriaArbitro, EstadoArbitro } from "@/lib/types"
import { CATEGORIA_LABELS, ESTADO_LABELS } from "@/lib/types"
import { LOCALIDADES_CORDOBA } from "@/lib/distancias-cordoba"

function categoriaBadgeClass(cat: CategoriaArbitro) {
  switch (cat) {
    case "division_honor":
      return "bg-[hsl(40,90%,50%)] text-[hsl(40,90%,12%)]"
    case "provincial":
      return "bg-primary text-primary-foreground"
    case "oficial":
      return "bg-[hsl(210,60%,50%)] text-[hsl(0,0%,100%)]"
    case "nuevo_ingreso":
      return "bg-muted text-muted-foreground"
  }
}

function estadoBadgeClass(estado: EstadoArbitro) {
  switch (estado) {
    case "activo":
      return "bg-primary/15 text-primary"
    case "permiso":
      return "bg-[hsl(40,90%,50%)]/15 text-[hsl(40,70%,35%)]"
    case "baja":
      return "bg-destructive/15 text-destructive"
  }
}

export function ArbitrosManager({ initialArbitros }: { initialArbitros: Arbitro[] }) {
  const router = useRouter()
  const [arbitros, setArbitros] = useState(initialArbitros)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState<string>("all")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [editArbitro, setEditArbitro] = useState<Arbitro | null>(null)

  const filtered = arbitros.filter((a) => {
    const matchSearch =
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.dni.toLowerCase().includes(search.toLowerCase()) ||
      a.localidad.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === "all" || a.categoria === filterCat
    const matchEstado = filterEstado === "all" || a.estado === filterEstado
    return matchSearch && matchCat && matchEstado
  })

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/arbitros?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setArbitros((prev) => prev.filter((a) => a.id !== id))
        toast.success("Arbitro eliminado")
        router.refresh()
      } else {
        toast.error("Error al eliminar")
      }
    },
    [router]
  )

  const handleExport = useCallback(() => {
    const csv = [
      "nombre,dni,fecha_nacimiento,es_menor,categoria,tiene_coche,localidad,estado",
      ...arbitros.map(
        (a) =>
          `${a.nombre},${a.dni},${a.fecha_nacimiento},${a.es_menor},${a.categoria},${a.tiene_coche},${a.localidad},${a.estado}`
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "arbitros_rfaf.csv"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exportado")
  }, [arbitros])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion de Arbitros</h1>
          <p className="text-sm text-muted-foreground">
            {arbitros.length} arbitros registrados
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nuevo Arbitro
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI o localidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="nuevo_ingreso">Nuevo Ingreso</SelectItem>
                <SelectItem value="oficial">Oficial</SelectItem>
                <SelectItem value="provincial">Provincial</SelectItem>
                <SelectItem value="division_honor">Div. Honor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="permiso">Permiso</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    DNI
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                    Categoria
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Localidad
                  </th>
                  <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Coche
                  </th>
                  <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Menor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{a.nombre}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                      {a.dni}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Badge className={categoriaBadgeClass(a.categoria)}>
                        {CATEGORIA_LABELS[a.categoria]}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {a.localidad}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                      {a.tiene_coche ? (
                        <Car className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                      {a.es_menor ? (
                        <Badge variant="outline" className="text-xs">
                          Menor
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={estadoBadgeClass(a.estado)}>
                        {ESTADO_LABELS[a.estado]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditArbitro(a)}
                          aria-label={`Editar ${a.nombre}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(a.id)}
                          aria-label={`Eliminar ${a.nombre}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No se encontraron arbitros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <ArbitroFormDialog
        open={showAddDialog || !!editArbitro}
        onClose={() => {
          setShowAddDialog(false)
          setEditArbitro(null)
        }}
        arbitro={editArbitro}
        onSaved={(saved) => {
          if (editArbitro) {
            setArbitros((prev) => prev.map((a) => (a.id === saved.id ? saved : a)))
          } else {
            setArbitros((prev) => [...prev, saved])
          }
          router.refresh()
        }}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImported={(imported) => {
          setArbitros((prev) => {
            const existingDnis = new Set(prev.map((a) => a.dni))
            const newOnes = imported.filter((a: Arbitro) => !existingDnis.has(a.dni))
            return [...prev, ...newOnes]
          })
          router.refresh()
        }}
      />
    </div>
  )
}

function ArbitroFormDialog({
  open,
  onClose,
  arbitro,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  arbitro: Arbitro | null
  onSaved: (a: Arbitro) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      nombre: formData.get("nombre") as string,
      dni: formData.get("dni") as string,
      fecha_nacimiento: formData.get("fecha_nacimiento") as string,
      es_menor: formData.get("es_menor") === "on",
      categoria: formData.get("categoria") as string,
      tiene_coche: formData.get("tiene_coche") === "on",
      localidad: formData.get("localidad") as string,
      estado: formData.get("estado") as string,
      ...(arbitro ? { id: arbitro.id } : {}),
    }

    const res = await fetch("/api/arbitros", {
      method: arbitro ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await res.json()
    setLoading(false)

    if (res.ok) {
      toast.success(arbitro ? "Arbitro actualizado" : "Arbitro creado")
      onSaved(result.data)
      onClose()
    } else {
      toast.error(result.error || "Error al guardar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{arbitro ? "Editar Arbitro" : "Nuevo Arbitro"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              defaultValue={arbitro?.nombre ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" name="dni" required defaultValue={arbitro?.dni ?? ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fecha_nacimiento">Fecha Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                required
                defaultValue={arbitro?.fecha_nacimiento ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                name="categoria"
                required
                defaultValue={arbitro?.categoria ?? "nuevo_ingreso"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="nuevo_ingreso">Nuevo Ingreso</option>
                <option value="oficial">Oficial</option>
                <option value="provincial">Provincial</option>
                <option value="division_honor">Division de Honor</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="localidad">Localidad</Label>
              <select
                id="localidad"
                name="localidad"
                required
                defaultValue={arbitro?.localidad ?? "Cordoba"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {LOCALIDADES_CORDOBA.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                name="estado"
                required
                defaultValue={arbitro?.estado ?? "activo"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="activo">Activo</option>
                <option value="permiso">Permiso</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="tiene_coche"
                name="tiene_coche"
                defaultChecked={arbitro?.tiene_coche ?? false}
              />
              <Label htmlFor="tiene_coche">Tiene coche</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="es_menor"
                name="es_menor"
                defaultChecked={arbitro?.es_menor ?? false}
              />
              <Label htmlFor="es_menor">Es menor</Label>
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
              {loading ? "Guardando..." : arbitro ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ImportDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean
  onClose: () => void
  onImported: (data: Arbitro[]) => void
}) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [rawFile, setRawFile] = useState<Record<string, string>[]>([])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split("\n").filter((l) => l.trim())
      if (lines.length < 2) {
        toast.error("El CSV debe tener cabeceras y al menos una fila")
        return
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((h, i) => {
          row[h] = values[i] || ""
        })
        return row
      })
      setRawFile(rows)
      setPreview(rows.slice(0, 5))
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (rawFile.length === 0) return
    setLoading(true)

    const mapped = rawFile.map((row) => ({
      nombre: row.nombre || "",
      dni: row.dni || "",
      fecha_nacimiento: row.fecha_nacimiento || "2000-01-01",
      es_menor: row.es_menor === "true" || row.es_menor === "si",
      categoria: row.categoria || "nuevo_ingreso",
      tiene_coche: row.tiene_coche === "true" || row.tiene_coche === "si",
      localidad: row.localidad || "",
      estado: row.estado || "activo",
    }))

    const res = await fetch("/api/arbitros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped),
    })

    const result = await res.json()
    setLoading(false)

    if (res.ok) {
      toast.success(`${result.count || mapped.length} arbitros importados`)
      onImported(result.data || [])
      setPreview([])
      setRawFile([])
      onClose()
    } else {
      toast.error(result.error || "Error al importar")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setPreview([])
          setRawFile([])
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Arbitros desde CSV</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              Formato: nombre,dni,fecha_nacimiento,es_menor,categoria,tiene_coche,localidad,estado
            </p>
            <Input type="file" accept=".csv" onChange={handleFile} className="mx-auto max-w-xs" />
          </div>

          {preview.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Vista previa ({rawFile.length} filas)
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 text-muted-foreground">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rawFile.length > 5 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  ...y {rawFile.length - 5} filas mas
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={rawFile.length === 0 || loading}
              className="bg-primary text-primary-foreground"
            >
              {loading ? "Importando..." : `Importar ${rawFile.length} arbitros`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
