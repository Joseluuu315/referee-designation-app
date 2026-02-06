/**
 * Sistema de distancias y tiempos de desplazamiento entre localidades de la provincia de Cordoba.
 * Los tiempos estan en MINUTOS y representan el tiempo real de conduccion (no linea recta).
 * Fuente: Google Maps rutas habituales.
 */

// Localidades principales de la provincia de Cordoba
export const LOCALIDADES_CORDOBA = [
  "Cordoba",
  "Lucena",
  "Montilla",
  "Priego de Cordoba",
  "Puente Genil",
  "Cabra",
  "Baena",
  "Pozoblanco",
  "Palma del Rio",
  "Montoro",
  "La Carlota",
  "Villanueva de Cordoba",
  "Hinojosa del Duque",
  "Penarroya-Pueblonuevo",
  "Aguilar de la Frontera",
  "Rute",
  "Fernán Núñez",
  "Castro del Rio",
  "Bujalance",
  "Villa del Rio",
] as const

export type LocalidadCordoba = (typeof LOCALIDADES_CORDOBA)[number]

/**
 * Matriz de tiempos de viaje en MINUTOS entre localidades.
 * Tiempos estimados en coche por carretera convencional/autovia.
 * Son tiempos de IDA, no ida y vuelta.
 */
const TIEMPOS_VIAJE: Record<string, Record<string, number>> = {
  Cordoba: {
    Cordoba: 0,
    Lucena: 70,
    Montilla: 45,
    "Priego de Cordoba": 85,
    "Puente Genil": 75,
    Cabra: 65,
    Baena: 55,
    Pozoblanco: 80,
    "Palma del Rio": 55,
    Montoro: 45,
    "La Carlota": 35,
    "Villanueva de Cordoba": 75,
    "Hinojosa del Duque": 95,
    "Penarroya-Pueblonuevo": 90,
    "Aguilar de la Frontera": 50,
    Rute: 85,
    "Fernán Núñez": 30,
    "Castro del Rio": 40,
    Bujalance: 40,
    "Villa del Rio": 55,
  },
  Lucena: {
    Cordoba: 70,
    Lucena: 0,
    Montilla: 30,
    "Priego de Cordoba": 30,
    "Puente Genil": 25,
    Cabra: 15,
    Baena: 45,
    Pozoblanco: 130,
    "Palma del Rio": 90,
    Montoro: 100,
    "La Carlota": 55,
    "Villanueva de Cordoba": 130,
    "Hinojosa del Duque": 150,
    "Penarroya-Pueblonuevo": 140,
    "Aguilar de la Frontera": 20,
    Rute: 25,
    "Fernán Núñez": 45,
    "Castro del Rio": 65,
    Bujalance: 80,
    "Villa del Rio": 95,
  },
  Montilla: {
    Cordoba: 45,
    Lucena: 30,
    Montilla: 0,
    "Priego de Cordoba": 55,
    "Puente Genil": 30,
    Cabra: 30,
    Baena: 45,
    Pozoblanco: 110,
    "Palma del Rio": 70,
    Montoro: 80,
    "La Carlota": 30,
    "Villanueva de Cordoba": 110,
    "Hinojosa del Duque": 130,
    "Penarroya-Pueblonuevo": 120,
    "Aguilar de la Frontera": 12,
    Rute: 45,
    "Fernán Núñez": 18,
    "Castro del Rio": 40,
    Bujalance: 60,
    "Villa del Rio": 75,
  },
  "Priego de Cordoba": {
    Cordoba: 85,
    Lucena: 30,
    Montilla: 55,
    "Priego de Cordoba": 0,
    "Puente Genil": 50,
    Cabra: 25,
    Baena: 40,
    Pozoblanco: 140,
    "Palma del Rio": 110,
    Montoro: 95,
    "La Carlota": 80,
    "Villanueva de Cordoba": 140,
    "Hinojosa del Duque": 160,
    "Penarroya-Pueblonuevo": 150,
    "Aguilar de la Frontera": 45,
    Rute: 15,
    "Fernán Núñez": 60,
    "Castro del Rio": 55,
    Bujalance: 80,
    "Villa del Rio": 100,
  },
  "Puente Genil": {
    Cordoba: 75,
    Lucena: 25,
    Montilla: 30,
    "Priego de Cordoba": 50,
    "Puente Genil": 0,
    Cabra: 35,
    Baena: 65,
    Pozoblanco: 130,
    "Palma del Rio": 80,
    Montoro: 100,
    "La Carlota": 45,
    "Villanueva de Cordoba": 130,
    "Hinojosa del Duque": 150,
    "Penarroya-Pueblonuevo": 140,
    "Aguilar de la Frontera": 18,
    Rute: 40,
    "Fernán Núñez": 50,
    "Castro del Rio": 70,
    Bujalance: 85,
    "Villa del Rio": 100,
  },
  Cabra: {
    Cordoba: 65,
    Lucena: 15,
    Montilla: 30,
    "Priego de Cordoba": 25,
    "Puente Genil": 35,
    Cabra: 0,
    Baena: 30,
    Pozoblanco: 120,
    "Palma del Rio": 90,
    Montoro: 85,
    "La Carlota": 55,
    "Villanueva de Cordoba": 120,
    "Hinojosa del Duque": 140,
    "Penarroya-Pueblonuevo": 130,
    "Aguilar de la Frontera": 25,
    Rute: 20,
    "Fernán Núñez": 40,
    "Castro del Rio": 45,
    Bujalance: 65,
    "Villa del Rio": 80,
  },
  Baena: {
    Cordoba: 55,
    Lucena: 45,
    Montilla: 45,
    "Priego de Cordoba": 40,
    "Puente Genil": 65,
    Cabra: 30,
    Baena: 0,
    Pozoblanco: 100,
    "Palma del Rio": 90,
    Montoro: 60,
    "La Carlota": 60,
    "Villanueva de Cordoba": 100,
    "Hinojosa del Duque": 120,
    "Penarroya-Pueblonuevo": 115,
    "Aguilar de la Frontera": 40,
    Rute: 50,
    "Fernán Núñez": 35,
    "Castro del Rio": 20,
    Bujalance: 35,
    "Villa del Rio": 50,
  },
  Pozoblanco: {
    Cordoba: 80,
    Lucena: 130,
    Montilla: 110,
    "Priego de Cordoba": 140,
    "Puente Genil": 130,
    Cabra: 120,
    Baena: 100,
    Pozoblanco: 0,
    "Palma del Rio": 120,
    Montoro: 65,
    "La Carlota": 100,
    "Villanueva de Cordoba": 30,
    "Hinojosa del Duque": 40,
    "Penarroya-Pueblonuevo": 55,
    "Aguilar de la Frontera": 105,
    Rute: 135,
    "Fernán Núñez": 90,
    "Castro del Rio": 75,
    Bujalance: 60,
    "Villa del Rio": 50,
  },
  "Palma del Rio": {
    Cordoba: 55,
    Lucena: 90,
    Montilla: 70,
    "Priego de Cordoba": 110,
    "Puente Genil": 80,
    Cabra: 90,
    Baena: 90,
    Pozoblanco: 120,
    "Palma del Rio": 0,
    Montoro: 85,
    "La Carlota": 40,
    "Villanueva de Cordoba": 120,
    "Hinojosa del Duque": 130,
    "Penarroya-Pueblonuevo": 100,
    "Aguilar de la Frontera": 55,
    Rute: 100,
    "Fernán Núñez": 55,
    "Castro del Rio": 70,
    Bujalance: 75,
    "Villa del Rio": 85,
  },
  Montoro: {
    Cordoba: 45,
    Lucena: 100,
    Montilla: 80,
    "Priego de Cordoba": 95,
    "Puente Genil": 100,
    Cabra: 85,
    Baena: 60,
    Pozoblanco: 65,
    "Palma del Rio": 85,
    Montoro: 0,
    "La Carlota": 65,
    "Villanueva de Cordoba": 55,
    "Hinojosa del Duque": 85,
    "Penarroya-Pueblonuevo": 90,
    "Aguilar de la Frontera": 75,
    Rute: 100,
    "Fernán Núñez": 55,
    "Castro del Rio": 35,
    Bujalance: 25,
    "Villa del Rio": 15,
  },
  "La Carlota": {
    Cordoba: 35,
    Lucena: 55,
    Montilla: 30,
    "Priego de Cordoba": 80,
    "Puente Genil": 45,
    Cabra: 55,
    Baena: 60,
    Pozoblanco: 100,
    "Palma del Rio": 40,
    Montoro: 65,
    "La Carlota": 0,
    "Villanueva de Cordoba": 100,
    "Hinojosa del Duque": 120,
    "Penarroya-Pueblonuevo": 100,
    "Aguilar de la Frontera": 20,
    Rute: 70,
    "Fernán Núñez": 15,
    "Castro del Rio": 45,
    Bujalance: 55,
    "Villa del Rio": 70,
  },
  "Villanueva de Cordoba": {
    Cordoba: 75,
    Lucena: 130,
    Montilla: 110,
    "Priego de Cordoba": 140,
    "Puente Genil": 130,
    Cabra: 120,
    Baena: 100,
    Pozoblanco: 30,
    "Palma del Rio": 120,
    Montoro: 55,
    "La Carlota": 100,
    "Villanueva de Cordoba": 0,
    "Hinojosa del Duque": 50,
    "Penarroya-Pueblonuevo": 60,
    "Aguilar de la Frontera": 105,
    Rute: 135,
    "Fernán Núñez": 85,
    "Castro del Rio": 70,
    Bujalance: 60,
    "Villa del Rio": 45,
  },
}

