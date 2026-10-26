// ============================================================
// MÓDULO: AUDITORÍAS 5S TURNO A TURNO
// ============================================================

var HOJAS_5S = {
  BASE:        'Registros_5s',
  TERRITORIOS: 'Territorios',
  AREAS:       'Areas_5s',
  AUDITORES:   'Auditores',
  BAUL:        'Baul_5S',
  BAUL_LISTAS: 'Baul_listas'
};

var PREGUNTAS_5S_OFICIALES = [
  { orden: 1,  categoria: "1S - Clasificar (Seiri)", pregunta: "¿Hay exceso de pertenencias personales (mochilas,  etc.) en el área? ¿Hay exceso de EPP?  En caso que no haya exceso, colocar Sí. *" },
  { orden: 2,  categoria: "1S - Clasificar (Seiri)", pregunta: "¿Se cuenta con layout del área? *" },
  { orden: 3,  categoria: "1S - Clasificar (Seiri)", pregunta: "¿Se cuenta con una RACI de actividades? *" },
  { orden: 4,  categoria: "1S - Clasificar (Seiri)", pregunta: "¿Se cuenta con una lista de verificación de actividades? *" },
  { orden: 5,  categoria: "1S - Clasificar (Seiri)", pregunta: "¿Las herramientas de limpieza necesarias están disponibles y son suficientes para la ejecución de actividades?  Las herramientas de limpieza deben cumplir con el estándar de Seguridad Alimentaria desplegado por Calidad. *" },
  { orden: 6,  categoria: "1S - Clasificar (Seiri)", pregunta: "¿El área está libre de materiales, repuestos o documentos innecesarios? En caso de estar en malas condiciones, corregir de inmediato. *" },
  { orden: 7,  categoria: "2S - Ordenar (Seiton)", pregunta: "¿Hay una forma sistemática/estandarizada de control de las herramientas necesarias que debe utilizar el personal? *" },
  { orden: 8,  categoria: "2S - Ordenar (Seiton)", pregunta: "¿Las herramientas de trabajo necesarias están disponibles y son suficientes para la ejecución de actividades? Entiéndase que las herramientas para Mantenimiento Autónomo siempre deben estar disponibles y completas. *" },
  { orden: 9,  categoria: "2S - Ordenar (Seiton)", pregunta: "¿Los lugares de almacenamiento están claramente marcados para indicar la ubicación de artículos?  No pared, ventanas, piso, máquina, etc. *" },
  { orden: 10, categoria: "2S - Ordenar (Seiton)", pregunta: "¿Los elementos se almacenan de una manera que hace que el área sea segura? *" },
  { orden: 11, categoria: "2S - Ordenar (Seiton)", pregunta: "¿Los elementos están segregados / clasificados? ¿Almacenados en contenedores / cajones según corresponda? *" },
  { orden: 12, categoria: "2S - Ordenar (Seiton)", pregunta: "¿Las herramientas de trabajo están en el lugar adecuado? ¿Son de fácil acceso y de conocimiento por todos? *" },
  { orden: 13, categoria: "2S - Ordenar (Seiton)", pregunta: "¿Los archivos, carpetas, cajas, armarios están identificados y etiquetados? ¿Coincide con el contenido? *" },
  { orden: 14, categoria: "2S - Ordenar (Seiton)", pregunta: "¿Los suministros de limpieza se guardan en un lugar accesible? ¿El acceso a estas herramientas está disponible para la gente que las utiliza y solamente para ellos? Verificar si se cuenta con un candado y que se cuente con la llave. *" },
  { orden: 15, categoria: "3S - Limpiar (Seiso)", pregunta: "¿Están limpios los interiores de los gabinetes y los cajones, los mostradores, los escritorios y el equipo? De encontrarse en mal estado, corregir de inmediato. *" },
  { orden: 16, categoria: "3S - Limpiar (Seiso)", pregunta: "¿Hay suficientes recipientes con tapa para recolectar residuos, identificados y disponibles en lugar adecuados? *" },
  { orden: 17, categoria: "3S - Limpiar (Seiso)", pregunta: "¿Pisos limpios, sin daños, secos y sin riesgos de tropiezos y resbalones? ¿paredes, techos y lámparas están limpios? *" },
  { orden: 18, categoria: "3S - Limpiar (Seiso)", pregunta: "¿Área libre de alguna deficiencia de mantenimiento que deba ser tratada? (Fugas, oxido, pintura, etc.) *" },
  { orden: 19, categoria: "4S - Estandarizar (Seiketsu)", pregunta: "¿Hay un mapa de 5S/Territorio  para el área y éste tiene un dueño asignado? ¿Está actualizado y corresponde a la realidad?  *" },
  { orden: 20, categoria: "4S - Estandarizar (Seiketsu)", pregunta: "¿Ha sido desarrollada, comunicada y publicada una RACI para 5S? *" },
  { orden: 21, categoria: "4S - Estandarizar (Seiketsu)", pregunta: "¿Los equipos, herramientas, documentos, muebles, mesas, etc.; están en buen estado de conservación? *" },
  { orden: 22, categoria: "4S - Estandarizar (Seiketsu)", pregunta: "¿Existe un programa de limpieza en el área? Existen estándares de 5S en el áreas? *" },
  { orden: 23, categoria: "4S - Estandarizar (Seiketsu)", pregunta: "¿Las 5S son abordadas durante las reuniones de cambio de turno o departamental?  *" },
  { orden: 24, categoria: "5S - Sostener (Shitsuke)", pregunta: "¿Hay un programa de auditoría y se cumple? ¿Conoces el estatus de cumplimiento del programa y la calificación que has obtenido? *" },
  { orden: 25, categoria: "5S - Sostener (Shitsuke)", pregunta: "¿Corregiste los hallazgos encontrados durante tu última auditoría? ¿Conoces el Plan de Acción de 5S? *" },
  { orden: 26, categoria: "5S - Sostener (Shitsuke)", pregunta: "¿Se cumplen los programas de limpieza y checklist para mantener las 5S en el área? *" },
  { orden: 27, categoria: "5S - Sostener (Shitsuke)", pregunta: "¿Se han compartido auditorías pasadas con los operadores en el área? Comprueba preguntando al operador del Territorio auditado el estatus de 5S. *" },
  { orden: 28, categoria: "5S - Sostener (Shitsuke)", pregunta: "De conocer el estatus del programa de auditorías, ¿el promedio de las últimas 3 auditorías es igual o superior a 80%? Si no lo conces, colocar No. *" }
];

