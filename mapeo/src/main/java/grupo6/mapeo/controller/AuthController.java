package grupo6.mapeo.controller;

import grupo6.mapeo.dto.LoginRequest;
import grupo6.mapeo.dto.LoginResponse;
import grupo6.mapeo.dto.RegisterRequest;
import grupo6.mapeo.entity.Usuario;
import grupo6.mapeo.entity.Rol;
import grupo6.mapeo.entity.Aprendiz;
import grupo6.mapeo.entity.Ficha;
import grupo6.mapeo.repository.UsuarioRepository;
import grupo6.mapeo.repository.RolRepository;
import grupo6.mapeo.repository.AprendizRepository;
import grupo6.mapeo.repository.FichaRepository;
import grupo6.mapeo.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private AprendizRepository aprendizRepository;
    
    @Autowired
    private FichaRepository fichaRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Validar que el usuario no exista
            if (usuarioRepository.findByCorreo(registerRequest.getCorreo()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("El correo ya está registrado");
            }
            
            if (usuarioRepository.findByNumeroDocumento(registerRequest.getNumeroDocumento()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("El número de documento ya está registrado");
            }
            
            // Obtener el rol
            Rol rol = rolRepository.findById(registerRequest.getRolId())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            
            // Crear nuevo usuario
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(registerRequest.getNombre());
            nuevoUsuario.setApellido(registerRequest.getApellido());
            nuevoUsuario.setCorreo(registerRequest.getCorreo());
            nuevoUsuario.setTipoDocumento(registerRequest.getTipoDocumento());
            nuevoUsuario.setNumeroDocumento(registerRequest.getNumeroDocumento());
            nuevoUsuario.setRol(rol);
            // Hashear la contraseña
            nuevoUsuario.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            nuevoUsuario.setEstado(Usuario.EstadoUsuario.ACTIVO);
            
            usuarioRepository.save(nuevoUsuario);
            
            // Si es aprendiz, crear registro automático en tabla aprendiz
            if ("aprendiz".equalsIgnoreCase(rol.getNombreRol())) {
                try {
                    // Obtener la primera ficha disponible
                    Optional<Ficha> fichaOpt = fichaRepository.findAll().stream().findFirst();
                    
                    Aprendiz aprendiz = new Aprendiz();
                    aprendiz.setUsuario(nuevoUsuario);
                    aprendiz.setEstado("ACTIVO");
                    
                    // Asignar ficha si existe
                    if (fichaOpt.isPresent()) {
                        aprendiz.setFicha(fichaOpt.get());
                    }
                    
                    aprendizRepository.save(aprendiz);
                    System.out.println("✓ Registro de aprendiz creado para usuario: " + nuevoUsuario.getCorreo());
                } catch (Exception ex) {
                    System.err.println("✗ Error al crear registro de aprendiz: " + ex.getMessage());
                    ex.printStackTrace();
                    // No lanzar excepción, permitir que el usuario se cree aunque falle el registro de aprendiz
                }
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Usuario registrado exitosamente");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar usuario: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByCorreo(loginRequest.getCorreo());
            
            if (!usuario.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Usuario no encontrado");
            }
            
            Usuario u = usuario.get();
            
            // Validar que el usuario tenga un rol asignado
            if (u.getRol() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("El usuario no tiene un rol asignado");
            }
            
            // Validar contraseña usando PasswordEncoder
            if (!passwordEncoder.matches(loginRequest.getPassword(), u.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Contraseña incorrecta");
            }
            
            String nombreRol = u.getRol().getNombreRol();
            
            // Generar token JWT
            String token = jwtTokenProvider.generateToken(
                    u.getId(), 
                    u.getCorreo(), 
                    nombreRol
            );
            
            // Determinar dashboard según rol
            String dashboard = obtenerDashboardPorRol(nombreRol);
            
            LoginResponse response = new LoginResponse(
                    token,
                    u.getId(),
                    u.getNombre(),
                    u.getApellido(),
                    u.getCorreo(),
                    nombreRol,
                    dashboard
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar login: " + e.getMessage());
        }
    }
    
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token inválido");
            }
            
            String jwtToken = token.substring(7);
            
            if (!jwtTokenProvider.validateToken(jwtToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token expirado o inválido");
            }
            
            Integer usuarioId = jwtTokenProvider.getUserIdFromToken(jwtToken);
            String rol = jwtTokenProvider.getRoleFromToken(jwtToken);
            
            return ResponseEntity.ok(new Object() {
                public Integer getUsuarioId() { return usuarioId; }
                public String getRol() { return rol; }
            });
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error validando token");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // El logout se maneja del lado del cliente (limpieza de localStorage)
            // El servidor solo confirma que se puede hacer logout
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Logout exitoso");
                put("status", "success");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error en logout: " + e.getMessage());
        }
    }
    
    private String obtenerDashboardPorRol(String rol) {
        if (rol == null) return "/";
        
        switch (rol.toLowerCase()) {
            case "aprendiz":
                return "/dashboard/aprendiz";
            case "instructor":
                return "/dashboard/instructor";
            case "administrador":
                return "/dashboard/administrador";
            default:
                return "/";
        }
    }
}
