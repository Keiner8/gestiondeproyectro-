package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Entregable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntregableRepository extends JpaRepository<Entregable, Integer> {
    
    List<Entregable> findByProyectoId(Integer proyectoId);
    
    List<Entregable> findByTrimestreId(Integer trimestreId);
    
    List<Entregable> findByProyectoIdAndTrimestreId(Integer proyectoId, Integer trimestreId);
    
    List<Entregable> findByAprendizId(Integer aprendizId);
    
    @Query("SELECT e FROM Entregable e WHERE e.proyectoId = :proyectoId ORDER BY e.id DESC")
    List<Entregable> findEntregablesByProyectoIdOrdenados(@Param("proyectoId") Integer proyectoId);
    
    // Obtener entregables por aprendiz específico (que subió el entregable)
    @Query("SELECT e FROM Entregable e WHERE e.aprendizId IS NOT NULL")
    List<Entregable> findAllEntregablesWithAprendiz();
}
