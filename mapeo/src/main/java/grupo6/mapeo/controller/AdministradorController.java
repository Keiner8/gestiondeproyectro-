package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Administrador;
import grupo6.mapeo.service.AdministradorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/administradores")
@CrossOrigin(origins = "*")
public class AdministradorController {
    
    @Autowired
    private AdministradorService administradorService;
    
    // CREATE - Registrar nuevo administrador
    @PostMapping
    public ResponseEntity<Administrador> crearAdministrador(@RequestBody Administrador administrador) {
        Administrador nuevoAdministrador = administradorService.crearAdministrador(administrador);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAdministrador);
    }
    
    // READ - Obtener administrador por ID
    @GetMapping("/{id}")
    public ResponseEntity<Administrador> obtenerAdministrador(@PathVariable Integer id) {
        Administrador administrador = administradorService.obtenerAdministradorPorId(id);
        return ResponseEntity.ok(administrador);
    }
    
    // READ - Obtener administrador por usuario ID
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Administrador> obtenerAdministradorPorUsuario(@PathVariable Integer usuarioId) {
        Optional<Administrador> administrador = administradorService.obtenerAdministradorPorUsuarioId(usuarioId);
        return administrador.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // READ - Obtener todos los administradores
    @GetMapping
    public ResponseEntity<List<Administrador>> obtenerTodosAdministradores() {
        List<Administrador> administradores = administradorService.obtenerTodosAdministradores();
        return ResponseEntity.ok(administradores);
    }
    
    // UPDATE - Actualizar administrador
    @PutMapping("/{id}")
    public ResponseEntity<Administrador> actualizarAdministrador(
            @PathVariable Integer id,
            @RequestBody Administrador administradorActualizado) {
        Administrador administrador = administradorService.actualizarAdministrador(id, administradorActualizado);
        return ResponseEntity.ok(administrador);
    }
    
    // DELETE - Eliminar administrador
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAdministrador(@PathVariable Integer id) {
        administradorService.eliminarAdministrador(id);
        return ResponseEntity.noContent().build();
    }
    
    // Verificar si existe administrador para un usuario
    @GetMapping("/existe/usuario/{usuarioId}")
    public ResponseEntity<Boolean> existeAdministradorPorUsuario(@PathVariable Integer usuarioId) {
        boolean existe = administradorService.existeAdministradorPorUsuario(usuarioId);
        return ResponseEntity.ok(existe);
    }
}
