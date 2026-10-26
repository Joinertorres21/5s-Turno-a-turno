// ============================================================
// MÓDULO: BAÚL DE ACCIONES 5S (Sincronizado con Baul_5S y Baul_listas)
// ============================================================

/**
 * Limpia y purga automáticamente acciones vacías o registros fantasmas sin novedad/acción en Baul_5S.
 */
function limpiarAccionesVaciasBaul5S(hoja) {
  try {
    if (!hoja) return;
    var ultFila = hoja.getLastRow();
    if (ultFila <= 1) return;
    var headers = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), 10)).getValues()[0];
    var iDesc = headers.findIndex(function(h) { return String(h).toLowerCase().includes('descrip'); });
    if (iDesc < 0) iDesc = 2; // Columna C por defecto
    var vals = hoja.getRange(2, iDesc + 1, ultFila - 1, 1).getValues();
    var filasEliminar = [];
    for (var i = vals.length - 1; i >= 0; i--) {
      var d = String(vals[i][0] || '').trim();
      // Elimina filas sin descripción o donde novedad y acción quedaron en blanco
      if (d === '' || /—\s*Novedad:\s*—\s*Acción:\s*$/i.test(d) || (d.indexOf('— Novedad:') !== -1 && d.trim().endsWith('— Acción:'))) {
        filasEliminar.push(i + 2);
      }
    }
    filasEliminar.forEach(function(f) {
      hoja.deleteRow(f);
    });
  } catch (e) {
    Logger.log("Error en limpiarAccionesVaciasBaul5S: " + e);
  }
}

/**
 * Lee el Baúl de Acciones 5S dinámicamente y calcula el estado y retrasos.
 */
function obtenerDatosBaul5S() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName('Baul_5S');
    if (!hoja) return { error: "No se encontró la hoja Baul_5S." };

    // Purgar filas vacías o acciones fantasmas registradas por error
    limpiarAccionesVaciasBaul5S(hoja);

    var datos = hoja.getDataRange().getDisplayValues();
    if (datos.length <= 1) {
      return { datos: [], resumen: { cerradas: 0, enProgreso: 0, retrasadas: 0, total: 0 } };
    }

