package grupo6.mapeo.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO para Ficha - Evita referencias circulares en JSON
 */
public class FichaDTO {
    private Integer id;
    private String codigoFicha;
    private String programaFormacion;
    private String jornada;
    private String modalidad;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    private List<AprendizDTO> aprendices;
    
    // Constructor vacío
    public FichaDTO() {
    }
    
    // Constructor completo
    public FichaDTO(Integer id, String codigoFicha, String programaFormacion, String jornada,
                   String modalidad, LocalDate fechaInicio, LocalDate fechaFin, String estado) {
        this.id = id;
        this.codigoFicha = codigoFicha;
        this.programaFormacion = programaFormacion;
        this.jornada = jornada;
        this.modalidad = modalidad;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
    }
    
    // Getters y Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getCodigoFicha() {
        return codigoFicha;
    }
    
    public void setCodigoFicha(String codigoFicha) {
        this.codigoFicha = codigoFicha;
    }
    
    public String getProgramaFormacion() {
        return programaFormacion;
    }
    
    public void setProgramaFormacion(String programaFormacion) {
        this.programaFormacion = programaFormacion;
    }
    
    public String getJornada() {
        return jornada;
    }
    
    public void setJornada(String jornada) {
        this.jornada = jornada;
    }
    
    public String getModalidad() {
        return modalidad;
    }
    
    public void setModalidad(String modalidad) {
        this.modalidad = modalidad;
    }
    
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }
    
    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    
    public LocalDate getFechaFin() {
        return fechaFin;
    }
    
    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public List<AprendizDTO> getAprendices() {
        return aprendices;
    }
    
    public void setAprendices(List<AprendizDTO> aprendices) {
        this.aprendices = aprendices;
    }
}
