# Dependencias para PDF y Excel - Sistema Mapeo

---

## 📊 DEPENDENCIAS UTILIZADAS

### **Para EXCEL (.xlsx)**

#### 1. **Apache POI - poi**
```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.0.0</version>
</dependency>
```

**¿Qué es?**
Librería Java para crear y manipular archivos de Microsoft Office (Word, Excel, PowerPoint)

**¿Para qué sirve?**
- Crear archivos Excel (.xls)
- Leer archivos Excel
- Manipular celdas, filas, columnas
- Agregar estilos (colores, bordes, fuentes)

**Ejemplo de uso:**
```java
// Crear workbook
Workbook workbook = new HSSFWorkbook(); // .xls
Sheet sheet = workbook.createSheet("Evaluaciones");

// Crear fila
Row row = sheet.createRow(0);
Cell cell = row.createCell(0);
cell.setCellValue("Nombre");
cell.setCellStyle(headerStyle);

// Guardar
FileOutputStream fos = new FileOutputStream("reportes.xls");
workbook.write(fos);
```

---

#### 2. **Apache POI - poi-ooxml**
```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.0.0</version>
</dependency>
```

**¿Qué es?**
Extensión de POI para archivos modernos Office Open XML

**¿Para qué sirve?**
- Crear archivos Excel (.xlsx) ← **USAMOS ESTE**
- Formato más moderno y comprimido
- Mejor compatibilidad con Excel 2007+
- Soporte para más características

**Ejemplo de uso:**
```java
// Crear workbook .xlsx
Workbook workbook = new XSSFWorkbook(); // .xlsx
Sheet sheet = workbook.createSheet("Evaluaciones");

// Agregar datos
Row row = sheet.createRow(1);
row.createCell(0).setCellValue("Juan Pérez");
row.createCell(1).setCellValue(4.5);

// Guardar
FileOutputStream fos = new FileOutputStream("reportes.xlsx");
workbook.write(fos);
```

---

### **Para PDF**

#### 3. **iText 5 (ACTUAL)**
```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13.3</version>
</dependency>
```

**¿Qué es?**
Librería Java para crear y manipular archivos PDF

**¿Para qué sirve?**
- Crear documentos PDF desde cero
- Agregar texto, tablas, imágenes
- Agregar estilos y colores
- Generar reportes profesionales

**Ejemplo de uso:**
```java
// Crear documento
Document document = new Document();
PdfWriter writer = PdfWriter.getInstance(document, 
    new FileOutputStream("reporte.pdf"));

document.open();

// Agregar título
Paragraph title = new Paragraph("REPORTE DE EVALUACIONES");
title.setAlignment(Element.ALIGN_CENTER);
document.add(title);

// Agregar tabla
PdfPTable table = new PdfPTable(3);
table.addCell("Aprendiz");
table.addCell("GAES");
table.addCell("Calificación");
table.addCell("Juan Pérez");
table.addCell("GAES-01");
table.addCell("4.5");

document.add(table);
document.close();
```

---

#### 4. **iText 7 (FUTURO)**
```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>
```

**¿Qué es?**
Versión moderna de iText con nueva arquitectura

**¿Para qué sirve?**
- PDF más moderno y eficiente
- API mejorada y simplificada
- Mejor rendimiento
- Está preparado para futuro

**Nota**: Actualmente no se usa, pero está lista para migración futura.

---

## 📋 TABLA COMPARATIVA

| Aspecto | POI (Excel) | iText (PDF) |
|---------|---|---|
| **Formato** | .xlsx | .pdf |
| **Versión** | 5.0.0 | 5.5.13.3 |
| **Tamaño archivo** | <2 MB | <5 MB |
| **Tiempo generación** | <3 seg | <5 seg |
| **Complejidad** | Media | Media |
| **Soporte** | Excelente | Excelente |
| **Compatibilidad** | Excel 2007+ | Adobe Reader+ |

---

## 🔧 CÓMO SE USA EN EL SISTEMA

### **Flujo de Generación de Excel**

```
1. Usuario click: "Descargar Excel"
   ↓
2. Backend obtiene evaluaciones de BD
   ↓
3. Crea workbook con POI:
   ├─ Hoja 1: Datos de evaluaciones
   ├─ Hoja 2: Cálculos y promedios
   └─ Hoja 3: Gráficos
   ↓
4. Aplica estilos (colores, bordes)
   ↓
5. Guarda en /downloads/excel/
   ↓
6. Envía archivo al navegador
   ↓
7. Navegador descarga: Reportes_Evaluaciones.xlsx
```

---

### **Flujo de Generación de PDF**

```
1. Usuario click: "Descargar PDF"
   ↓
2. Backend obtiene evaluaciones de BD
   ↓
3. Crea documento con iText:
   ├─ Header (título, fecha, usuario)
   ├─ Tabla con evaluaciones
   ├─ Gráfico de distribución
   └─ Footer (firma, página)
   ↓
4. Aplica estilos (colores, fuentes)
   ↓
5. Guarda en /downloads/pdf/
   ↓
6. Envía archivo al navegador
   ↓
7. Navegador descarga: Reportes_Evaluaciones.pdf
```

---

## 📦 INSTALACIÓN

