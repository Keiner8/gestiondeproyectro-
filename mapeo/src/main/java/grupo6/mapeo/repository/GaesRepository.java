package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Gaes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GaesRepository extends JpaRepository<Gaes, Integer> {
    
    Optional<Gaes> findByNombre(String nombre);
    
    List<Gaes> findByFichaId(Integer fichaId);
    
    @Query("SELECT g FROM Gaes g WHERE g.fichaId = :fichaId AND g.estado = 'ACTIVO'")
    List<Gaes> findGaesActivosByFichaId(@Param("fichaId") Integer fichaId);
}
