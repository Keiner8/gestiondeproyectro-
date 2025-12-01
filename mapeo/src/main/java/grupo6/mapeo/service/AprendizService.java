package grupo6.mapeo.service;

import grupo6.mapeo.dto.AprendizDTO;
import grupo6.mapeo.entity.Aprendiz;
import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.entity.Ficha;
import grupo6.mapeo.entity.Gaes;
import grupo6.mapeo.repository.AprendizRepository;
import grupo6.mapeo.repository.UsuarioRepository;
import grupo6.mapeo.repository.FichaRepository;
import grupo6.mapeo.repository.GaesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AprendizService {
    
    @Autowired
     private AprendizRepository aprendizRepository;
     
     @Autowired
     private UsuarioRepository usuarioRepository;
     
     @Autowired
     private FichaRepository fichaRepository;
     
     @Autowired
     private GaesRepository gaesRepository;
    
    // CREATE
    public Aprendiz crearAprendiz(Aprendiz aprendiz) {
        return aprendizRepository.save(aprendiz);
    }
    
    // CREATE con DTO
    public Aprendiz crearAprendizPorIds(AprendizDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + dto.getUsuarioId()));
        
        Ficha ficha = null;
        if (dto.getFichaId() != null) {
            ficha = fichaRepository.findById(dto.getFichaId())
                    .orElseThrow(() -> new RuntimeException("Ficha no encontrada con ID: " + dto.getFichaId()));
        }
        
        Aprendiz aprendiz = new Aprendiz(usuario, ficha);
        System.out.println("✓ Aprendiz creado: " + usuario.getNombre() + " -> Ficha: " + (ficha != null ? ficha.getCodigoFicha() : "SIN ASIGNAR"));
        return aprendizRepository.save(aprendiz);
    }
    
    // READ
    public Aprendiz obtenerAprendizPorId(Integer id) {
        return aprendizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aprendiz no encontrado con ID: " + id));
    }
    
    public Optional<Aprendiz> obtenerAprendizPorUsuarioId(Integer usuarioId) {
        try {
            return aprendizRepository.findByUsuarioId(usuarioId);
        } catch (Exception e) {
            // Si hay múltiples aprendices, devolver el primero (más reciente)
            List<Aprendiz> aprendices = aprendizRepository.findByUsuarioIdOrderByIdDesc(usuarioId);
            if (!aprendices.isEmpty()) {
                return Optional.of(aprendices.get(0));
            }
            return Optional.empty();
        }
    }
    
    public List<Aprendiz> obtenerAprendicesPorFicha(Integer fichaId) {
        return aprendizRepository.findByFichaId(fichaId);
    }
    
    public List<Aprendiz> obtenerTodosAprendices() {
        return aprendizRepository.findAll();
    }
    
    // UPDATE
    public Aprendiz actualizarAprendiz(Integer id, Aprendiz aprendizActualizado) {
        Aprendiz aprendiz = obtenerAprendizPorId(id);
        aprendiz.setUsuario(aprendizActualizado.getUsuario());
        aprendiz.setFicha(aprendizActualizado.getFicha());
        if (aprendizActualizado.getEstado() != null) {
            aprendiz.setEstado(aprendizActualizado.getEstado());
        }
        return aprendizRepository.save(aprendiz);
    }
    
    // PATCH - Asignar GAES al aprendiz
    public Aprendiz asignarGaes(Integer aprendizId, Integer gaesId) {
        Aprendiz aprendiz = obtenerAprendizPorId(aprendizId);
        if (aprendiz == null) {
            throw new RuntimeException("Aprendiz no encontrado con ID: " + aprendizId);
        }
        
        Gaes gaes = gaesRepository.findById(gaesId)
                .orElseThrow(() -> new RuntimeException("GAES no encontrado con ID: " + gaesId));
        
        aprendiz.setGaes(gaes);
        Aprendiz actualizado = aprendizRepository.save(aprendiz);
        
        System.out.println("✓ GAES asignado: Aprendiz " + aprendizId + " -> GAES " + gaesId);
        return actualizado;
    }
    
    // PATCH - Desasignar GAES del aprendiz
    public Aprendiz desasignarGaes(Integer aprendizId) {
        Aprendiz aprendiz = obtenerAprendizPorId(aprendizId);
        if (aprendiz == null) {
            throw new RuntimeException("Aprendiz no encontrado con ID: " + aprendizId);
        }
        
        aprendiz.setGaes(null);
        Aprendiz actualizado = aprendizRepository.save(aprendiz);
        
        System.out.println("✓ GAES desasignado: Aprendiz " + aprendizId);
        return actualizado;
    }
    
    // PATCH - Asignar Ficha al aprendiz
    public Aprendiz asignarFicha(Integer aprendizId, Integer fichaId) {
        Aprendiz aprendiz = obtenerAprendizPorId(aprendizId);
        if (aprendiz == null) {
            throw new RuntimeException("Aprendiz no encontrado con ID: " + aprendizId);
        }
        
        Ficha ficha = fichaRepository.findById(fichaId)
                .orElseThrow(() -> new RuntimeException("Ficha no encontrada con ID: " + fichaId));
        
        aprendiz.setFicha(ficha);
        Aprendiz actualizado = aprendizRepository.save(aprendiz);
        
        System.out.println("✓ Ficha asignada: Aprendiz " + aprendizId + " -> Ficha " + fichaId);
        return actualizado;
    }
    
    // DESACTIVAR (cambiar estado a INACTIVO) - También desactiva el usuario
    public Aprendiz desactivarAprendiz(Integer id) {
        Aprendiz aprendiz = obtenerAprendizPorId(id);
        aprendiz.setEstado("INACTIVO");
        
        // Desactivar el usuario asociado
        if (aprendiz.getUsuario() != null) {
            Usuario usuario = aprendiz.getUsuario();
            usuario.setEstado(Usuario.EstadoUsuario.INACTIVO);
            usuarioRepository.save(usuario);
        }
        
        return aprendizRepository.save(aprendiz);
    }
    
    // ACTIVAR (cambiar estado a ACTIVO) - También activa el usuario
    public Aprendiz activarAprendiz(Integer id) {
        Aprendiz aprendiz = obtenerAprendizPorId(id);
        aprendiz.setEstado("ACTIVO");
        
        // Activar el usuario asociado
        if (aprendiz.getUsuario() != null) {
            Usuario usuario = aprendiz.getUsuario();
            usuario.setEstado(Usuario.EstadoUsuario.ACTIVO);
            usuarioRepository.save(usuario);
        }
        
        return aprendizRepository.save(aprendiz);
    }
    
    // DELETE
    public void eliminarAprendiz(Integer id) {
        aprendizRepository.deleteById(id);
    }
    
    // Validaciones
    public boolean existeAprendizPorUsuario(Integer usuarioId) {
        return aprendizRepository.existsByUsuarioId(usuarioId);
    }
}