// Estructura oficial de 14 columnas del Baúl 5S
var CABECERA_BAUL_OFICIAL = [
  'Rutina',                     // Col 1 (A)
  'KPI',                        // Col 2 (B)
  'Descripción',                // Col 3 (C)
  'Accion',                     // Col 4 (D)
  'Responsable',                // Col 5 (E)
  'Dueño',                      // Col 6 (F)
  'Fecha de creacion',          // Col 7 (G)
  'fecha de compromiso',        // Col 8 (H)
  'Estado',                     // Col 9 (I)
  'ImagenURL',                  // Col 10 (J)
  'comentario',                 // Col 11 (K)
  'Estado (Lista desplegable)',  // Col 12 (L)
  'Modificado por (Usuario)',   // Col 13 (M)
  'Territorio'                  // Col 14 (N)
];

    var headers = datos[0].map(function(h) { return String(h || '').trim().toLowerCase(); });
    
    // Mapeo dinámico por nombres de columnas según la nueva estructura de Baul_5S
    var iRutina   = headers.findIndex(function(h) { return h.includes('rutina'); });
    var iKpi      = headers.findIndex(function(h) { return h.includes('kpi'); });
    var iDesc     = headers.findIndex(function(h) { return h.includes('descrip'); });
    var iAccion   = headers.findIndex(function(h) { return h.includes('accion') || h.includes('acción'); });
    var iResp     = headers.findIndex(function(h) { return h.includes('responsable'); });
    var iDueno    = headers.findIndex(function(h) { return h.includes('dueño') || h.includes('dueno'); });
    var iFecCrea  = headers.findIndex(function(h) { return h.includes('creacion') || h.includes('creación'); });
    var iFecComp  = headers.findIndex(function(h) { return h.includes('compromiso'); });
    var iEstado   = headers.findIndex(function(h) { return h === 'estado' || (h.startsWith('estado') && !h.includes('desplegable') && !h.includes('lista')); });
    var iImg      = headers.findIndex(function(h) { return h.includes('imagen') || h.includes('url'); });
    var iComent   = headers.findIndex(function(h) { return h.includes('comentario'); });
    var iEstadoL  = headers.findIndex(function(h) { return h.includes('desplegable') || h.includes('lista'); });
    var iModifPor = headers.findIndex(function(h) { return h.includes('modificado') || h.includes('cerrado') || h.includes('usuario'); });
    var iTerr     = headers.findIndex(function(h) { return h.includes('territorio'); });

    // Fallbacks a los 14 índices estándar
    if (iRutina < 0)   iRutina = 0;   // A
    if (iKpi < 0)      iKpi = 1;      // B
    if (iDesc < 0)     iDesc = 2;     // C
    if (iAccion < 0)   iAccion = 3;   // D
    if (iResp < 0)     iResp = 4;     // E
    if (iDueno < 0)    iDueno = 5;    // F
    if (iFecCrea < 0)  iFecCrea = 6;  // G
    if (iFecComp < 0)  iFecComp = 7;  // H
    if (iEstado < 0)   iEstado = 8;   // I
    if (iImg < 0)      iImg = 9;      // J
    if (iComent < 0)   iComent = 10;  // K
    if (iEstadoL < 0)  iEstadoL = 11; // L
    if (iModifPor < 0) iModifPor = 12;// M
    if (iTerr < 0)     iTerr = 13;    // N

    var hoy = new Date(); 
    hoy.setHours(0, 0, 0, 0);
    var resumen = { cerradas: 0, enProgreso: 0, pendientes: 0, retrasadas: 0, total: datos.length - 1 };

    var filas = datos.slice(1).map(function(fila, index) {
      var comentario   = String(fila[iComent] || '').trim();
      var estadoOrig   = String(fila[iEstado] || '').trim().toUpperCase();
      var fechaCompStr = String(fila[iFecComp] || '').trim();
      var estadoCalculado = 'EN PROGRESO';
      var diasRetraso = 0;

      if (estadoOrig.includes('CERRAD')) {
        estadoCalculado = 'CERRADAS';
        resumen.cerradas++;
      } else if (estadoOrig.includes('PENDIENTE') || estadoOrig.includes('GESTIONAD') || estadoOrig.includes('VALIDA') || estadoOrig.includes('CIERRE')) {
        estadoCalculado = 'PENDIENTE CIERRE';
        resumen.pendientes++;
      } else {
        var estaRetrasada = false;
        if (fechaCompStr !== '') {
          var partes = fechaCompStr.split(/[/-]/);
          if (partes.length === 3) {
            var d, m, y;
            if (partes[0].length === 4) {
              d = parseInt(partes[2]); m = parseInt(partes[1]) - 1; y = parseInt(partes[0]);
            } else {
              d = parseInt(partes[0]); m = parseInt(partes[1]) - 1; y = parseInt(partes[2]);
            }
            var dateComp = new Date(y, m, d);
            if (!isNaN(dateComp.getTime())) {
              dateComp.setHours(0, 0, 0, 0);
              if (dateComp < hoy) {
                estaRetrasada = true;
                var diffMs = hoy.getTime() - dateComp.getTime();
                diasRetraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              }
            }
          }
        }
        if (estaRetrasada) {
          estadoCalculado = 'RETRASADAS';
          resumen.retrasadas++;
        } else {
          estadoCalculado = 'EN PROGRESO';
          resumen.enProgreso++;
        }
      }

      return {
        filaIndex:       index + 2,
        rutina:          fila[iRutina] || '',
        kpi:             fila[iKpi] || '',
        descripcion:     fila[iDesc] || '',
        accion:          fila[iAccion] || '',
        responsable:     fila[iResp] || '',
        dueno:           fila[iDueno] || '',
        fechaCreacion:   fila[iFecCrea] || '',
        fechaCompromiso: fila[iFecComp] || '',
        estado:          estadoCalculado,
        imagenUrl:       fila[iImg] || '',
        comentario:      comentario,
        estadoLista:     fila[iEstadoL] || '',
        modificadoPor:   fila[iModifPor] || '',
        territorio:      fila[iTerr] || '',
        diasRetraso:     diasRetraso
      };
    });

    return { datos: filas, resumen: resumen };
  } catch (e) {
    Logger.log("Error en obtenerDatosBaul5S: " + e);
    return { error: e.toString() };
  }
}

