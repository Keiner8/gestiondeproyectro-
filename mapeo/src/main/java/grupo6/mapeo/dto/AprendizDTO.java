package grupo6.mapeo.dto;

/**
 * DTO para Aprendiz - Evita referencias circulares en JSON
 */
public class AprendizDTO {
    private Integer id;
    private Integer usuarioId;
    private String usuarioNombre;
    private String usuarioApellido;
    private String usuarioCorreo;
    private Integer fichaId;
    private String fichaCodigoFicha;
    private String fichaProgramaFormacion;
    private Integer gaesId;
    private String gaesNombre;
    private Boolean esLider;
    private String estado;
    
    // Constructor vacío
    public AprendizDTO() {
    }
    
    // Constructor completo
    public AprendizDTO(Integer id, Integer usuarioId, String usuarioNombre, String usuarioApellido,
                      String usuarioCorreo, Integer fichaId, String fichaCodigoFicha,
                      String fichaProgramaFormacion, Integer gaesId, String gaesNombre,
                      Boolean esLider, String estado) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.usuarioApellido = usuarioApellido;
        this.usuarioCorreo = usuarioCorreo;
        this.fichaId = fichaId;
        this.fichaCodigoFicha = fichaCodigoFicha;
        this.fichaProgramaFormacion = fichaProgramaFormacion;
        this.gaesId = gaesId;
        this.gaesNombre = gaesNombre;
        this.esLider = esLider;
        this.estado = estado;
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
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
    
    public Integer getGaesId() {
        return gaesId;
    }
    
    public void setGaesId(Integer gaesId) {
        this.gaesId = gaesId;
    }
    
    public String getGaesNombre() {
        return gaesNombre;
    }
    
    public void setGaesNombre(String gaesNombre) {
        this.gaesNombre = gaesNombre;
    }
    
    public Boolean getEsLider() {
        return esLider;
    }
    
    public void setEsLider(Boolean esLider) {
        this.esLider = esLider;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
}
