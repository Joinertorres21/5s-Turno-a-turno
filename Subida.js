// ── Constante de las 34 Columnas Oficiales Limpias ─────────────────────────────
const COLUMNAS_HEADER_5S = [
  "Semana",
  "Fecha",
  "Turno",
  "Territorio",
  "Auditor",
  "Cumplimiento",
  "¿Hay exceso de pertenencias personales (mochilas, etc.) en el área? ¿Hay exceso de EPP?",
  "¿Se cuenta con layout del área?",
  "¿Se cuenta con una RACI de actividades?",
  "¿Se cuenta con una lista de verificación de actividades?",
  "¿Las herramientas de limpieza necesarias están disponibles y son suficientes?",
  "¿El área está libre de materiales, repuestos o documentos innecesarios?",
  "¿Hay una forma sistemática/estandarizada de control de las herramientas?",
  "¿Las herramientas de trabajo necesarias están disponibles y son suficientes?",
  "¿Los lugares de almacenamiento están claramente marcados?",
  "¿Los elementos se almacenan de una manera que hace que el área sea segura?",
  "¿Los elementos están segregados / clasificados?",
  "¿Las herramientas de trabajo están en el lugar adecuado?",
  "¿Los archivos, carpetas, cajas, armarios están identificados y etiquetados?",
  "¿Los suministros de limpieza se guardan en un lugar accesible?",
  "¿Están limpios los interiores de los gabinetes, cajones, escritorios y equipos?",
  "¿Hay suficientes recipientes con tapa para recolectar residuos?",
  "¿Pisos limpios, sin daños, secos y sin riesgos de tropiezos?",
  "¿Área libre de alguna deficiencia de mantenimiento que deba ser tratada?",
  "¿Hay un mapa de 5S/Territorio para el área y éste tiene un dueño asignado?",
  "¿Ha sido desarrollada, comunicada y publicada una RACI para 5S?",
  "¿Los equipos, herramientas, documentos, muebles están en buen estado?",
  "¿Existe un programa de limpieza en el área?",
  "¿Las 5S son abordadas durante las reuniones de cambio de turno?",
  "¿Hay un programa de auditoría y se cumple?",
  "¿Corregiste los hallazgos encontrados durante tu última auditoría?",
  "¿Se cumplen los programas de limpieza y checklist para mantener las 5S?",
  "¿Se han compartido auditorías pasadas con los operadores en el área?",
  "¿El promedio de las últimas 3 auditorías es igual o superior a 80%?"
];

function obtenerColumnasOficiales5S() {
  return COLUMNAS_HEADER_5S;
}

function obtenerListaTerritorios() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaTerritorios = ss.getSheetByName('Areas_5s') || ss.getSheetByName('Territorios');
    let lista = [];
    if (hojaTerritorios && hojaTerritorios.getLastRow() > 1) {
      const terrData = hojaTerritorios.getDataRange().getValues();
      terrData.shift(); 
      lista = terrData.map(row => String(row[0] || '').trim()).filter(String);
    }
    // Incluir territorio especial 'No Aplica' para casos no evaluables
    if (!lista.some(t => t.toLowerCase() === 'no aplica')) {
      lista.push('No Aplica');
    }
    return lista;
  } catch (e) {
    Logger.log("Error en obtenerListaTerritorios: " + e);
    return ['No Aplica'];
  }
}

function guardarDatosEnBase(datosValidados) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let hojaBase = ss.getSheetByName('Registros_5s');
    if (!hojaBase) hojaBase = ss.insertSheet('Registros_5s');

    const NUM_COLUMNAS = 34;
    
    if (hojaBase.getLastRow() === 0) {
      hojaBase.getRange(1, 1, 1, NUM_COLUMNAS).setValues([COLUMNAS_HEADER_5S]);
      hojaBase.setFrozenRows(1);
      hojaBase.getRange(1, 1, 1, NUM_COLUMNAS)
        .setFontWeight("bold")
        .setBackground("#E0E0E0")
        .setWrap(true);
    }

    const filasParaInsertar = datosValidados.map(dato => {
      let fila = Array.isArray(dato.filaCompleta) ? dato.filaCompleta.slice() : [];
      fila.length = NUM_COLUMNAS; 
      for (let i = 0; i < NUM_COLUMNAS; i++) {
        if (fila[i] === undefined || fila[i] === null) fila[i] = "";
      }
      
      // Mapear campos en las nuevas posiciones
      fila[0] = dato.semana || fila[0] || "";
      fila[1] = dato.fechaFormato || fila[1] || "";
      fila[2] = dato.turno || fila[2] || "";
      fila[3] = dato.territorioAsignado; // Territorio en Col D (índice 3)
      fila[4] = dato.auditor || fila[4] || "";
      fila[5] = dato.cumplimiento || fila[5] || "";

      return fila;
    });
    
    if (filasParaInsertar.length > 0) {
      const ultimaFila = hojaBase.getLastRow();
      hojaBase.getRange(ultimaFila + 1, 1, filasParaInsertar.length, NUM_COLUMNAS).setValues(filasParaInsertar);
    }
    
    return { ok: true, total: filasParaInsertar.length };
  } catch (e) {
    Logger.log("Error en guardarDatosEnBase: " + e);
    throw new Error(e.message || e.toString());
  }
}