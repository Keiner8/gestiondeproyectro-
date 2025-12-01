package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Evaluation;
import grupo6.mapeo.dto.EvaluacionDTO;
import grupo6.mapeo.service.EvaluacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.io.IOException;
import java.io.File;
import com.itextpdf.text.Document;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.Element;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Rectangle;
import org.springframework.core.io.ClassPathResource;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;

@RestController
@RequestMapping("/api/evaluaciones")
@CrossOrigin(origins = "*")
public class EvaluacionController {
    
    @Autowired
    private EvaluacionService evaluacionService;
    
    // CREATE - Crear nueva evaluación desde DTO
    @PostMapping
    public ResponseEntity<Evaluation> crearEvaluacion(@RequestBody EvaluacionDTO evaluacionDTO) {
        Evaluation nuevaEvaluacion = evaluacionService.crearEvaluacionDesdeDTO(evaluacionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEvaluacion);
    }
    
    // READ - Obtener evaluación por ID
    @GetMapping("/{id}")
    public ResponseEntity<Evaluation> obtenerEvaluacion(@PathVariable Integer id) {
        Evaluation evaluacion = evaluacionService.obtenerEvaluacionPorId(id);
        return ResponseEntity.ok(evaluacion);
    }
    
    // READ - Obtener todas las evaluaciones
    @GetMapping
    public ResponseEntity<List<Evaluation>> obtenerTodasEvaluaciones() {
        List<Evaluation> evaluaciones = evaluacionService.obtenerTodasEvaluaciones();
        return ResponseEntity.ok(evaluaciones);
    }
    
    // READ - Obtener evaluaciones por aprendiz
    @GetMapping("/aprendiz/{aprendizId}")
    public ResponseEntity<List<Evaluation>> obtenerPorAprendiz(@PathVariable Integer aprendizId) {
        List<Evaluation> evaluaciones = evaluacionService.obtenerEvaluacionesPorAprendiz(aprendizId);
        return ResponseEntity.ok(evaluaciones);
    }
    
    // READ - Obtener evaluaciones por GAES
    @GetMapping("/gaes/{gaesId}")
    public ResponseEntity<List<Evaluation>> obtenerPorGaes(@PathVariable Integer gaesId) {
        List<Evaluation> evaluaciones = evaluacionService.obtenerEvaluacionesPorGaes(gaesId);
        return ResponseEntity.ok(evaluaciones);
    }
    
    // READ - Obtener evaluaciones por evaluador (instructor)
    @GetMapping("/evaluador/{evaluadorId}")
    public ResponseEntity<List<Evaluation>> obtenerPorEvaluador(@PathVariable Integer evaluadorId) {
        List<Evaluation> evaluaciones = evaluacionService.obtenerEvaluacionesPorEvaluador(evaluadorId);
        return ResponseEntity.ok(evaluaciones);
    }
    
    // READ - Obtener evaluaciones por aprendiz y rango de fechas
    @GetMapping("/aprendiz/{aprendizId}/fechas")
    public ResponseEntity<List<Evaluation>> obtenerPorAprendizYFecha(
            @PathVariable Integer aprendizId,
            @RequestParam LocalDate fechaInicio,
            @RequestParam LocalDate fechaFin) {
        List<Evaluation> evaluaciones = evaluacionService.obtenerEvaluacionesPorAprendizYFecha(aprendizId, fechaInicio, fechaFin);
        return ResponseEntity.ok(evaluaciones);
    }
    
    // READ - Obtener evaluaciones recientes del evaluador
    @GetMapping("/evaluador/{evaluadorId}/recientes")
    public ResponseEntity<List<Evaluation>> obtenerRecientesPorEvaluador(
            @PathVariable Integer evaluadorId,
            @RequestParam LocalDate desde) {
        List<Evaluation> evaluaciones = evaluacionService.obtenerEvaluacionesRecientesPorEvaluador(evaluadorId, desde);
        return ResponseEntity.ok(evaluaciones);
    }
    
    // UPDATE - Actualizar evaluación
    @PutMapping("/{id}")
    public ResponseEntity<Evaluation> actualizarEvaluacion(
            @PathVariable Integer id,
            @RequestBody Evaluation evaluacionActualizada) {
        Evaluation evaluacion = evaluacionService.actualizarEvaluacion(id, evaluacionActualizada);
        return ResponseEntity.ok(evaluacion);
    }
    
