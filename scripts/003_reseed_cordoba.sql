-- Clear existing data and reseed with Cordoba province referees and matches
DELETE FROM public.designaciones;
DELETE FROM public.partidos;
DELETE FROM public.arbitros;

-- Arbitros from Cordoba capital and pueblos of the province
INSERT INTO public.arbitros (nombre, dni, fecha_nacimiento, es_menor, categoria, tiene_coche, localidad, estado) VALUES
  -- Division de Honor (3)
  ('Miguel Angel Torres Ruiz', '30100001A', '1985-11-22', false, 'division_honor', true, 'Cordoba', 'activo'),
  ('Rafael Gomez Serrano', '30100002B', '1987-06-15', false, 'division_honor', true, 'Lucena', 'activo'),
  ('Antonio Jesus Morales', '30100003C', '1986-09-10', false, 'division_honor', true, 'Cordoba', 'activo'),
  -- Provincial (7)
  ('Jose Maria Blanco Ortiz', '30100004D', '1990-02-11', false, 'provincial', true, 'Cordoba', 'activo'),
  ('Carlos Ruiz Martinez', '30100005E', '1991-05-15', false, 'provincial', true, 'Montilla', 'activo'),
  ('Fernando Lopez Navarro', '30100006F', '1989-08-09', false, 'provincial', true, 'Priego de Cordoba', 'activo'),
  ('Adrian Salazar Fuentes', '30100007G', '1990-12-15', false, 'provincial', true, 'Cordoba', 'activo'),
  ('Daniel Castro Guerrero', '30100008H', '1993-07-30', false, 'provincial', true, 'Puente Genil', 'activo'),
  ('Pablo Reyes Castro', '30100009I', '1992-03-20', false, 'provincial', true, 'Cabra', 'activo'),
  ('Sergio Molina Vega', '30100010J', '1988-11-05', false, 'provincial', true, 'Baena', 'permiso'),
  -- Oficial (8)
  ('Juan Garcia Lopez', '30100011K', '1995-03-10', false, 'oficial', true, 'Cordoba', 'activo'),
  ('Francisco Diaz Perez', '30100012L', '1994-07-14', false, 'oficial', false, 'Palma del Rio', 'activo'),
  ('Raul Jimenez Vega', '30100013M', '1996-04-07', false, 'oficial', true, 'Cordoba', 'activo'),
  ('Luis Herrera Molina', '30100014N', '1995-10-28', false, 'oficial', true, 'Pozoblanco', 'activo'),
  ('David Ruiz Sanchez', '30100015O', '1997-01-18', false, 'oficial', true, 'Lucena', 'activo'),
  ('Alejandro Fernandez Gil', '30100016P', '1996-06-22', false, 'oficial', true, 'Cordoba', 'activo'),
  ('Roberto Marquez Pena', '30100017Q', '1994-09-03', false, 'oficial', false, 'Montoro', 'activo'),
  ('Jorge Mendez Vargas', '30100018R', '1995-11-01', false, 'oficial', true, 'Cordoba', 'baja'),
  -- Nuevo Ingreso (7)
  ('Pedro Sanchez Ruiz', '30100019S', '2007-08-25', true, 'nuevo_ingreso', false, 'Cordoba', 'activo'),
  ('Manuel Ortega Cruz', '30100020T', '2007-05-16', true, 'nuevo_ingreso', false, 'La Carlota', 'activo'),
  ('Ivan Dominguez Rios', '30100021U', '2008-01-05', true, 'nuevo_ingreso', false, 'Cordoba', 'activo'),
  ('Sergio Pena Luna', '30100022V', '1998-03-25', false, 'nuevo_ingreso', true, 'Villanueva de Cordoba', 'activo'),
  ('Alberto Campos Delgado', '30100023W', '1999-07-12', false, 'nuevo_ingreso', false, 'Cordoba', 'activo'),
  ('Marcos Jimenez Torres', '30100024X', '2007-11-30', true, 'nuevo_ingreso', false, 'Cabra', 'activo'),
  ('Gonzalo Rivas Moreno', '30100025Y', '1999-02-14', false, 'nuevo_ingreso', true, 'Cordoba', 'activo')
ON CONFLICT (dni) DO NOTHING;

