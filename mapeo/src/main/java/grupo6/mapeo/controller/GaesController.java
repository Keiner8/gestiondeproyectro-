package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Gaes;
import grupo6.mapeo.dto.GaesDTO;
import grupo6.mapeo.service.GaesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/gaes")
@CrossOrigin(origins = "*")
public class GaesController {
    
    @Autowired
    private GaesService gaesService;
    
    // CREATE - Crear nuevo GAES
    @PostMapping
    public ResponseEntity<Gaes> crearGaes(@RequestBody Gaes gaes) {
        // Validar que no exista un GAES con el mismo nombre
        if (gaesService.existeGaesConNombre(gaes.getNombre())) {
            return ResponseEntity.badRequest().build();
        }
        Gaes nuevoGaes = gaesService.crearGaes(gaes);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoGaes);
    }
    
    // READ - Obtener GAES por ID
    @GetMapping("/{id}")
    public ResponseEntity<Gaes> obtenerGaes(@PathVariable Integer id) {
        Gaes gaes = gaesService.obtenerGaesPorId(id);
        return ResponseEntity.ok(gaes);
    }
    
    // READ - Obtener GAES con integrantes (DTO)
    @GetMapping("/{id}/con-integrantes")
    public ResponseEntity<GaesDTO> obtenerGaesConIntegrantes(@PathVariable Integer id) {
        GaesDTO gaesDTO = gaesService.obtenerGaesConIntegrantesDTO(id);
        return ResponseEntity.ok(gaesDTO);
    }
    
    // READ - Obtener GAES por nombre
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<Gaes> obtenerGaesPorNombre(@PathVariable String nombre) {
        Optional<Gaes> gaes = gaesService.obtenerGaesPorNombre(nombre);
        return gaes.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // READ - Obtener todos los GAES
    @GetMapping
    public ResponseEntity<List<Gaes>> obtenerTodosGaes() {
        List<Gaes> gaesList = gaesService.obtenerTodosGaes();
        return ResponseEntity.ok(gaesList);
    }
    
    // READ - Obtener GAES activos por ficha
    @GetMapping("/ficha/{fichaId}/activos")
    public ResponseEntity<List<Gaes>> obtenerGaesActivosPorFicha(@PathVariable Integer fichaId) {
        List<Gaes> gaesList = gaesService.obtenerGaesActivosPorFicha(fichaId);
        return ResponseEntity.ok(gaesList);
    }
    
    // READ - Obtener GAES por ficha
    @GetMapping("/ficha/{fichaId}")
    public ResponseEntity<List<Gaes>> obtenerGaesPorFicha(@PathVariable Integer fichaId) {
        List<Gaes> gaesList = gaesService.obtenerGaesPorFicha(fichaId);
        return ResponseEntity.ok(gaesList);
    }
    
    // UPDATE - Actualizar GAES
    @PutMapping("/{id}")
    public ResponseEntity<Gaes> actualizarGaes(
            @PathVariable Integer id,
            @RequestBody Gaes gaesActualizado) {
        Gaes gaes = gaesService.actualizarGaes(id, gaesActualizado);
        return ResponseEntity.ok(gaes);
    }
    
    // UPDATE - Asignar aprendices a GAES (desde formulario del instructor)
    @PutMapping("/{id}/asignar-aprendices")
    public ResponseEntity<?> asignarAprendicesGaes(
            @PathVariable Integer id,
            @RequestBody Map<String, List<Map<String, Integer>>> request) {
        try {
            if (request == null || request.get("integrantes") == null) {
                return ResponseEntity.badRequest().body("El campo 'integrantes' es requerido");
            }
            
            List<Integer> aprendizIds = request.get("integrantes").stream()
                    .map(m -> m.get("id"))
                    .collect(java.util.stream.Collectors.toList());
            
            System.out.println("Asignando " + aprendizIds.size() + " aprendices al GAES " + id);
            Gaes gaes = gaesService.asignarAprendicesAlGaes(id, aprendizIds);
            return ResponseEntity.ok(gaes);
        } catch (Exception e) {
            System.err.println("Error asignando aprendices al GAES: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    
    // DELETE - Eliminar GAES
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarGaes(@PathVariable Integer id) {
        gaesService.eliminarGaes(id);
        return ResponseEntity.noContent().build();
    }
}
