function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('5S Turno a Turno | Gestión Operativa')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ── Filtros del dashboard ─────────────────────────────────────
function getFiltros() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var hojaTerritorios = ss.getSheetByName('Areas_5s') || ss.getSheetByName('Territorios');
  var terrMap = {};
  var duenosSet = new Set();

  function normalizar(s) {
    return String(s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
  }

  if (hojaTerritorios && hojaTerritorios.getLastRow() > 1) {
    var tVals = hojaTerritorios.getDataRange().getValues().slice(1);
    tVals.forEach(function(r) {
      var terr = String(r[0] || '').trim();
      var dueno = String(r[1] || '').trim();
      if (dueno.startsWith('#') && r[3]) dueno = String(r[3]).trim();

      var k = normalizar(terr);
      if (k && k !== 'noaplica' && k !== 'territorio' && k !== 'sinasignar') {
        if (!terrMap[k]) terrMap[k] = terr;
      }
      if (dueno && dueno !== 'Sin Asignar') {
        duenosSet.add(dueno);
      }
    });
  }

  // Complementar con hoja Baul_listas si existe
  var hojaListas = ss.getSheetByName('Baul_listas');
  if (hojaListas && hojaListas.getLastRow() > 1) {
    var lVals = hojaListas.getDataRange().getValues().slice(1);
    lVals.forEach(function(r) {
      var terr = String(r[4] || '').trim();
      var dueno = String(r[3] || '').trim();
      var k = normalizar(terr);
      if (k && k !== 'noaplica' && k !== 'territorio' && k !== 'sinasignar') {
        if (!terrMap[k]) terrMap[k] = terr;
      }
      if (dueno && dueno !== 'Sin Asignar') {
        duenosSet.add(dueno);
      }
    });
  }

  var auditores = (typeof getAuditores === 'function') ? getAuditores() : [];

  return {
    territorios: Object.keys(terrMap).map(function(k) { return terrMap[k]; }).sort(),
    auditores:   Array.from(new Set(auditores)).sort(),
    duenosAbi:   Array.from(duenosSet).sort(),
    duenosOl:    [],
    semanas:     [],
    turnos:      ['A', 'B', 'C']
  };
}

/**
 * Valida el ID de usuario contra la hoja 'Usuarios'
 * Busca en Col A (User_ID) y retorna { valido: true, usuario: { id: ..., nombre: ... } }
 */
function validarUsuario(idIngresado) {
  try {
    var idBuscado = String(idIngresado || '').trim().toLowerCase();

    // ── Superusuario admin autorizado permanentemente ─────────
    if (idBuscado === 'admin' || idBuscado === 'administrador') {
      return {
        valido: true,
        usuario: {
          id: 'admin',
          nombre: 'admin'
        }
      };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName('Usuarios') || ss.getSheetByName('Usuarios_App');
    if (!hoja) {
      try {
        hoja = ss.insertSheet('Usuarios');
        hoja.appendRow(['ID', 'Nombre', 'Rol']);
        hoja.appendRow(['admin', 'admin', 'Administrador']);
      } catch (err) {}
      return {
        valido: (idBuscado === 'admin'),
        usuario: { id: 'admin', nombre: 'admin' }
      };
    }

    var ultFila = hoja.getLastRow();
    if (ultFila < 2) {
      return (idBuscado === 'admin') 
        ? { valido: true, usuario: { id: 'admin', nombre: 'admin' } }
        : { valido: false, error: 'No hay usuarios registrados en la hoja Usuarios.' };
    }

    var datos = hoja.getRange(2, 1, ultFila - 1, Math.max(hoja.getLastColumn(), 2)).getDisplayValues();
    var idBuscado = String(idIngresado || '').trim().toLowerCase();

    for (var i = 0; i < datos.length; i++) {
      var idFila = String(datos[i][0] || '').trim().toLowerCase();
      var nombre = String(datos[i][1] || '').trim();

      if (idFila === idBuscado) {
        return {
          valido: true,
          usuario: {
            id: datos[i][0].toString().trim(),
            nombre: nombre || 'admin'
          }
        };
      }
    }

    return { valido: false, error: 'ID de usuario incorrecto o no encontrado.' };
  } catch (e) {
    Logger.log("Error en validarUsuario: " + e);
    return { valido: false, error: 'Error del servidor: ' + e.toString() };
  }
}