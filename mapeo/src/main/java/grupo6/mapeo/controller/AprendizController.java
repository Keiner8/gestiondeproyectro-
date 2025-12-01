package grupo6.mapeo.controller;

import grupo6.mapeo.dto.AprendizDTO;
import grupo6.mapeo.entity.Aprendiz;
import grupo6.mapeo.service.AprendizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/aprendices")
@CrossOrigin(origins = "*")
public class AprendizController {
    
    @Autowired
    private AprendizService aprendizService;
    
    // CREATE - Registrar nuevo aprendiz
    @PostMapping
    public ResponseEntity<?> crearAprendiz(@RequestBody Aprendiz aprendiz) {
        try {
            Aprendiz nuevoAprendiz = aprendizService.crearAprendiz(aprendiz);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAprendiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear aprendiz: " + e.getMessage());
        }
    }
    
    // CREATE con IDs
    @PostMapping("/por-ids")
    public ResponseEntity<?> crearAprendizPorIds(@RequestBody AprendizDTO dto) {
        try {
            Aprendiz nuevoAprendiz = aprendizService.crearAprendizPorIds(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAprendiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear aprendiz: " + e.getMessage());
        }
    }
    
    // READ - Obtener aprendiz por ID
    @GetMapping("/{id}")
    public ResponseEntity<Aprendiz> obtenerAprendiz(@PathVariable Integer id) {
        Aprendiz aprendiz = aprendizService.obtenerAprendizPorId(id);
        return ResponseEntity.ok(aprendiz);
    }
    
    // READ - Obtener aprendiz por usuario ID
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Aprendiz> obtenerAprendizPorUsuario(@PathVariable Integer usuarioId) {
        Optional<Aprendiz> aprendiz = aprendizService.obtenerAprendizPorUsuarioId(usuarioId);
        return aprendiz.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // READ - Obtener aprendiz por usuario ID como DTO (sin referencias circulares)
    @GetMapping("/usuario/{usuarioId}/dto")
    public ResponseEntity<AprendizDTO> obtenerAprendizPorUsuarioDTO(@PathVariable Integer usuarioId) {
        Optional<Aprendiz> aprendiz = aprendizService.obtenerAprendizPorUsuarioId(usuarioId);
        
        if (!aprendiz.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Aprendiz a = aprendiz.get();
        AprendizDTO dto = convertAprendizToDTO(a);
        return ResponseEntity.ok(dto);
    }
    
    // Método auxiliar para convertir Aprendiz a AprendizDTO
    private AprendizDTO convertAprendizToDTO(Aprendiz a) {
        AprendizDTO dto = new AprendizDTO();
        dto.setId(a.getId());
        dto.setEsLider(a.getEsLider());
        dto.setEstado(a.getEstado());
        
        if (a.getUsuario() != null) {
            dto.setUsuarioId(a.getUsuario().getId());
            dto.setUsuarioNombre(a.getUsuario().getNombre());
            dto.setUsuarioApellido(a.getUsuario().getApellido());
            dto.setUsuarioCorreo(a.getUsuario().getCorreo());
        }
        
        if (a.getFicha() != null) {
            dto.setFichaId(a.getFicha().getId());
            dto.setFichaCodigoFicha(a.getFicha().getCodigoFicha());
            dto.setFichaProgramaFormacion(a.getFicha().getProgramaFormacion());
        }
        
        if (a.getGaes() != null) {
            dto.setGaesId(a.getGaes().getId());
            dto.setGaesNombre(a.getGaes().getNombre());
            System.out.println("✓ DTO Aprendiz " + a.getId() + " -> GAES " + a.getGaes().getId());
        } else {
            System.out.println("⚠ DTO Aprendiz " + a.getId() + " NO tiene GAES asignado");
        }
        
        return dto;
    }
    
    // READ - Obtener todos los aprendices
    @GetMapping
    public ResponseEntity<List<Aprendiz>> obtenerTodosAprendices() {
        List<Aprendiz> aprendices = aprendizService.obtenerTodosAprendices();
        return ResponseEntity.ok(aprendices);
    }
    
    // READ - Obtener aprendices de una ficha
    @GetMapping("/ficha/{fichaId}")
    public ResponseEntity<List<Aprendiz>> obtenerAprendicesPorFicha(@PathVariable Integer fichaId) {
        List<Aprendiz> aprendices = aprendizService.obtenerAprendicesPorFicha(fichaId);
        return ResponseEntity.ok(aprendices);
    }
    
    // READ - Obtener aprendices de una ficha como DTOs
    @GetMapping("/ficha/{fichaId}/dto")
    public ResponseEntity<List<AprendizDTO>> obtenerAprendicesPorFichaDTO(@PathVariable Integer fichaId) {
        List<Aprendiz> aprendices = aprendizService.obtenerAprendicesPorFicha(fichaId);
        List<AprendizDTO> dtos = aprendices.stream()
            .map(a -> {
                AprendizDTO dto = new AprendizDTO();
                dto.setId(a.getId());
                dto.setEsLider(a.getEsLider());
                dto.setEstado(a.getEstado());
                if (a.getUsuario() != null) {
                    dto.setUsuarioId(a.getUsuario().getId());
                    dto.setUsuarioNombre(a.getUsuario().getNombre());
                    dto.setUsuarioApellido(a.getUsuario().getApellido());
                    dto.setUsuarioCorreo(a.getUsuario().getCorreo());
                }
                if (a.getFicha() != null) {
                    dto.setFichaId(a.getFicha().getId());
                    dto.setFichaCodigoFicha(a.getFicha().getCodigoFicha());
                    dto.setFichaProgramaFormacion(a.getFicha().getProgramaFormacion());
                }
                if (a.getGaes() != null) {
                    dto.setGaesId(a.getGaes().getId());
                    dto.setGaesNombre(a.getGaes().getNombre());
                }
                return dto;
            })
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    // UPDATE - Actualizar aprendiz
    @PutMapping("/{id}")
    public ResponseEntity<Aprendiz> actualizarAprendiz(
            @PathVariable Integer id,
            @RequestBody Aprendiz aprendizActualizado) {
        Aprendiz aprendiz = aprendizService.actualizarAprendiz(id, aprendizActualizado);
        return ResponseEntity.ok(aprendiz);
    }
    
    // PATCH - Actualizar solo GAES del aprendiz
    @PatchMapping("/{id}/gaes/{gaesId}")
    public ResponseEntity<Aprendiz> asignarGaes(
            @PathVariable Integer id,
            @PathVariable Integer gaesId) {
        Aprendiz aprendiz = aprendizService.asignarGaes(id, gaesId);
        return ResponseEntity.ok(aprendiz);
    }
    
    // PATCH - Desasignar GAES del aprendiz
    @PatchMapping("/{id}/gaes")
    public ResponseEntity<Aprendiz> desasignarGaes(@PathVariable Integer id) {
        Aprendiz aprendiz = aprendizService.desasignarGaes(id);
        return ResponseEntity.ok(aprendiz);
    }
    
    // PATCH - Asignar Ficha al aprendiz
    @PatchMapping("/{id}/ficha/{fichaId}")
    public ResponseEntity<Aprendiz> asignarFicha(
            @PathVariable Integer id,
            @PathVariable Integer fichaId) {
        Aprendiz aprendiz = aprendizService.asignarFicha(id, fichaId);
        return ResponseEntity.ok(aprendiz);
    }
    
    // PATCH - Desactivar aprendiz (cambiar a INACTIVO)
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Aprendiz> desactivarAprendiz(@PathVariable Integer id) {
        Aprendiz aprendiz = aprendizService.desactivarAprendiz(id);
        return ResponseEntity.ok(aprendiz);
    }
    
    // PATCH - Activar aprendiz (cambiar a ACTIVO)
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Aprendiz> activarAprendiz(@PathVariable Integer id) {
        Aprendiz aprendiz = aprendizService.activarAprendiz(id);
        return ResponseEntity.ok(aprendiz);
    }
    
    // DELETE - Eliminar aprendiz
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAprendiz(@PathVariable Integer id) {
        aprendizService.eliminarAprendiz(id);
        return ResponseEntity.noContent().build();
    }
    
    // Verificar si existe aprendiz para un usuario
    @GetMapping("/existe/usuario/{usuarioId}")
    public ResponseEntity<Boolean> existeAprendizPorUsuario(@PathVariable Integer usuarioId) {
        boolean existe = aprendizService.existeAprendizPorUsuario(usuarioId);
        return ResponseEntity.ok(existe);
    }
}
