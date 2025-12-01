package grupo6.mapeo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "gaes")
public class Gaes {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;
    
    @Column(name = "ficha_id", nullable = false)
    private Integer fichaId;
    
    @Column(name = "estado", length = 50, nullable = false)
    private String estado = "ACTIVO";
    
    @OneToMany(mappedBy = "gaes", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Aprendiz> integrantes;
    
    @OneToMany(mappedBy = "gaes", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Evaluation> evaluaciones;
    
    // Constructores
    public Gaes() {
    }
    
    public Gaes(String nombre, Integer fichaId) {
        this.nombre = nombre;
        this.fichaId = fichaId;
    }
    
    public Gaes(Integer id, String nombre, Integer fichaId) {
        this.id = id;
        this.nombre = nombre;
        this.fichaId = fichaId;
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
    
    public Integer getFichaId() {
        return fichaId;
    }
    
    public void setFichaId(Integer fichaId) {
        this.fichaId = fichaId;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public List<Aprendiz> getIntegrantes() {
        return integrantes;
    }
    
    public void setIntegrantes(List<Aprendiz> integrantes) {
        this.integrantes = integrantes;
    }
    
    public List<Evaluation> getEvaluaciones() {
        return evaluaciones;
    }
    
    public void setEvaluaciones(List<Evaluation> evaluaciones) {
        this.evaluaciones = evaluaciones;
    }
}