/**
 * Retorna las opciones de listas desplegables desde la hoja 'Baul_listas'
 * conectando Rutina (Col A), KPI (Col B), Responsable (Col C), Dueño (Col D) y Territorio (Col E).
 */
function obtenerListasBaul5S() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hojaListas = ss.getSheetByName('Baul_listas');

    var rutinas = [];
    var kpis = [];
    var responsables = [];
    var duenos = [];
    var territorios = [];

    if (hojaListas && hojaListas.getLastRow() > 1) {
      var data = hojaListas.getDataRange().getValues().slice(1);
      data.forEach(function(r) {
        if (r[0]) rutinas.push(String(r[0]).trim());
        if (r[1]) kpis.push(String(r[1]).trim());
        if (r[2]) responsables.push(String(r[2]).trim());
        if (r[3]) duenos.push(String(r[3]).trim());
        if (r[4]) territorios.push(String(r[4]).trim());
      });
    }

    // Suplementar con hoja Auditores para responsables
    var hAuditores = ss.getSheetByName('Auditores');
    if (hAuditores && hAuditores.getLastRow() > 1) {
      var aVals = hAuditores.getDataRange().getValues().slice(1);
      aVals.forEach(function(r) {
        var a = String(r[0] || '').trim();
        if (a) responsables.push(a);
      });
    }

    // Suplementar con hoja Areas_5s o Territorios
    var hTerr = ss.getSheetByName('Areas_5s') || ss.getSheetByName('Territorios');
    if (hTerr && hTerr.getLastRow() > 1) {
      var tVals = hTerr.getDataRange().getValues().slice(1);
      tVals.forEach(function(r) {
        var t = String(r[0] || '').trim();
        var d = String(r[1] || '').trim();
        if (d.startsWith('#') && r[3]) d = String(r[3]).trim();
        if (t && t.toLowerCase() !== 'no aplica') territorios.push(t);
        if (d && d !== 'Sin Asignar') duenos.push(d);
      });
    }

    rutinas = Array.from(new Set(rutinas)).filter(Boolean).sort();
    kpis = Array.from(new Set(kpis)).filter(Boolean).sort();
    responsables = Array.from(new Set(responsables)).filter(Boolean).sort();
    duenos = Array.from(new Set(duenos)).filter(Boolean).sort();
    territorios = Array.from(new Set(territorios)).filter(Boolean).sort();

    if (rutinas.length === 0) rutinas = ['Rutina Lineas', 'Rutina Preturno T1', 'Auditoría 5S'];
    if (kpis.length === 0) kpis = ['#Prioridades de turno', '#5WHY', '#5S'];

    return {
      rutinas:      rutinas,
      kpis:         kpis,
      responsables: responsables,
      duenos:       duenos,
      territorios:  territorios
    };
  } catch (e) {
    Logger.log("Error en obtenerListasBaul5S: " + e);
    return { error: e.toString() };
  }
}

/**
 * Agrega una acción al Baúl de Acciones Baul_5S (14 columnas oficiales)
 */
