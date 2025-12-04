package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Trimestre;
import grupo6.mapeo.entity.Trimestre.EstadoTrimestre;
import grupo6.mapeo.dto.TrimestreDTO;
import grupo6.mapeo.dto.FichaDTO;
import grupo6.mapeo.service.TrimestreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trimestres")
@CrossOrigin(origins = "*")
public class TrimestreController {
    
    @Autowired
    private TrimestreService trimestreService;
    
    // CREATE - Crear nuevo trimestre
    @PostMapping
    public ResponseEntity<?> crearTrimestre(@RequestBody Trimestre trimestre) {
        try {
            // Validar campos obligatorios
            if (trimestre.getNumero() == null) {
                return ResponseEntity.badRequest().body("El número del trimestre es obligatorio");
            }
            if (trimestre.getFichaId() == null) {
                return ResponseEntity.badRequest().body("Debe seleccionar una ficha");
            }
            if (trimestre.getFechaInicio() == null) {
                return ResponseEntity.badRequest().body("La fecha de inicio es obligatoria");
            }
            if (trimestre.getFechaFin() == null) {
                return ResponseEntity.badRequest().body("La fecha de fin es obligatoria");
            }
            
            Trimestre nuevoTrimestre = trimestreService.crearTrimestre(trimestre);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTrimestre);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear trimestre: " + e.getMessage());
        }
    }
    
    // READ - Obtener trimestre por ID
    @GetMapping("/{id}")
    public ResponseEntity<Trimestre> obtenerTrimestre(@PathVariable Integer id) {
        Trimestre trimestre = trimestreService.obtenerTrimestrePorId(id);
        return ResponseEntity.ok(trimestre);
    }
    
    // READ - Obtener todos los trimestres
    @GetMapping
    public ResponseEntity<List<TrimestreDTO>> obtenerTodosLosTrimestres() {
        List<Trimestre> trimestres = trimestreService.obtenerTrimestres();
        List<TrimestreDTO> trimestresDTO = trimestres.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(trimestresDTO);
    }
    
    // READ - Obtener trimestres por ficha
    @GetMapping("/ficha/{fichaId}")
    public ResponseEntity<List<Trimestre>> obtenerTrimestresporFicha(@PathVariable Integer fichaId) {
        List<Trimestre> trimestres = trimestreService.obtenerTrimestresporFicha(fichaId);
        return ResponseEntity.ok(trimestres);
    }
    
    // READ - Obtener trimestre por ficha y número
    @GetMapping("/ficha/{fichaId}/numero/{numero}")
    public ResponseEntity<List<Trimestre>> obtenerTrimestreporFichaYNumero(
            @PathVariable Integer fichaId,
            @PathVariable Integer numero) {
        List<Trimestre> trimestres = trimestreService.obtenerTrimestresporFichaYNumero(fichaId, numero);
        return ResponseEntity.ok(trimestres);
    }
    
    // READ - Obtener trimestres por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Trimestre>> obtenerTrimestresporEstado(@PathVariable EstadoTrimestre estado) {
        List<Trimestre> trimestres = trimestreService.obtenerTrimestresporEstado(estado);
        return ResponseEntity.ok(trimestres);
    }
    
    // READ - Obtener trimestres por ficha y estado
    @GetMapping("/ficha/{fichaId}/estado/{estado}")
    public ResponseEntity<List<Trimestre>> obtenerTrimestresporFichaYEstado(
            @PathVariable Integer fichaId,
            @PathVariable EstadoTrimestre estado) {
        List<Trimestre> trimestres = trimestreService.obtenerTrimestresporFichaYEstado(fichaId, estado);
        return ResponseEntity.ok(trimestres);
    }
    
    // UPDATE - Actualizar trimestre
    @PutMapping("/{id}")
    public ResponseEntity<Trimestre> actualizarTrimestre(
            @PathVariable Integer id,
            @RequestBody Trimestre trimestreActualizado) {
        Trimestre trimestre = trimestreService.actualizarTrimestre(id, trimestreActualizado);
        return ResponseEntity.ok(trimestre);
    }
    
    // DELETE - Eliminar trimestre
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTrimestre(@PathVariable Integer id) {
        trimestreService.eliminarTrimestre(id);
        return ResponseEntity.noContent().build();
    }
    
    // UTILIDAD - Convertir Trimestre a TrimestreDTO
    private TrimestreDTO convertToDTO(Trimestre trimestre) {
        TrimestreDTO dto = new TrimestreDTO();
        dto.setId(trimestre.getId());
        dto.setNumero(trimestre.getNumero());
        dto.setFichaId(trimestre.getFichaId());
        dto.setFechaInicio(trimestre.getFechaInicio());
        dto.setFechaFin(trimestre.getFechaFin());
        dto.setEstado(trimestre.getEstado() != null ? trimestre.getEstado().toString() : null);
        
        if (trimestre.getFicha() != null) {
            FichaDTO fichaDTO = new FichaDTO(
                    trimestre.getFicha().getId(),
                    trimestre.getFicha().getCodigoFicha(),
                    trimestre.getFicha().getProgramaFormacion(),
                    trimestre.getFicha().getJornada() != null ? trimestre.getFicha().getJornada().toString() : null,
                    trimestre.getFicha().getModalidad() != null ? trimestre.getFicha().getModalidad().toString() : null,
                    trimestre.getFicha().getFechaInicio(),
                    trimestre.getFicha().getFechaFin(),
                    trimestre.getFicha().getEstado() != null ? trimestre.getFicha().getEstado().toString() : null
            );
            dto.setFicha(fichaDTO);
        }
        
        return dto;
        }
        }
