package grupo6.mapeo.controller;

import grupo6.mapeo.service.ReportePDFService;
import grupo6.mapeo.service.ReporteExcelService;
import grupo6.mapeo.service.UsuarioService;
import grupo6.mapeo.service.FichaService;
import grupo6.mapeo.service.TrimestreService;
import grupo6.mapeo.service.ReporteAdministradorService;
import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.entity.Ficha;
import grupo6.mapeo.entity.Trimestre;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes/descargar")
@CrossOrigin(origins = "*")
public class ReportesDescargarController {
    
    @Autowired
    private ReportePDFService reportePDFService;
    
    @Autowired
    private ReporteExcelService reporteExcelService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private FichaService fichaService;
    
    @Autowired
    private TrimestreService trimestreService;
    
    @Autowired
    private ReporteAdministradorService reporteAdministradorService;
    
    /**
     * Descargar reporte de usuarios en PDF
     */
    @GetMapping("/usuarios/pdf")
    public ResponseEntity<byte[]> descargarUsuariosPDF() {
        try {
            List<Usuario> usuarios = usuarioService.obtenerTodosUsuarios();
            
            String[] encabezados = {"ID", "Nombre", "Apellido", "Correo", "Documento", "Rol", "Estado"};
            List<String[]> datos = usuarios.stream()
                    .map(u -> new String[]{
                            String.valueOf(u.getId()),
                            u.getNombre() != null ? u.getNombre() : "",
                            u.getApellido() != null ? u.getApellido() : "",
                            u.getCorreo() != null ? u.getCorreo() : "",
                            (u.getTipoDocumento() != null ? u.getTipoDocumento() : "") + ": " + 
                            (u.getNumeroDocumento() != null ? u.getNumeroDocumento() : ""),
                            u.getRol() != null ? u.getRol().getNombreRol() : "Sin Rol",
                            u.getEstado() != null ? u.getEstado().toString() : ""
                    })
                    .toList();
            
            byte[] pdf = reportePDFService.generarPDF("Reporte de Usuarios", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-usuarios.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de fichas en PDF
     */
    @GetMapping("/fichas/pdf")
    public ResponseEntity<byte[]> descargarFichasPDF() {
        try {
            List<Ficha> fichas = fichaService.obtenerTodasFichas();
            
            String[] encabezados = {"Código Ficha", "Programa", "Jornada", "Modalidad", "Estado"};
            List<String[]> datos = fichas.stream()
                    .map(f -> new String[]{
                            f.getCodigoFicha() != null ? f.getCodigoFicha() : "",
                            f.getProgramaFormacion() != null ? f.getProgramaFormacion() : "",
                            f.getJornada() != null ? f.getJornada().toString() : "",
                            f.getModalidad() != null ? f.getModalidad().toString() : "",
                            f.getEstado() != null ? f.getEstado().toString() : ""
                    })
                    .toList();
            
            byte[] pdf = reportePDFService.generarPDF("Reporte de Fichas y Aprendices", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-fichas.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de instructores en PDF
     */
    @GetMapping("/instructores/pdf")
    public ResponseEntity<byte[]> descargarInstructoresPDF() {
        try {
            List<Map<String, Object>> instructores = reporteAdministradorService.obtenerReporteInstructoresEspecialidad();
            
            String[] encabezados = {"Instructor", "Correo", "Especialidad", "Estado"};
            List<String[]> datos = instructores.stream()
                    .map(i -> new String[]{
                            i.get("instructor") != null ? i.get("instructor").toString() : "",
                            i.get("correo") != null ? i.get("correo").toString() : "",
                            i.get("especialidad") != null ? i.get("especialidad").toString() : "",
                            i.get("estado") != null ? i.get("estado").toString() : ""
                    })
                    .toList();
            
            byte[] pdf = reportePDFService.generarPDF("Reporte de Instructores", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-instructores.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de trimestres en PDF
     */
    @GetMapping("/trimestres/pdf")
    public ResponseEntity<byte[]> descargarTrimestrespdf() {
        try {
            List<Trimestre> trimestres = trimestreService.obtenerTrimestres();
            
            String[] encabezados = {"Código Ficha", "Trimestre", "Fecha Inicio", "Fecha Fin", "Estado"};
            List<String[]> datos = trimestres.stream()
                    .map(t -> new String[]{
                            t.getFicha() != null && t.getFicha().getCodigoFicha() != null ? t.getFicha().getCodigoFicha() : "",
                            t.getNumero() != null ? "Trimestre " + t.getNumero() : "",
                            t.getFechaInicio() != null ? t.getFechaInicio().toString() : "",
                            t.getFechaFin() != null ? t.getFechaFin().toString() : "",
                            t.getEstado() != null ? t.getEstado().toString() : ""
                    })
                    .toList();
            
            byte[] pdf = reportePDFService.generarPDF("Reporte de Trimestres", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-trimestres.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de proyectos en PDF
     */
    @GetMapping("/proyectos/pdf")
    public ResponseEntity<byte[]> descargarProyectosPDF() {
        try {
            List<Map<String, Object>> proyectos = reporteAdministradorService.obtenerReporteProyectosGaes();
            
            String[] encabezados = {"GAES", "Proyecto", "Estado", "Fecha Inicio", "Fecha Fin"};
            List<String[]> datos = proyectos.stream()
                    .map(p -> new String[]{
                            p.get("gaes") != null ? p.get("gaes").toString() : "",
                            p.get("proyecto") != null ? p.get("proyecto").toString() : "",
                            p.get("estado") != null ? p.get("estado").toString() : "",
                            p.get("fecha_inicio") != null ? p.get("fecha_inicio").toString() : "",
                            p.get("fecha_fin") != null ? p.get("fecha_fin").toString() : ""
                    })
                    .toList();
            
            byte[] pdf = reportePDFService.generarPDF("Reporte de Proyectos", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-proyectos.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de usuarios en Excel
     */
    @GetMapping("/usuarios/excel")
    public ResponseEntity<byte[]> descargarUsuariosExcel() {
        try {
            List<Usuario> usuarios = usuarioService.obtenerTodosUsuarios();
            
            String[] encabezados = {"ID", "Nombre", "Apellido", "Correo", "Documento", "Rol", "Estado"};
            List<String[]> datos = usuarios.stream()
                    .map(u -> new String[]{
                            String.valueOf(u.getId()),
                            u.getNombre() != null ? u.getNombre() : "",
                            u.getApellido() != null ? u.getApellido() : "",
                            u.getCorreo() != null ? u.getCorreo() : "",
                            (u.getTipoDocumento() != null ? u.getTipoDocumento() : "") + ": " + 
                            (u.getNumeroDocumento() != null ? u.getNumeroDocumento() : ""),
                            u.getRol() != null ? u.getRol().getNombreRol() : "Sin Rol",
                            u.getEstado() != null ? u.getEstado().toString() : ""
                    })
                    .toList();
            
            byte[] excel = reporteExcelService.generarExcel("Reporte de Usuarios", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-usuarios.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de fichas en Excel
     */
    @GetMapping("/fichas/excel")
    public ResponseEntity<byte[]> descargarFichasExcel() {
        try {
            List<Ficha> fichas = fichaService.obtenerTodasFichas();
            
            String[] encabezados = {"Código Ficha", "Programa", "Jornada", "Modalidad", "Estado"};
            List<String[]> datos = fichas.stream()
                    .map(f -> new String[]{
                            f.getCodigoFicha() != null ? f.getCodigoFicha() : "",
                            f.getProgramaFormacion() != null ? f.getProgramaFormacion() : "",
                            f.getJornada() != null ? f.getJornada().toString() : "",
                            f.getModalidad() != null ? f.getModalidad().toString() : "",
                            f.getEstado() != null ? f.getEstado().toString() : ""
                    })
                    .toList();
            
            byte[] excel = reporteExcelService.generarExcel("Reporte de Fichas y Aprendices", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-fichas.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de instructores en Excel
     */
    @GetMapping("/instructores/excel")
    public ResponseEntity<byte[]> descargarInstructoresExcel() {
        try {
            List<Map<String, Object>> instructores = reporteAdministradorService.obtenerReporteInstructoresEspecialidad();
            
            String[] encabezados = {"Instructor", "Correo", "Especialidad", "Estado"};
            List<String[]> datos = instructores.stream()
                    .map(i -> new String[]{
                            i.get("instructor") != null ? i.get("instructor").toString() : "",
                            i.get("correo") != null ? i.get("correo").toString() : "",
                            i.get("especialidad") != null ? i.get("especialidad").toString() : "",
                            i.get("estado") != null ? i.get("estado").toString() : ""
                    })
                    .toList();
            
            byte[] excel = reporteExcelService.generarExcel("Reporte de Instructores", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-instructores.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de trimestres en Excel
     */
    @GetMapping("/trimestres/excel")
    public ResponseEntity<byte[]> descargarTrimestresExcel() {
        try {
            List<Trimestre> trimestres = trimestreService.obtenerTrimestres();
            
            String[] encabezados = {"Código Ficha", "Trimestre", "Fecha Inicio", "Fecha Fin", "Estado"};
            List<String[]> datos = trimestres.stream()
                    .map(t -> new String[]{
                            t.getFicha() != null && t.getFicha().getCodigoFicha() != null ? t.getFicha().getCodigoFicha() : "",
                            t.getNumero() != null ? "Trimestre " + t.getNumero() : "",
                            t.getFechaInicio() != null ? t.getFechaInicio().toString() : "",
                            t.getFechaFin() != null ? t.getFechaFin().toString() : "",
                            t.getEstado() != null ? t.getEstado().toString() : ""
                    })
                    .toList();
            
            byte[] excel = reporteExcelService.generarExcel("Reporte de Trimestres", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-trimestres.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Descargar reporte de proyectos en Excel
     */
    @GetMapping("/proyectos/excel")
    public ResponseEntity<byte[]> descargarProyectosExcel() {
        try {
            List<Map<String, Object>> proyectos = reporteAdministradorService.obtenerReporteProyectosGaes();
            
            String[] encabezados = {"GAES", "Proyecto", "Estado", "Fecha Inicio", "Fecha Fin"};
            List<String[]> datos = proyectos.stream()
                    .map(p -> new String[]{
                            p.get("gaes") != null ? p.get("gaes").toString() : "",
                            p.get("proyecto") != null ? p.get("proyecto").toString() : "",
                            p.get("estado") != null ? p.get("estado").toString() : "",
                            p.get("fecha_inicio") != null ? p.get("fecha_inicio").toString() : "",
                            p.get("fecha_fin") != null ? p.get("fecha_fin").toString() : ""
                    })
                    .toList();
            
            byte[] excel = reporteExcelService.generarExcel("Reporte de Proyectos", encabezados, datos);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte-proyectos.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
