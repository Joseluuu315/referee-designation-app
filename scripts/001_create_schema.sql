-- RFAF Arbitros - Database Schema

-- Tabla de arbitros (referees)
CREATE TABLE IF NOT EXISTS public.arbitros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  es_menor BOOLEAN DEFAULT FALSE,
  categoria TEXT NOT NULL CHECK (categoria IN ('nuevo_ingreso', 'oficial', 'provincial', 'division_honor')),
  tiene_coche BOOLEAN DEFAULT FALSE,
  localidad TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'permiso', 'baja')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de partidos (matches)
CREATE TABLE IF NOT EXISTS public.partidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('futbol_11', 'futbol_7', 'futbol_femenino', 'futbol_sala')),
  equipo_local TEXT NOT NULL,
  equipo_visitante TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  campo TEXT NOT NULL,
  categoria_partido TEXT NOT NULL,
  jornada TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de designaciones (assignments)
CREATE TABLE IF NOT EXISTS public.designaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
  arbitro_id UUID NOT NULL REFERENCES public.arbitros(id) ON DELETE CASCADE,
  rol TEXT NOT NULL CHECK (rol IN ('principal', 'asistente_1', 'asistente_2', 'cuarto')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partido_id, rol)
);

-- Enable RLS but with permissive policies (admin-only app)
ALTER TABLE public.arbitros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designaciones ENABLE ROW LEVEL SECURITY;

-- Permissive policies for all operations (single admin app)
CREATE POLICY "Allow all on arbitros" ON public.arbitros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on partidos" ON public.partidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on designaciones" ON public.designaciones FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_arbitros_categoria ON public.arbitros(categoria);
CREATE INDEX IF NOT EXISTS idx_arbitros_estado ON public.arbitros(estado);
CREATE INDEX IF NOT EXISTS idx_partidos_tipo ON public.partidos(tipo);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON public.partidos(fecha);
CREATE INDEX IF NOT EXISTS idx_designaciones_partido ON public.designaciones(partido_id);
CREATE INDEX IF NOT EXISTS idx_designaciones_arbitro ON public.designaciones(arbitro_id);
