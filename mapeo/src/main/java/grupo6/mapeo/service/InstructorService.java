package grupo6.mapeo.service;

import grupo6.mapeo.entity.Ficha;
import grupo6.mapeo.entity.Instructor;
import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.entity.Aprendiz;
import grupo6.mapeo.dto.InstructorDTO;
import grupo6.mapeo.dto.AprendizDTO;
import grupo6.mapeo.repository.FichaRepository;
import grupo6.mapeo.repository.InstructorRepository;
import grupo6.mapeo.repository.UsuarioRepository;
import grupo6.mapeo.repository.AprendizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InstructorService {

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FichaRepository fichaRepository;

    @Autowired
    private AprendizRepository aprendizRepository;

    // CREATE
    public Instructor crearInstructor(Instructor instructor) {
        // Estado por defecto ACTIVO si no se proporciona
        if (instructor.getEstado() == null) {
            instructor.setEstado("ACTIVO");
        }

        // Si el usuario es null pero tenemos usuarioId, cargarlo desde BD
        if (instructor.getUsuario() == null && instructor.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(instructor.getUsuarioId())
                    .orElseThrow(
                            () -> new RuntimeException("Usuario no encontrado con ID: " + instructor.getUsuarioId()));
            instructor.setUsuario(usuario);
        }

        // Si la ficha es null pero tenemos fichaId, cargarla desde BD
        if (instructor.getFicha() == null && instructor.getFichaId() != null) {
            Ficha ficha = fichaRepository.findById(instructor.getFichaId())
                    .orElseThrow(() -> new RuntimeException("Ficha no encontrada con ID: " + instructor.getFichaId()));
            instructor.setFicha(ficha);
        }

        return instructorRepository.save(instructor);
    }

    // READ
    public Instructor obtenerInstructorPorId(Integer id) {
        return instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor no encontrado con ID: " + id));
    }

    public Optional<Instructor> obtenerInstructorPorUsuarioId(Integer usuarioId) {
        return instructorRepository.findByUsuario_Id(usuarioId);
    }

    public List<Instructor> obtenerInstructoresPorEspecialidad(String especialidad) {
        return instructorRepository.findByEspecialidad(especialidad);
    }

    public List<Instructor> obtenerInstructoresPorEspecialidadContaining(String especialidad) {
        return instructorRepository.findInstructoresByEspecialidadContaining(especialidad);
    }

    public List<Instructor> obtenerTodosInstructores() {
        return instructorRepository.findAll();
    }

    // UPDATE
    public Instructor actualizarInstructor(Integer id, Instructor instructorActualizado) {
        Instructor instructor = obtenerInstructorPorId(id);
        instructor.setEspecialidad(instructorActualizado.getEspecialidad());

        // Actualizar estado
        if (instructorActualizado.getEstado() != null) {
            instructor.setEstado(instructorActualizado.getEstado());
        }

        // Si tenemos usuarioId, cargarlo y asignarlo
        if (instructorActualizado.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(instructorActualizado.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException(
                            "Usuario no encontrado con ID: " + instructorActualizado.getUsuarioId()));
            instructor.setUsuario(usuario);
        } else if (instructorActualizado.getUsuario() != null) {
            instructor.setUsuario(instructorActualizado.getUsuario());
        }

        // Si tenemos fichaId, cargarla y asignarla
        if (instructorActualizado.getFichaId() != null) {
            Ficha ficha = fichaRepository.findById(instructorActualizado.getFichaId())
                    .orElseThrow(() -> new RuntimeException(
                            "Ficha no encontrada con ID: " + instructorActualizado.getFichaId()));
            instructor.setFicha(ficha);
        } else if (instructorActualizado.getFicha() != null) {
            instructor.setFicha(instructorActualizado.getFicha());
        }

        return instructorRepository.save(instructor);
    }

    // DELETE
    public void eliminarInstructor(Integer id) {
        instructorRepository.deleteById(id);
    }

    // Validaciones
    public boolean existeInstructorPorUsuario(Integer usuarioId) {
        return instructorRepository.existsByUsuario_Id(usuarioId);
    }

    // Método para convertir Instructor a InstructorDTO sin referencias circulares
    public InstructorDTO convertToDTO(Instructor instructor) {
        if (instructor == null) {
            return null;
        }

        InstructorDTO dto = new InstructorDTO();
        dto.setId(instructor.getId());
        dto.setEspecialidad(instructor.getEspecialidad());
        dto.setEstado(instructor.getEstado());

        // Datos del usuario
        if (instructor.getUsuario() != null) {
            dto.setUsuarioId(instructor.getUsuario().getId());
            dto.setUsuarioNombre(instructor.getUsuario().getNombre());
            dto.setUsuarioApellido(instructor.getUsuario().getApellido());
            dto.setUsuarioCorreo(instructor.getUsuario().getCorreo());
        }

        // Datos de la ficha
        if (instructor.getFicha() != null) {
            dto.setFichaId(instructor.getFicha().getId());
            dto.setFichaCodigoFicha(instructor.getFicha().getCodigoFicha());
            dto.setFichaProgramaFormacion(instructor.getFicha().getProgramaFormacion());
            if (instructor.getFicha().getEstado() != null) {
                dto.setFichaEstado(instructor.getFicha().getEstado().toString());
            }

            // Obtener aprendices de la ficha con usuario cargado
            List<Aprendiz> aprendices = aprendizRepository.findByFichaIdWithUser(instructor.getFicha().getId());
            List<AprendizDTO> aprendicesDTO = aprendices.stream()
                    .map(this::convertAprendizToDTO)
                    .collect(Collectors.toList());
            dto.setAprendices(aprendicesDTO);
        }

        return dto;
    }

    // Método para convertir Aprendiz a AprendizDTO
    private AprendizDTO convertAprendizToDTO(Aprendiz aprendiz) {
        if (aprendiz == null) {
            return null;
        }

        AprendizDTO dto = new AprendizDTO();
        dto.setId(aprendiz.getId());
        dto.setEsLider(aprendiz.getEsLider());
        dto.setEstado(aprendiz.getEstado());

        // Datos del usuario
        if (aprendiz.getUsuario() != null) {
            dto.setUsuarioId(aprendiz.getUsuario().getId());
            dto.setUsuarioNombre(aprendiz.getUsuario().getNombre());
            dto.setUsuarioApellido(aprendiz.getUsuario().getApellido());
            dto.setUsuarioCorreo(aprendiz.getUsuario().getCorreo());
        }

        // Datos de la ficha
        if (aprendiz.getFicha() != null) {
            dto.setFichaId(aprendiz.getFicha().getId());
            dto.setFichaCodigoFicha(aprendiz.getFicha().getCodigoFicha());
            dto.setFichaProgramaFormacion(aprendiz.getFicha().getProgramaFormacion());
        }

        // Datos del GAES
        if (aprendiz.getGaes() != null) {
            dto.setGaesId(aprendiz.getGaes().getId());
            dto.setGaesNombre(aprendiz.getGaes().getNombre());
        }

        return dto;
    }
}
