package grupo6.mapeo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "aprendiz")
public class Aprendiz {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "ficha_id")
    private Ficha ficha;
    
    @ManyToOne
    @JoinColumn(name = "gaes_id")
    private Gaes gaes;
    
    @Column(name = "es_lider", nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean esLider = false;
    
    @Column(name = "estado", nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'ACTIVO'")
    private String estado = "ACTIVO";
    
    // Constructores
    public Aprendiz() {
    }
    
    public Aprendiz(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public Aprendiz(Usuario usuario, Ficha ficha) {
        this.usuario = usuario;
        this.ficha = ficha;
    }
    
    public Aprendiz(Integer id, Usuario usuario, Ficha ficha) {
        this.id = id;
        this.usuario = usuario;
        this.ficha = ficha;
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public Ficha getFicha() {
        return ficha;
    }
    
    public void setFicha(Ficha ficha) {
        this.ficha = ficha;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public Gaes getGaes() {
        return gaes;
    }
    
    public void setGaes(Gaes gaes) {
        this.gaes = gaes;
    }
    
    public Boolean getEsLider() {
        return esLider;
    }
    
    public void setEsLider(Boolean esLider) {
        this.esLider = esLider;
    }
}
