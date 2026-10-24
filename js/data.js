/* WorkConnect — datos ficticios de demostración (El Salvador, salarios en USD).
   Para modificar el contenido inicial edita este archivo. Si ya abriste el sitio,
   usa "Restablecer datos" en el menú "P01–P15" para volver a cargarlo. */

(function () {
  var DEPARTAMENTOS = ["Ahuachapán", "Cabañas", "Chalatenango", "Cuscatlán", "La Libertad", "La Paz", "La Unión", "Morazán", "San Miguel", "San Salvador", "San Vicente", "Santa Ana", "Sonsonate", "Usulután"];
  var SECTORES = ["Tecnología", "Finanzas", "Logística", "Agroindustria", "Salud", "Manufactura", "Turismo", "Comercio", "Educación", "Administración", "Construcción"];
  var MODALIDADES = ["Presencial", "Híbrido", "Remoto"];
  var CONTRATOS = ["Tiempo completo", "Medio tiempo", "Temporal", "Por proyecto", "Pasantía"];
  var EXPERIENCIAS = [
    { v: 0, t: "Sin experiencia" },
    { v: 1, t: "1 a 2 años" },
    { v: 3, t: "3 a 5 años" },
    { v: 5, t: "Más de 5 años" }
  ];

  function daysAgo(n) {
    var d = new Date(2026, 9, 21);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  var companies = [
    { id: "c1", name: "Volcán Software", sector: "Tecnología", dept: "La Libertad", city: "Antiguo Cuscatlán", size: "51–200 empleados", web: "https://volcansoftware.example", email: "talento@volcansoftware.example", phone: "2278-4410", status: "Verificada", logo: "", desc: "Desarrollamos software a la medida para banca, retail y gobierno en Centroamérica. Equipos pequeños, entregas frecuentes y mucho aprendizaje técnico." },
    { id: "c2", name: "Banco del Pacífico", sector: "Finanzas", dept: "San Salvador", city: "San Salvador", size: "501–1,000 empleados", web: "https://bancopacifico.example", email: "reclutamiento@bancopacifico.example", phone: "2210-3300", status: "Verificada", logo: "", desc: "Institución financiera salvadoreña con más de 40 años acompañando a familias y empresas. Cuenta con 38 agencias a nivel nacional." },
    { id: "c3", name: "Logística Izalco", sector: "Logística", dept: "Sonsonate", city: "Acajutla", size: "201–500 empleados", web: "https://logisticaizalco.example", email: "rrhh@logisticaizalco.example", phone: "2452-9021", status: "Verificada", logo: "", desc: "Operador logístico con bodegas y flota propia conectando el puerto de Acajutla con toda la región." },
    { id: "c4", name: "Café Apaneca Export", sector: "Agroindustria", dept: "Ahuachapán", city: "Apaneca", size: "51–200 empleados", web: "https://cafeapaneca.example", email: "empleo@cafeapaneca.example", phone: "2433-0187", status: "Verificada", logo: "", desc: "Beneficio y exportadora de café de altura de la ruta de las flores. Trabajamos de la mano con más de 300 productores." },
    { id: "c5", name: "Clínica Santa Lucía", sector: "Salud", dept: "Santa Ana", city: "Santa Ana", size: "51–200 empleados", web: "https://clinicasantalucia.example", email: "personal@clinicasantalucia.example", phone: "2440-7755", status: "Verificada", logo: "", desc: "Centro médico privado con consulta externa, laboratorio y hospitalización en el occidente del país." },
    { id: "c6", name: "Textiles San Marcos", sector: "Manufactura", dept: "San Salvador", city: "Soyapango", size: "501–1,000 empleados", web: "https://textilessanmarcos.example", email: "seleccion@textilessanmarcos.example", phone: "2291-6402", status: "Verificada", logo: "", desc: "Planta de confección de prendas deportivas para exportación, con certificaciones de buenas prácticas laborales." },
    { id: "c7", name: "Costa Azul Hoteles", sector: "Turismo", dept: "La Libertad", city: "Tamanique", size: "51–200 empleados", web: "https://costaazul.example", email: "empleo@costaazul.example", phone: "2389-1120", status: "Verificada", logo: "", desc: "Cadena de hoteles boutique en la Ruta del Surf. Atención cercana y turismo responsable." },
    { id: "c8", name: "Distribuidora Oriental", sector: "Comercio", dept: "San Miguel", city: "San Miguel", size: "201–500 empleados", web: "https://distoriental.example", email: "gente@distoriental.example", phone: "2661-4590", status: "Verificada", logo: "", desc: "Distribución de consumo masivo para la zona oriental con más de 2,500 puntos de venta atendidos." },
    { id: "c9", name: "Colegio Nuevo Horizonte", sector: "Educación", dept: "La Libertad", city: "Santa Tecla", size: "51–200 empleados", web: "https://nuevohorizonte.example", email: "direccion@nuevohorizonte.example", phone: "2228-3015", status: "Pendiente", logo: "", desc: "Centro educativo bilingüe de parvularia a bachillerato en Santa Tecla." },
    { id: "c10", name: "Constructora Lempa", sector: "Construcción", dept: "Usulután", city: "Usulután", size: "51–200 empleados", web: "https://constructoralempa.example", email: "proyectos@constructoralempa.example", phone: "2624-8800", status: "Pendiente", logo: "", desc: "Obras civiles y vivienda de interés social en la zona oriental y paracentral." }
  ];

  var benefitsBase = ["Seguro médico y de vida", "Prestaciones de ley (aguinaldo y vacaciones)", "Capacitación continua", "Ambiente laboral colaborativo"];

  function job(id, title, co, city, dept, mod, con, exp, min, max, sector, ago, feat, status, desc, fun, req, ben) {
    return { id: id, title: title, companyId: co, city: city, dept: dept, modality: mod, contract: con, exp: exp, salaryMin: min, salaryMax: max, sector: sector, posted: daysAgo(ago), featured: feat, status: status, vacancies: 1, description: desc, functions: fun, requirements: req, benefits: ben || benefitsBase };
  }

  var jobs = [
    job("j1", "Desarrollador/a Full Stack", "c1", "Antiguo Cuscatlán", "La Libertad", "Híbrido", "Tiempo completo", 3, 1200, 1800, "Tecnología", 2, true, "activa",
      "Súmate al equipo de producto que construye la plataforma de banca digital de nuestros clientes. Trabajarás con equipos pequeños y entregas quincenales.",
      ["Diseñar y desarrollar servicios web y componentes de interfaz.", "Participar en revisiones de código y decisiones de arquitectura.", "Escribir pruebas automatizadas y documentación técnica.", "Colaborar con diseño y producto en la definición de funcionalidades."],
      ["3 años o más de experiencia con JavaScript y bases de datos relacionales.", "Conocimiento de APIs REST y control de versiones con Git.", "Licenciatura o ingeniería en sistemas, o carrera afín.", "Inglés técnico de lectura."],
      ["Trabajo híbrido (3 días en oficina)", "Seguro médico familiar", "Bono de capacitación anual de $600", "Aguinaldo y vacaciones de ley"]),
    job("j2", "Analista de Riesgos Crediticios", "c2", "San Salvador", "San Salvador", "Presencial", "Tiempo completo", 3, 1100, 1500, "Finanzas", 4, true, "activa",
      "Evaluarás solicitudes de crédito empresarial y darás seguimiento al comportamiento de la cartera en coordinación con las agencias.",
      ["Analizar estados financieros y capacidad de pago de clientes.", "Elaborar informes de riesgo para el comité de crédito.", "Dar seguimiento a indicadores de mora y alertas tempranas.", "Proponer mejoras a las políticas de otorgamiento."],
      ["Licenciatura en Economía, Finanzas, Administración o afín.", "3 años en análisis de crédito o riesgos.", "Dominio avanzado de Excel.", "Disponibilidad para trabajar en San Salvador."],
      ["Seguro médico y de vida", "Crédito de empleado con tasa preferencial", "Aguinaldo superior al de ley", "Plan de carrera interno"]),
    job("j3", "Coordinador/a de Logística Portuaria", "c3", "Acajutla", "Sonsonate", "Presencial", "Tiempo completo", 3, 900, 1200, "Logística", 6, true, "activa",
      "Coordinarás la recepción, almacenaje y despacho de contenedores en nuestra bodega de Acajutla, garantizando entregas puntuales.",
      ["Programar entradas y salidas de carga junto con transportistas.", "Supervisar al equipo de bodega y el cumplimiento de seguridad.", "Controlar inventarios y documentación aduanal.", "Reportar indicadores de despacho semanalmente."],
      ["Bachiller técnico o estudios universitarios en logística o afín.", "3 años de experiencia en operaciones logísticas.", "Conocimiento de trámites aduanales.", "Licencia de conducir liviana."],
      ["Transporte de personal desde Sonsonate", "Alimentación subsidiada", "Seguro médico y de vida", "Bono por cumplimiento de metas"]),
    job("j4", "Supervisor/a de Beneficio de Café", "c4", "Apaneca", "Ahuachapán", "Presencial", "Temporal", 1, 600, 750, "Agroindustria", 9, false, "activa",
      "Para la cosecha 2026-2027 buscamos a quien supervise el recibo, secado y clasificación del café en nuestro beneficio.",
      ["Supervisar cuadrillas de recibo y secado.", "Controlar humedad y calidad del grano.", "Llevar registros de producción diaria.", "Cumplir normas de seguridad e higiene."],
      ["1 año en procesos agroindustriales o de beneficio.", "Bachillerato completo.", "Disponibilidad de noviembre a marzo.", "Capacidad de liderar equipos."],
      ["Alimentación en planta", "Bono de cosecha", "Seguro social e ISSS", "Posibilidad de contrato permanente"]),
    job("j5", "Enfermero/a General", "c5", "Santa Ana", "Santa Ana", "Presencial", "Tiempo completo", 1, 650, 800, "Salud", 3, true, "activa",
      "Atención directa a pacientes en hospitalización y apoyo en procedimientos menores, bajo coordinación médica.",
      ["Administrar medicamentos y tratamientos indicados.", "Monitorear signos vitales y registrar evolución.", "Apoyar procedimientos ambulatorios.", "Aplicar protocolos de bioseguridad."],
      ["Licenciatura o técnico en enfermería con JVPE vigente.", "1 año de experiencia en centros hospitalarios.", "Disponibilidad para turnos rotativos.", "Trato empático y trabajo en equipo."],
      ["Pago de horas extra", "Uniformes", "Seguro médico", "Capacitación en emergencias"]),
    job("j6", "Operario/a de Producción", "c6", "Soyapango", "San Salvador", "Presencial", "Tiempo completo", 0, 420, 520, "Manufactura", 1, false, "activa",
      "Incorpórate a la línea de confección. Ofrecemos capacitación inicial pagada y oportunidad de crecimiento a supervisión.",
      ["Operar máquinas de coser industriales.", "Cumplir metas de calidad y producción por turno.", "Mantener orden y limpieza del área.", "Reportar defectos al supervisor."],
      ["Noveno grado aprobado como mínimo.", "No se requiere experiencia: se capacita.", "Habilidad manual y atención al detalle.", "Disponibilidad de turnos."],
      ["Transporte de personal", "Almuerzo subsidiado", "Bono de asistencia", "Clínica empresarial"]),
    job("j7", "Recepcionista de Hotel", "c7", "Tamanique", "La Libertad", "Presencial", "Tiempo completo", 1, 500, 620, "Turismo", 5, false, "activa",
      "Serás la primera cara de nuestros huéspedes nacionales e internacionales en la Ruta del Surf.",
      ["Realizar check-in y check-out de huéspedes.", "Atender reservas por teléfono y correo.", "Resolver solicitudes y quejas con cordialidad.", "Coordinar con housekeeping y restaurante."],
      ["Bachillerato completo.", "1 año en atención al cliente o hotelería.", "Inglés conversacional intermedio.", "Disponibilidad para turnos de fin de semana."],
      ["Alojamiento en días de turno", "Propinas compartidas", "Alimentación incluida", "Descuentos en cadena hotelera"]),
    job("j8", "Ejecutivo/a de Ventas", "c8", "San Miguel", "San Miguel", "Presencial", "Tiempo completo", 1, 600, 900, "Comercio", 2, true, "activa",
      "Atenderás una cartera de tiendas y mini súper en la zona oriental, impulsando el portafolio de consumo masivo.",
      ["Visitar puntos de venta según ruta asignada.", "Levantar pedidos y dar seguimiento a cobros.", "Ejecutar exhibiciones y promociones.", "Reportar competencia y oportunidades."],
      ["Bachillerato o estudios universitarios en curso.", "1 año de experiencia en ventas de campo.", "Licencia de conducir y motocicleta propia.", "Orientación a resultados."],
      ["Comisiones sin techo", "Combustible y depreciación de moto", "Seguro de vida", "Incentivos trimestrales"]),
    job("j9", "Diseñador/a UX/UI", "c1", "Remoto", "San Salvador", "Remoto", "Tiempo completo", 1, 900, 1300, "Tecnología", 7, true, "activa",
      "Diseña experiencias claras y accesibles para aplicaciones web y móviles de clientes regionales, desde la investigación hasta el prototipo.",
      ["Realizar entrevistas y pruebas de usabilidad.", "Crear flujos, wireframes y prototipos de alta fidelidad.", "Mantener el sistema de diseño del equipo.", "Entregar especificaciones a desarrollo."],
      ["Portafolio con al menos 3 proyectos reales.", "1–2 años de experiencia en diseño de producto.", "Dominio de Figma.", "Conocimiento de accesibilidad web."],
      ["100% remoto dentro de El Salvador", "Equipo de cómputo incluido", "Seguro médico", "Bono de capacitación anual de $600"]),
    job("j10", "Soporte Técnico Nivel 1", "c1", "San Salvador", "San Salvador", "Híbrido", "Tiempo completo", 0, 550, 700, "Tecnología", 8, false, "activa",
      "Primera línea de atención a usuarios de nuestras plataformas. Ideal para quien inicia su carrera en tecnología.",
      ["Atender tickets y llamadas de usuarios.", "Diagnosticar y resolver incidentes comunes.", "Escalar casos al nivel 2 con información completa.", "Documentar soluciones en la base de conocimiento."],
      ["Estudiante avanzado o técnico en informática.", "Buena comunicación oral y escrita.", "Conocimientos básicos de redes y sistemas operativos.", "Sin experiencia previa requerida."],
      ["Horario de lunes a viernes", "Seguro médico", "Ruta de crecimiento a nivel 2", "Certificaciones pagadas"]),
    job("j11", "Contador/a General", "c8", "San Miguel", "San Miguel", "Presencial", "Tiempo completo", 3, 800, 1000, "Finanzas", 11, false, "activa",
      "Responsable del cierre contable mensual, obligaciones tributarias y estados financieros de la distribuidora.",
      ["Registrar y conciliar operaciones contables.", "Presentar declaraciones de IVA y renta.", "Preparar estados financieros mensuales.", "Coordinar auditorías externas."],
      ["Licenciatura en Contaduría Pública.", "3 años en contabilidad comercial.", "Manejo de sistemas contables y Excel.", "Conocimiento de normativa tributaria salvadoreña."],
      ["Seguro médico y de vida", "Aguinaldo de ley", "Bono anual por desempeño", "Estacionamiento"]),
    job("j12", "Docente de Inglés", "c9", "Santa Tecla", "La Libertad", "Presencial", "Medio tiempo", 1, 450, 600, "Educación", 0, false, "pendiente",
      "Impartirás clases de inglés a estudiantes de tercer ciclo y bachillerato con enfoque comunicativo.",
      ["Planificar y desarrollar clases.", "Evaluar el progreso de los estudiantes.", "Participar en actividades institucionales.", "Comunicarse con padres de familia."],
      ["Licenciatura en idioma inglés o certificación C1.", "1 año de experiencia docente.", "Disponibilidad por las tardes.", "Vocación de enseñanza."],
      ["Horario compatible con estudios", "Capacitación pedagógica", "Aguinaldo de ley", "Ambiente escolar acogedor"]),
    job("j13", "Asistente Administrativo (Pasantía)", "c3", "San Salvador", "San Salvador", "Presencial", "Pasantía", 0, 300, 350, "Administración", 14, false, "inactiva",
      "Pasantía de seis meses en las oficinas administrativas para estudiantes en último año de carrera.",
      ["Archivar y digitalizar documentos.", "Apoyar el control de facturas.", "Atender llamadas y correos.", "Preparar reportes sencillos en Excel."],
      ["Estudiante de Administración o afín.", "Manejo básico de Office.", "Responsabilidad y puntualidad.", "Carta de la universidad."],
      ["Constancia de horas sociales", "Subsidio de transporte", "Posible contratación", "Capacitación en procesos"]),
    job("j14", "Ingeniero/a Civil Residente", "c10", "Usulután", "Usulután", "Presencial", "Por proyecto", 5, 1400, 1900, "Construcción", 1, false, "pendiente",
      "Residente de obra para un proyecto de vivienda de interés social de 18 meses en el departamento de Usulután.",
      ["Supervisar la ejecución de obra y calidad.", "Controlar avances, costos y estimaciones.", "Coordinar subcontratistas y seguridad.", "Elaborar bitácora e informes."],
      ["Ingeniería Civil con JVPIA vigente.", "Más de 5 años en obra residencial.", "Dominio de AutoCAD y presupuestos.", "Residir o trasladarse a Usulután."],
      ["Hospedaje durante el proyecto", "Vehículo de obra", "Seguro de vida", "Bono de finalización"]),
    job("j15", "Analista de Datos", "c2", "San Salvador", "San Salvador", "Híbrido", "Tiempo completo", 1, 1000, 1400, "Tecnología", 5, false, "activa",
      "Construirás tableros y modelos que ayuden a entender el comportamiento de clientes y la calidad de la cartera.",
      ["Extraer y limpiar datos de diversas fuentes.", "Construir tableros de seguimiento en BI.", "Presentar hallazgos a gerencias.", "Automatizar reportes recurrentes."],
      ["Ingeniería, Estadística, Economía o afín.", "1–2 años con SQL y Python o R.", "Experiencia con herramientas de visualización.", "Pensamiento analítico."],
      ["Modalidad híbrida", "Seguro médico y de vida", "Becas de certificación", "Aguinaldo superior al de ley"])
  ];

  var names = ["María Fernanda Hernández", "Carlos Mejía", "José Roberto Alvarenga", "Ana Lucía Portillo", "Kevin Orellana", "Gabriela Menjívar", "Walter Cruz", "Daniela Rivas", "Óscar Amaya", "Karla Guardado", "Mauricio Escobar", "Lorena Chávez", "Fátima Ayala", "Rodrigo Pineda", "Beatriz Quintanilla", "Jonathan Argueta", "Sofía Barrera", "Eduardo Lara", "Nancy Villalta", "Henry Rosales", "Andrea Cañas", "Luis Ernesto Peña"];
  function slug(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, "."); }

  var users = [
    { id: "u1", name: names[0], email: "candidato@workconnect.sv", pass: "Demo1234", role: "candidato", status: "activo", created: daysAgo(180) },
    { id: "u2", name: names[1], email: "empresa@workconnect.sv", pass: "Demo1234", role: "empresa", status: "activo", companyId: "c1", created: daysAgo(210) },
    { id: "u3", name: "Administrador WorkConnect", email: "admin@workconnect.sv", pass: "Admin1234", role: "admin", status: "activo", created: daysAgo(400) }
  ];
  for (var i = 2; i < names.length; i++) {
    var isCo = i % 5 === 0;
    users.push({
      id: "u" + (users.length + 1), name: names[i], email: slug(names[i]).replace(/\.$/, "") + "@correo.sv", pass: "Demo1234",
      role: isCo ? "empresa" : "candidato", status: i === 6 || i === 13 ? "inactivo" : "activo",
      companyId: isCo ? "c" + (2 + (i % 8)) : undefined, created: daysAgo(10 + i * 9)
    });
  }

  var profiles = {
    "candidato@workconnect.sv": {
      name: "María Fernanda Hernández", headline: "Desarrolladora web junior", phone: "7812-3456", dept: "San Salvador", city: "Mejicanos", birth: "1999-04-12",
      summary: "Ingeniera en sistemas con práctica en desarrollo web y bases de datos. Busco un equipo donde seguir creciendo en producto digital.",
      studies: [
        { id: "s1", title: "Ingeniería en Sistemas Informáticos", place: "Universidad de El Salvador", period: "2017 – 2023" },
        { id: "s2", title: "Bachillerato técnico en Informática", place: "Instituto Nacional Francisco Menéndez", period: "2014 – 2016" }
      ],
      experience: [
        { id: "x1", title: "Desarrolladora web (pasantía)", place: "Agencia Cuzcatlán Digital", period: "2022 – 2023", desc: "Mantenimiento de sitios en JavaScript y PHP." },
        { id: "x2", title: "Soporte técnico", place: "Centro de cómputo UES", period: "2020 – 2022", desc: "Atención a laboratorios y usuarios." }
      ],
      skills: ["JavaScript", "HTML y CSS", "SQL", "Git", "Atención al cliente", "Inglés intermedio"],
      cv: { name: "CV_Maria_Hernandez.pdf", size: 184320 },
      alerts: [{ id: "al1", keyword: "Desarrollador", dept: "San Salvador", freq: "Semanal", active: true }]
    }
  };

  function app(id, jobId, name, email, headline, city, exp, skills, summary, status, ago) {
    return { id: id, jobId: jobId, name: name, email: email, headline: headline, city: city, exp: exp, skills: skills, summary: summary, status: status, date: daysAgo(ago) };
  }
  var applications = [
    app("a1", "j1", "María Fernanda Hernández", "candidato@workconnect.sv", "Desarrolladora web junior", "Mejicanos, San Salvador", "2 años", ["JavaScript", "SQL", "Git"], "Ingeniera en sistemas con práctica en desarrollo web.", "En revisión", 5),
    app("a2", "j9", "María Fernanda Hernández", "candidato@workconnect.sv", "Desarrolladora web junior", "Mejicanos, San Salvador", "2 años", ["HTML y CSS", "Figma"], "Interés en diseño de interfaces y accesibilidad.", "Nueva", 2),
    app("a3", "j10", "María Fernanda Hernández", "candidato@workconnect.sv", "Desarrolladora web junior", "Mejicanos, San Salvador", "2 años", ["Atención al cliente", "Redes"], "Experiencia previa en soporte técnico.", "Rechazada", 12),
    app("a4", "j1", "José Roberto Alvarenga", "jose.alvarenga@correo.sv", "Ingeniero de software", "Santa Tecla, La Libertad", "5 años", ["JavaScript", "Node.js", "PostgreSQL", "Docker"], "Cinco años desarrollando sistemas para banca y comercio.", "Entrevista", 6),
    app("a5", "j1", "Kevin Orellana", "kevin.orellana@correo.sv", "Programador full stack", "San Salvador", "3 años", ["React", "Python", "SQL"], "Experiencia en startups y proyectos freelance.", "Nueva", 1),
    app("a6", "j1", "Daniela Rivas", "daniela.rivas@correo.sv", "Desarrolladora backend", "Soyapango, San Salvador", "4 años", ["Java", "Spring", "MySQL"], "Enfoque en servicios escalables y pruebas.", "En revisión", 4),
    app("a7", "j9", "Gabriela Menjívar", "gabriela.menjivar@correo.sv", "Diseñadora de producto", "San Salvador", "2 años", ["Figma", "Investigación UX", "Accesibilidad"], "Portafolio con apps de salud y educación.", "Entrevista", 5),
    app("a8", "j10", "Walter Cruz", "walter.cruz@correo.sv", "Técnico en informática", "Ilopango, San Salvador", "1 año", ["Windows", "Redes", "Soporte"], "Egresado de técnico en redes con práctica en help desk.", "Nueva", 3),
    app("a9", "j2", "Ana Lucía Portillo", "ana.portillo@correo.sv", "Analista financiera", "San Salvador", "4 años", ["Excel", "Análisis crediticio", "Power BI"], "Cuatro años en análisis de crédito en cooperativas.", "En revisión", 4),
    app("a10", "j5", "Karla Guardado", "karla.guardado@correo.sv", "Licenciada en enfermería", "Santa Ana", "2 años", ["Urgencias", "Hospitalización"], "Experiencia en hospital departamental.", "Contratada", 15),
    app("a11", "j8", "Mauricio Escobar", "mauricio.escobar@correo.sv", "Vendedor de campo", "San Miguel", "3 años", ["Ventas", "Cobros", "Negociación"], "Ruta de mini súper en San Miguel y Usulután.", "Nueva", 2),
    app("a12", "j3", "Rodrigo Pineda", "rodrigo.pineda@correo.sv", "Técnico logístico", "Sonsonate", "4 años", ["Inventarios", "Aduanas"], "Coordinación de bodega en zona franca.", "Entrevista", 7)
  ];

  var threads = [
    { id: "t1", cat: "entrevistas", title: "¿Cómo responder a «hábleme de usted» sin sonar ensayado?", author: "Lorena Chávez", body: "Tengo entrevista el jueves en una empresa de logística y siempre me trabo en esa pregunta. ¿Qué estructura usan ustedes?", date: daysAgo(3), status: "visible", replies: [
      { id: "r1", author: "Ana Lucía Portillo", text: "Yo uso presente, pasado, futuro: qué hago hoy, qué he logrado y qué busco. Máximo dos minutos.", date: daysAgo(3), status: "visible" },
      { id: "r2", author: "Óscar Amaya", text: "Prepara un logro con números. Por ejemplo, «reduje 15% el tiempo de despacho». Se recuerda más.", date: daysAgo(2), status: "visible" }
    ] },
    { id: "t2", cat: "salarios", title: "Rangos salariales de desarrollo web en San Salvador 2026", author: "Kevin Orellana", body: "Estoy por recibir una oferta y quiero comparar. ¿Qué rangos ven para junior y semi senior en El Salvador?", date: daysAgo(5), status: "visible", replies: [
      { id: "r3", author: "José Roberto Alvarenga", text: "Junior entre $600 y $900; semi senior entre $1,100 y $1,700 según la empresa y si es trabajo remoto para el extranjero.", date: daysAgo(4), status: "visible" }
    ] },
    { id: "t3", cat: "empleo", title: "Ferias de empleo en el oriente del país", author: "Mauricio Escobar", body: "¿Alguien sabe si habrá feria de empleo en San Miguel antes de diciembre? Busco oportunidades en ventas.", date: daysAgo(6), status: "visible", replies: [] },
    { id: "t4", cat: "primer", title: "Primer empleo sin experiencia: ¿por dónde empiezo?", author: "Fátima Ayala", body: "Me gradúo en diciembre de Administración de Empresas y no tengo experiencia formal. ¿Pasantías, voluntariados, qué recomiendan?", date: daysAgo(8), status: "visible", replies: [
      { id: "r4", author: "Beatriz Quintanilla", text: "Las pasantías con constancia de horas sociales cuentan como experiencia. Inclúyelas en tu CV con resultados concretos.", date: daysAgo(7), status: "visible" },
      { id: "r5", author: "Henry Rosales", text: "Postúlate también a puestos de asistente; son una buena puerta de entrada.", date: daysAgo(7), status: "visible" }
    ] },
    { id: "t5", cat: "carrera", title: "¿Vale la pena certificarse en gestión de proyectos?", author: "Nancy Villalta", body: "Estoy valorando certificaciones de gestión de proyectos. ¿Les han servido para crecer en empresas locales?", date: daysAgo(10), status: "visible", replies: [] },
    { id: "t6", cat: "empleo", title: "Cuidado con ofertas que piden dinero por adelantado", author: "Andrea Cañas", body: "Me contactaron por mensajería ofreciendo trabajo y pedían $30 para «uniforme». Les comparto para que estén alertas.", date: daysAgo(12), status: "visible", replies: [
      { id: "r6", author: "Luis Ernesto Peña", text: "Una empresa seria no cobra por contratar. Gracias por compartir.", date: daysAgo(11), status: "visible" }
    ] }
  ];
  var forumCats = [
    { id: "empleo", name: "Búsqueda de empleo" },
    { id: "entrevistas", name: "Entrevistas y CV" },
    { id: "salarios", name: "Salarios y prestaciones" },
    { id: "carrera", name: "Desarrollo profesional" },
    { id: "primer", name: "Primer empleo" }
  ];

  var reviews = [
    { id: "v1", companyId: "c1", author: "Ricardo A.", rating: 5, text: "Buen ambiente y mucho aprendizaje. Los líderes técnicos acompañan de verdad.", date: daysAgo(30), status: "visible" },
    { id: "v2", companyId: "c1", author: "Elena M.", rating: 4, text: "Proyectos retadores y flexibilidad. El proceso de selección es algo largo.", date: daysAgo(55), status: "visible" },
    { id: "v3", companyId: "c2", author: "Pablo C.", rating: 4, text: "Estabilidad y buenas prestaciones. Muy estructurado, a veces lento para cambiar.", date: daysAgo(40), status: "visible" },
    { id: "v4", companyId: "c3", author: "Marcela R.", rating: 3, text: "Buen salario pero los turnos pueden extenderse en temporada alta.", date: daysAgo(22), status: "visible" },
    { id: "v5", companyId: "c5", author: "Karla G.", rating: 5, text: "Equipo humano cálido y capacitaciones constantes.", date: daysAgo(18), status: "visible" },
    { id: "v6", companyId: "c8", author: "Anónimo", rating: 2, text: "Metas muy altas y poca comunicación de cambios de ruta.", date: daysAgo(9), status: "pendiente" },
    { id: "v7", companyId: "c6", author: "Julia S.", rating: 3, text: "Cumplen con pagos y prestaciones; el trabajo es repetitivo.", date: daysAgo(35), status: "visible" },
    { id: "v9", companyId: "c2", author: "María H.", by: "candidato@workconnect.sv", rating: 4, text: "Proceso de selección ordenado y respetuoso; me dieron respuesta en menos de dos semanas.", date: daysAgo(20), status: "visible" },
    { id: "v8", companyId: "c4", author: "Samuel P.", rating: 5, text: "Trato respetuoso con los cortadores y beneficios claros durante la cosecha.", date: daysAgo(60), status: "visible" }
  ];

  var reports = [
    { id: "rp1", reporter: "Lorena Chávez", target: "Oferta «Ganá $500 diarios desde casa»", reason: "Posible estafa: pide pago previo.", date: daysAgo(2), status: "pendiente" },
    { id: "rp2", reporter: "Walter Cruz", target: "Comentario en foro «Salarios»", reason: "Lenguaje ofensivo hacia otro usuario.", date: daysAgo(4), status: "pendiente" },
    { id: "rp3", reporter: "Sofía Barrera", target: "Valoración de Distribuidora Oriental", reason: "Contiene datos personales de un supervisor.", date: daysAgo(6), status: "visible" }
  ];

  var articles = [
    { id: "ar1", type: "Artículo", title: "Cómo leer una oferta laboral y detectar señales de alerta", summary: "Salario poco claro, pagos por adelantado y mensajes urgentes: lo que debes revisar antes de postularte.", read: "6 min", body: ["Una oferta confiable indica empresa, ubicación, funciones y rango salarial. Si falta información básica, pregunta antes de enviar tus datos.", "Desconfía de quien pida dinero por uniformes, capacitaciones o trámites. Las empresas formales no cobran por contratar.", "Verifica el dominio del correo, busca a la empresa en sitios oficiales y consulta valoraciones de otros candidatos."] },
    { id: "ar2", type: "Consejo", title: "Cinco hábitos para buscar empleo con constancia", summary: "Una rutina breve y diaria rinde más que maratones esporádicos.", read: "4 min", body: ["Define un horario fijo de 45 minutos para buscar y postularte. Registra cada postulación y la fecha de seguimiento.", "Personaliza tu mensaje: menciona la vacante y un logro relevante. Evita enviar el mismo texto a todas las empresas.", "Pide retroalimentación después de cada entrevista y ajusta tu preparación."] },
    { id: "ar3", type: "Tutorial", title: "Tutorial: estructura un CV de una página", summary: "Orden, extensión y palabras clave para pasar los filtros de selección.", read: "8 min", body: ["Comienza con tu nombre, contacto y un resumen de tres líneas. Después incluye experiencia en orden cronológico inverso.", "Cada puesto debe tener de dos a cuatro viñetas con verbos de acción y resultados medibles.", "Cierra con estudios, idiomas y habilidades. Guarda el archivo en PDF con tu nombre, por ejemplo CV_Nombre_Apellido.pdf."] },
    { id: "ar4", type: "Noticia", title: "Sectores que más contratan en El Salvador este trimestre", summary: "Logística, servicios financieros y tecnología lideran la demanda de talento.", read: "5 min", body: ["De acuerdo con los datos de vacantes publicadas en el portal, los sectores con mayor crecimiento son logística, tecnología y comercio.", "Las empresas buscan perfiles con inglés intermedio, manejo de herramientas digitales y disposición para trabajo híbrido."] },
    { id: "ar5", type: "Consejo", title: "Qué vestir en una entrevista presencial o virtual", summary: "Comodidad, sobriedad y adaptación a la cultura de la empresa.", read: "3 min", body: ["Investiga el código de vestimenta de la empresa. Ante la duda, elige una opción sobria y limpia.", "En entrevistas virtuales cuida la iluminación, el fondo ordenado y la conexión; prueba el audio antes."] },
    { id: "ar6", type: "Tutorial", title: "Tutorial: responde con el método STAR", summary: "Situación, tarea, acción y resultado para contar logros con claridad.", read: "7 min", body: ["STAR ordena tus ejemplos: describe la Situación, la Tarea que tenías, la Acción que realizaste y el Resultado.", "Prepara tres historias: un logro, un error del que aprendiste y un conflicto resuelto.", "Practica en voz alta y mide que cada respuesta dure entre uno y dos minutos."] },
    { id: "ar7", type: "Noticia", title: "Qué prestaciones corresponden por ley a un empleado", summary: "Aguinaldo, vacaciones, ISSS y AFP: un repaso rápido de lo básico.", read: "5 min", body: ["Todo trabajador formal tiene derecho a aguinaldo, vacaciones anuales con recargo, y cobertura de ISSS y AFP.", "Revisa tu contrato y conserva tus comprobantes de pago. Ante dudas, consulta al Ministerio de Trabajo."] },
    { id: "ar8", type: "Artículo", title: "Negociar tu salario sin miedo", summary: "Cómo investigar rangos, fijar un piso y responder a la primera oferta.", read: "6 min", body: ["Consulta rangos en el portal y en foros. Define un monto mínimo aceptable y un monto objetivo.", "Responde a la oferta con agradecimiento y una contrapropuesta fundamentada en tu experiencia.", "Considera el paquete completo: seguro, bonos, modalidad y capacitación."] }
  ];

  var interviewTips = [
    "Investiga la empresa, su sector y sus productos.",
    "Revisa la oferta y prepara ejemplos para cada requisito.",
    "Practica la respuesta «hábleme de usted» en 90 segundos.",
    "Prepara tres preguntas para hacer al entrevistador.",
    "Confirma dirección, hora y persona de contacto el día anterior.",
    "Lleva copias del CV y documentos de identidad."
  ];

  var monthly = [
    { m: "May", v: 182 }, { m: "Jun", v: 240 }, { m: "Jul", v: 310 }, { m: "Ago", v: 285 }, { m: "Sep", v: 402 }, { m: "Oct", v: 468 }
  ];

  window.WC_DATA = {
    version: 1, DEPARTAMENTOS: DEPARTAMENTOS, SECTORES: SECTORES, MODALIDADES: MODALIDADES, CONTRATOS: CONTRATOS, EXPERIENCIAS: EXPERIENCIAS,
    companies: companies, jobs: jobs, users: users, profiles: profiles, applications: applications, threads: threads, forumCats: forumCats,
    reviews: reviews, reports: reports, articles: articles, interviewTips: interviewTips, monthly: monthly
  };
})();