/**
 * Obtiene la lista completa de auditores desde la hoja 'Auditores',
 * revisando todas las columnas y filas, complementando con 'Baul_listas' y 'Registros_5s'.
 */
function getAuditores() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var list = [];
    
    // 1. Hoja Auditores (búsqueda flexible insensible a mayúsculas/espacios)
    var sheets = ss.getSheets();
    var hojaAuditores = null;
    for (var i = 0; i < sheets.length; i++) {
      var sName = sheets[i].getName().toLowerCase().trim();
      if (sName === 'auditores' || sName === 'auditor') {
        hojaAuditores = sheets[i];
        break;
      }
    }
    
    if (hojaAuditores && hojaAuditores.getLastRow() >= 1) {
      var valores = hojaAuditores.getDataRange().getValues();
      valores.forEach(function(fila) {
        fila.forEach(function(celda) {
          var val = String(celda || '').trim();
          if (!val) return;
          var valNorm = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (valNorm === 'auditor' || valNorm === 'auditores' || valNorm === 'nombre' || 
              valNorm === 'nombres' || valNorm === 'id' || valNorm === 'cedula' || 
              valNorm === 'cargo' || valNorm === 'rol' || valNorm === 'correo' || 
              valNorm === 'email' || valNorm === 'item') {
            return;
          }
          if (/^\d+$/.test(val)) return; // Ignorar IDs o números
          if (val.length >= 3 && !val.includes('@')) {
            list.push(val);
          }
        });
      });
    }

    // 2. Complementar con Baul_listas (responsables y dueños)
    var hListas = ss.getSheetByName(HOJAS_5S.BAUL_LISTAS);
    if (hListas && hListas.getLastRow() > 1) {
      var dListas = hListas.getDataRange().getValues().slice(1);
      dListas.forEach(function(r) {
        var resp = String(r[2] || '').trim();
        var dueno = String(r[3] || '').trim();
        if (resp && resp.length >= 3 && !/^\d+$/.test(resp) && !resp.includes('@')) list.push(resp);
        if (dueno && dueno !== 'Sin Asignar' && dueno.length >= 3 && !dueno.startsWith('#')) list.push(dueno);
      });
    }

    // 3. Complementar con auditores históricos de Registros_5s (Col E / índice 4)
    var hBase = ss.getSheetByName(HOJAS_5S.BASE);
    if (hBase && hBase.getLastRow() > 1) {
      var dBase = hBase.getDataRange().getValues().slice(1);
      dBase.forEach(function(r) {
        var a = String(r[4] || '').trim();
        if (a && a.length >= 3 && !/^\d+$/.test(a) && a.toLowerCase() !== 'auditor' && a.toLowerCase() !== 'users') {
          list.push(a);
        }
      });
    }

    var unicos = Array.from(new Set(list.map(function(x) { return x.replace(/\s+/g, ' ').trim(); })));
    return unicos.filter(Boolean).sort();
  } catch (e) {
    Logger.log("Error en getAuditores: " + e);
    return [];
  }
}

