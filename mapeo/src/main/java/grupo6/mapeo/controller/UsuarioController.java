package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    // CREATE - Crear nuevo usuario
    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.crearUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }
    
    // READ - Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuario(@PathVariable Integer id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        return ResponseEntity.ok(usuario);
    }
    
    // READ - Obtener usuario por correo
    @GetMapping("/correo/{correo}")
    public ResponseEntity<Usuario> obtenerPorCorreo(@PathVariable String correo) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorCorreo(correo);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // READ - Obtener usuario por documento
    @GetMapping("/documento/{documento}")
    public ResponseEntity<Usuario> obtenerPorDocumento(@PathVariable String documento) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorDocumento(documento);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // READ - Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosUsuarios() {
        List<Usuario> usuarios = usuarioService.obtenerTodosUsuarios();
        return ResponseEntity.ok(usuarios);
    }
    
    // READ - Obtener usuarios por rol
    @GetMapping("/rol/{rolId}")
    public ResponseEntity<List<Usuario>> obtenerPorRol(@PathVariable Integer rolId) {
        List<Usuario> usuarios = usuarioService.obtenerUsuariosPorRol(rolId);
        return ResponseEntity.ok(usuarios);
    }
    
    // READ - Buscar usuarios por nombre
    @GetMapping("/buscar/{nombre}")
    public ResponseEntity<List<Usuario>> buscarPorNombre(@PathVariable String nombre) {
        List<Usuario> usuarios = usuarioService.buscarUsuariosPorNombre(nombre);
        return ResponseEntity.ok(usuarios);
    }
    
    // READ - Obtener usuarios por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Usuario>> obtenerPorEstado(@PathVariable Usuario.EstadoUsuario estado) {
        List<Usuario> usuarios = usuarioService.obtenerUsuariosPorEstado(estado);
        return ResponseEntity.ok(usuarios);
    }
    
    // UPDATE - Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Integer id,
            @RequestBody Usuario usuarioActualizado) {
        try {
            Usuario usuario = usuarioService.actualizarUsuario(id, usuarioActualizado);
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar usuario: " + e.getMessage());
        }
    }
    
    // PATCH - Desactivar usuario
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Usuario> desactivarUsuario(@PathVariable Integer id) {
        Usuario usuario = usuarioService.desactivarUsuario(id);
        return ResponseEntity.ok(usuario);
    }
    
    // PATCH - Activar usuario
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Usuario> activarUsuario(@PathVariable Integer id) {
        Usuario usuario = usuarioService.activarUsuario(id);
        return ResponseEntity.ok(usuario);
    }
    
    // DELETE - Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
    
    // Validaciones
    @GetMapping("/existe-correo/{correo}")
    public ResponseEntity<Boolean> existeCorreo(@PathVariable String correo) {
        boolean existe = usuarioService.existeUsuarioPorCorreo(correo);
        return ResponseEntity.ok(existe);
    }
    
    @GetMapping("/existe-documento/{documento}")
    public ResponseEntity<Boolean> existeDocumento(@PathVariable String documento) {
        boolean existe = usuarioService.existeUsuarioPorDocumento(documento);
        return ResponseEntity.ok(existe);
    }
}
