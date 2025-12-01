package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluation, Integer> {
     
     @Query("SELECT e FROM Evaluation e LEFT JOIN FETCH e.evaluador LEFT JOIN FETCH e.aprendiz LEFT JOIN FETCH e.gaes")
     List<Evaluation> findAllWithRelations();
     
     @Query("SELECT e FROM Evaluation e LEFT JOIN FETCH e.evaluador LEFT JOIN FETCH e.aprendiz LEFT JOIN FETCH e.gaes WHERE e.id = :id")
     Evaluation findByIdWithRelations(@Param("id") Integer id);
     
     List<Evaluation> findByAprendizId(Integer aprendizId);
     
     List<Evaluation> findByGaesId(Integer gaesId);
     
     List<Evaluation> findByEvaluadorId(Integer evaluadorId);
    
    @Query("SELECT e FROM Evaluation e WHERE e.aprendiz.id = :aprendizId AND e.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<Evaluation> findEvaluacionesPorAprendizYFecha(
            @Param("aprendizId") Integer aprendizId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);
    
    @Query("SELECT e FROM Evaluation e WHERE e.evaluador.id = :evaluadorId AND e.fecha >= :fecha")
    List<Evaluation> findEvaluacionesRecientesPorEvaluador(
            @Param("evaluadorId") Integer evaluadorId,
            @Param("fecha") LocalDate fecha);
    
    @Query("SELECT AVG(e.calificacion) FROM Evaluation e WHERE e.aprendiz.id = :aprendizId")
    Double obtenerPromedioCalificacionesPorAprendiz(@Param("aprendizId") Integer aprendizId);
    
    @Query("SELECT AVG(e.calificacion) FROM Evaluation e WHERE e.gaes.id = :gaesId")
    Double obtenerPromedioCalificacionesPorGaes(@Param("gaesId") Integer gaesId);
}