/**
 * Retorna la configuración de territorios, auditores y listas de soporte.
 */
function getConfigTerritorios() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var mapa = {};

    var hojaTerr = ss.getSheetByName(HOJAS_5S.AREAS) || ss.getSheetByName(HOJAS_5S.TERRITORIOS);
    if (hojaTerr && hojaTerr.getLastRow() > 1) {
      var datos = hojaTerr.getDataRange().getValues().slice(1);
      datos.forEach(function(r) {
        var nom = String(r[0] || '').trim();
        var dueno = String(r[1] || '').trim();
        if (dueno.startsWith('#') && r[3]) dueno = String(r[3]).trim();
        if (nom && nom.toLowerCase() !== 'no aplica') {
          mapa[nom] = {
            nombre: nom,
            duenoBi: dueno || 'Sin Asignar',
            duenOol: dueno || 'Sin Asignar',
            hashtag: '#' + nom.toUpperCase().replace(/[^A-Z0-9]/g, '')
          };
        }
      });
    }

    // Suplementar con territorios de Baul_listas si hay alguno adicional
    var hListas = ss.getSheetByName(HOJAS_5S.BAUL_LISTAS);
    if (hListas && hListas.getLastRow() > 1) {
      var dListas = hListas.getDataRange().getValues().slice(1);
      dListas.forEach(function(r) {
        var nom = String(r[4] || '').trim();
        var dueno = String(r[3] || '').trim();
        if (nom && !mapa[nom]) {
          mapa[nom] = {
            nombre: nom,
            duenoBi: dueno || 'Sin Asignar',
            duenOol: dueno || 'Sin Asignar',
            hashtag: '#' + nom.toUpperCase().replace(/[^A-Z0-9]/g, '')
          };
        }
      });
    }

    var auditores = getAuditores();

    return {
      territorios: Object.values(mapa),
      auditores: auditores
    };
  } catch (e) {
    return { error: e.toString() };
  }
}

/**
 * Retorna las 28 preguntas oficiales para el checklist turno a turno.
 */
function getPreguntas5S() {
  return { preguntas: PREGUNTAS_5S_OFICIALES };
}

