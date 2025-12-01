package grupo6.mapeo.dto;

import java.util.List;

/**
 * DTO para Instructor - Evita referencias circulares en JSON
 */
public class InstructorDTO {
    private Integer id;
    private String especialidad;
    private String estado;
    private Integer usuarioId;
    private String usuarioNombre;
    private String usuarioApellido;
    private String usuarioCorreo;
    private Integer fichaId;
    private String fichaCodigoFicha;
    private String fichaProgramaFormacion;
    private String fichaEstado;
    private List<AprendizDTO> aprendices;
    
    // Constructor vacío
    public InstructorDTO() {
    }
    
    // Constructor completo
    public InstructorDTO(Integer id, String especialidad, String estado, Integer usuarioId,
                        String usuarioNombre, String usuarioApellido, String usuarioCorreo,
                        Integer fichaId, String fichaCodigoFicha, String fichaProgramaFormacion,
                        String fichaEstado) {
        this.id = id;
        this.especialidad = especialidad;
        this.estado = estado;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.usuarioApellido = usuarioApellido;
        this.usuarioCorreo = usuarioCorreo;
        this.fichaId = fichaId;
        this.fichaCodigoFicha = fichaCodigoFicha;
        this.fichaProgramaFormacion = fichaProgramaFormacion;
        this.fichaEstado = fichaEstado;
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
    
    public Integer getUsuarioId() {
        return usuarioId;
    }
    
    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }
    
    public String getUsuarioNombre() {
        return usuarioNombre;
    }
    
    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }
    
    public String getUsuarioApellido() {
        return usuarioApellido;
    }
    
    public void setUsuarioApellido(String usuarioApellido) {
        this.usuarioApellido = usuarioApellido;
    }
    
    public String getUsuarioCorreo() {
        return usuarioCorreo;
    }
    
    public void setUsuarioCorreo(String usuarioCorreo) {
        this.usuarioCorreo = usuarioCorreo;
    }
    
    public Integer getFichaId() {
        return fichaId;
    }
    
    public void setFichaId(Integer fichaId) {
        this.fichaId = fichaId;
    }
    
    public String getFichaCodigoFicha() {
        return fichaCodigoFicha;
    }
    
    public void setFichaCodigoFicha(String fichaCodigoFicha) {
        this.fichaCodigoFicha = fichaCodigoFicha;
    }
    
    public String getFichaProgramaFormacion() {
        return fichaProgramaFormacion;
    }
    
    public void setFichaProgramaFormacion(String fichaProgramaFormacion) {
        this.fichaProgramaFormacion = fichaProgramaFormacion;
    }
    
    public String getFichaEstado() {
        return fichaEstado;
    }
    
    public void setFichaEstado(String fichaEstado) {
        this.fichaEstado = fichaEstado;
    }
    
    public List<AprendizDTO> getAprendices() {
        return aprendices;
    }
    
    public void setAprendices(List<AprendizDTO> aprendices) {
        this.aprendices = aprendices;
    }
}
