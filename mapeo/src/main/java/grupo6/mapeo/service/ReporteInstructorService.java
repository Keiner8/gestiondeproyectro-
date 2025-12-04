package grupo6.mapeo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@Service
public class ReporteInstructorService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 2.1 Aprendices por GAES que atiende un instructor
     */
    public List<Map<String, Object>> obtenerReporteAprendicesGaes(Integer instructorId, String gaes) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT DISTINCT ")
           .append("CONCAT(u.nombre, ' ', u.apellido) AS aprendiz, ")
           .append("g.nombre AS gaes, ")
           .append("f.codigo_ficha ")
           .append("FROM instructor i ")
           .append("INNER JOIN ficha f ON f.id = i.ficha_id ")
           .append("INNER JOIN aprendiz a ON a.ficha_id = f.id ")
           .append("INNER JOIN usuario u ON u.id = a.usuario_id ")
           .append("INNER JOIN aprendiz_gaes ag ON ag.aprendiz_id = a.id ")
           .append("INNER JOIN gaes g ON g.id = ag.gaes_id ")
           .append("WHERE i.id = ? ");

        if (gaes != null && !gaes.isEmpty()) {
            sql.append("AND g.nombre LIKE ? ");
        }

        sql.append("ORDER BY g.nombre, u.apellido");

        if (gaes != null && !gaes.isEmpty()) {
            return jdbcTemplate.queryForList(sql.toString(), instructorId, "%" + gaes + "%");
        } else {
            return jdbcTemplate.queryForList(sql.toString(), instructorId);
        }
    }

    /**
     * 2.2 Proyectos asignados al instructor
     */
    public List<Map<String, Object>> obtenerReporteProyectosAsignados(Integer instructorId, String estado) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT DISTINCT ")
           .append("p.nombre AS proyecto, ")
           .append("g.nombre AS gaes, ")
           .append("p.estado, ")
           .append("p.fecha_inicio, ")
           .append("p.fecha_fin ")
           .append("FROM proyecto p ")
           .append("INNER JOIN gaes g ON g.id = p.gaes_id ")
           .append("INNER JOIN aprendiz_gaes ag ON ag.gaes_id = g.id ")
           .append("INNER JOIN aprendiz a ON a.id = ag.aprendiz_id ")
           .append("INNER JOIN ficha f ON f.id = a.ficha_id ")
           .append("WHERE f.id = (SELECT ficha_id FROM instructor WHERE id = ?) ");

        if (estado != null && !estado.isEmpty()) {
            sql.append("AND p.estado = ? ");
        }

        sql.append("ORDER BY p.nombre");

        if (estado != null && !estado.isEmpty()) {
            return jdbcTemplate.queryForList(sql.toString(), instructorId, estado);
        } else {
            return jdbcTemplate.queryForList(sql.toString(), instructorId);
        }
    }

    /**
     * 2.3 Entregables de un proyecto por trimestre
     */
    public List<Map<String, Object>> obtenerReporteEntregablesProyecto(Integer proyectoId) {
        String sql = "SELECT " +
                "p.nombre AS proyecto, " +
                "t.numero AS trimestre, " +
                "en.nombre AS entregable, " +
                "en.descripcion " +
                "FROM entregable en " +
                "INNER JOIN proyecto p ON p.id = en.proyecto_id " +
                "INNER JOIN trimestre t ON t.id = en.trimestre_id " +
                "WHERE p.id = ? " +
                "ORDER BY t.numero";

        return jdbcTemplate.queryForList(sql, proyectoId);
    }

    /**
     * 2.4 Evaluaciones realizadas por el instructor
     */
    public List<Map<String, Object>> obtenerReporteEvaluacionesRealizadas(Integer instructorId, String gaes) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ")
           .append("en.nombre AS entregable, ")
           .append("g.nombre AS gaes, ")
           .append("CONCAT(u.nombre, ' ', u.apellido) AS aprendiz, ")
           .append("e.calificacion, ")
           .append("e.observaciones, ")
           .append("e.fecha ")
           .append("FROM evaluacion e ")
           .append("LEFT JOIN aprendiz a ON a.id = e.aprendiz_id ")
           .append("LEFT JOIN usuario u ON u.id = a.usuario_id ")
           .append("LEFT JOIN gaes g ON g.id = e.gaes_id ")
           .append("LEFT JOIN entregable en ON en.id = e.entregable_id ")
           .append("WHERE e.evaluador_id = ? ");

        if (gaes != null && !gaes.isEmpty()) {
            sql.append("AND g.nombre LIKE ? ");
        }

        sql.append("ORDER BY e.fecha DESC");

        if (gaes != null && !gaes.isEmpty()) {
            return jdbcTemplate.queryForList(sql.toString(), instructorId, "%" + gaes + "%");
        } else {
            return jdbcTemplate.queryForList(sql.toString(), instructorId);
        }
    }

    /**
     * 2.5 Resumen de calificaciones por GAES
     */
    public List<Map<String, Object>> obtenerReporteResumenCalificaciones(Integer instructorId) {
        String sql = "SELECT " +
                "g.nombre AS gaes, " +
                "AVG(e.calificacion) AS promedio_calificacion, " +
                "COUNT(e.id) AS entregas_evaluadas " +
                "FROM evaluacion e " +
                "INNER JOIN gaes g ON g.id = e.gaes_id " +
                "WHERE e.evaluador_id = ? " +
                "GROUP BY g.nombre " +
                "ORDER BY g.nombre";

        return jdbcTemplate.queryForList(sql, instructorId);
    }
}