function agregarAccionBaul5S(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName('Baul_5S');
    if (!hoja) {
      hoja = ss.insertSheet('Baul_5S');
      hoja.appendRow(CABECERA_BAUL_OFICIAL);
    } else {
      var totalColsActuales = hoja.getLastColumn();
      if (totalColsActuales < 14) {
        hoja.getRange(1, 1, 1, CABECERA_BAUL_OFICIAL.length).setValues([CABECERA_BAUL_OFICIAL]).setFontWeight('bold');
      }
    }

    var ahora = new Date();
    var fechaCrea = Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd');
    var totalCols = 14;
    var fila = new Array(totalCols).fill('');

    var accion = typeof payload === 'object' && payload !== null ? payload : {};

    fila[0]  = accion.rutina || '5S';                                             // Col A: Rutina
    fila[1]  = accion.kpi || '#Prioridades de turno';                              // Col B: KPI
    fila[2]  = accion.descripcion || '';                                          // Col C: Descripción
    fila[3]  = accion.accion || accion.accionPropuesta || accion.descripcion || ''; // Col D: Accion
    fila[4]  = accion.responsable || '';                                          // Col E: Responsable
    fila[5]  = accion.dueno || 'Sin Asignar';                                     // Col F: Dueño
    fila[6]  = accion.fechaCreacion || fechaCrea;                                 // Col G: Fecha de creacion
    fila[7]  = accion.fechaCompromiso || fechaCrea;                               // Col H: fecha de compromiso
    fila[8]  = accion.estado || 'EN PROGRESO';                                    // Col I: Estado
    fila[9]  = accion.imagenUrl || '';                                            // Col J: ImagenURL
    fila[10] = accion.comentario || '';                                           // Col K: comentario
    fila[11] = accion.estado || 'EN PROGRESO';                                    // Col L: Estado (Lista desplegable)
    fila[12] = accion.usuario || accion.modificadoPor || 'Usuario';               // Col M: Modificado por (Usuario)
    fila[13] = accion.territorio || '';                                           // Col N: Territorio

    hoja.appendRow(fila);
    return { exito: true };
  } catch (e) {
    Logger.log("Error en agregarAccionBaul5S: " + e);
    return { error: e.toString() };
  }
}

/**
 * Elimina una acción del Baúl de Acciones Baul_5S
 */
function eliminarAccionBaul5S(filaIndex) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName('Baul_5S');
    if (!hoja) return { error: 'Hoja no encontrada' };

    hoja.deleteRow(filaIndex);
    return { exito: true };
  } catch (e) {
    Logger.log("Error en eliminarAccionBaul5S: " + e);
    return { error: e.toString() };
  }
}

/**
 * Permite editar o gestionar una acción del Baúl garantizando la estructura de 14 columnas
 */
