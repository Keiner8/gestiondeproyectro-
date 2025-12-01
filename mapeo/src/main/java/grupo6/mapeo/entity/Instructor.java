package grupo6.mapeo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "instructor")
public class Instructor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "especialidad", length = 100)
    private String especialidad;
    
    @Column(name = "estado", length = 20)
    private String estado;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ficha_id")
    private Ficha ficha;
    
    @Transient
    private Integer usuarioId;
    
    @Transient
    private Integer fichaId;
    
    // Constructores
    public Instructor() {
    }
    
    public Instructor(String especialidad, Usuario usuario) {
        this.especialidad = especialidad;
        this.usuario = usuario;
    }
    
    public Instructor(Integer id, String especialidad, Usuario usuario) {
        this.id = id;
        this.especialidad = especialidad;
        this.usuario = usuario;
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getEspecialidad() {
        return especialidad;
    }
    
    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
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
    
    @JsonProperty("usuarioId")
    public Integer getUsuarioId() {
        // Si el usuarioId no está set pero tenemos usuario, extraerlo de ahí
        if (usuarioId == null && usuario != null) {
            return usuario.getId();
        }
        return usuarioId;
    }
    
    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }
    
    @JsonProperty("fichaId")
    public Integer getFichaId() {
        // Si fichaId no está set pero tenemos ficha, extraerlo de ahí
        if (fichaId == null && ficha != null) {
            return ficha.getId();
        }
        return fichaId;
    }
    
    public void setFichaId(Integer fichaId) {
        this.fichaId = fichaId;
    }
}
