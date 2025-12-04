package grupo6.mapeo.dto;

import java.time.LocalDate;

/**
 * DTO para Trimestre - Evita referencias circulares en JSON
 */
public class TrimestreDTO {
    private Integer id;
    private Integer numero;
    private Integer fichaId;
    private FichaDTO ficha;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    
    // Constructor vacío
    public TrimestreDTO() {
    }
    
    // Constructor básico
    public TrimestreDTO(Integer id, Integer numero, Integer fichaId, LocalDate fechaInicio, 
                       LocalDate fechaFin, String estado) {
        this.id = id;
        this.numero = numero;
        this.fichaId = fichaId;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
    }
    
    // Constructor con ficha
    public TrimestreDTO(Integer id, Integer numero, Integer fichaId, FichaDTO ficha,
                       LocalDate fechaInicio, LocalDate fechaFin, String estado) {
        this.id = id;
        this.numero = numero;
        this.fichaId = fichaId;
        this.ficha = ficha;
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
    
    public Integer getNumero() {
        return numero;
    }
    
    public void setNumero(Integer numero) {
        this.numero = numero;
    }
    
    public Integer getFichaId() {
        return fichaId;
    }
    
    public void setFichaId(Integer fichaId) {
        this.fichaId = fichaId;
    }
    
    public FichaDTO getFicha() {
        return ficha;
    }
    
    public void setFicha(FichaDTO ficha) {
        this.ficha = ficha;
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
}
