package grupo6.mapeo.service;

import grupo6.mapeo.entity.Ficha;
import grupo6.mapeo.entity.Aprendiz;
import grupo6.mapeo.dto.FichaDTO;
import grupo6.mapeo.dto.AprendizDTO;
import grupo6.mapeo.repository.FichaRepository;
import grupo6.mapeo.repository.AprendizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FichaService {
    
    @Autowired
    private FichaRepository fichaRepository;
    
    @Autowired
    private AprendizRepository aprendizRepository;
    
    // CREATE
    public Ficha crearFicha(Ficha ficha) {
        ficha.setEstado(Ficha.EstadoFicha.ACTIVO);
        return fichaRepository.save(ficha);
    }
    
    // READ
    public Ficha obtenerFichaPorId(Integer id) {
        return fichaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ficha no encontrada con ID: " + id));
    }
    
    public Optional<Ficha> obtenerFichaPorCodigo(String codigoFicha) {
        return fichaRepository.findByCodigoFicha(codigoFicha);
    }
    
    public List<Ficha> obtenerFichasPorPrograma(String programa) {
        return fichaRepository.findByProgramaFormacionContaining(programa);
    }
    
    public List<Ficha> obtenerFichasPorEstado(Ficha.EstadoFicha estado) {
        return fichaRepository.findByEstado(estado);
    }
    
    public List<Ficha> obtenerFichasActivasEnFecha(LocalDate fecha) {
        return fichaRepository.findFichasActivasEnFecha(fecha);
    }
    
    public List<Ficha> obtenerFichasActivas() {
        return fichaRepository.findFichasActivas();
    }
    
    public List<Ficha> obtenerFichasFinalizadas() {
        return fichaRepository.findFichasFinalizadas();
    }
    
    public List<Ficha> obtenerTodasFichas() {
        List<Ficha> fichas = fichaRepository.findAll();
        
        // Asigna estado por defecto si está NULL
        fichas.forEach(ficha -> {
            if (ficha.getEstado() == null) {
                ficha.setEstado(Ficha.EstadoFicha.ACTIVO);
                fichaRepository.save(ficha);
            }
        });
        
        return fichas;
    }
    
    // UPDATE
    public Ficha actualizarFicha(Integer id, Ficha fichaActualizada) {
        Ficha ficha = obtenerFichaPorId(id);
        ficha.setCodigoFicha(fichaActualizada.getCodigoFicha());
        ficha.setProgramaFormacion(fichaActualizada.getProgramaFormacion());
        ficha.setJornada(fichaActualizada.getJornada());
        ficha.setModalidad(fichaActualizada.getModalidad());
        ficha.setFechaInicio(fichaActualizada.getFechaInicio());
        ficha.setFechaFin(fichaActualizada.getFechaFin());
        ficha.setEstado(fichaActualizada.getEstado());
        return fichaRepository.save(ficha);
    }
    
    public Ficha cambiarEstadoFicha(Integer id, Ficha.EstadoFicha nuevoEstado) {
        Ficha ficha = obtenerFichaPorId(id);
        ficha.setEstado(nuevoEstado);
        return fichaRepository.save(ficha);
    }
    
    // DESACTIVAR (cambiar estado a INACTIVO)
    public Ficha desactivarFicha(Integer id) {
        Ficha ficha = obtenerFichaPorId(id);
        ficha.setEstado(Ficha.EstadoFicha.INACTIVO);
        return fichaRepository.save(ficha);
    }
    
    // ACTIVAR (cambiar estado a ACTIVO)
    public Ficha activarFicha(Integer id) {
        Ficha ficha = obtenerFichaPorId(id);
        ficha.setEstado(Ficha.EstadoFicha.ACTIVO);
        return fichaRepository.save(ficha);
    }
    
    // DELETE
    public void eliminarFicha(Integer id) {
        fichaRepository.deleteById(id);
    }
    
    // Convertir Ficha a FichaDTO con aprendices incluidos
    public FichaDTO convertToDTO(Ficha ficha) {
        if (ficha == null) {
            return null;
        }
        
        FichaDTO dto = new FichaDTO(
                ficha.getId(),
                ficha.getCodigoFicha(),
                ficha.getProgramaFormacion(),
                ficha.getJornada() != null ? ficha.getJornada().toString() : null,
                ficha.getModalidad() != null ? ficha.getModalidad().toString() : null,
                ficha.getFechaInicio(),
                ficha.getFechaFin(),
                ficha.getEstado() != null ? ficha.getEstado().toString() : null
        );
        
        // Cargar aprendices de la ficha con usuario cargado (JOIN FETCH)
        List<Aprendiz> aprendices = aprendizRepository.findByFichaIdWithUser(ficha.getId());
        List<AprendizDTO> aprendicesDTO = aprendices.stream()
                .map(a -> {
                    AprendizDTO aDto = new AprendizDTO();
                    aDto.setId(a.getId());
                    aDto.setEsLider(a.getEsLider());
                    aDto.setEstado(a.getEstado());
                    
                    if (a.getUsuario() != null) {
                        aDto.setUsuarioId(a.getUsuario().getId());
                        aDto.setUsuarioNombre(a.getUsuario().getNombre());
                        aDto.setUsuarioApellido(a.getUsuario().getApellido());
                        aDto.setUsuarioCorreo(a.getUsuario().getCorreo());
                    }
                    
                    if (a.getFicha() != null) {
                        aDto.setFichaId(a.getFicha().getId());
                        aDto.setFichaCodigoFicha(a.getFicha().getCodigoFicha());
                        aDto.setFichaProgramaFormacion(a.getFicha().getProgramaFormacion());
                    }
                    
                    if (a.getGaes() != null) {
                        aDto.setGaesId(a.getGaes().getId());
                        aDto.setGaesNombre(a.getGaes().getNombre());
                    }
                    
                    return aDto;
                })
                .collect(Collectors.toList());
        
        dto.setAprendices(aprendicesDTO);
        return dto;
    }
}