Las dependencias ya están en el **pom.xml**:

```bash
# Maven descarga automáticamente al compilar
mvn clean compile

# O ejecutar la aplicación
mvn spring-boot:run
```

---

## ⚙️ CONFIGURACIÓN EN pom.xml

```xml
<!-- Apache POI para Excel -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.0.0</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.0.0</version>
</dependency>

<!-- iText 5 para PDF -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13.3</version>
</dependency>

<!-- iText 7 para PDF (futuro) -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>
```

---

## 💾 EJEMPLO COMPLETO: Generar Excel

```java
@PostMapping("/descargar/excel")
public ResponseEntity<byte[]> descargarExcel() throws IOException {
    // Crear workbook
    Workbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Evaluaciones");
    
    // Estilo header
    CellStyle headerStyle = workbook.createCellStyle();
    headerStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
    headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    Font font = workbook.createFont();
    font.setColor(IndexedColors.WHITE.getIndex());
    font.setBold(true);
    headerStyle.setFont(font);
    
    // Crear header
    Row headerRow = sheet.createRow(0);
    String[] columns = {"ID", "Aprendiz", "GAES", "Calificación", "Fecha"};
    for (int i = 0; i < columns.length; i++) {
        Cell cell = headerRow.createCell(i);
        cell.setCellValue(columns[i]);
        cell.setCellStyle(headerStyle);
    }
    
    // Agregar datos
    List<Evaluacion> evaluaciones = evaluacionService.findAll();
    int rowNum = 1;
    for (Evaluacion eval : evaluaciones) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(eval.getId());
        row.createCell(1).setCellValue(eval.getAprendiz().getUsuario().getNombre());
        row.createCell(2).setCellValue(eval.getGaes().getNombre());
        row.createCell(3).setCellValue(eval.getCalificacion());
        row.createCell(4).setCellValue(eval.getFecha().toString());
    }
    
    // Ajustar ancho de columnas
    for (int i = 0; i < columns.length; i++) {
        sheet.autoSizeColumn(i);
    }
    
    // Guardar en bytes
    ByteArrayOutputStream bos = new ByteArrayOutputStream();
    workbook.write(bos);
    workbook.close();
    
    byte[] excelBytes = bos.toByteArray();
    
    // Retornar como descarga
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    headers.setContentDispositionFormData("attachment", 
        "Reportes_Evaluaciones_" + System.currentTimeMillis() + ".xlsx");
    
    return ResponseEntity
        .ok()
        .headers(headers)
        .body(excelBytes);
}
```

---

## 💾 EJEMPLO COMPLETO: Generar PDF

```java
@PostMapping("/descargar/pdf")
public ResponseEntity<byte[]> descargarPDF() throws Exception {
    // Crear documento PDF
    Document document = new Document();
    ByteArrayOutputStream bos = new ByteArrayOutputStream();
    PdfWriter writer = PdfWriter.getInstance(document, bos);
    
    document.open();
    
    // Título
    Paragraph title = new Paragraph("REPORTE DE EVALUACIONES");
    title.setAlignment(Element.ALIGN_CENTER);
    title.getFont().setSize(16);
    title.getFont().setStyle(Font.BOLD);
    document.add(title);
    
    // Fecha
    Paragraph fecha = new Paragraph("Generado: " + new Date());
    fecha.setAlignment(Element.ALIGN_CENTER);
    document.add(fecha);
    
    document.add(new Paragraph("\n"));
    
    // Tabla
    PdfPTable table = new PdfPTable(5);
    table.setWidthPercentage(100);
    
    // Headers
    String[] headers = {"ID", "Aprendiz", "GAES", "Calificación", "Fecha"};
    for (String header : headers) {
        PdfPCell cell = new PdfPCell(new Phrase(header));
        cell.setBackgroundColor(BaseColor.BLUE);
        cell.getPhrase().getFont().setColor(BaseColor.WHITE);
        table.addCell(cell);
    }
    
    // Datos
    List<Evaluacion> evaluaciones = evaluacionService.findAll();
    for (Evaluacion eval : evaluaciones) {
        table.addCell(String.valueOf(eval.getId()));
        table.addCell(eval.getAprendiz().getUsuario().getNombre());
        table.addCell(eval.getGaes().getNombre());
        table.addCell(String.valueOf(eval.getCalificacion()));
        table.addCell(eval.getFecha().toString());
    }
    
    document.add(table);
    document.close();
    
    byte[] pdfBytes = bos.toByteArray();
    
    // Retornar como descarga
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDispositionFormData("attachment", 
        "Reportes_Evaluaciones_" + System.currentTimeMillis() + ".pdf");
    
    return ResponseEntity
        .ok()
        .headers(headers)
        .body(pdfBytes);
}
```

---

## 📊 RESUMEN

| Librería | Uso | Formato | Ventaja |
|---|---|---|---|
| **Apache POI** | Excel | .xlsx | Tablas estructuradas |
| **iText 5** | PDF | .pdf | Reportes profesionales |
| **iText 7** | PDF futuro | .pdf | Más moderno y rápido |

---

**Documento:** DEPENDENCIAS_PDF_EXCEL.md
**Versión:** 1.0
**Fecha:** 2025