-- Partidos in Cordoba province
INSERT INTO public.partidos (tipo, equipo_local, equipo_visitante, fecha, hora, campo, categoria_partido, jornada) VALUES
  -- Futbol 11 (6 partidos)
  ('futbol_11', 'Cordoba CF B', 'CD Lucecor', '2026-02-07', '17:00', 'Ciudad Deportiva Cordoba', 'Division de Honor Andaluza', 'Jornada 22'),
  ('futbol_11', 'Salerm Puente Genil', 'Montilla CF', '2026-02-07', '18:00', 'Estadio Manuel Polinario (Puente Genil)', 'Tercera RFEF', 'Jornada 22'),
  ('futbol_11', 'CD Pozoblanco', 'Baena CF', '2026-02-08', '11:00', 'Estadio Municipal El Pozo (Pozoblanco)', 'Division de Honor Andaluza', 'Jornada 22'),
  ('futbol_11', 'Lucena CF', 'Priego CF', '2026-02-08', '12:00', 'Estadio Ciudad de Lucena (Lucena)', 'Tercera RFEF', 'Jornada 22'),
  ('futbol_11', 'Palma del Rio CF', 'CD La Carlota', '2026-02-08', '16:00', 'Estadio Municipal (Palma del Rio)', 'Primera Andaluza', 'Jornada 22'),
  ('futbol_11', 'CD Montoro', 'Cordoba CF C', '2026-02-08', '18:00', 'Campo Municipal (Montoro)', 'Primera Andaluza', 'Jornada 22'),
  -- Futbol 7 (5 partidos)
  ('futbol_7', 'CD Cordoba Cadete A', 'CD Lucena Cadete', '2026-02-07', '10:00', 'Ciudad Deportiva Cordoba', 'Cadete Provincial', 'Jornada 15'),
  ('futbol_7', 'AD Palma Cadete', 'CD Cabra Infantil', '2026-02-07', '11:30', 'Campo Municipal (Palma del Rio)', 'Infantil Provincial', 'Jornada 15'),
  ('futbol_7', 'CD Montilla Alevin', 'AD Baena Alevin', '2026-02-08', '09:30', 'Campo Municipal (Montilla)', 'Alevin Provincial', 'Jornada 15'),
  ('futbol_7', 'CD Cordoba Infantil B', 'CD Pozoblanco Infantil', '2026-02-08', '10:30', 'Ciudad Deportiva Cordoba', 'Infantil Provincial', 'Jornada 15'),
  ('futbol_7', 'Priego CF Cadete', 'CD Puente Genil Cadete', '2026-02-08', '12:00', 'Campo Municipal (Priego de Cordoba)', 'Cadete Provincial', 'Jornada 15'),
  -- Futbol Femenino (3 partidos)
  ('futbol_femenino', 'Cordoba CF Femenino', 'CD Lucena Femenino', '2026-02-07', '16:00', 'Ciudad Deportiva Cordoba', 'Primera Nacional Fem.', 'Jornada 18'),
  ('futbol_femenino', 'CD Montilla Femenino', 'Priego CF Femenino', '2026-02-08', '11:00', 'Campo Municipal (Montilla)', 'Primera Andaluza Fem.', 'Jornada 18'),
  ('futbol_femenino', 'Salerm P. Genil Fem.', 'Cabra CF Femenino', '2026-02-08', '12:30', 'Estadio Manuel Polinario (Puente Genil)', 'Primera Andaluza Fem.', 'Jornada 18'),
  -- Futbol Sala (3 partidos)
  ('futbol_sala', 'Cordoba Patrimonio FS', 'Lucena FS', '2026-02-07', '20:30', 'Pabellon Vista Alegre (Cordoba)', 'Primera Division FS', 'Jornada 20'),
  ('futbol_sala', 'Montilla FS', 'Priego FS', '2026-02-08', '13:00', 'Pabellon Municipal (Montilla)', 'Segunda Andaluza FS', 'Jornada 20'),
  ('futbol_sala', 'CD Baena FS', 'Cabra FS', '2026-02-08', '18:00', 'Pabellon Municipal (Baena)', 'Segunda Andaluza FS', 'Jornada 20')
ON CONFLICT DO NOTHING;
