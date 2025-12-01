package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Entregable;
import grupo6.mapeo.service.EntregableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/entregables")
@CrossOrigin(origins = "*")
public class EntregableController {
    
    @Autowired
    private EntregableService entregableService;
    
    // CREATE - Crear nuevo entregable
    @PostMapping
    public ResponseEntity<?> crearEntregable(
            @RequestParam String nombre,
            @RequestParam String descripcion,
            @RequestParam Integer proyectoId,
            @RequestParam(required = false) Integer aprendizId,
            @RequestParam(required = false) Integer trimestreId,
            @RequestParam(required = false) String url,
            @RequestParam(required = false) MultipartFile archivo) {
        
        try {
            // Validar parámetros requeridos
            if (nombre == null || nombre.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre del entregable es requerido");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (proyectoId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El ID del proyecto es requerido");
                return ResponseEntity.badRequest().body(error);
            }
            
            Entregable entregable = new Entregable();
            entregable.setNombre(nombre.trim());
            entregable.setDescripcion(descripcion);
            entregable.setProyectoId(proyectoId);
            entregable.setAprendizId(aprendizId);
            // Solo asigna trimestre_id si tiene valor, si es null dejalo null
            entregable.setTrimestreId(trimestreId);
            entregable.setUrl(url);
            
            if (archivo != null && !archivo.isEmpty()) {
                try {
                    byte[] fileBytes = archivo.getBytes();
                    entregable.setArchivo(fileBytes);
                    entregable.setNombreArchivo(archivo.getOriginalFilename());
                } catch (Exception fileError) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Error al procesar el archivo: " + fileError.getMessage());
                    return ResponseEntity.badRequest().body(error);
                }
            }
            
            Entregable nuevoEntregable = entregableService.crearEntregable(entregable);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEntregable);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear entregable: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // READ - Obtener entregable por ID
    @GetMapping("/{id}")
    public ResponseEntity<Entregable> obtenerEntregable(@PathVariable Integer id) {
        Entregable entregable = entregableService.obtenerEntregablePorId(id);
        return ResponseEntity.ok(entregable);
    }
    
    // READ - Obtener todos los entregables
    @GetMapping
    public ResponseEntity<List<Entregable>> obtenerTodosEntregables() {
        List<Entregable> entregables = entregableService.obtenerTodosEntregables();
        return ResponseEntity.ok(entregables);
    }
    
    // READ - Obtener entregables por proyecto
    @GetMapping("/proyecto/{proyectoId}")
    public ResponseEntity<List<Entregable>> obtenerEntregablesPorProyecto(@PathVariable Integer proyectoId) {
        List<Entregable> entregables = entregableService.obtenerEntregablesPorProyecto(proyectoId);
        return ResponseEntity.ok(entregables);
    }
    
    // READ - Obtener entregables por trimestre
    @GetMapping("/trimestre/{trimestreId}")
    public ResponseEntity<List<Entregable>> obtenerEntregablesPorTrimestre(@PathVariable Integer trimestreId) {
        List<Entregable> entregables = entregableService.obtenerEntregablesPorTrimestre(trimestreId);
        return ResponseEntity.ok(entregables);
    }
    
    // READ - Obtener entregables por proyecto y trimestre
    @GetMapping("/proyecto/{proyectoId}/trimestre/{trimestreId}")
    public ResponseEntity<List<Entregable>> obtenerEntregablesPorProyectoYTrimestre(
            @PathVariable Integer proyectoId,
            @PathVariable Integer trimestreId) {
        List<Entregable> entregables = entregableService.obtenerEntregablesPorProyectoYTrimestre(proyectoId, trimestreId);
        return ResponseEntity.ok(entregables);
    }
    
    // READ - Obtener entregables ordenados por proyecto
    @GetMapping("/proyecto/{proyectoId}/ordenados")
    public ResponseEntity<List<Entregable>> obtenerEntregablesOrdenados(@PathVariable Integer proyectoId) {
        List<Entregable> entregables = entregableService.obtenerEntregablesOrdenados(proyectoId);
        return ResponseEntity.ok(entregables);
    }
    
    // READ - Obtener entregables por aprendiz ID
    @GetMapping("/aprendiz/{aprendizId}")
    public ResponseEntity<List<Entregable>> obtenerEntregablesPorAprendiz(@PathVariable Integer aprendizId) {
        List<Entregable> entregables = entregableService.obtenerEntregablesPorAprendizId(aprendizId);
        return ResponseEntity.ok(entregables);
    }
    

    
    // UPDATE - Actualizar entregable
    @PutMapping("/{id}")
    public ResponseEntity<Entregable> actualizarEntregable(
            @PathVariable Integer id,
            @RequestBody Entregable entregableActualizado) {
        Entregable entregable = entregableService.actualizarEntregable(id, entregableActualizado);
        return ResponseEntity.ok(entregable);
    }
    
    // DELETE - Eliminar entregable
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEntregable(@PathVariable Integer id) {
        entregableService.eliminarEntregable(id);
        return ResponseEntity.noContent().build();
    }
}
