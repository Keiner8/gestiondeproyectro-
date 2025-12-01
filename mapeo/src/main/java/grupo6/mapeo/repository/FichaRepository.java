package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Ficha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FichaRepository extends JpaRepository<Ficha, Integer> {
    
    Optional<Ficha> findByCodigoFicha(String codigoFicha);
    
    @Query("SELECT f FROM Ficha f WHERE LOWER(f.programaFormacion) LIKE LOWER(CONCAT('%', :programa, '%'))")
    List<Ficha> findByProgramaFormacionContaining(@Param("programa") String programa);
    
    List<Ficha> findByEstado(Ficha.EstadoFicha estado);
    
    @Query("SELECT f FROM Ficha f WHERE f.fechaInicio <= :fecha AND f.fechaFin >= :fecha")
    List<Ficha> findFichasActivasEnFecha(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT f FROM Ficha f WHERE f.estado = 'ACTIVO'")
    List<Ficha> findFichasActivas();
    
    @Query("SELECT f FROM Ficha f WHERE f.estado = 'FINALIZADO'")
    List<Ficha> findFichasFinalizadas();
}
