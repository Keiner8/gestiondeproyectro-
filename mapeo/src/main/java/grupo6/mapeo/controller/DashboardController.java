package grupo6.mapeo.controller;

import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    private String obtenerRolDelUsuarioAutenticado(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Intentar obtener del contexto de seguridad
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            String correo = authentication.getName();
            Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);
            if (usuario != null && usuario.getRol() != null) {
                return usuario.getRol().getNombreRol().toLowerCase();
            }
        }
        
        // Si no está en el contexto, intentar obtener del atributo del request (JWT filter)
        Object rolAttr = request.getAttribute("rol");
        if (rolAttr != null) {
            return rolAttr.toString().toLowerCase();
        }
        
        return null;
    }
    
    @GetMapping("/aprendiz")
    public String aprendizDashboard(HttpServletRequest request, RedirectAttributes redirectAttributes) {
        String rolActual = obtenerRolDelUsuarioAutenticado(request);
        
        if (rolActual == null || !rolActual.equals("aprendiz")) {
            // Redirigir al dashboard correcto según el rol
            if ("instructor".equals(rolActual)) {
                return "redirect:/dashboard/instructor";
            } else if ("administrador".equals(rolActual)) {
                return "redirect:/dashboard/administrador";
            } else {
                return "redirect:/login";
            }
        }
        
        return "aprendiz-dashboard";
    }
    
    @GetMapping("/instructor")
    public String instructorDashboard(HttpServletRequest request, RedirectAttributes redirectAttributes) {
        String rolActual = obtenerRolDelUsuarioAutenticado(request);
        
        if (rolActual == null || !rolActual.equals("instructor")) {
            // Redirigir al dashboard correcto según el rol
            if ("aprendiz".equals(rolActual)) {
                return "redirect:/dashboard/aprendiz";
            } else if ("administrador".equals(rolActual)) {
                return "redirect:/dashboard/administrador";
            } else {
                return "redirect:/login";
            }
        }
        
        return "instructor-dashboard";
    }
    
    @GetMapping("/administrador")
    public String administradorDashboard(HttpServletRequest request, RedirectAttributes redirectAttributes) {
        String rolActual = obtenerRolDelUsuarioAutenticado(request);
        
        if (rolActual == null || !rolActual.equals("administrador")) {
            // Redirigir al dashboard correcto según el rol
            if ("aprendiz".equals(rolActual)) {
                return "redirect:/dashboard/aprendiz";
            } else if ("instructor".equals(rolActual)) {
                return "redirect:/dashboard/instructor";
            } else {
                return "redirect:/login";
            }
        }
        
        return "administrador-dashboard";
    }
}
