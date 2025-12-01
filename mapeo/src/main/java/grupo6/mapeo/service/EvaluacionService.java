package grupo6.mapeo.service;

import grupo6.mapeo.entity.Evaluation;
import grupo6.mapeo.entity.Aprendiz;
import grupo6.mapeo.entity.Gaes;
import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.entity.Instructor;
import grupo6.mapeo.dto.EvaluacionDTO;
import grupo6.mapeo.repository.EvaluacionRepository;
import grupo6.mapeo.repository.AprendizRepository;
import grupo6.mapeo.repository.GaesRepository;
import grupo6.mapeo.repository.UsuarioRepository;
import grupo6.mapeo.repository.InstructorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class EvaluacionService {
     
     @Autowired
      private EvaluacionRepository evaluacionRepository;
       
      @Autowired
      private AprendizRepository aprendizRepository;
      
      @Autowired
      private GaesRepository gaesRepository;
      
      @Autowired
      private UsuarioRepository usuarioRepository;
      
      @Autowired
      private InstructorRepository instructorRepository;
     
     // CREATE - Desde DTO (IDs solamente)
     public Evaluation crearEvaluacionDesdeDTO(EvaluacionDTO dto) {
         System.out.println("DEBUG: Creando evaluación desde DTO");
         System.out.println("DEBUG - AprendizId: " + dto.getAprendizId());
         System.out.println("DEBUG - GaesId: " + dto.getGaesId());
         System.out.println("DEBUG - EvaluadorId: " + dto.getEvaluadorId());
         
         // Validar que los IDs sean proporcionados
         if (dto.getAprendizId() == null) {
             throw new RuntimeException("El aprendizId es requerido");
         }
         if (dto.getGaesId() == null) {
             throw new RuntimeException("El gaesId es requerido");
         }
         if (dto.getEvaluadorId() == null) {
             throw new RuntimeException("El evaluadorId es requerido");
         }
         
         // Resolver entidades por ID
         System.out.println("DEBUG - Buscando aprendiz con ID: " + dto.getAprendizId());
         Aprendiz aprendiz = aprendizRepository.findById(dto.getAprendizId())
                 .orElseThrow(() -> new RuntimeException("Aprendiz no encontrado con ID: " + dto.getAprendizId()));
         System.out.println("DEBUG - Aprendiz encontrado: " + aprendiz.getId());
         
         System.out.println("DEBUG - Buscando GAES con ID: " + dto.getGaesId());
         Gaes gaes = gaesRepository.findById(dto.getGaesId())
                 .orElseThrow(() -> new RuntimeException("GAES no encontrado con ID: " + dto.getGaesId()));
         System.out.println("DEBUG - GAES encontrado: " + gaes.getId());
         
         System.out.println("DEBUG - Buscando evaluador (instructor) con ID: " + dto.getEvaluadorId());
         Instructor evaluador = instructorRepository.findById(dto.getEvaluadorId())
                 .orElseThrow(() -> new RuntimeException("Instructor evaluador no encontrado con ID: " + dto.getEvaluadorId()));
         System.out.println("DEBUG - Instructor encontrado: " + evaluador.getId());
         
         // Crear la evaluación
         Evaluation evaluacion = new Evaluation();
         evaluacion.setAprendiz(aprendiz);
         evaluacion.setGaes(gaes);
         evaluacion.setEvaluador(evaluador);
         evaluacion.setCalificacion(dto.getCalificacion());
         evaluacion.setObservaciones(dto.getObservaciones());
         evaluacion.setFecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now());
         
         System.out.println("DEBUG - Guardando evaluación");
         return evaluacionRepository.save(evaluacion);
     }
     
     // CREATE - Desde Evaluation (legacy)
     public Evaluation crearEvaluacion(Evaluation evaluacion) {
         System.out.println("DEBUG: Creando evaluación");
         System.out.println("DEBUG - Aprendiz: " + evaluacion.getAprendiz());
         System.out.println("DEBUG - GAES: " + evaluacion.getGaes());
         System.out.println("DEBUG - Evaluador: " + evaluacion.getEvaluador());
         
         // Validar que aprendiz no sea nulo
         if (evaluacion.getAprendiz() == null || evaluacion.getAprendiz().getId() == null) {
             throw new RuntimeException("El aprendiz es requerido y no puede ser nulo");
         }
         
         if (evaluacion.getGaes() == null || evaluacion.getGaes().getId() == null) {
             throw new RuntimeException("El GAES es requerido y no puede ser nulo");
         }
         
         if (evaluacion.getEvaluador() == null || evaluacion.getEvaluador().getId() == null) {
             throw new RuntimeException("El evaluador es requerido y no puede ser nulo");
         }
         
         // Resolver entidades por ID
         System.out.println("DEBUG - Buscando aprendiz con ID: " + evaluacion.getAprendiz().getId());
         Aprendiz aprendiz = aprendizRepository.findById(evaluacion.getAprendiz().getId())
                 .orElseThrow(() -> new RuntimeException("Aprendiz no encontrado con ID: " + evaluacion.getAprendiz().getId()));
         evaluacion.setAprendiz(aprendiz);
         System.out.println("DEBUG - Aprendiz encontrado: " + aprendiz.getId());
         
         System.out.println("DEBUG - Buscando GAES con ID: " + evaluacion.getGaes().getId());
         Gaes gaes = gaesRepository.findById(evaluacion.getGaes().getId())
                 .orElseThrow(() -> new RuntimeException("GAES no encontrado con ID: " + evaluacion.getGaes().getId()));
         evaluacion.setGaes(gaes);
         System.out.println("DEBUG - GAES encontrado: " + gaes.getId());
         
         System.out.println("DEBUG - Buscando evaluador (instructor) con ID: " + evaluacion.getEvaluador().getId());
         Instructor evaluador = instructorRepository.findById(evaluacion.getEvaluador().getId())
                 .orElseThrow(() -> new RuntimeException("Instructor evaluador no encontrado con ID: " + evaluacion.getEvaluador().getId()));
         evaluacion.setEvaluador(evaluador);
         System.out.println("DEBUG - Instructor encontrado: " + evaluador.getId());
         
         evaluacion.setFecha(LocalDate.now());
         System.out.println("DEBUG - Guardando evaluación");
         return evaluacionRepository.save(evaluacion);
     }
    
    // READ
    public Evaluation obtenerEvaluacionPorId(Integer id) {
        Evaluation evaluacion = evaluacionRepository.findByIdWithRelations(id);
        if (evaluacion == null) {
            throw new RuntimeException("Evaluación no encontrada con ID: " + id);
        }
        return evaluacion;
    }
    
    public List<Evaluation> obtenerEvaluacionesPorAprendiz(Integer aprendizId) {
        return evaluacionRepository.findByAprendizId(aprendizId);
    }
    
    public List<Evaluation> obtenerEvaluacionesPorGaes(Integer gaesId) {
        return evaluacionRepository.findByGaesId(gaesId);
    }
    
    public List<Evaluation> obtenerEvaluacionesPorEvaluador(Integer evaluadorId) {
        return evaluacionRepository.findByEvaluadorId(evaluadorId);
    }
    
    public List<Evaluation> obtenerEvaluacionesPorAprendizYFecha(Integer aprendizId, LocalDate fechaInicio, LocalDate fechaFin) {
        return evaluacionRepository.findEvaluacionesPorAprendizYFecha(aprendizId, fechaInicio, fechaFin);
    }
    
    public List<Evaluation> obtenerEvaluacionesRecientesPorEvaluador(Integer evaluadorId, LocalDate fecha) {
        return evaluacionRepository.findEvaluacionesRecientesPorEvaluador(evaluadorId, fecha);
    }
    
    public List<Evaluation> obtenerTodasEvaluaciones() {
        return evaluacionRepository.findAllWithRelations();
    }
    
    // UPDATE
    public Evaluation actualizarEvaluacion(Integer id, Evaluation evaluacionActualizada) {
        Evaluation evaluacion = obtenerEvaluacionPorId(id);
        evaluacion.setCalificacion(evaluacionActualizada.getCalificacion());
        evaluacion.setObservaciones(evaluacionActualizada.getObservaciones());
        evaluacion.setFecha(evaluacionActualizada.getFecha());
        return evaluacionRepository.save(evaluacion);
    }
    
    // DELETE
    public void eliminarEvaluacion(Integer id) {
        evaluacionRepository.deleteById(id);
    }
    
    // Estadísticas
    public Double obtenerPromedioAprendiz(Integer aprendizId) {
        return evaluacionRepository.obtenerPromedioCalificacionesPorAprendiz(aprendizId);
    }
    
    public Double obtenerPromedioGaes(Integer gaesId) {
        return evaluacionRepository.obtenerPromedioCalificacionesPorGaes(gaesId);
    }
}