function guardarEdicionBaul5S(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName('Baul_5S');
    if (!hoja) return { error: 'No se encontró la hoja Baul_5S.' };

    var filaIndex = payload.filaIndex;
    if (!filaIndex || filaIndex <= 1) return { error: 'Índice de fila inválido.' };

    var headers = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), 14)).getValues()[0];
    var iRutina   = headers.findIndex(function(h) { return String(h).toLowerCase().includes('rutina'); });
    var iKpi      = headers.findIndex(function(h) { return String(h).toLowerCase().includes('kpi'); });
    var iDesc     = headers.findIndex(function(h) { return String(h).toLowerCase().includes('descrip'); });
    var iAccion   = headers.findIndex(function(h) { return String(h).toLowerCase().includes('accion') || String(h).toLowerCase().includes('acción'); });
    var iResp     = headers.findIndex(function(h) { return String(h).toLowerCase().includes('responsable'); });
    var iDueno    = headers.findIndex(function(h) { return String(h).toLowerCase().includes('dueño') || String(h).toLowerCase().includes('dueno'); });
    var iComp     = headers.findIndex(function(h) { return String(h).toLowerCase().includes('compromiso'); });
    var iEstado   = headers.findIndex(function(h) { var s = String(h).toLowerCase(); return s === 'estado' || (s.startsWith('estado') && !s.includes('desplegable') && !s.includes('lista')); });
    var iImg      = headers.findIndex(function(h) { return String(h).toLowerCase().includes('imagen') || String(h).toLowerCase().includes('url'); });
    var iComent   = headers.findIndex(function(h) { return String(h).toLowerCase().includes('comentario'); });
    var iEstadoL  = headers.findIndex(function(h) { return String(h).toLowerCase().includes('desplegable') || String(h).toLowerCase().includes('lista'); });
    var iModifPor = headers.findIndex(function(h) { return String(h).toLowerCase().includes('modificado') || String(h).toLowerCase().includes('cerrado') || String(h).toLowerCase().includes('usuario'); });
    var iTerr     = headers.findIndex(function(h) { return String(h).toLowerCase().includes('territorio'); });

    // Fallbacks a los 14 índices oficiales
    if (iRutina < 0)   iRutina = 0;   // A
    if (iKpi < 0)      iKpi = 1;      // B
    if (iDesc < 0)     iDesc = 2;     // C
    if (iAccion < 0)   iAccion = 3;   // D
    if (iResp < 0)     iResp = 4;     // E
    if (iDueno < 0)    iDueno = 5;    // F
    if (iComp < 0)     iComp = 7;     // H
    if (iEstado < 0)   iEstado = 8;   // I
    if (iImg < 0)      iImg = 9;      // J
    if (iComent < 0)   iComent = 10;  // K
    if (iEstadoL < 0)  iEstadoL = 11; // L
    if (iModifPor < 0) iModifPor = 12;// M
    if (iTerr < 0)     iTerr = 13;    // N

    var estadoActual = String(hoja.getRange(filaIndex, iEstado + 1).getValue() || '').trim().toUpperCase();
    if (estadoActual.includes('CERRAD')) {
      return { error: 'Esta acción ya se encuentra CERRADA y protegida contra modificaciones.' };
    }

    var comentario = (payload.comentario || '').toString().trim();
    var estado = payload.estado || 'EN PROGRESO';
    var evidencia = payload.evidencia || '';

    // Manejo estricto de evidencia: subir a Drive si viene en base64 para JAMÁS sobrecargar las celdas
    if (evidencia && (evidencia.indexOf('data:image') !== -1 || evidencia.length > 500)) {
      var resDrive = subirEvidenciaBaul5S(evidencia, 'evidencia_5s_' + Date.now() + '.jpg', 'image/jpeg');
      if (resDrive && resDrive.url && !resDrive.url.startsWith('data:image')) {
        evidencia = resDrive.url;
      } else {
        Logger.log("Aviso: no se pudo obtener URL pública de Drive para la evidencia.");
      }
    }

    if (String(estado).toUpperCase().includes('CERRAD')) {
      estado = 'CERRADAS';
    } else if (String(estado).toUpperCase().includes('PENDIENTE') || String(estado).toUpperCase().includes('GESTIONAD') || String(estado).toUpperCase().includes('VALIDA') || String(estado).toUpperCase().includes('CIERRE')) {
      estado = 'PENDIENTE CIERRE';
    } else {
      var partes = (payload.fechaCompromiso || '').split(/[/-]/);
      if (partes.length === 3) {
        var d, m, y;
        if (partes[0].length === 4) {
          d = parseInt(partes[2]); m = parseInt(partes[1]) - 1; y = parseInt(partes[0]);
        } else {
          d = parseInt(partes[0]); m = parseInt(partes[1]) - 1; y = parseInt(partes[2]);
        }
        var dateComp = new Date(y, m, d);
        dateComp.setHours(0, 0, 0, 0);
        var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        if (dateComp < hoy) estado = 'RETRASADAS';
      }
    }

    if (payload.rutina !== undefined) hoja.getRange(filaIndex, iRutina + 1).setValue(payload.rutina);
    if (payload.kpi !== undefined) hoja.getRange(filaIndex, iKpi + 1).setValue(payload.kpi);
    if (payload.responsable !== undefined) hoja.getRange(filaIndex, iResp + 1).setValue(payload.responsable);
    if (payload.dueno !== undefined) hoja.getRange(filaIndex, iDueno + 1).setValue(payload.dueno);
    if (payload.fechaCompromiso !== undefined) hoja.getRange(filaIndex, iComp + 1).setValue(payload.fechaCompromiso);
    
    // Guardar Estado en Col I y Col L
    hoja.getRange(filaIndex, iEstado + 1).setValue(estado);
    if (iEstadoL >= 0) hoja.getRange(filaIndex, iEstadoL + 1).setValue(estado);

    // Guardar Comentario en Col K
    if (payload.comentario !== undefined) hoja.getRange(filaIndex, iComent + 1).setValue(comentario);

    // Guardar ImagenURL en Col J (Únicamente si es URL de Drive, nunca base64)
    if (evidencia && !evidencia.startsWith('data:image')) {
      hoja.getRange(filaIndex, iImg + 1).setValue(evidencia);
    }

    // Guardar Modificado por en Col M
    var usuarioModif = payload.usuario || payload.nombreUsuario || '';
    if (!usuarioModif && payload.userId) {
      var resU = validarUsuario(payload.userId);
      if (resU && resU.valido && resU.usuario) usuarioModif = resU.usuario.nombre || resU.usuario.id;
    }
    if (usuarioModif && iModifPor >= 0) {
      hoja.getRange(filaIndex, iModifPor + 1).setValue(usuarioModif);
    }

    // Guardar Territorio en Col N
    if (iTerr >= 0 && payload.territorio !== undefined) {
      hoja.getRange(filaIndex, iTerr + 1).setValue(payload.territorio);
    }

    return { exito: true, estadoFinal: estado, imagenUrl: evidencia };
  } catch (e) {
    Logger.log("Error en guardarEdicionBaul5S: " + e);
    return { error: e.toString() };
  }
}