/**
 * Verifica si ya existe auditoría para el mismo territorio, turno y fecha.
 */
function verificarDuplicadoAuditoria(territorio, turno, fecha) {
  try {
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName(HOJAS_5S.BASE);
    if (!hoja || hoja.getLastRow() <= 1) return { existe: false };

    var datos = hoja.getDataRange().getDisplayValues();
    var headers = datos[0].map(function(h) { return String(h).trim().toUpperCase(); });
    
    var iFecha = headers.indexOf('FECHA') >= 0 ? headers.indexOf('FECHA') : 1;
    var iTurno = headers.indexOf('TURNO') >= 0 ? headers.indexOf('TURNO') : 2;
    var iTerr  = headers.indexOf('TERRITORIO') >= 0 ? headers.indexOf('TERRITORIO') : 3;

    var encontrado = datos.slice(1).some(function(fila) {
      return String(fila[iTerr]).trim()  === String(territorio).trim() &&
             String(fila[iTurno]).trim() === String(turno).trim() &&
             String(fila[iFecha]).trim() === String(fecha).trim();
    });

    return { existe: encontrado };
  } catch (e) {
    return { existe: false };
  }
}

/**
 * Guarda la auditoría turno a turno en la hoja 'Registros_5s' (nueva estructura limpia de 34 columnas)
 * y si existen novedades o hallazgos con "No", registra las acciones correspondientes en 'Baul_5S'.
 */
