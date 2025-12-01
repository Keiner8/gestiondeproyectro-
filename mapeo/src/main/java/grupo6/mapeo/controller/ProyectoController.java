package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Proyecto;
import grupo6.mapeo.entity.Proyecto.EstadoProyecto;
import grupo6.mapeo.service.ProyectoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proyectos")
@CrossOrigin(origins = "*")
public class ProyectoController {
    
    @Autowired
    private ProyectoService proyectoService;
    
    // CREATE - Registrar nuevo proyecto
    @PostMapping
    public ResponseEntity<Proyecto> crearProyecto(@RequestBody Proyecto proyecto) {
        // Validar que el nombre no exista ya en el GAES
        if (proyectoService.existeProyectoConNombre(proyecto.getNombre(), proyecto.getGaesId())) {
            return ResponseEntity.badRequest().build();
        }
        Proyecto nuevoProyecto = proyectoService.crearProyecto(proyecto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProyecto);
    }
    
    // READ - Obtener proyecto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Proyecto> obtenerProyecto(@PathVariable Integer id) {
        Proyecto proyecto = proyectoService.obtenerProyectoPorId(id);
        return ResponseEntity.ok(proyecto);
    }
    
    // READ - Obtener todos los proyectos
    @GetMapping
    public ResponseEntity<List<Proyecto>> obtenerTodosProyectos() {
        List<Proyecto> proyectos = proyectoService.obtenerTodosProyectos();
        return ResponseEntity.ok(proyectos);
    }
    
    // READ - Obtener proyectos por GAES
    @GetMapping("/gaes/{gaesId}")
    public ResponseEntity<List<Proyecto>> obtenerProyectosPorGaes(@PathVariable Integer gaesId) {
        List<Proyecto> proyectos = proyectoService.obtenerProyectosPorGaes(gaesId);
        return ResponseEntity.ok(proyectos);
    }
    
    // READ - Obtener proyectos por líder aprendiz
    @GetMapping("/lider/{liderId}")
    public ResponseEntity<List<Proyecto>> obtenerProyectosPorLider(@PathVariable Integer liderId) {
        List<Proyecto> proyectos = proyectoService.obtenerProyectosPorLider(liderId);
        return ResponseEntity.ok(proyectos);
    }
    
    // READ - Obtener proyectos por trimestre
    @GetMapping("/trimestre/{trimestre}")
    public ResponseEntity<List<Proyecto>> obtenerProyectosPorTrimestre(@PathVariable Integer trimestre) {
        List<Proyecto> proyectos = proyectoService.obtenerProyectosPorTrimestre(trimestre);
        return ResponseEntity.ok(proyectos);
    }
    
    // READ - Obtener proyectos por GAES y trimestre
    @GetMapping("/gaes/{gaesId}/trimestre/{trimestre}")
    public ResponseEntity<List<Proyecto>> obtenerProyectosPorGaesYTrimestre(
            @PathVariable Integer gaesId,
            @PathVariable Integer trimestre) {
        List<Proyecto> proyectos = proyectoService.obtenerProyectosPorGaesYTrimestre(gaesId, trimestre);
        return ResponseEntity.ok(proyectos);
    }
    
    // READ - Obtener proyectos en desarrollo del líder
    @GetMapping("/en-desarrollo/lider/{liderId}")
    public ResponseEntity<List<Proyecto>> obtenerProyectosEnDesarrolloDelLider(@PathVariable Integer liderId) {
        List<Proyecto> proyectos = proyectoService.obtenerProyectosEnDesarrolloDelLider(liderId);
        return ResponseEntity.ok(proyectos);
    }
    
    // UPDATE - Actualizar proyecto
    @PutMapping("/{id}")
    public ResponseEntity<Proyecto> actualizarProyecto(
            @PathVariable Integer id,
            @RequestBody Proyecto proyectoActualizado) {
        Proyecto proyecto = proyectoService.actualizarProyecto(id, proyectoActualizado);
        return ResponseEntity.ok(proyecto);
    }
    
    // UPDATE - Cambiar estado del proyecto
    @PutMapping("/{id}/estado")
    public ResponseEntity<Proyecto> cambiarEstadoProyecto(
            @PathVariable Integer id,
            @RequestBody EstadoProyecto nuevoEstado) {
        Proyecto proyecto = proyectoService.cambiarEstadoProyecto(id, nuevoEstado);
        return ResponseEntity.ok(proyecto);
    }
    
    // DELETE - Eliminar proyecto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProyecto(@PathVariable Integer id) {
        proyectoService.eliminarProyecto(id);
        return ResponseEntity.noContent().build();
    }
}