/**
 * Genera el reporte de acciones retrasadas agrupadas por territorio y responsable.
 */
function generarReporteAccionesRetrasadas() {
  try {
    var res = obtenerDatosBaul5S();
    if (res.error) return { error: res.error };

    var retrasadas = res.datos.filter(function(a) { return a.estado === 'RETRASADAS'; });
    
    var porTerritorio = {};
    var porResponsable = {};

    retrasadas.forEach(function(a) {
      var t = a.territorio || 'Sin Territorio';
      var r = a.responsable || 'Sin Asignar';
      porTerritorio[t] = (porTerritorio[t] || 0) + 1;
      porResponsable[r] = (porResponsable[r] || 0) + 1;
    });

    var ahora = new Date();
    var fechaHoyStr = Utilities.formatDate(ahora, 'America/Bogota', 'dd/MM/yyyy HH:mm');
    var texto = '🚨 *REPORTE DE ACCIONES 5S RETRASADAS* 🚨\n';
    texto += '📅 Fecha de corte: ' + fechaHoyStr + '\n';
    texto += '📊 Total acciones vencidas: ' + retrasadas.length + '\n\n';

    texto += '*RESUMEN POR TERRITORIO:*\n';
    Object.keys(porTerritorio).forEach(function(terr) {
      texto += '• ' + terr + ': ' + porTerritorio[terr] + ' acción(es)\n';
    });

    texto += '\n*DETALLE DE ACCIONES RETRASADAS:*\n';
    retrasadas.forEach(function(a, idx) {
      texto += (idx + 1) + '. [' + (a.territorio || 'S/T') + '] ' + a.descripcion + '\n';
      texto += '   👤 Resp: ' + a.responsable + ' | 🗓️ Venció: ' + a.fechaCompromiso + ' (' + a.diasRetraso + ' días de atraso)\n';
    });

    return {
      total: retrasadas.length,
      porTerritorio: porTerritorio,
      porResponsable: porResponsable,
      acciones: retrasadas,
      textoReporte: texto
    };
  } catch (e) {
    Logger.log("Error en generarReporteAccionesRetrasadas: " + e);
    return { error: e.toString() };
  }
}

/**
 * Ejecuta esta función en el editor de Apps Script para autorizar los permisos de Google Drive.
 */
function autorizarPermisosDrive() {
  var id = '1K3nNfDEnl2ClLcjbmSYFWC2zkaikxjB-';
  var carpeta = DriveApp.getFolderById(id);
  Logger.log("✅ Permisos de Google Drive concedidos exitosamente. Carpeta: " + carpeta.getName());
  return "Permisos OK: " + carpeta.getName();
}

/**
 * Guarda foto de evidencia en la carpeta de Google Drive y retorna la URL pública permanente.
 */