/**
 * Extracts the locality name from a campo/venue string.
 * Pattern: "Estadio Municipal (Lucena)" -> "Lucena"
 * Also handles "Ciudad Deportiva Cordoba" -> "Cordoba"
 */
export function extractLocalidadFromCampo(campo: string): string {
  // Check for parentheses pattern: "... (Localidad)"
  const parenMatch = campo.match(/\(([^)]+)\)/)
  if (parenMatch) {
    return parenMatch[1].trim()
  }

  // Check if any known locality is mentioned in the field name
  for (const loc of LOCALIDADES_CORDOBA) {
    if (campo.toLowerCase().includes(loc.toLowerCase())) {
      return loc
    }
  }

  // Default fallback
  return "Cordoba"
}

/**
 * Get travel time in minutes between two localities.
 * If not found in the matrix, estimates based on a default.
 */
export function getTiempoViaje(origen: string, destino: string): number {
  // Normalize names
  const o = normalizeLocalidad(origen)
  const d = normalizeLocalidad(destino)

  if (o === d) return 0

  // Direct lookup
  if (TIEMPOS_VIAJE[o]?.[d] !== undefined) {
    return TIEMPOS_VIAJE[o][d]
  }

  // Reverse lookup
  if (TIEMPOS_VIAJE[d]?.[o] !== undefined) {
    return TIEMPOS_VIAJE[d][o]
  }

  // Unknown locality - assume 60 min (medium distance in the province)
  return 60
}

