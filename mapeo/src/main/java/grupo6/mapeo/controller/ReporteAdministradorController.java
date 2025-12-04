package grupo6.mapeo.controller;

import grupo6.mapeo.dto.UsuarioReporteDTO;
import grupo6.mapeo.service.ReporteAdministradorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
