package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Aprendiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AprendizRepository extends JpaRepository<Aprendiz, Integer> {
    
    Optional<Aprendiz> findByUsuarioId(Integer usuarioId);
    
    List<Aprendiz> findByUsuarioIdOrderByIdDesc(Integer usuarioId);
    
    List<Aprendiz> findByFichaId(Integer fichaId);
    
    @Query("SELECT a FROM Aprendiz a WHERE a.ficha.id = :fichaId")
    List<Aprendiz> findAprendicesByFichaId(@Param("fichaId") Integer fichaId);
    
    @Query("SELECT a FROM Aprendiz a JOIN FETCH a.usuario WHERE a.ficha.id = :fichaId")
    List<Aprendiz> findByFichaIdWithUser(@Param("fichaId") Integer fichaId);
    
    boolean existsByUsuarioId(Integer usuarioId);
}
