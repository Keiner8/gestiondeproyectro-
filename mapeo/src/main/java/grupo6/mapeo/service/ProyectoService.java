package grupo6.mapeo.service;

import grupo6.mapeo.entity.Proyecto;
import grupo6.mapeo.entity.Proyecto.EstadoProyecto;
import grupo6.mapeo.repository.ProyectoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProyectoService {
    
    @Autowired
    private ProyectoRepository proyectoRepository;
    
    // CREATE
    public Proyecto crearProyecto(Proyecto proyecto) {
        proyecto.setFechaCreacion(LocalDateTime.now());
        proyecto.setFechaActualizacion(LocalDateTime.now());
        proyecto.setEstado(EstadoProyecto.EN_DESARROLLO);
        return proyectoRepository.save(proyecto);
    }
    
    // READ
    public Proyecto obtenerProyectoPorId(Integer id) {
        return proyectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con ID: " + id));
    }
    
    public List<Proyecto> obtenerProyectosPorGaes(Integer gaesId) {
        return proyectoRepository.findByGaesId(gaesId);
    }
    
    public List<Proyecto> obtenerProyectosPorLider(Integer aprendizLiderId) {
        return proyectoRepository.findByAprendizLiderId(aprendizLiderId);
    }
    
    public List<Proyecto> obtenerProyectosPorTrimestre(Integer trimestre) {
        return proyectoRepository.findByTrimestre(trimestre);
    }
    
    public List<Proyecto> obtenerProyectosPorGaesYTrimestre(Integer gaesId, Integer trimestre) {
        return proyectoRepository.findByGaesIdAndTrimestre(gaesId, trimestre);
    }
    
    public List<Proyecto> obtenerTodosProyectos() {
        List<Proyecto> proyectos = proyectoRepository.findAll();
        
        // Asigna estado por defecto si está NULL
        proyectos.forEach(proyecto -> {
            if (proyecto.getEstado() == null) {
                proyecto.setEstado(EstadoProyecto.EN_DESARROLLO);
                proyectoRepository.save(proyecto);
            }
        });
        
        return proyectos;
    }
    
    // UPDATE
    public Proyecto actualizarProyecto(Integer id, Proyecto proyectoActualizado) {
        Proyecto proyecto = obtenerProyectoPorId(id);
        proyecto.setNombre(proyectoActualizado.getNombre());
        proyecto.setDescripcion(proyectoActualizado.getDescripcion());
        proyecto.setTrimestre(proyectoActualizado.getTrimestre());
        proyecto.setDocumentoInicial(proyectoActualizado.getDocumentoInicial());
        proyecto.setFechaActualizacion(LocalDateTime.now());
        return proyectoRepository.save(proyecto);
    }
    
    public Proyecto cambiarEstadoProyecto(Integer id, EstadoProyecto nuevoEstado) {
        Proyecto proyecto = obtenerProyectoPorId(id);
        proyecto.setEstado(nuevoEstado);
        proyecto.setFechaActualizacion(LocalDateTime.now());
        return proyectoRepository.save(proyecto);
    }
    
    // DELETE
    public void eliminarProyecto(Integer id) {
        proyectoRepository.deleteById(id);
    }
    
    // Validaciones
    public boolean existeProyectoConNombre(String nombre, Integer gaesId) {
        return proyectoRepository.findByNombreAndGaesId(nombre, gaesId).isPresent();
    }
    
    public List<Proyecto> obtenerProyectosEnDesarrolloDelLider(Integer liderId) {
        return proyectoRepository.findProyectosEnDesarrolloByLider(liderId);
    }
}
