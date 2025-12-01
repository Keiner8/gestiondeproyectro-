package grupo6.mapeo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "administrador")
public class Administrador {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;
    
    // Constructores
    public Administrador() {
    }
    
    public Administrador(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public Administrador(Integer id, Usuario usuario) {
        this.id = id;
        this.usuario = usuario;
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
}
