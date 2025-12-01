package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Instructor;
import grupo6.mapeo.dto.InstructorDTO;
import grupo6.mapeo.service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/instructores")
@CrossOrigin(origins = "*")
public class InstructorController {
    
    @Autowired
    private InstructorService instructorService;
    
    // CREATE - Registrar nuevo instructor
    @PostMapping
    public ResponseEntity<Instructor> crearInstructor(@RequestBody Instructor instructor) {
        Instructor nuevoInstructor = instructorService.crearInstructor(instructor);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoInstructor);
    }
    
    // READ - Obtener instructor por ID
    @GetMapping("/{id}")
    public ResponseEntity<Instructor> obtenerInstructor(@PathVariable Integer id) {
        Instructor instructor = instructorService.obtenerInstructorPorId(id);
        return ResponseEntity.ok(instructor);
    }
    
    // READ - Obtener instructor por usuario ID (con DTO para evitar referencias circulares)
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<InstructorDTO> obtenerInstructorPorUsuario(@PathVariable Integer usuarioId) {
        Optional<Instructor> instructor = instructorService.obtenerInstructorPorUsuarioId(usuarioId);
        return instructor.map(i -> ResponseEntity.ok(instructorService.convertToDTO(i)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // READ - Obtener todos los instructores
    @GetMapping
    public ResponseEntity<List<Instructor>> obtenerTodosInstructores() {
        List<Instructor> instructores = instructorService.obtenerTodosInstructores();
        return ResponseEntity.ok(instructores);
    }
    
    // READ - Obtener instructores por especialidad
    @GetMapping("/especialidad/{especialidad}")
    public ResponseEntity<List<Instructor>> obtenerPorEspecialidad(@PathVariable String especialidad) {
        List<Instructor> instructores = instructorService.obtenerInstructoresPorEspecialidad(especialidad);
        return ResponseEntity.ok(instructores);
    }
    
    // READ - Obtener instructores por especialidad (búsqueda parcial)
    @GetMapping("/especialidad-buscar/{especialidad}")
    public ResponseEntity<List<Instructor>> buscarPorEspecialidad(@PathVariable String especialidad) {
        List<Instructor> instructores = instructorService.obtenerInstructoresPorEspecialidadContaining(especialidad);
        return ResponseEntity.ok(instructores);
    }
    
    // UPDATE - Actualizar instructor
    @PutMapping("/{id}")
    public ResponseEntity<Instructor> actualizarInstructor(
            @PathVariable Integer id,
            @RequestBody Instructor instructorActualizado) {
        Instructor instructor = instructorService.actualizarInstructor(id, instructorActualizado);
        return ResponseEntity.ok(instructor);
    }
    
    // DELETE - Eliminar instructor
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarInstructor(@PathVariable Integer id) {
        instructorService.eliminarInstructor(id);
        return ResponseEntity.noContent().build();
    }
    
    // Verificar si existe instructor para un usuario
    @GetMapping("/existe/usuario/{usuarioId}")
    public ResponseEntity<Boolean> existeInstructorPorUsuario(@PathVariable Integer usuarioId) {
        boolean existe = instructorService.existeInstructorPorUsuario(usuarioId);
        return ResponseEntity.ok(existe);
    }
}
