package grupo6.mapeo.service;

import grupo6.mapeo.entity.Administrador;
import grupo6.mapeo.repository.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AdministradorService {
    
    @Autowired
    private AdministradorRepository administradorRepository;
    
    // CREATE
    public Administrador crearAdministrador(Administrador administrador) {
        return administradorRepository.save(administrador);
    }
    
    // READ
    public Administrador obtenerAdministradorPorId(Integer id) {
        return administradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador no encontrado con ID: " + id));
    }
    
    public Optional<Administrador> obtenerAdministradorPorUsuarioId(Integer usuarioId) {
        return administradorRepository.findByUsuarioId(usuarioId);
    }
    
    public List<Administrador> obtenerTodosAdministradores() {
        return administradorRepository.findAll();
    }
    
    // UPDATE
    public Administrador actualizarAdministrador(Integer id, Administrador administradorActualizado) {
        Administrador administrador = obtenerAdministradorPorId(id);
        administrador.setUsuario(administradorActualizado.getUsuario());
        return administradorRepository.save(administrador);
    }
    
    // DELETE
    public void eliminarAdministrador(Integer id) {
        administradorRepository.deleteById(id);
    }
    
    // Validaciones
    public boolean existeAdministradorPorUsuario(Integer usuarioId) {
        return administradorRepository.existsByUsuarioId(usuarioId);
    }
}
