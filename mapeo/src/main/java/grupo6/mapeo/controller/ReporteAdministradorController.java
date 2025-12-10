package grupo6.mapeo.controller;

import grupo6.mapeo.dto.UsuarioReporteDTO;
import grupo6.mapeo.service.ReporteAdministradorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.Font;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes/administrador")
@CrossOrigin(origins = "*")
public class ReporteAdministradorController {
    
    @Autowired
    private ReporteAdministradorService reporteService;
    
    /**
     * 1.1 Reporte general de usuarios
     */
    @GetMapping("/usuarios-general")
    public ResponseEntity<List<UsuarioReporteDTO>> reporteGeneralUsuarios() {
        List<UsuarioReporteDTO> reportes = reporteService.obtenerReporteGeneralUsuarios();
        return ResponseEntity.ok(reportes);
    }
    
    /**
     * 1.2 Reporte de fichas con sus aprendices
     */
    @GetMapping("/fichas-aprendices")
    public ResponseEntity<List<Map<String, Object>>> reporteFichasAprendices() {
        List<Map<String, Object>> reportes = reporteService.obtenerReporteFichasAprendices();
        return ResponseEntity.ok(reportes);
    }
    
    /**
     * 1.3 Reporte de instructores con especialidad
     */
    @GetMapping("/instructores-especialidad")
    public ResponseEntity<List<Map<String, Object>>> reporteInstructoresEspecialidad() {
        List<Map<String, Object>> reportes = reporteService.obtenerReporteInstructoresEspecialidad();
        return ResponseEntity.ok(reportes);
    }
    
    /**
     * 1.4 Reporte de trimestres por ficha
     */
    @GetMapping("/trimestres-ficha")
    public ResponseEntity<List<Map<String, Object>>> reporteTrimestresPerFicha() {
        List<Map<String, Object>> reportes = reporteService.obtenerReporteTrimestresPerFicha();
        return ResponseEntity.ok(reportes);
    }
    
    /**
     * 1.5 Reporte general de proyectos por GAES
     */
    @GetMapping("/proyectos-gaes")
    public ResponseEntity<List<Map<String, Object>>> reporteProyectosGaes() {
        List<Map<String, Object>> reportes = reporteService.obtenerReporteProyectosGaes();
        return ResponseEntity.ok(reportes);
    }
    
    /**
     * Descargar reporte de usuarios en Excel (con Apache POI)
     */
    @PostMapping("/descargar-usuarios-excel")
    public ResponseEntity<byte[]> descargarUsuariosExcel(@RequestBody List<UsuarioReporteDTO> usuarios) {
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Reporte Usuarios");
            
            // Crear encabezados
            Row headerRow = sheet.createRow(0);
            String[] encabezados = {"ID", "Nombre", "Apellido", "Correo", "Tipo Documento", "Número Documento", "Rol", "Estado"};
            
            // Estilo para encabezados
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Crear y configurar la fuente
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            for (int i = 0; i < encabezados.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(encabezados[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Agregar datos
            int rowNum = 1;
            for (UsuarioReporteDTO usuario : usuarios) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(usuario.getId());
                row.createCell(1).setCellValue(usuario.getNombre());
                row.createCell(2).setCellValue(usuario.getApellido());
                row.createCell(3).setCellValue(usuario.getCorreo());
                row.createCell(4).setCellValue(usuario.getTipoDocumento());
                row.createCell(5).setCellValue(usuario.getNumeroDocumento());
                row.createCell(6).setCellValue(usuario.getRol());
                row.createCell(7).setCellValue(usuario.getEstado());
            }
            
            // Ajustar ancho de columnas
            for (int i = 0; i < encabezados.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Escribir a byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            workbook.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.set("Content-Disposition", "attachment; filename=reporte-usuarios.xlsx");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(baos.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
