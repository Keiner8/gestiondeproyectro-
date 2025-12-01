package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Trimestre;
import grupo6.mapeo.entity.Trimestre.EstadoTrimestre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrimestreRepository extends JpaRepository<Trimestre, Integer> {
    List<Trimestre> findByFichaId(Integer fichaId);
    
    List<Trimestre> findByFichaIdAndNumero(Integer fichaId, Integer numero);
    
    List<Trimestre> findByEstado(EstadoTrimestre estado);
    
    List<Trimestre> findByFichaIdAndEstado(Integer fichaId, EstadoTrimestre estado);
}
