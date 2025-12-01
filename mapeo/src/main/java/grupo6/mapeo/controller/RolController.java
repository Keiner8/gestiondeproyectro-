package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Rol;
import grupo6.mapeo.service.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RolController {
    
    @Autowired
    private RolService rolService;
    
    // CREATE - Crear nuevo rol
    @PostMapping
    public ResponseEntity<Rol> crearRol(@RequestBody Rol rol) {
        Rol nuevoRol = rolService.crearRol(rol);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRol);
    }
    
    // READ - Obtener todos los roles
    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        List<Rol> roles = rolService.obtenerTodosLosRoles();
        return ResponseEntity.ok(roles);
    }
    
    // READ - Obtener rol por ID
    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRol(@PathVariable Integer id) {
        Rol rol = rolService.obtenerRolPorId(id);
        return ResponseEntity.ok(rol);
    }
    
    // READ - Obtener rol por nombre
    @GetMapping("/nombre/{nombreRol}")
    public ResponseEntity<Rol> obtenerPorNombre(@PathVariable String nombreRol) {
        Optional<Rol> rol = rolService.obtenerRolPorNombre(nombreRol);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // UPDATE - Actualizar rol
    @PutMapping("/{id}")
    public ResponseEntity<Rol> actualizarRol(
            @PathVariable Integer id,
            @RequestBody Rol rolActualizado) {
        Rol rol = rolService.actualizarRol(id, rolActualizado);
        return ResponseEntity.ok(rol);
    }
    
    // DELETE - Eliminar rol
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Integer id) {
        rolService.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }
}
