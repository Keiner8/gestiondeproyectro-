package grupo6.mapeo.service;

import grupo6.mapeo.entity.Gaes;
import grupo6.mapeo.entity.Aprendiz;
import grupo6.mapeo.dto.GaesDTO;
import grupo6.mapeo.dto.AprendizDTO;
import grupo6.mapeo.repository.GaesRepository;
import grupo6.mapeo.repository.AprendizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GaesService {
    
    @Autowired
     private GaesRepository gaesRepository;
     
     @Autowired
     private AprendizRepository aprendizRepository;
    
    // CREATE
    public Gaes crearGaes(Gaes gaes) {
        return gaesRepository.save(gaes);
    }
    
    // READ
    public Gaes obtenerGaesPorId(Integer id) {
        return gaesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GAES no encontrado con ID: " + id));
    }
    
    public Optional<Gaes> obtenerGaesPorNombre(String nombre) {
        return gaesRepository.findByNombre(nombre);
    }
    
    public List<Gaes> obtenerGaesActivosPorFicha(Integer fichaId) {
        return gaesRepository.findGaesActivosByFichaId(fichaId);
    }
    
    public List<Gaes> obtenerGaesPorFicha(Integer fichaId) {
        return gaesRepository.findByFichaId(fichaId);
    }
    
    public List<Gaes> obtenerTodosGaes() {
        return gaesRepository.findAll();
    }
    
    // UPDATE
    public Gaes actualizarGaes(Integer id, Gaes gaesActualizado) {
        Gaes gaes = obtenerGaesPorId(id);
        if (gaesActualizado.getNombre() != null) {
            gaes.setNombre(gaesActualizado.getNombre());
        }
        if (gaesActualizado.getFichaId() != null) {
            gaes.setFichaId(gaesActualizado.getFichaId());
        }
        if (gaesActualizado.getEstado() != null) {
            gaes.setEstado(gaesActualizado.getEstado());
        }
        // NO actualizar evaluaciones desde el cliente para evitar orphan deletion issues
        return gaesRepository.save(gaes);
    }
    
    // DELETE
    public void eliminarGaes(Integer id) {
        gaesRepository.deleteById(id);
    }
    
    // Asignar múltiples aprendices a un GAES
    public Gaes asignarAprendicesAlGaes(Integer gaesId, List<Integer> aprendizIds) {
        Gaes gaes = obtenerGaesPorId(gaesId);
        
        // Primero, desasignar a todos los aprendices que no están en la lista
        List<Aprendiz> aprendicesActuales = aprendizRepository.findAll().stream()
                .filter(a -> gaesId.equals(a.getGaes() != null ? a.getGaes().getId() : null))
                .toList();
        
        for (Aprendiz aprendiz : aprendicesActuales) {
            if (!aprendizIds.contains(aprendiz.getId())) {
                aprendiz.setGaes(null);
                aprendizRepository.save(aprendiz);
            }
        }
        
        // Luego, asignar todos los aprendices de la lista
        for (Integer aprendizId : aprendizIds) {
            Aprendiz aprendiz = aprendizRepository.findById(aprendizId)
                    .orElseThrow(() -> new RuntimeException("Aprendiz no encontrado con ID: " + aprendizId));
            aprendiz.setGaes(gaes);
            aprendizRepository.save(aprendiz);
        }
        
        System.out.println("✓ Asignados " + aprendizIds.size() + " aprendices al GAES " + gaesId);
        return gaes;
    }
    
    // Obtener GAES con integrantes como DTO
    public GaesDTO obtenerGaesConIntegrantesDTO(Integer id) {
        Gaes gaes = obtenerGaesPorId(id);
        
        List<AprendizDTO> integrantesDTO = null;
        if (gaes.getIntegrantes() != null && !gaes.getIntegrantes().isEmpty()) {
            integrantesDTO = gaes.getIntegrantes().stream()
                .map(aprendiz -> {
                    AprendizDTO dto = new AprendizDTO();
                    dto.setId(aprendiz.getId());
                    if (aprendiz.getUsuario() != null) {
                        dto.setUsuarioId(aprendiz.getUsuario().getId());
                        dto.setUsuarioNombre(aprendiz.getUsuario().getNombre());
                        dto.setUsuarioApellido(aprendiz.getUsuario().getApellido());
                        dto.setUsuarioCorreo(aprendiz.getUsuario().getCorreo());
                    }
                    if (aprendiz.getFicha() != null) {
                        dto.setFichaId(aprendiz.getFicha().getId());
                        dto.setFichaCodigoFicha(aprendiz.getFicha().getCodigoFicha());
                        dto.setFichaProgramaFormacion(aprendiz.getFicha().getProgramaFormacion());
                    }
                    if (aprendiz.getGaes() != null) {
                        dto.setGaesId(aprendiz.getGaes().getId());
                        dto.setGaesNombre(aprendiz.getGaes().getNombre());
                    }
                    dto.setEsLider(aprendiz.getEsLider());
                    dto.setEstado(aprendiz.getEstado());
                    return dto;
                })
                .collect(Collectors.toList());
        } else {
            integrantesDTO = List.of();
        }
        
        return new GaesDTO(gaes.getId(), gaes.getNombre(), gaes.getFichaId(), gaes.getEstado(), integrantesDTO);
    }
    
    // Obtener todos los GAES con integrantes como DTO
    public List<GaesDTO> obtenerTodosGaesConIntegrantesDTO() {
        List<Gaes> gaesList = obtenerTodosGaes();
        return gaesList.stream()
            .map(gaes -> {
                List<AprendizDTO> integrantesDTO = null;
                if (gaes.getIntegrantes() != null && !gaes.getIntegrantes().isEmpty()) {
                    integrantesDTO = gaes.getIntegrantes().stream()
                        .map(aprendiz -> {
                            AprendizDTO dto = new AprendizDTO();
                            dto.setId(aprendiz.getId());
                            if (aprendiz.getUsuario() != null) {
                                dto.setUsuarioId(aprendiz.getUsuario().getId());
                                dto.setUsuarioNombre(aprendiz.getUsuario().getNombre());
                                dto.setUsuarioApellido(aprendiz.getUsuario().getApellido());
                                dto.setUsuarioCorreo(aprendiz.getUsuario().getCorreo());
                            }
                            if (aprendiz.getFicha() != null) {
                                dto.setFichaId(aprendiz.getFicha().getId());
                                dto.setFichaCodigoFicha(aprendiz.getFicha().getCodigoFicha());
                                dto.setFichaProgramaFormacion(aprendiz.getFicha().getProgramaFormacion());
                            }
                            if (aprendiz.getGaes() != null) {
                                dto.setGaesId(aprendiz.getGaes().getId());
                                dto.setGaesNombre(aprendiz.getGaes().getNombre());
                            }
                            dto.setEsLider(aprendiz.getEsLider());
                            dto.setEstado(aprendiz.getEstado());
                            return dto;
                        })
                        .collect(Collectors.toList());
                } else {
                    integrantesDTO = List.of();
                }
                
                return new GaesDTO(gaes.getId(), gaes.getNombre(), gaes.getFichaId(), gaes.getEstado(), integrantesDTO);
            })
            .collect(Collectors.toList());
    }
    
    // Obtener GAES por ficha con integrantes como DTO
    public List<GaesDTO> obtenerGaesPorFichaConIntegrantesDTO(Integer fichaId) {
        List<Gaes> gaesList = obtenerGaesPorFicha(fichaId);
        return gaesList.stream()
            .map(gaes -> {
                List<AprendizDTO> integrantesDTO = null;
                if (gaes.getIntegrantes() != null && !gaes.getIntegrantes().isEmpty()) {
                    integrantesDTO = gaes.getIntegrantes().stream()
                        .map(aprendiz -> {
                            AprendizDTO dto = new AprendizDTO();
                            dto.setId(aprendiz.getId());
                            if (aprendiz.getUsuario() != null) {
                                dto.setUsuarioId(aprendiz.getUsuario().getId());
                                dto.setUsuarioNombre(aprendiz.getUsuario().getNombre());
                                dto.setUsuarioApellido(aprendiz.getUsuario().getApellido());
                                dto.setUsuarioCorreo(aprendiz.getUsuario().getCorreo());
                            }
                            if (aprendiz.getFicha() != null) {
                                dto.setFichaId(aprendiz.getFicha().getId());
                                dto.setFichaCodigoFicha(aprendiz.getFicha().getCodigoFicha());
                                dto.setFichaProgramaFormacion(aprendiz.getFicha().getProgramaFormacion());
                            }
                            if (aprendiz.getGaes() != null) {
                                dto.setGaesId(aprendiz.getGaes().getId());
                                dto.setGaesNombre(aprendiz.getGaes().getNombre());
                            }
                            dto.setEsLider(aprendiz.getEsLider());
                            dto.setEstado(aprendiz.getEstado());
                            return dto;
                        })
                        .collect(Collectors.toList());
                } else {
                    integrantesDTO = List.of();
                }
                
                return new GaesDTO(gaes.getId(), gaes.getNombre(), gaes.getFichaId(), gaes.getEstado(), integrantesDTO);
            })
            .collect(Collectors.toList());
    }
    
    // Validaciones
    public boolean existeGaesConNombre(String nombre) {
        return gaesRepository.findByNombre(nombre).isPresent();
    }
    }
