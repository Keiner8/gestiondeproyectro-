package grupo6.mapeo.repository;

import grupo6.mapeo.entity.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Integer> {
    
    Optional<Administrador> findByUsuarioId(Integer usuarioId);
    
    boolean existsByUsuarioId(Integer usuarioId);
}
