package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Integer> {
    
    List<Proyecto> findByGaesId(Integer gaesId);
    
    List<Proyecto> findByAprendizLiderId(Integer aprendizLiderId);
    
    List<Proyecto> findByTrimestre(Integer trimestre);
    
    List<Proyecto> findByGaesIdAndTrimestre(Integer gaesId, Integer trimestre);
    
    @Query("SELECT p FROM Proyecto p WHERE p.aprendizLiderId = :liderId AND p.estado = 'EN_DESARROLLO'")
    List<Proyecto> findProyectosEnDesarrolloByLider(@Param("liderId") Integer liderId);
    
    Optional<Proyecto> findByNombreAndGaesId(String nombre, Integer gaesId);
}
