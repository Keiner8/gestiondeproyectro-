package grupo6.mapeo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "proyecto")
public class Proyecto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "gaes_id", nullable = false)
    private Integer gaesId;
    
    @Column(name = "aprendiz_lider_id")
    private Integer aprendizLiderId;
    
    @Column(name = "trimestre", nullable = false)
    private Integer trimestre;
    
    @Column(name = "documento_inicial")
    private String documentoInicial;
    
    @Column(name = "estado", length = 20)
    @Enumerated(EnumType.STRING)
    private EstadoProyecto estado;
    
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;
    
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;
    
    // Constructores
    public Proyecto() {
        this.estado = EstadoProyecto.EN_DESARROLLO;
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public Proyecto(String nombre, String descripcion, Integer gaesId, Integer aprendizLiderId, Integer trimestre) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.gaesId = gaesId;
        this.aprendizLiderId = aprendizLiderId;
        this.trimestre = trimestre;
        this.estado = EstadoProyecto.EN_DESARROLLO;
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public Integer getGaesId() {
        return gaesId;
    }
    
    public void setGaesId(Integer gaesId) {
        this.gaesId = gaesId;
    }
    
    public Integer getAprendizLiderId() {
        return aprendizLiderId;
    }
    
    public void setAprendizLiderId(Integer aprendizLiderId) {
        this.aprendizLiderId = aprendizLiderId;
    }
    
    public Integer getTrimestre() {
        return trimestre;
    }
    
    public void setTrimestre(Integer trimestre) {
        this.trimestre = trimestre;
    }
    
    public String getDocumentoInicial() {
        return documentoInicial;
    }
    
    public void setDocumentoInicial(String documentoInicial) {
        this.documentoInicial = documentoInicial;
    }
    
    public EstadoProyecto getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoProyecto estado) {
        this.estado = estado;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
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
    
    // Enums
    public enum EstadoProyecto {
        EN_DESARROLLO,
        EN_REVISION,
        APROBADO,
        RECHAZADO,
        FINALIZADO
    }
}
