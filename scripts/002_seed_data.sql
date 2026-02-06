-- Seed arbitros (referees) for testing
INSERT INTO public.arbitros (nombre, dni, fecha_nacimiento, es_menor, categoria, tiene_coche, localidad, estado) VALUES
  ('Carlos Ruiz Martinez', '12345678A', '1990-05-15', false, 'provincial', true, 'Sevilla', 'activo'),
  ('Miguel Angel Torres', '23456789B', '1985-11-22', false, 'division_honor', true, 'Cordoba', 'activo'),
  ('Juan Garcia Lopez', '34567890C', '1995-03-10', false, 'oficial', true, 'Malaga', 'activo'),
  ('Pedro Sanchez Ruiz', '45678901D', '2007-08-25', true, 'nuevo_ingreso', false, 'Sevilla', 'activo'),
  ('Antonio Moreno Gil', '56789012E', '1988-01-30', false, 'provincial', true, 'Granada', 'activo'),
  ('Francisco Diaz Perez', '67890123F', '1992-07-14', false, 'oficial', false, 'Jaen', 'activo'),
  ('David Lopez Navarro', '78901234G', '1998-12-03', false, 'nuevo_ingreso', false, 'Huelva', 'activo'),
  ('Alejandro Fernandez', '89012345H', '2006-09-18', true, 'nuevo_ingreso', false, 'Sevilla', 'activo'),
  ('Raul Jimenez Vega', '90123456I', '1991-04-07', false, 'oficial', true, 'Cadiz', 'activo'),
  ('Manuel Ortega Cruz', '01234567J', '1987-06-20', false, 'division_honor', true, 'Almeria', 'activo'),
  ('Jose Maria Blanco', '11223344K', '1993-02-11', false, 'provincial', true, 'Cordoba', 'activo'),
  ('Luis Herrera Molina', '22334455L', '1996-10-28', false, 'oficial', true, 'Malaga', 'activo'),
  ('Fernando Romero Soto', '33445566M', '2007-05-16', true, 'nuevo_ingreso', false, 'Sevilla', 'activo'),
  ('Pablo Reyes Castro', '44556677N', '1989-08-09', false, 'provincial', true, 'Granada', 'permiso'),
  ('Jorge Mendez Vargas', '55667788O', '1994-11-01', false, 'oficial', false, 'Jaen', 'baja'),
  ('Sergio Peña Luna', '66778899P', '1997-03-25', false, 'nuevo_ingreso', true, 'Huelva', 'activo'),
  ('Ivan Dominguez Rios', '77889900Q', '1986-09-12', false, 'division_honor', true, 'Cadiz', 'activo'),
  ('Roberto Marquez Pena', '88990011R', '2008-01-05', true, 'nuevo_ingreso', false, 'Almeria', 'activo'),
  ('Adrian Salazar Fuentes', '99001122S', '1990-12-15', false, 'provincial', true, 'Sevilla', 'activo'),
  ('Daniel Castro Guerrero', '00112233T', '1993-07-30', false, 'oficial', true, 'Cordoba', 'activo')
ON CONFLICT (dni) DO NOTHING;

-- Seed partidos (matches) for the current week
INSERT INTO public.partidos (tipo, equipo_local, equipo_visitante, fecha, hora, campo, categoria_partido, jornada) VALUES
  -- Futbol 11
  ('futbol_11', 'Sevilla FC B', 'Real Betis B', '2026-02-07', '17:00', 'Ciudad Deportiva Sevilla', 'Tercera RFEF', 'Jornada 22'),
  ('futbol_11', 'Cordoba CF B', 'Jaen CD', '2026-02-07', '18:00', 'El Arcangel', 'Division de Honor', 'Jornada 22'),
  ('futbol_11', 'Malaga CF C', 'Granada CF B', '2026-02-08', '11:00', 'La Rosaleda Anexo', 'Tercera RFEF', 'Jornada 22'),
  ('futbol_11', 'UD Almeria B', 'Cadiz CF B', '2026-02-08', '16:00', 'Estadio Juegos Mediterraneos', 'Division de Honor', 'Jornada 22'),
  ('futbol_11', 'Recreativo Huelva', 'Linares Deportivo', '2026-02-08', '18:30', 'Nuevo Colombino', 'Tercera RFEF', 'Jornada 22'),
  -- Futbol 7
  ('futbol_7', 'CD Nervion', 'CF Triana', '2026-02-07', '10:00', 'Campo Municipal Nervion', 'Cadete', 'Jornada 15'),
  ('futbol_7', 'AD Cartuja', 'UD Macarena', '2026-02-07', '11:30', 'Campo Municipal Cartuja', 'Infantil', 'Jornada 15'),
  ('futbol_7', 'CD Cerro Amate', 'CF San Juan', '2026-02-08', '09:00', 'Campo Cerro Amate', 'Alevin', 'Jornada 15'),
  ('futbol_7', 'UD Bellavista', 'CD Los Palacios', '2026-02-08', '10:30', 'Campo Bellavista', 'Cadete', 'Jornada 15'),
  ('futbol_7', 'AD San Jose', 'CF Torreblanca', '2026-02-08', '12:00', 'Campo San Jose', 'Infantil', 'Jornada 15'),
  -- Futbol Femenino
  ('futbol_femenino', 'Sevilla FC Femenino B', 'Betis Femenino B', '2026-02-07', '16:00', 'Ciudad Deportiva Sevilla', 'Primera Nacional Fem.', 'Jornada 18'),
  ('futbol_femenino', 'Cordoba CF Femenino', 'Malaga CF Femenino', '2026-02-08', '11:00', 'El Arcangel Anexo', 'Primera Nacional Fem.', 'Jornada 18'),
  ('futbol_femenino', 'Granada CF Femenino', 'UD Almeria Femenino', '2026-02-08', '12:30', 'Ciudad Deportiva Granada', 'Segunda Nacional Fem.', 'Jornada 18'),
  -- Futbol Sala
  ('futbol_sala', 'Sevilla FS', 'Cordoba FS', '2026-02-07', '20:00', 'Pabellon San Pablo', 'Primera Division FS', 'Jornada 20'),
  ('futbol_sala', 'Jaen Paraiso FS', 'Malaga FS', '2026-02-08', '13:00', 'Pabellon La Salobreja', 'Primera Division FS', 'Jornada 20'),
  ('futbol_sala', 'Betis FS', 'Cadiz FS', '2026-02-08', '18:00', 'Pabellon Betis', 'Segunda Division FS', 'Jornada 20')
ON CONFLICT DO NOTHING;
