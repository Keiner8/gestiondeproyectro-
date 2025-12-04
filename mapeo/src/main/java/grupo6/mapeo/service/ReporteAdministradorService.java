package grupo6.mapeo.service;

import grupo6.mapeo.dto.UsuarioReporteDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteAdministradorService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 1.1 Reporte general de usuarios
     */
    public List<UsuarioReporteDTO> obtenerReporteGeneralUsuarios() {
        String sql = "SELECT " +
                "u.id, " +
                "u.nombre, " +
                "u.apellido, " +
                "u.correo, " +
                "u.tipo_documento, " +
                "u.numero_documento, " +
                "COALESCE(r.nombre_rol, 'Sin Rol') AS rol, " +
                "COALESCE(u.estado, 'ACTIVO') AS estado " +
                "FROM usuario u " +
                "LEFT JOIN rol r ON u.rol_id = r.id " +
                "ORDER BY r.nombre_rol, u.apellido";
        
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        return result.stream().map(row -> new UsuarioReporteDTO(
            ((Number) row.get("id")).intValue(),
            (String) row.get("nombre"),
            (String) row.get("apellido"),
            (String) row.get("correo"),
            (String) row.get("tipo_documento"),
            (String) row.get("numero_documento"),
            (String) row.get("rol"),
            (String) row.get("estado")
        )).collect(Collectors.toList());
    }
    
    /**
     * 1.2 Reporte de fichas con sus aprendices
     */
    public List<Map<String, Object>> obtenerReporteFichasAprendices() {
        String sql = "SELECT " +
                "f.codigo_ficha, " +
                "f.programa_formacion, " +
                "f.jornada, " +
                "f.modalidad, " +
                "CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) AS aprendiz, " +
                "COALESCE(u.numero_documento, 'N/A') AS numero_documento, " +
                "COALESCE(f.estado, 'ACTIVO') AS estado " +
                "FROM ficha f " +
                "INNER JOIN aprendiz a ON a.ficha_id = f.id " +
                "INNER JOIN usuario u ON u.id = a.usuario_id " +
                "ORDER BY f.codigo_ficha, aprendiz";
        return jdbcTemplate.queryForList(sql);
    }
    
    /**
     * 1.3 Reporte de instructores con especialidad
     */
    public List<Map<String, Object>> obtenerReporteInstructoresEspecialidad() {
        String sql = "SELECT " +
                "CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) AS instructor, " +
                "u.correo, " +
                "COALESCE(i.especialidad, 'N/A') AS especialidad, " +
                "u.estado " +
                "FROM instructor i " +
                "INNER JOIN usuario u ON u.id = i.usuario_id " +
                "ORDER BY instructor";
        return jdbcTemplate.queryForList(sql);
    }
    
    /**
     * 1.4 Reporte de trimestres por ficha
     */
    public List<Map<String, Object>> obtenerReporteTrimestresPerFicha() {
        String sql = "SELECT " +
                "f.codigo_ficha, " +
                "t.numero AS trimestre, " +
                "t.fecha_inicio, " +
                "t.fecha_fin, " +
                "COALESCE(t.estado, 'ACTIVO') AS estado " +
                "FROM trimestre t " +
                "INNER JOIN ficha f ON f.id = t.ficha_id " +
                "ORDER BY f.codigo_ficha, t.numero";
        return jdbcTemplate.queryForList(sql);
    }
    
    /**
     * 1.5 Reporte general de proyectos por GAES
     */
    public List<Map<String, Object>> obtenerReporteProyectosGaes() {
        String sql = "SELECT " +
                "g.nombre AS gaes, " +
                "p.nombre AS proyecto, " +
                "COALESCE(p.estado, 'en_proceso') AS estado, " +
                "p.fecha_inicio, " +
                "p.fecha_fin " +
                "FROM proyecto p " +
                "INNER JOIN gaes g ON g.id = p.gaes_id " +
                "ORDER BY g.nombre, p.nombre";
        return jdbcTemplate.queryForList(sql);
    }
}
