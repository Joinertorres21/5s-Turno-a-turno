function calcularSemana(fecha) {
  if (!fecha) return 'Desconocida';
  var date = new Date(fecha);
  if (isNaN(date.getTime())) return 'Desconocida';
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  var week1 = new Date(date.getFullYear(), 0, 4);
  var weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return 'W' + (weekNumber < 10 ? '0' + weekNumber : weekNumber);
}

// ── Catálogo de Áreas 5S (Hoja 'Areas_5s' Col A: Territorio, Col B: Dueño, Col C: Foto) ──
function getCatalogoAreas5S() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('Areas_5s') || ss.getSheetByName('Territorios');
  var resultado = {};
  if (hoja && hoja.getLastRow() > 1) {
    var rawValues = hoja.getDataRange().getValues();
    var headers = rawValues[0].map(function(h) { return String(h || '').trim().toLowerCase(); });

    var iTerr = headers.findIndex(function(h) { return h.includes('territorio') || h.includes('area') || h.includes('seccion'); });
    var iDueno = headers.findIndex(function(h) { return h.includes('dueño') || h.includes('dueno') || h.includes('responsable'); });
    var iFoto = headers.findIndex(function(h) { return h.includes('foto') || h.includes('imagen') || h.includes('url') || h.includes('link') || h.includes('evidencia'); });

    if (iTerr < 0) iTerr = 0;
    if (iDueno < 0) iDueno = 1;
    if (iFoto < 0) iFoto = 2;

    var filas = rawValues.slice(1);
    filas.forEach(function(r) {
      var nom = String(r[iTerr] || '').trim();
      if (!nom) return;
      var norm = nom.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '');

      var dueno = String(r[iDueno] || '').trim();
      if (dueno.startsWith('#') && r[3]) {
        dueno = String(r[3]).trim();
      }

      // Buscar foto: primero en iFoto, o si no buscar en cualquier columna que contenga URL o drive
      var fotoRaw = String(r[iFoto] || '').trim();
      if (!fotoRaw.includes('drive.google.com') && !fotoRaw.includes('http') && !fotoRaw.startsWith('data:')) {
        for (var c = 1; c < r.length; c++) {
          var celda = String(r[c] || '').trim();
          if (celda.includes('drive.google.com') || celda.includes('http://') || celda.includes('https://') || celda.startsWith('data:')) {
            fotoRaw = celda;
            break;
          }
        }
      }

      var fotoDirecta = normalizarUrlDrive(fotoRaw);

      resultado[norm] = {
        territorio: nom,
        dueno: dueno || 'Sin Asignar',
        foto: fotoDirecta
      };
    });
  }
  return resultado;
}

function normalizarUrlDrive(url) {
  if (!url) return '';
  url = String(url).trim();
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  var fileId = '';
  var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
              url.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
              url.match(/\/d\/([a-zA-Z0-9_-]+)/i);

  if (match && match[1]) {
    fileId = match[1];
  } else if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    fileId = url;
  }

  if (fileId) {
    return 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w300';
  }
  return url;
}

function getDatosBase() {
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var hojaBase = ss.getSheetByName('Registros_5s');
  var preguntasFallback = (typeof PREGUNTAS_5S_OFICIALES !== 'undefined') 
    ? PREGUNTAS_5S_OFICIALES.map(function(p){ return p.pregunta; })
    : [];

  if (!hojaBase) return { registros: [], preguntas: preguntasFallback, areas5s: {} };

  var data = hojaBase.getDataRange().getValues();
  if (data.length <= 1) return { registros: [], preguntas: preguntasFallback, areas5s: {} };
  var headers = data.shift();

  // Preguntas van desde la columna G (índice 6) hasta AH (índice 33)
  var preguntas = headers.slice(6, 34);
  if (!preguntas || preguntas.length < 28 || !preguntas[0]) {
    preguntas = preguntasFallback;
  }
  var catalogoAreas = getCatalogoAreas5S();
  var registros = [];

  data.forEach(function(row) {
    var nomTerr = String(row[3] || '').trim(); // Territorio en índice 3
    var terrNorm = nomTerr.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');

    if (terrNorm === 'noaplica' || terrNorm === 'na' || terrNorm === 'noaplica5s') return;

    // Cumplimiento en índice 5
    var cumplimiento = row[5];
    var valorNumerico = 0;
    if (typeof cumplimiento === 'number') {
      valorNumerico = (cumplimiento > 0 && cumplimiento <= 1) ? (cumplimiento * 100) : cumplimiento;
    } else if (typeof cumplimiento === 'string') {
      var strClean = cumplimiento.trim();
      var esPct = strClean.includes('%');
      valorNumerico = parseFloat(strClean.replace('%', '')) || 0;
      if (!esPct && valorNumerico > 0 && valorNumerico <= 1) valorNumerico = valorNumerico * 100;
    }

    var fechaCruda = row[1]; // Fecha en índice 1
    var fechaObj = fechaCruda instanceof Date ? fechaCruda : new Date(fechaCruda);
    var fechaFormateada = '';
    if (!isNaN(fechaObj.getTime())) fechaFormateada = fechaObj.toISOString().split('T')[0];
    
    var semanaCalculada = calcularSemana(fechaObj);
    var semanaBase = String(row[0] || '').trim(); // Semana en índice 0
    var turno = row[2] ? String(row[2]).trim() : ''; // Turno en índice 2
    var auditorFinal = row[4] ? String(row[4]).trim() : ''; // Auditor en índice 4

    var infoArea = catalogoAreas[terrNorm] || {};
    var duenoTerritorio = infoArea.dueno || '';

    // Evaluaciones Sí/No desde la Col 6 a la 33
    var fallos = [];
    for (var i = 6; i <= 33; i++) {
      var resp = String(row[i] || '').trim().toLowerCase();
      fallos.push(resp === 'no' ? 1 : 0);
    }

    registros.push({
      semana:       semanaCalculada,
      semanaBase:   semanaBase,
      auditor:      auditorFinal,
      duenoAbi:     duenoTerritorio,
      duenoOl:      'N/A',
      territorio:   nomTerr,
      turno:        turno,
      cumplimiento: Math.round(valorNumerico),
      fecha:        fechaFormateada,
      fallos:       fallos
    });
  });

  return {
    registros: registros.filter(function(r) { return r.fecha !== ''; }),
    preguntas: preguntas,
    areas5s: catalogoAreas
  };
}

function getCronogramaData(semanaDeseada) {
  return { semanasDisponibles: [], semanaActual: '', filas: [] };
}