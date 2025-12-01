package grupo6.mapeo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "evaluacion")
public class Evaluation {
     
     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Integer id;
     
     @ManyToOne
     @JoinColumn(name = "aprendiz_id", nullable = false)
     private Aprendiz aprendiz;
     
     @ManyToOne
     @JoinColumn(name = "gaes_id", nullable = false)
     private Gaes gaes;
     
     @ManyToOne
     @JoinColumn(name = "evaluador_id", nullable = false)
     private Instructor evaluador;
    
    @Column(name = "calificacion", precision = 5, scale = 2)
    private BigDecimal calificacion;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;
    
    // Constructores
    public Evaluation() {
    }
    
    public Evaluation(Aprendiz aprendiz, Gaes gaes, Instructor evaluador) {
        this.aprendiz = aprendiz;
        this.gaes = gaes;
        this.evaluador = evaluador;
        this.fecha = LocalDate.now();
    }
    
    public Evaluation(Aprendiz aprendiz, Gaes gaes, Instructor evaluador, BigDecimal calificacion, String observaciones) {
        this.aprendiz = aprendiz;
        this.gaes = gaes;
        this.evaluador = evaluador;
        this.calificacion = calificacion;
        this.observaciones = observaciones;
        this.fecha = LocalDate.now();
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Aprendiz getAprendiz() {
        return aprendiz;
    }
    
    public void setAprendiz(Aprendiz aprendiz) {
        this.aprendiz = aprendiz;
    }
    
    public Gaes getGaes() {
        return gaes;
    }
    
    public void setGaes(Gaes gaes) {
        this.gaes = gaes;
    }
    
    public Instructor getEvaluador() {
        return evaluador;
    }
    
    public void setEvaluador(Instructor evaluador) {
        this.evaluador = evaluador;
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
