package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Integer> {
    
    Optional<Instructor> findByUsuario_Id(Integer usuarioId);
    
    List<Instructor> findByEspecialidad(String especialidad);
    
    @Query("SELECT i FROM Instructor i WHERE LOWER(i.especialidad) LIKE LOWER(CONCAT('%', :especialidad, '%'))")
    List<Instructor> findInstructoresByEspecialidadContaining(@Param("especialidad") String especialidad);
    
    boolean existsByUsuario_Id(Integer usuarioId);
}
