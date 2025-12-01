package grupo6.mapeo.service;

import grupo6.mapeo.entity.Trimestre;
import grupo6.mapeo.entity.Trimestre.EstadoTrimestre;
import grupo6.mapeo.repository.TrimestreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrimestreService {
    
    @Autowired
    private TrimestreRepository trimestreRepository;
    
    // CREATE
    public Trimestre crearTrimestre(Trimestre trimestre) {
        return trimestreRepository.save(trimestre);
    }
    
    // READ
    public Trimestre obtenerTrimestrePorId(Integer id) {
        return trimestreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trimestre no encontrado con ID: " + id));
    }
    
    public List<Trimestre> obtenerTrimestres() {
        List<Trimestre> trimestres = trimestreRepository.findAll();
        
        // Solo retorna los trimestres, sin modificarlos
        // El estado debe ser manejado en la base de datos con un valor por defecto
        return trimestres;
    }
    
    public List<Trimestre> obtenerTrimestresporFicha(Integer fichaId) {
        return trimestreRepository.findByFichaId(fichaId);
    }
    
    public List<Trimestre> obtenerTrimestresporFichaYNumero(Integer fichaId, Integer numero) {
        return trimestreRepository.findByFichaIdAndNumero(fichaId, numero);
    }
    
    public List<Trimestre> obtenerTrimestresporEstado(EstadoTrimestre estado) {
        return trimestreRepository.findByEstado(estado);
    }
    
    public List<Trimestre> obtenerTrimestresporFichaYEstado(Integer fichaId, EstadoTrimestre estado) {
        return trimestreRepository.findByFichaIdAndEstado(fichaId, estado);
    }
    
    // UPDATE
    public Trimestre actualizarTrimestre(Integer id, Trimestre trimestreActualizado) {
        Trimestre trimestre = obtenerTrimestrePorId(id);
        trimestre.setNumero(trimestreActualizado.getNumero());
        trimestre.setFichaId(trimestreActualizado.getFichaId());
        trimestre.setFechaInicio(trimestreActualizado.getFechaInicio());
        trimestre.setFechaFin(trimestreActualizado.getFechaFin());
        trimestre.setEstado(trimestreActualizado.getEstado());
        return trimestreRepository.save(trimestre);
    }
    
    // DELETE
    public void eliminarTrimestre(Integer id) {
        trimestreRepository.deleteById(id);
    }
}
