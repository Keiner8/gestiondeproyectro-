package grupo6.mapeo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para recibir evaluaciones - Solo requiere IDs
 */
public class EvaluacionDTO {
    private Integer aprendizId;
    private Integer gaesId;
    private Integer evaluadorId;
    private BigDecimal calificacion;
    private String observaciones;
    private LocalDate fecha;
    
    // Constructores
    public EvaluacionDTO() {
    }
    
    public EvaluacionDTO(Integer aprendizId, Integer gaesId, Integer evaluadorId, 
                        BigDecimal calificacion, String observaciones, LocalDate fecha) {
        this.aprendizId = aprendizId;
        this.gaesId = gaesId;
        this.evaluadorId = evaluadorId;
        this.calificacion = calificacion;
        this.observaciones = observaciones;
        this.fecha = fecha;
    }
    
    // Getters y Setters
    public Integer getAprendizId() {
        return aprendizId;
    }
    
    public void setAprendizId(Integer aprendizId) {
        this.aprendizId = aprendizId;
    }
    
    public Integer getGaesId() {
        return gaesId;
    }
    
    public void setGaesId(Integer gaesId) {
        this.gaesId = gaesId;
    }
    
    public Integer getEvaluadorId() {
        return evaluadorId;
    }
    
    public void setEvaluadorId(Integer evaluadorId) {
        this.evaluadorId = evaluadorId;
    }
    
    public BigDecimal getCalificacion() {
        return calificacion;
    }
    
    public void setCalificacion(BigDecimal calificacion) {
        this.calificacion = calificacion;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public LocalDate getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
}
