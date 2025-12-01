package grupo6.mapeo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    
    // ==========================================
    // PÁGINAS DE AUTENTICACIÓN (Pendiente)
    // ==========================================
    
    @GetMapping("/login")
    public String login() {
        return "login";
    }
    
    @GetMapping("/register")
    public String register() {
        return "register";
    }
    
    // ==========================================
    // REDIRECCIÓN RAÍZ
    // ==========================================
    
    @GetMapping("/")
    public String root() {
        return "index";
    }
    
    @GetMapping("/welcome")
    public String welcome() {
        return "index";
    }
    
    @GetMapping("/index")
    public String index() {
        return "index";
    }
}