function subirEvidenciaBaul5S(base64Data, nombreArchivo, mimeType) {
  var idCarpeta = '1K3nNfDEnl2ClLcjbmSYFWC2zkaikxjB-';

  // Si se ejecuta sin datos (desde el editor de Apps Script), llamamos DriveApp DIRECTAMENTE
  // fuera de cualquier try-catch para forzar a Google a abrir el diálogo de autorización OAuth
  if (!base64Data) {
    Logger.log("Activando ventana de autorización de Google Apps Script...");
    var carpetaAuth = DriveApp.getFolderById(idCarpeta);
    Logger.log("✅ Permisos autorizados exitosamente: " + carpetaAuth.getName());
    return "✅ Autorizado correctamente para la carpeta: " + carpetaAuth.getName();
  }

  try {
    var base64Limpio = String(base64Data);
    if (base64Limpio.indexOf('base64,') !== -1) {
      base64Limpio = base64Limpio.split('base64,')[1];
    }

    var bytes = Utilities.base64Decode(base64Limpio);
    var blob = Utilities.newBlob(bytes, mimeType || 'image/jpeg', nombreArchivo || ('evidencia_5s_' + Date.now() + '.jpg'));

    var archivo = null;

    // 1. Intentar guardar en la carpeta compartida designada
    if (idCarpeta) {
      try {
        var carpetaCompartida = DriveApp.getFolderById(idCarpeta);
        archivo = carpetaCompartida.createFile(blob);
      } catch (eCompartida) {
        Logger.log("Aviso: No se pudo escribir en carpeta compartida (" + idCarpeta + "): " + eCompartida);
      }
    }

    // 2. Si no hubo permisos o acceso por ID, buscar o crear la carpeta con el nombre exacto 'Evidencias 5s turno a turno'
    if (!archivo) {
      try {
        var nombres = ['Evidencias 5s turno a turno', 'Evidencias 5S'];
        for (var i = 0; i < nombres.length; i++) {
          var iter = DriveApp.getFoldersByName(nombres[i]);
          if (iter.hasNext()) {
            archivo = iter.next().createFile(blob);
            break;
          }
        }
        if (!archivo) {
          var carpetaNueva = DriveApp.createFolder('Evidencias 5s turno a turno');
          archivo = carpetaNueva.createFile(blob);
        }
      } catch (ePropia) {
        Logger.log("Aviso: Error en fallback de carpetas: " + ePropia);
      }
    }

    // 3. Fallback final: Guardar en la raíz de Google Drive
    if (!archivo) {
      archivo = DriveApp.getRootFolder().createFile(blob);
    }

    // 4. Configurar permisos de lectura en el archivo generado
    try {
      archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eShare) {
      try {
        archivo.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eDom) {
        Logger.log("Aviso sobre setSharing: " + eDom);
      }
    }

    var fileId = archivo.getId();
    var urlPublica = archivo.getUrl();
    var urlDirecta = 'https://drive.google.com/uc?export=view&id=' + fileId;

    return { exito: true, url: urlDirecta, fileId: fileId, urlDrive: urlPublica };
  } catch (e) {
    Logger.log("Error en subirEvidenciaBaul5S: " + e);
    if (String(e).indexOf('permission to call DriveApp') !== -1 || String(e).indexOf('auth/drive') !== -1) {
      throw e;
    }
    return { error: "No se pudo subir la foto a Google Drive: " + e.message };
  }
}

/**
 * Cierra o devuelve directamente una acción tras validar la gestión y evidencia.
 * Actualiza Col I (Estado), Col L (Estado Lista), Col K (Comentario) y Col M (Modificado / Cerrado por).
 */
