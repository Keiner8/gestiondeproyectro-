package grupo6.mapeo.service;

import grupo6.mapeo.entity.Entregable;
import grupo6.mapeo.repository.EntregableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EntregableService {
    
    @Autowired
    private EntregableRepository entregableRepository;
    
    // CREATE
    public Entregable crearEntregable(Entregable entregable) {
        return entregableRepository.save(entregable);
    }
    
    // READ
    public Entregable obtenerEntregablePorId(Integer id) {
        return entregableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entregable no encontrado con ID: " + id));
    }
    
    public List<Entregable> obtenerEntregablesPorProyecto(Integer proyectoId) {
        return entregableRepository.findByProyectoId(proyectoId);
    }
    
    public List<Entregable> obtenerEntregablesPorTrimestre(Integer trimestreId) {
        return entregableRepository.findByTrimestreId(trimestreId);
    }
    
    public List<Entregable> obtenerEntregablesPorProyectoYTrimestre(Integer proyectoId, Integer trimestreId) {
        return entregableRepository.findByProyectoIdAndTrimestreId(proyectoId, trimestreId);
    }
    
    public List<Entregable> obtenerTodosEntregables() {
        return entregableRepository.findAll();
    }
    
    // UPDATE
    public Entregable actualizarEntregable(Integer id, Entregable entregableActualizado) {
        Entregable entregable = obtenerEntregablePorId(id);
        entregable.setNombre(entregableActualizado.getNombre());
        entregable.setDescripcion(entregableActualizado.getDescripcion());
        entregable.setProyectoId(entregableActualizado.getProyectoId());
        entregable.setTrimestreId(entregableActualizado.getTrimestreId());
        return entregableRepository.save(entregable);
    }
    
    // DELETE
    public void eliminarEntregable(Integer id) {
        entregableRepository.deleteById(id);
    }
    
    // Métodos adicionales
    public List<Entregable> obtenerEntregablesOrdenados(Integer proyectoId) {
        return entregableRepository.findEntregablesByProyectoIdOrdenados(proyectoId);
    }
    
    public List<Entregable> obtenerEntregablesPorAprendizId(Integer aprendizId) {
        return entregableRepository.findByAprendizId(aprendizId);
    }
}
