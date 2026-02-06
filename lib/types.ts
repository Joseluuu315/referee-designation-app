export type CategoriaArbitro = "nuevo_ingreso" | "oficial" | "provincial" | "division_honor"
export type EstadoArbitro = "activo" | "permiso" | "baja"
export type TipoPartido = "futbol_11" | "futbol_7" | "futbol_femenino" | "futbol_sala"
export type RolDesignacion = "principal" | "asistente_1" | "asistente_2" | "cuarto"

export interface Arbitro {
  id: string
  nombre: string
  dni: string
  fecha_nacimiento: string
  es_menor: boolean
  categoria: CategoriaArbitro
  tiene_coche: boolean
  localidad: string
  estado: EstadoArbitro
  created_at: string
}

export interface Partido {
  id: string
  tipo: TipoPartido
  equipo_local: string
  equipo_visitante: string
  fecha: string
  hora: string
  campo: string
  categoria_partido: string
  jornada: string | null
  created_at: string
}

export interface Designacion {
  id: string
  partido_id: string
  arbitro_id: string
  rol: RolDesignacion
  created_at: string
  arbitro?: Arbitro
  partido?: Partido
}

export const CATEGORIA_LABELS: Record<CategoriaArbitro, string> = {
  nuevo_ingreso: "Nuevo Ingreso",
  oficial: "Oficial",
  provincial: "Provincial",
  division_honor: "Div. Honor",
}

export const ESTADO_LABELS: Record<EstadoArbitro, string> = {
  activo: "Activo",
  permiso: "Permiso",
  baja: "Baja",
}

export const TIPO_LABELS: Record<TipoPartido, string> = {
  futbol_11: "Futbol 11",
  futbol_7: "Futbol 7",
  futbol_femenino: "Futbol Femenino",
  futbol_sala: "Futbol Sala",
}

export const ROL_LABELS: Record<RolDesignacion, string> = {
  principal: "Principal",
  asistente_1: "Asistente 1",
  asistente_2: "Asistente 2",
  cuarto: "Cuarto Arbitro",
}
