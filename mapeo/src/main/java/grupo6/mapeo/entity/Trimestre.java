package grupo6.mapeo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trimestre")
public class Trimestre {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "numero", nullable = false)
    private Integer numero;
    
    @Column(name = "ficha_id", nullable = false)
    private Integer fichaId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ficha_id", insertable = false, updatable = false)
    private Ficha ficha;
    
    @Column(name = "fecha_inicio")
    private java.time.LocalDate fechaInicio;
    
    @Column(name = "fecha_fin")
    private java.time.LocalDate fechaFin;
    
    @Column(name = "estado", length = 20)
    @Enumerated(EnumType.STRING)
    private EstadoTrimestre estado;
    
    // Constructores
    public Trimestre() {
    }
    
    public Trimestre(Integer numero, Integer fichaId) {
        this.numero = numero;
        this.fichaId = fichaId;
        this.estado = EstadoTrimestre.ACTIVO;
    }
    
    public Trimestre(Integer numero, Integer fichaId, java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin) {
        this.numero = numero;
        this.fichaId = fichaId;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = EstadoTrimestre.ACTIVO;
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Integer getNumero() {
        return numero;
    }
    
    public void setNumero(Integer numero) {
        this.numero = numero;
    }
    
    public Integer getFichaId() {
        return fichaId;
    }
    
    public void setFichaId(Integer fichaId) {
        this.fichaId = fichaId;
    }
    
    public java.time.LocalDate getFechaInicio() {
        return fechaInicio;
    }
    
    public void setFechaInicio(java.time.LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    
    public java.time.LocalDate getFechaFin() {
        return fechaFin;
    }
    
    public void setFechaFin(java.time.LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    
    public EstadoTrimestre getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoTrimestre estado) {
        this.estado = estado;
    }
    
    public Ficha getFicha() {
        return ficha;
    }
    
    public void setFicha(Ficha ficha) {
        this.ficha = ficha;
    }
    
    // Enum
    public enum EstadoTrimestre {
        ACTIVO,
        INACTIVO,
        FINALIZADO,
        PENDIENTE
    }
}
