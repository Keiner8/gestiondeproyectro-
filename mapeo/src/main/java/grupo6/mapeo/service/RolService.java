package grupo6.mapeo.service;

import grupo6.mapeo.entity.Rol;
import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.repository.RolRepository;
import grupo6.mapeo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RolService {
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    // CREATE
    public Rol crearRol(Rol rol) {
        return rolRepository.save(rol);
    }
    
    // READ
    public Rol obtenerRolPorId(Integer id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
    }
    
    public Optional<Rol> obtenerRolPorNombre(String nombreRol) {
        return rolRepository.findByNombreRol(nombreRol);
    }
    
    public List<Rol> obtenerTodosLosRoles() {
        return rolRepository.findAll();
    }
    
    // UPDATE
    public Rol actualizarRol(Integer id, Rol rolActualizado) {
        Rol rol = obtenerRolPorId(id);
        rol.setNombreRol(rolActualizado.getNombreRol());
        return rolRepository.save(rol);
    }
    
    // DELETE - Eliminar rol y reasignar usuarios al rol ID 1
    public void eliminarRol(Integer id) {
        // No permitir eliminar el rol con ID 1 (aprendiz) o si es el último rol
        List<Rol> todosLosRoles = rolRepository.findAll();
        if (id == 1 || todosLosRoles.size() <= 1) {
            throw new RuntimeException("No se puede eliminar este rol");
        }
        
        // Reasignar todos los usuarios que tenían este rol al rol ID 1 (aprendiz)
        List<Usuario> usuariosConEsteRol = usuarioRepository.findByRolId(id);
        
        if (!usuariosConEsteRol.isEmpty()) {
            Rol rolDestino = rolRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Rol destino (aprendiz) no encontrado"));
            
            for (Usuario usuario : usuariosConEsteRol) {
                usuario.setRol(rolDestino);
                usuarioRepository.save(usuario);
            }
        }
        
        // Ahora sí eliminar el rol
        rolRepository.deleteById(id);
    }
}
