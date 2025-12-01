package grupo6.mapeo.service;

import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    // CREATE
    public Usuario crearUsuario(Usuario usuario) {
        // Validar que no exista usuario con el mismo correo
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new RuntimeException("Ya existe un usuario con el correo: " + usuario.getCorreo());
        }
        // Validar que no exista usuario con el mismo documento
        if (usuarioRepository.existsByNumeroDocumento(usuario.getNumeroDocumento())) {
            throw new RuntimeException("Ya existe un usuario con el documento: " + usuario.getNumeroDocumento());
        }
        return usuarioRepository.save(usuario);
    }
    
    // READ
    public Usuario obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }
    
    public Optional<Usuario> obtenerUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }
    
    public Optional<Usuario> obtenerUsuarioPorDocumento(String numeroDocumento) {
        return usuarioRepository.findByNumeroDocumento(numeroDocumento);
    }
    
    public List<Usuario> obtenerUsuariosPorRol(Integer rolId) {
        return usuarioRepository.findByRolId(rolId);
    }
    
    public List<Usuario> buscarUsuariosPorNombre(String nombre) {
        return usuarioRepository.findByNombreOrApellidoContaining(nombre);
    }
    
    public List<Usuario> obtenerUsuariosPorEstado(Usuario.EstadoUsuario estado) {
        return usuarioRepository.findByEstado(estado);
    }
    
    public List<Usuario> obtenerTodosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        
        // Asigna estado por defecto si está NULL
        usuarios.forEach(usuario -> {
            if (usuario.getEstado() == null) {
                usuario.setEstado(Usuario.EstadoUsuario.ACTIVO);
                usuarioRepository.save(usuario);
            }
        });
        
        return usuarios;
    }
    
    // UPDATE
    public Usuario actualizarUsuario(Integer id, Usuario usuarioActualizado) {
        Usuario usuario = obtenerUsuarioPorId(id);
        
        // Validar correo si cambió
        if (!usuario.getCorreo().equals(usuarioActualizado.getCorreo())) {
            if (usuarioRepository.existsByCorreo(usuarioActualizado.getCorreo())) {
                throw new RuntimeException("Ya existe un usuario con el correo: " + usuarioActualizado.getCorreo());
            }
        }
        
        // Validar documento si cambió
        if (usuarioActualizado.getNumeroDocumento() != null && 
            !usuarioActualizado.getNumeroDocumento().equals(usuario.getNumeroDocumento())) {
            if (usuarioRepository.existsByNumeroDocumento(usuarioActualizado.getNumeroDocumento())) {
                throw new RuntimeException("Ya existe un usuario con el documento: " + usuarioActualizado.getNumeroDocumento());
            }
        }
        
        usuario.setNombre(usuarioActualizado.getNombre());
        usuario.setApellido(usuarioActualizado.getApellido());
        usuario.setCorreo(usuarioActualizado.getCorreo());
        // Solo actualizar password si viene con valor
        if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isEmpty()) {
            usuario.setPassword(usuarioActualizado.getPassword());
        }
        usuario.setTipoDocumento(usuarioActualizado.getTipoDocumento());
        usuario.setNumeroDocumento(usuarioActualizado.getNumeroDocumento());
        usuario.setEstado(usuarioActualizado.getEstado());
        usuario.setRol(usuarioActualizado.getRol());
        return usuarioRepository.save(usuario);
    }
    
    // DESACTIVAR (cambiar estado a INACTIVO)
    public Usuario desactivarUsuario(Integer id) {
        Usuario usuario = obtenerUsuarioPorId(id);
        usuario.setEstado(Usuario.EstadoUsuario.INACTIVO);
        return usuarioRepository.save(usuario);
    }
    
    // ACTIVAR (cambiar estado a ACTIVO)
    public Usuario activarUsuario(Integer id) {
        Usuario usuario = obtenerUsuarioPorId(id);
        usuario.setEstado(Usuario.EstadoUsuario.ACTIVO);
        return usuarioRepository.save(usuario);
    }
    
    // DELETE
    public void eliminarUsuario(Integer id) {
        usuarioRepository.deleteById(id);
    }
    
    // Validaciones
    public boolean existeUsuarioPorCorreo(String correo) {
        return usuarioRepository.existsByCorreo(correo);
    }
    
    public boolean existeUsuarioPorDocumento(String numeroDocumento) {
        return usuarioRepository.existsByNumeroDocumento(numeroDocumento);
    }
}
