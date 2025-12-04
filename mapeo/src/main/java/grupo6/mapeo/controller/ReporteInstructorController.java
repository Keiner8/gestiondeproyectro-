package grupo6.mapeo.controller;

import grupo6.mapeo.service.ReporteInstructorService;
import grupo6.mapeo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes/instructor")
@CrossOrigin(origins = "*")
public class ReporteInstructorController {

    @Autowired
    private ReporteInstructorService reporteService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 2.1 Aprendices por GAES que atiende un instructor
     */
    @GetMapping("/aprendices-gaes")
    public ResponseEntity<List<Map<String, Object>>> reporteAprendicesGaes(
            HttpServletRequest request,
            @RequestParam(required = false) String gaes) {
        Integer instructorId = extraerInstructorIdDelToken(request);
        List<Map<String, Object>> reportes = reporteService.obtenerReporteAprendicesGaes(instructorId, gaes);
        return ResponseEntity.ok(reportes);
    }

    /**
     * 2.2 Proyectos asignados al instructor
     */
    @GetMapping("/proyectos-asignados")
    public ResponseEntity<List<Map<String, Object>>> reporteProyectosAsignados(
            HttpServletRequest request,
            @RequestParam(required = false) String estado) {
        Integer instructorId = extraerInstructorIdDelToken(request);
        List<Map<String, Object>> reportes = reporteService.obtenerReporteProyectosAsignados(instructorId, estado);
        return ResponseEntity.ok(reportes);
    }

    /**
     * 2.3 Entregables de un proyecto por trimestre
     */
    @GetMapping("/entregables-proyecto/{proyectoId}")
    public ResponseEntity<List<Map<String, Object>>> reporteEntregablesProyecto(
            @PathVariable Integer proyectoId) {
        List<Map<String, Object>> reportes = reporteService.obtenerReporteEntregablesProyecto(proyectoId);
        return ResponseEntity.ok(reportes);
    }

    /**
     * 2.4 Evaluaciones realizadas por el instructor
     */
    @GetMapping("/evaluaciones-realizadas")
    public ResponseEntity<List<Map<String, Object>>> reporteEvaluacionesRealizadas(
            HttpServletRequest request,
            @RequestParam(required = false) String gaes) {
        Integer instructorId = extraerInstructorIdDelToken(request);
        List<Map<String, Object>> reportes = reporteService.obtenerReporteEvaluacionesRealizadas(instructorId, gaes);
        return ResponseEntity.ok(reportes);
    }

    /**
     * 2.5 Resumen de calificaciones por GAES
     */
    @GetMapping("/resumen-calificaciones")
    public ResponseEntity<List<Map<String, Object>>> reporteResumenCalificaciones(
            HttpServletRequest request) {
        Integer instructorId = extraerInstructorIdDelToken(request);
        List<Map<String, Object>> reportes = reporteService.obtenerReporteResumenCalificaciones(instructorId);
        return ResponseEntity.ok(reportes);
    }

    private Integer extraerInstructorIdDelToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return jwtUtil.obtenerInstructorId(token);
        }
        return null;
    }
}