    // DELETE - Eliminar evaluación
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEvaluacion(@PathVariable Integer id) {
        evaluacionService.eliminarEvaluacion(id);
        return ResponseEntity.noContent().build();
    }
    
    // Estadísticas - Promedio de aprendiz
    @GetMapping("/promedio/aprendiz/{aprendizId}")
    public ResponseEntity<Double> obtenerPromedioAprendiz(@PathVariable Integer aprendizId) {
        Double promedio = evaluacionService.obtenerPromedioAprendiz(aprendizId);
        return ResponseEntity.ok(promedio);
    }
    
    // Estadísticas - Promedio de GAES
    @GetMapping("/promedio/gaes/{gaesId}")
    public ResponseEntity<Double> obtenerPromedioGaes(@PathVariable Integer gaesId) {
        Double promedio = evaluacionService.obtenerPromedioGaes(gaesId);
        return ResponseEntity.ok(promedio);
    }
    
    // EXPORTAR - Descargar como Excel (.xlsx) usando Apache POI
    @GetMapping("/descargar/excel")
    public void descargarExcel(HttpServletResponse response) {
        try {
            List<Evaluation> evaluaciones = evaluacionService.obtenerTodasEvaluaciones();
            
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=Reportes_Evaluaciones_" + System.currentTimeMillis() + ".xlsx");
            
            XSSFWorkbook workbook = new XSSFWorkbook();
            XSSFSheet sheet = workbook.createSheet("Evaluaciones");
            
            // Fila 0 - Espacio
            sheet.createRow(0);
            
            // Fila 1 - Título
            Row titleRow = sheet.createRow(1);
            var titleCell = titleRow.createCell(0);
            titleCell.setCellValue("REPORTE DE EVALUACIONES");
            
            // Estilo para encabezados
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            
            // Fila 2 - Espacio
            sheet.createRow(2);
            
            // Fila 3 - Fecha
            Row dateRow = sheet.createRow(3);
            dateRow.createCell(0).setCellValue("Fecha de generación: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            
            // Fila 4 - Espacio
            sheet.createRow(4);
            
            // Crear encabezados en fila 5
            Row headerRow = sheet.createRow(5);
            String[] headers = {"ID", "Aprendiz", "GAES", "Evaluador", "Calificación", "Fecha", "Observaciones"};
            for (int i = 0; i < headers.length; i++) {
                var cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Agregar datos a partir de fila 6
            int rowNum = 6;
            for (Evaluation evaluacion : evaluaciones) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(evaluacion.getId());
                row.createCell(1).setCellValue(evaluacion.getAprendiz() != null && evaluacion.getAprendiz().getUsuario() != null 
                    ? evaluacion.getAprendiz().getUsuario().getNombre() : "N/A");
                row.createCell(2).setCellValue(evaluacion.getGaes() != null ? evaluacion.getGaes().getNombre() : "N/A");
                row.createCell(3).setCellValue(evaluacion.getEvaluador() != null && evaluacion.getEvaluador().getUsuario() != null
                    ? evaluacion.getEvaluador().getUsuario().getNombre() : "N/A");
                row.createCell(4).setCellValue(evaluacion.getCalificacion() != null ? evaluacion.getCalificacion().doubleValue() : 0.0);
                row.createCell(5).setCellValue(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                row.createCell(6).setCellValue(evaluacion.getObservaciones() != null ? evaluacion.getObservaciones() : "");
            }
            
            // Ajustar ancho de columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(response.getOutputStream());
            workbook.close();
            
        } catch (Exception e) {
            e.printStackTrace();
            try {
                response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error al generar Excel: " + e.getMessage());
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }
    
    // EXPORTAR - Descargar como PDF (usando OpenPDF)
     @GetMapping("/descargar/pdf")
     public void descargarPDF(
             @RequestParam(required = false) Integer aprendizId,
             @RequestParam(required = false) Integer evaluadorId,
             HttpServletResponse response) {
         try {
             List<Evaluation> evaluaciones;
             
             if (aprendizId != null) {
                 evaluaciones = evaluacionService.obtenerEvaluacionesPorAprendiz(aprendizId);
             } else if (evaluadorId != null) {
                 evaluaciones = evaluacionService.obtenerEvaluacionesPorEvaluador(evaluadorId);
             } else {
                 evaluaciones = evaluacionService.obtenerTodasEvaluaciones();
             }
             
             response.setContentType("application/pdf");
             response.setHeader("Content-Disposition", "attachment; filename=Reportes_Evaluaciones_" + System.currentTimeMillis() + ".pdf");
             
             // Documento en orientación LANDSCAPE (horizontal)
             Rectangle pageSize = PageSize.A4.rotate();
             Document documento = new Document(pageSize);
             PdfWriter.getInstance(documento, response.getOutputStream());
             
             documento.open();
             
             // Agregar logo
             try {
                 ClassPathResource resource = new ClassPathResource("static/img/logo2.png");
                 Image logo = Image.getInstance(resource.getFile().getAbsolutePath());
                 logo.scaleToFit(80, 80);
                 logo.setAlignment(Element.ALIGN_CENTER);
                 documento.add(logo);
                 documento.add(new Paragraph(" "));
             } catch (Exception e) {
                 System.out.println("No se pudo cargar el logo: " + e.getMessage());
             }
             
             // Título con estilo
             Paragraph titulo = new Paragraph("REPORTE DE EVALUACIONES", new Font(com.itextpdf.text.FontFactory.getFont("Helvetica", 20, Font.BOLD)));
             titulo.setAlignment(Element.ALIGN_CENTER);
             documento.add(titulo);
             
             // Subtítulo
             Paragraph subtitulo = new Paragraph("Registro de evaluaciones de aprendices", new Font(com.itextpdf.text.FontFactory.getFont("Helvetica", 11, Font.ITALIC)));
             subtitulo.setAlignment(Element.ALIGN_CENTER);
             documento.add(subtitulo);
             
             Paragraph espacio = new Paragraph(" ");
             documento.add(espacio);
             
             // Fecha de generación con formato
             Paragraph fecha = new Paragraph("Fecha de generación: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), 
                 new Font(com.itextpdf.text.FontFactory.getFont("Helvetica", 10, Font.NORMAL)));
             documento.add(fecha);
             documento.add(new Paragraph(" "));
             
             // Tabla mejorada
             PdfPTable tabla = new PdfPTable(7);
             tabla.setWidthPercentage(100);
             tabla.setSpacingBefore(10f);
             tabla.setSpacingAfter(10f);
             
             // Encabezados de tabla con estilos
             String[] headers = {"ID", "Aprendiz", "GAES", "Evaluador", "Calificación", "Fecha", "Observaciones"};
             for (String header : headers) {
                 PdfPCell celda = new PdfPCell(new Paragraph(header, new Font(com.itextpdf.text.FontFactory.getFont("Helvetica", 11, Font.BOLD))));
                 celda.setBackgroundColor(new com.itextpdf.text.BaseColor(25, 135, 175));
                 celda.setHorizontalAlignment(Element.ALIGN_CENTER);
                 celda.setVerticalAlignment(Element.ALIGN_MIDDLE);
                 tabla.addCell(celda);
             }
             
             // Datos con colores alternados
             int rowCount = 0;
             for (Evaluation evaluacion : evaluaciones) {
                 com.itextpdf.text.BaseColor bgColor = (rowCount % 2 == 0) ? new com.itextpdf.text.BaseColor(240, 248, 255) : new com.itextpdf.text.BaseColor(255, 255, 255);
                 
                 String[] datosRow = {
                     String.valueOf(evaluacion.getId()),
                     evaluacion.getAprendiz() != null && evaluacion.getAprendiz().getUsuario() != null 
                         ? evaluacion.getAprendiz().getUsuario().getNombre() : "N/A",
                     evaluacion.getGaes() != null ? evaluacion.getGaes().getNombre() : "N/A",
                     evaluacion.getEvaluador() != null && evaluacion.getEvaluador().getUsuario() != null
                         ? evaluacion.getEvaluador().getUsuario().getNombre() : "N/A",
                     String.valueOf(evaluacion.getCalificacion() != null ? evaluacion.getCalificacion() : "N/A"),
                     LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                     evaluacion.getObservaciones() != null ? evaluacion.getObservaciones() : ""
                 };
                 
                 for (String dato : datosRow) {
                     PdfPCell celda = new PdfPCell(new Paragraph(dato, new Font(com.itextpdf.text.FontFactory.getFont("Helvetica", 9, Font.NORMAL))));
                     celda.setBackgroundColor(bgColor);
                     tabla.addCell(celda);
                 }
                 rowCount++;
             }
             
             documento.add(tabla);
             documento.close();
            
        } catch (Exception e) {
            e.printStackTrace();
            try {
                response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error al generar PDF: " + e.getMessage());
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }
}