function guardarAuditoria5S(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (eLock) {
    return { error: 'El sistema está ocupado procesando otra auditoría. Por favor reintenta en un momento.' };
  }

  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var hBase = ss.getSheetByName(HOJAS_5S.BASE);
    var hBaul = ss.getSheetByName(HOJAS_5S.BAUL);

    if (!hBase) {
      hBase = ss.insertSheet(HOJAS_5S.BASE);
    }
    var cabeceraOficialBaul = [
      'Rutina',
      'KPI',
      'Descripción',
      'Accion',
      'Responsable',
      'Dueño',
      'Fecha de creacion',
      'fecha de compromiso',
      'Estado',
      'ImagenURL',
      'comentario',
      'Estado (Lista desplegable)',
      'Modificado por (Usuario)',
      'Territorio'
    ];

    if (!hBaul) {
      hBaul = ss.insertSheet(HOJAS_5S.BAUL);
      hBaul.appendRow(cabeceraOficialBaul);
    } else {
      var colsActuales = hBaul.getLastColumn();
      if (colsActuales < 14) {
        hBaul.getRange(1, 1, 1, cabeceraOficialBaul.length).setValues([cabeceraOficialBaul]).setFontWeight('bold');
      }
    }

    var respuestas = payload.respuestas || [];
    var total = respuestas.length;
    var correctas = respuestas.filter(function(r) { return r.respuesta === 'Si'; }).length;
    var porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;

    var ahora = new Date();
    var fechaCreacionStr = Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd');
    var auditoriaId = '5S-' + Utilities.formatDate(ahora, 'America/Bogota', 'yyyyMMdd-HHmmss');

    // ── Nueva Estructura de 34 columnas limpias ──
    var filaBase = new Array(34).fill('');
    filaBase[0] = payload.semana || '';
    filaBase[1] = payload.fecha || fechaCreacionStr;
    filaBase[2] = payload.turno || '';
    filaBase[3] = payload.territorio || '';
    filaBase[4] = payload.auditadoPor || '';
    filaBase[5] = porcentaje + '%';

    // Respuestas Sí/No desde la columna G (índice 6) hasta AH (índice 33)
    respuestas.forEach(function(r, i) {
      if (6 + i < 34) {
        filaBase[6 + i] = r.respuesta;
      }
    });

    hBase.appendRow(filaBase);

    // ── Acciones en Baul_5S (Nueva Estructura Oficial de 14 columnas) ──
    var totalColsBaul = 14;
    var filasBaul = [];
    var fechaCompTurno = payload.fecha || fechaCreacionStr;

    // 1. Registrar únicamente las acciones generadas por hallazgos puntuales marcados con "No"
    respuestas.forEach(function(r) {
      if (r.respuesta !== 'No') return;

      var hallazgo = (r.hallazgo || '').toString().trim();
      var accion = (r.accion || '').toString().trim();

      // Validación: NO crear acción en Baúl si no hay novedad ni acción
      if (!hallazgo && !accion) {
        return;
      }

      var filaHallazgo = new Array(totalColsBaul).fill('');
      filaHallazgo[0]  = '5S';                                             // Col A: Rutina
      filaHallazgo[1]  = '#Prioridades de turno';                          // Col B: KPI
      filaHallazgo[2]  = r.pregunta + (hallazgo ? (' — Novedad: ' + hallazgo) : ''); // Col C: Descripción
      filaHallazgo[3]  = accion || hallazgo || 'Gestionar hallazgo 5S';     // Col D: Accion
      filaHallazgo[4]  = (r.encargado && r.encargado.trim()) ? r.encargado.trim() : payload.auditadoPor; // Col E: Responsable
      filaHallazgo[5]  = payload.duenoBi || 'Sin Asignar';                 // Col F: Dueño
      filaHallazgo[6]  = fechaCreacionStr;                                 // Col G: Fecha de creacion
      filaHallazgo[7]  = fechaCompTurno;                                   // Col H: fecha de compromiso
      filaHallazgo[8]  = 'EN PROGRESO';                                    // Col I: Estado
      filaHallazgo[9]  = '';                                               // Col J: ImagenURL
      filaHallazgo[10] = '';                                               // Col K: comentario
      filaHallazgo[11] = 'EN PROGRESO';                                    // Col L: Estado (Lista desplegable)
      filaHallazgo[12] = payload.auditadoPor || 'Auditor';                 // Col M: Modificado por (Usuario)
      filaHallazgo[13] = payload.territorio || '';                         // Col N: Territorio

      filasBaul.push(filaHallazgo);
    });

    // 2. Si y solo si NO se generó ninguna acción desde las preguntas "No",
    // pero se envió explícitamente una acción de fin de turno (<80%), registrarla para no duplicar:
    if (filasBaul.length === 0 && porcentaje < 80 && payload.accionFinTurno && payload.accionFinTurno.descripcion) {
      var descFinTurno = payload.accionFinTurno.descripcion.trim();
      if (descFinTurno) {
        var filaEntrega = new Array(totalColsBaul).fill('');
        filaEntrega[0]  = '5S';                                              // Col A: Rutina
        filaEntrega[1]  = '#Prioridades de turno';                           // Col B: KPI
        filaEntrega[2]  = '[COMPROMISO FIN DE TURNO <80%] ' + descFinTurno;  // Col C: Descripción
        filaEntrega[3]  = descFinTurno;                                      // Col D: Accion
        filaEntrega[4]  = payload.accionFinTurno.responsable || payload.auditadoPor; // Col E: Responsable
        filaEntrega[5]  = payload.accionFinTurno.dueno || payload.duenoBi || 'Sin Asignar'; // Col F: Dueño
        filaEntrega[6]  = fechaCreacionStr;                                  // Col G: Fecha de creacion
        filaEntrega[7]  = payload.fecha || fechaCreacionStr;                 // Col H: fecha de compromiso
        filaEntrega[8]  = 'EN PROGRESO';                                     // Col I: Estado
        filaEntrega[9]  = '';                                                // Col J: ImagenURL
        filaEntrega[10] = '';                                                // Col K: comentario
        filaEntrega[11] = 'EN PROGRESO';                                     // Col L: Estado (Lista desplegable)
        filaEntrega[12] = payload.auditadoPor || 'Auditor';                  // Col M: Modificado por (Usuario)
        filaEntrega[13] = payload.territorio || '';                          // Col N: Territorio

        filasBaul.push(filaEntrega);
      }
    }

    // 3. Deduplicación estricta en el lote a insertar
    var filasUnicasBaul = [];
    var clavesRegistradas = {};
    filasBaul.forEach(function(f) {
      var clave = (String(f[2]).trim() + '|' + String(f[3]).trim() + '|' + String(f[4]).trim() + '|' + String(f[13]).trim()).toLowerCase();
      if (!clavesRegistradas[clave]) {
        clavesRegistradas[clave] = true;
        filasUnicasBaul.push(f);
      }
    });

    if (filasUnicasBaul.length > 0) {
      var ultimaFila = hBaul.getLastRow();
      hBaul.getRange(ultimaFila + 1, 1, filasUnicasBaul.length, totalColsBaul).setValues(filasUnicasBaul);
    }

    return {
      exito: true,
      auditoriaId: auditoriaId,
      porcentaje: porcentaje,
      novedades: filasUnicasBaul.length,
      accionFinTurnoRegistrada: false
    };
  } catch (e) {
    Logger.log("Error en guardarAuditoria5S: " + e);
    return { error: e.toString() };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Función auxiliar para crear registros de prueba de la semana pasada (para pruebas en dashboard)
 */
function generarRegistrosPrueba() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Registros_5s');
  if (!hoja) return 'Error: No existe hoja Registros_5s';

  var hojaTerr = ss.getSheetByName('Territorios');
  var territorios = [];
  if (hojaTerr) {
    var vals = hojaTerr.getDataRange().getValues();
    for (var j = 1; j < vals.length; j++) {
      if (vals[j][0]) territorios.push(vals[j][0]);
    }
  }
  if (territorios.length === 0) {
    territorios = ['Cope y Descope', 'Báscula', 'Mantenimiento', 'Cuarto Frío', 'Conductores', 'Oficinas', 'Almacén', 'Área de Calidad', 'Parqueadero', 'Patio de Maniobras', 'Maquila', 'Envasado'];
  }
  var turnos = ['Turno A (06:00 – 14:00)', 'Turno B (14:00 – 22:00)', 'Turno C (22:00 – 06:00)'];
  var auditores = ['FREDYS DE LA HOZ LOPEZ', 'ALEJANDRA PULIDO FERRER', 'ELIANA BERMEJO FONTALVO'];
  var numCols = 49;
  
  var filas = [];
  var baseDate = new Date();
  baseDate.setHours(0,0,0,0);
  
  // Generar datos para los últimos 7 días
  for (var diasAtras = 1; diasAtras <= 7; diasAtras++) {
    var d = new Date(baseDate.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
    var semanaStr = 'W' + Utilities.formatDate(d, 'America/Bogota', 'w');
    var fechaStr = Utilities.formatDate(d, 'America/Bogota', 'yyyy-MM-dd');
    
    // Un registro por territorio y por turno en cada día
    territorios.forEach(function(terr) {
      turnos.forEach(function(turno) {
        var fila = new Array(numCols).fill('');
        
        var score = Math.floor(Math.random() * 30) + 70; // 70 a 100%
        
        fila[0]  = semanaStr;
        fila[4]  = auditores[Math.floor(Math.random() * auditores.length)];
        fila[9]  = score + '%';
        fila[18] = terr;
        fila[19] = turno;
        fila[20] = fechaStr;
        
        // Colocar respuestas Sí/No desde la columna V (índice 21) hasta AW (índice 48)
        for (var p = 21; p <= 48; p++) {
          fila[p] = (Math.random() > (1 - (score/100))) ? 'Si' : 'No';
        }
        
        filas.push(fila);
      });
    });
  }
  
  if (filas.length > 0) {
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, numCols).setValues(filas);
  }
  return filas.length + ' registros de prueba insertados exitosamente.';
}
