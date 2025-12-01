package grupo6.mapeo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "entregable")
public class Entregable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "proyecto_id")
    private Integer proyectoId;
    
    @Column(name = "trimestre_id", nullable = true)
    private Integer trimestreId;
    
    @Column(name = "aprendiz_id")
    private Integer aprendizId;
    
    @Column(name = "url")
    private String url;
    
    @Column(name = "archivo", columnDefinition = "LONGBLOB")
    private byte[] archivo;
    
    @Column(name = "nombre_archivo")
    private String nombreArchivo;
    
    // Constructores
    public Entregable() {
    }
    
    public Entregable(String nombre) {
        this.nombre = nombre;
    }
    
    public Entregable(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }
    
    public Entregable(Integer id, String nombre, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
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
    
    public Integer getProyectoId() {
        return proyectoId;
    }
    
    public void setProyectoId(Integer proyectoId) {
        this.proyectoId = proyectoId;
    }
    
    public Integer getTrimestreId() {
        return trimestreId;
    }
    
    public void setTrimestreId(Integer trimestreId) {
        this.trimestreId = trimestreId;
    }
    
    public Integer getAprendizId() {
        return aprendizId;
    }
    
    public void setAprendizId(Integer aprendizId) {
        this.aprendizId = aprendizId;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public byte[] getArchivo() {
        return archivo;
    }
    
    public void setArchivo(byte[] archivo) {
        this.archivo = archivo;
    }
    
    public String getNombreArchivo() {
        return nombreArchivo;
    }
    
    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }
}