/**
 * Normalize locality name to match the matrix keys.
 */
function normalizeLocalidad(loc: string): string {
  const normalized = loc.trim()

  // Check exact match first
  if (TIEMPOS_VIAJE[normalized]) return normalized

  // Case-insensitive match
  for (const key of Object.keys(TIEMPOS_VIAJE)) {
    if (key.toLowerCase() === normalized.toLowerCase()) return key
  }

  // Partial match
  for (const key of Object.keys(TIEMPOS_VIAJE)) {
    if (
      normalized.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalized.toLowerCase())
    ) {
      return key
    }
  }

  return normalized
}

/**
 * Format minutes into human-readable string.
 */
export function formatTiempo(minutos: number): string {
  if (minutos === 0) return "Local"
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/**
 * Check if a referee can physically make it between two matches
 * considering travel time + match duration + buffer.
 */
export function canMakeItBetweenMatches(
  localidadArbitro: string,
  campo1: string,
  hora1: string,
  campo2: string,
  hora2: string,
  fecha1: string,
  fecha2: string,
  duracionPartido: number = 105 // minutes - includes half-time, warm-up etc.
): { canMakeIt: boolean; travelMinutes: number; availableMinutes: number } {
  // Different days - always fine
  if (fecha1 !== fecha2) {
    return { canMakeIt: true, travelMinutes: 0, availableMinutes: 9999 }
  }

  const loc1 = extractLocalidadFromCampo(campo1)
  const loc2 = extractLocalidadFromCampo(campo2)

  const [h1, m1] = hora1.split(":").map(Number)
  const [h2, m2] = hora2.split(":").map(Number)
  const min1 = h1 * 60 + m1
  const min2 = h2 * 60 + m2

  // Determine which match is first
  const firstEnd = Math.min(min1, min2) + duracionPartido
  const secondStart = Math.max(min1, min2)

  // Time between end of first match and start of second
  const availableMinutes = secondStart - firstEnd

  // Travel time from first venue to second venue
  const travelBetweenVenues = getTiempoViaje(loc1, loc2)

  // Also need 15 min buffer for changing, etc.
  const totalNeeded = travelBetweenVenues + 15

  return {
    canMakeIt: availableMinutes >= totalNeeded,
    travelMinutes: travelBetweenVenues,
    availableMinutes,
  }
}

/**
 * Get the total travel burden for a referee for a given match.
 * Includes time from home to venue and back.
 */
export function getTravelBurden(
  localidadArbitro: string,
  campo: string
): { ida: number; vuelta: number; total: number } {
  const localidadPartido = extractLocalidadFromCampo(campo)
  const ida = getTiempoViaje(localidadArbitro, localidadPartido)
  return { ida, vuelta: ida, total: ida * 2 }
}
