package grupo6.mapeo.dto;

public class LoginResponse {
    private String token;
    private Integer usuarioId;
    private String nombre;
    private String apellido;
    private String correo;
    private String rol;
    private String dashboard;
    
    public LoginResponse() {
    }
    
    public LoginResponse(String token, Integer usuarioId, String nombre, String apellido, 
                         String correo, String rol, String dashboard) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.rol = rol;
        this.dashboard = dashboard;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public Integer getUsuarioId() {
        return usuarioId;
    }
    
    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getApellido() {
        return apellido;
    }
    
    public void setApellido(String apellido) {
        this.apellido = apellido;
    }
    
    public String getCorreo() {
        return correo;
    }
    
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    
    public String getRol() {
        return rol;
    }
    
    public void setRol(String rol) {
        this.rol = rol;
    }
    
    public String getDashboard() {
        return dashboard;
    }
    
    public void setDashboard(String dashboard) {
        this.dashboard = dashboard;
    }
}
