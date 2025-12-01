package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Ficha;
import grupo6.mapeo.entity.Ficha.EstadoFicha;
import grupo6.mapeo.dto.FichaDTO;
import grupo6.mapeo.service.FichaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fichas")
@CrossOrigin(origins = "*")
public class FichaController {
    
    @Autowired
    private FichaService fichaService;
    
    // CREATE - Crear nueva ficha
    @PostMapping
    public ResponseEntity<?> crearFicha(@RequestBody Ficha ficha) {
        try {
            if (ficha.getCodigoFicha() == null || ficha.getCodigoFicha().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El código de ficha es requerido");
            }
            if (ficha.getProgramaFormacion() == null || ficha.getProgramaFormacion().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El programa de formación es requerido");
            }
            if (ficha.getFechaInicio() == null) {
                return ResponseEntity.badRequest().body("La fecha de inicio es requerida");
            }
            if (ficha.getFechaFin() == null) {
                return ResponseEntity.badRequest().body("La fecha de fin es requerida");
            }
            if (ficha.getFechaFin().isBefore(ficha.getFechaInicio())) {
                return ResponseEntity.badRequest().body("La fecha fin debe ser posterior a la fecha inicio");
            }
            
            // Validar que el código de ficha no esté duplicado
            Optional<Ficha> fichaExistente = fichaService.obtenerFichaPorCodigo(ficha.getCodigoFicha());
            if (fichaExistente.isPresent()) {
                return ResponseEntity.badRequest().body("El código de ficha " + ficha.getCodigoFicha() + " ya existe");
            }
            
            Ficha nuevaFicha = fichaService.crearFicha(ficha);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaFicha);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear ficha: " + e.getMessage());
        }
    }
    
    // READ - Obtener ficha por ID (sin referencias circulares, con aprendices)
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerFicha(@PathVariable Integer id) {
        try {
            Ficha ficha = fichaService.obtenerFichaPorId(id);
            FichaDTO fichaDTO = fichaService.convertToDTO(ficha);
            return ResponseEntity.ok(fichaDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener ficha: " + e.getMessage());
        }
    }
    
    // READ - Obtener ficha por código
    @GetMapping("/codigo/{codigoFicha}")
    public ResponseEntity<Ficha> obtenerPorCodigo(@PathVariable String codigoFicha) {
        Optional<Ficha> ficha = fichaService.obtenerFichaPorCodigo(codigoFicha);
        return ficha.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // READ - Obtener todas las fichas (sin referencias circulares)
    @GetMapping
    public ResponseEntity<?> obtenerTodasFichas() {
        try {
            List<Ficha> fichas = fichaService.obtenerTodasFichas();
            List<FichaDTO> fichasDTO = fichas.stream()
                    .map(f -> new FichaDTO(
                            f.getId(),
                            f.getCodigoFicha(),
                            f.getProgramaFormacion(),
                            f.getJornada() != null ? f.getJornada().toString() : null,
                            f.getModalidad() != null ? f.getModalidad().toString() : null,
                            f.getFechaInicio(),
                            f.getFechaFin(),
                            f.getEstado() != null ? f.getEstado().toString() : null
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(fichasDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al cargar fichas: " + e.getMessage());
        }
    }
    
    // READ - Obtener fichas por programa
    @GetMapping("/programa/{programa}")
    public ResponseEntity<List<Ficha>> obtenerPorPrograma(@PathVariable String programa) {
        List<Ficha> fichas = fichaService.obtenerFichasPorPrograma(programa);
        return ResponseEntity.ok(fichas);
    }
    
    // READ - Obtener fichas por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Ficha>> obtenerPorEstado(@PathVariable EstadoFicha estado) {
        List<Ficha> fichas = fichaService.obtenerFichasPorEstado(estado);
        return ResponseEntity.ok(fichas);
    }
    
    // READ - Obtener fichas activas
    @GetMapping("/activas")
    public ResponseEntity<List<Ficha>> obtenerFichasActivas() {
        List<Ficha> fichas = fichaService.obtenerFichasActivas();
        return ResponseEntity.ok(fichas);
    }
    
    // READ - Obtener fichas finalizadas
    @GetMapping("/finalizadas")
    public ResponseEntity<List<Ficha>> obtenerFichasFinalizadas() {
        List<Ficha> fichas = fichaService.obtenerFichasFinalizadas();
        return ResponseEntity.ok(fichas);
    }
    
    // READ - Obtener fichas activas en una fecha
    @GetMapping("/activas-en/{fecha}")
    public ResponseEntity<List<Ficha>> obtenerFichasActivasEnFecha(@PathVariable LocalDate fecha) {
        List<Ficha> fichas = fichaService.obtenerFichasActivasEnFecha(fecha);
        return ResponseEntity.ok(fichas);
    }
    
    // UPDATE - Actualizar ficha
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarFicha(
            @PathVariable Integer id,
            @RequestBody Ficha fichaActualizada) {
        try {
            // Validar que el código no esté duplicado (en otra ficha)
            Optional<Ficha> fichaExistente = fichaService.obtenerFichaPorCodigo(fichaActualizada.getCodigoFicha());
            if (fichaExistente.isPresent() && !fichaExistente.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body("El código de ficha " + fichaActualizada.getCodigoFicha() + " ya existe");
            }
            
            Ficha ficha = fichaService.actualizarFicha(id, fichaActualizada);
            return ResponseEntity.ok(ficha);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar ficha: " + e.getMessage());
        }
    }
    
    // UPDATE - Cambiar estado de ficha
    @PutMapping("/{id}/estado")
    public ResponseEntity<Ficha> cambiarEstadoFicha(
            @PathVariable Integer id,
            @RequestBody EstadoFicha nuevoEstado) {
        Ficha ficha = fichaService.cambiarEstadoFicha(id, nuevoEstado);
        return ResponseEntity.ok(ficha);
    }
    
    // PATCH - Desactivar ficha
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Ficha> desactivarFicha(@PathVariable Integer id) {
        Ficha ficha = fichaService.desactivarFicha(id);
        return ResponseEntity.ok(ficha);
    }
    
    // PATCH - Activar ficha
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Ficha> activarFicha(@PathVariable Integer id) {
        Ficha ficha = fichaService.activarFicha(id);
        return ResponseEntity.ok(ficha);
    }
    
    // DELETE - Eliminar ficha
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFicha(@PathVariable Integer id) {
        fichaService.eliminarFicha(id);
        return ResponseEntity.noContent().build();
    }
}
