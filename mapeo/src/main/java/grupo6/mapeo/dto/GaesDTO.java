package grupo6.mapeo.dto;

import java.util.List;

/**
 * DTO para GAES - Incluye integrantes sin referencias circulares
 */
public class GaesDTO {
    private Integer id;
    private String nombre;
    private Integer fichaId;
    private String estado;
    private List<AprendizDTO> integrantes;
    
    public GaesDTO() {}
    
    public GaesDTO(Integer id, String nombre, Integer fichaId, String estado) {
        this.id = id;
        this.nombre = nombre;
        this.fichaId = fichaId;
        this.estado = estado;
    }
    
    public GaesDTO(Integer id, String nombre, Integer fichaId, String estado, List<AprendizDTO> integrantes) {
        this.id = id;
        this.nombre = nombre;
        this.fichaId = fichaId;
        this.estado = estado;
        this.integrantes = integrantes;
    }
    
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
    
    public List<AprendizDTO> getIntegrantes() {
        return integrantes;
    }
    
    public void setIntegrantes(List<AprendizDTO> integrantes) {
        this.integrantes = integrantes;
    }
}