function cerrarAccionDirecta(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName('Baul_5S');
    if (!hoja) return { error: 'No se encontró la hoja Baul_5S.' };

    var filaIndex = payload.filaIndex;
    if (!filaIndex || filaIndex <= 1) return { error: 'Fila inválida.' };

    var nombreUsuario = payload.nombreUsuario || '';
    if (!nombreUsuario && payload.userId) {
      var resAuth = validarUsuario(payload.userId);
      if (resAuth && resAuth.valido && resAuth.usuario) {
        nombreUsuario = resAuth.usuario.nombre || resAuth.usuario.id || 'admin';
      }
    }

    var headers = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), 14)).getValues()[0];
    var iEstado   = headers.findIndex(function(h) { var s = String(h).toLowerCase(); return s === 'estado' || (s.startsWith('estado') && !s.includes('desplegable') && !s.includes('lista')); });
    var iComent   = headers.findIndex(function(h) { return String(h).toLowerCase().includes('comentario'); });
    var iImg      = headers.findIndex(function(h) { return String(h).toLowerCase().includes('imagen') || String(h).toLowerCase().includes('url'); });
    var iEstadoL  = headers.findIndex(function(h) { return String(h).toLowerCase().includes('desplegable') || String(h).toLowerCase().includes('lista'); });
    var iModifPor = headers.findIndex(function(h) { return String(h).toLowerCase().includes('modificado') || String(h).toLowerCase().includes('cerrado') || String(h).toLowerCase().includes('usuario'); });

    if (iEstado < 0)   iEstado = 8;
    if (iImg < 0)      iImg = 9;
    if (iComent < 0)   iComent = 10;
    if (iEstadoL < 0)  iEstadoL = 11;
    if (iModifPor < 0) iModifPor = 12;

    var nuevoEstado = payload.nuevoEstado || 'CERRADAS';
    if (nuevoEstado.includes('PENDIENTE') || nuevoEstado.includes('VALIDA') || nuevoEstado.includes('CIERRE')) {
      nuevoEstado = 'PENDIENTE CIERRE';
    } else if (nuevoEstado.includes('CERRAD')) {
      nuevoEstado = 'CERRADAS';
    }

    // Si viene evidencia en base64, subirla a Drive y guardar URL
    if (payload.evidencia && payload.evidencia.trim()) {
      var evStr = payload.evidencia.trim();
      if (evStr.indexOf('data:image') !== -1 || evStr.length > 500) {
        var resDrive = subirEvidenciaBaul5S(evStr, 'evidencia_5s_' + Date.now() + '.jpg', 'image/jpeg');
        if (resDrive && resDrive.url && !resDrive.url.startsWith('data:image')) {
          evStr = resDrive.url;
        }
      }
      if (!evStr.startsWith('data:image')) {
        hoja.getRange(filaIndex, iImg + 1).setValue(evStr);
      }
    }

    var comentarioActual = String(hoja.getRange(filaIndex, iComent + 1).getValue() || '').trim();
    comentarioActual = comentarioActual.replace(/\|\s*(?:✅\s*Cerrada|🔍\s*Pendiente|🔄\s*En Progreso|🔄\s*Devuelta)[^|]*/gi, '').trim();
    comentarioActual = comentarioActual.replace(/(?:✅\s*Cerrada|🔍\s*Pendiente|🔄\s*En Progreso)[^—]*—\s*/gi, '').trim();

    var prefix = '';
    if (nuevoEstado === 'CERRADAS') {
      prefix = '✅ Cerrada' + (nombreUsuario ? (' por: ' + nombreUsuario) : '');
    } else if (nuevoEstado === 'PENDIENTE CIERRE') {
      prefix = '🔍 Pendiente de cierre' + (nombreUsuario ? (' por: ' + nombreUsuario) : '');
    } else {
      prefix = '🔄 Volver a Gestionar' + (nombreUsuario ? (' por: ' + nombreUsuario) : '');
    }

    var observacion = (payload.comentario || '').toString().trim();
    if (observacion && observacion !== comentarioActual) {
      prefix += ' (' + observacion + ')';
    }

    var notaFinal = comentarioActual ? (comentarioActual + ' | ' + prefix) : prefix;

    // Actualizar Estado en Col I y Col L
    hoja.getRange(filaIndex, iEstado + 1).setValue(nuevoEstado);
    if (iEstadoL >= 0) hoja.getRange(filaIndex, iEstadoL + 1).setValue(nuevoEstado);

    // Actualizar Comentario en Col K
    hoja.getRange(filaIndex, iComent + 1).setValue(notaFinal);

    // Actualizar Modificado por / Cerrado por en Col M
    var userRegistrar = nombreUsuario || 'admin';
    if (iModifPor >= 0) {
      hoja.getRange(filaIndex, iModifPor + 1).setValue(userRegistrar);
    }

    return { exito: true, nuevoEstado: nuevoEstado, usuario: userRegistrar };
  } catch (e) {
    Logger.log("Error en cerrarAccionDirecta: " + e);
    return { error: e.toString() };
  }
}



