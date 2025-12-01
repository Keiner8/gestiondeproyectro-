package grupo6.mapeo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "ficha")
public class Ficha {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "codigo_ficha", length = 20, nullable = false, unique = true)
    private String codigoFicha;
    
    @Column(name = "programa_formacion", length = 100, nullable = false)
    private String programaFormacion;
    
    @Column(name = "jornada", length = 50)
    @Enumerated(EnumType.STRING)
    private Jornada jornada;
    
    @Column(name = "modalidad", length = 50)
    @Enumerated(EnumType.STRING)
    private Modalidad modalidad;
    
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;
    
    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;
    
    @Column(name = "estado", length = 20)
    @Enumerated(EnumType.STRING)
    private EstadoFicha estado;
    
    @OneToMany(mappedBy = "ficha", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Aprendiz> aprendices;
    
    // Constructores
    public Ficha() {
    }
    
    public Ficha(String codigoFicha, String programaFormacion) {
        this.codigoFicha = codigoFicha;
        this.programaFormacion = programaFormacion;
        this.estado = EstadoFicha.ACTIVO;
    }
    
    public Ficha(String codigoFicha, String programaFormacion, Jornada jornada, 
                 Modalidad modalidad, LocalDate fechaInicio, LocalDate fechaFin) {
        this.codigoFicha = codigoFicha;
        this.programaFormacion = programaFormacion;
        this.jornada = jornada;
        this.modalidad = modalidad;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = EstadoFicha.ACTIVO;
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getCodigoFicha() {
        return codigoFicha;
    }
    
    public void setCodigoFicha(String codigoFicha) {
        this.codigoFicha = codigoFicha;
    }
    
    public String getProgramaFormacion() {
        return programaFormacion;
    }
    
    public void setProgramaFormacion(String programaFormacion) {
        this.programaFormacion = programaFormacion;
    }
    
    public Jornada getJornada() {
        return jornada;
    }
    
    public void setJornada(Jornada jornada) {
        this.jornada = jornada;
    }
    
    public Modalidad getModalidad() {
        return modalidad;
    }
    
    public void setModalidad(Modalidad modalidad) {
        this.modalidad = modalidad;
    }
    
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }
    
    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    
    public LocalDate getFechaFin() {
        return fechaFin;
    }
    
    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    
    public EstadoFicha getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoFicha estado) {
        this.estado = estado;
    }
    
    public List<Aprendiz> getAprendices() {
        return aprendices;
    }
    
    public void setAprendices(List<Aprendiz> aprendices) {
        this.aprendices = aprendices;
    }
    
    // Enums
    public enum Jornada {
        MAÑANA,
        TARDE,
        NOCHE,
        COMPLETA
    }
    
    public enum Modalidad {
        PRESENCIAL,
        VIRTUAL,
        HIBRIDA
    }
    
    public enum EstadoFicha {
        ACTIVO,
        INACTIVO,
        FINALIZADO
    }
}
