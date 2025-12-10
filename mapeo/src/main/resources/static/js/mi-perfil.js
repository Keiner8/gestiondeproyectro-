// API URLs
const API_USUARIOS = '/api/usuarios';
const API_USUARIO_ACTUAL = '/api/usuario-actual'; // Endpoint para obtener usuario actual

// Variables globales
let usuarioActual = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarioActual();
});

// ===== CARGAR USUARIO ACTUAL =====
function cargarUsuarioActual() {
    // Intentar obtener usuario ID del localStorage (guardado en login)
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    
    // Inicializar con usuario por defecto
    usuarioActual = {
        id: usuarioId ? parseInt(usuarioId) : 1,
        nombre: usuarioNombre || 'Administrador',
        apellido: '',
        correo: 'admin@sena.edu.co',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        rol: {
            id: 1,
            nombreRol: 'Administrador'
        }
    };
    
    // Intentar obtener usuario actual desde sesión o localStorage
    const usuarioEnSessionStorage = sessionStorage.getItem('usuarioActual');
    const usuarioEnLocalStorage = localStorage.getItem('usuarioActual');
    
    if (usuarioEnSessionStorage) {
        usuarioActual = JSON.parse(usuarioEnSessionStorage);
        actualizarHeaderUsuario();
        return;
    }
    
    if (usuarioEnLocalStorage) {
        usuarioActual = JSON.parse(usuarioEnLocalStorage);
        actualizarHeaderUsuario();
        return;
    }
    
    // Actualizar header con valores del localStorage
    actualizarHeaderUsuario();
    
    // Si tenemos usuarioId, obtener datos completos del usuario desde la API (en background)
    if (usuarioId) {
        fetchWithAuth(`${API_USUARIOS}/${usuarioId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener usuario');
                }
                return response.json();
            })
            .then(usuario => {
                usuarioActual = usuario;
                sessionStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
                localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
                actualizarHeaderUsuario();
                console.log('✓ Usuario actual cargado:', usuarioActual.nombre);
            })
            .catch(error => {
                console.error('Error al cargar usuario actual desde API:', error);
                // Mantener valores del localStorage
            });
    }
}

function actualizarHeaderUsuario() {
    if (!usuarioActual) return;
    
    // Obtener iniciales
    const iniciales = (usuarioActual.nombre?.charAt(0) || 'U') + 
                     (usuarioActual.apellido?.charAt(0) || '');
    
    // Actualizar header
    const avatarElement = document.getElementById('user-initials');
    const nameElement = document.getElementById('user-name');
    
    if (avatarElement) avatarElement.textContent = iniciales.toUpperCase();
    if (nameElement) nameElement.textContent = `${usuarioActual.nombre} ${usuarioActual.apellido}`;
}

// ===== ABRIR MODAL MI PERFIL =====
function abrirMiPerfil() {
    if (!usuarioActual) {
        mostrarNotificacionPerfil('Error al cargar tu perfil', 'error');
        return;
    }
    
    // Llenar datos del perfil
    document.getElementById('profile-nombre').textContent = `${usuarioActual.nombre} ${usuarioActual.apellido}`;
    document.getElementById('profile-correo').textContent = usuarioActual.correo || 'Sin correo';
    const rolNombre = usuarioActual.rol?.nombreRol || 'Administrador';
    document.getElementById('profile-rol').textContent = rolNombre;
    
    // Iniciales en avatar
    const iniciales = (usuarioActual.nombre?.charAt(0) || 'U') + 
                     (usuarioActual.apellido?.charAt(0) || '');
    document.getElementById('profile-avatar').textContent = iniciales.toUpperCase();
    
    // Llenar formulario
    document.getElementById('perfil-nombre').value = usuarioActual.nombre || '';
    document.getElementById('perfil-apellido').value = usuarioActual.apellido || '';
    document.getElementById('perfil-correo').value = usuarioActual.correo || '';
    document.getElementById('perfil-tipo-documento').value = usuarioActual.tipoDocumento || 'CC';
    document.getElementById('perfil-numero-documento').value = usuarioActual.numeroDocumento || '';
    
    // Llenar nivel si el usuario es aprendiz
    cargarNivelAprendiz(usuarioActual.id);
    }

    function cargarNivelAprendiz(usuarioId) {
    const nivelInput = document.getElementById('perfil-nivel');
    if (!nivelInput) return;
    
    // Buscar el aprendiz por usuarioId
    fetch(`${window.API_APRENDICES}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
    })
    .then(r => r.json())
    .then(aprendices => {
        const aprendiz = aprendices.find(a => a.usuario?.id === usuarioId);
        if (aprendiz && aprendiz.nivel) {
            nivelInput.value = aprendiz.nivel === 'TECNICO' ? 'Técnico' : 'Tecnólogo';
        } else {
            nivelInput.value = 'Sin asignar';
        }
    })
    .catch(error => {
        console.error('Error cargando nivel:', error);
        nivelInput.value = 'Sin asignar';
    });
    }

// Interceptar apertura del modal
const modalMiPerfil = document.getElementById('modal-mi-perfil');
if (modalMiPerfil) {
    const originalStyle = modalMiPerfil.style.display;
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (modalMiPerfil.style.display === 'flex') {
                abrirMiPerfil();
            }
        });
    });
    observer.observe(modalMiPerfil, { attributes: true, attributeFilter: ['style'] });
}

// ===== ACTUALIZAR MI PERFIL =====
function actualizarMiPerfil(event) {
    event.preventDefault();
    
    if (!usuarioActual) {
        mostrarNotificacionPerfil('Error: Usuario no identificado', 'error');
        return;
    }
    
    const nombre = document.getElementById('perfil-nombre').value.trim();
    const apellido = document.getElementById('perfil-apellido').value.trim();
    const correo = document.getElementById('perfil-correo').value.trim();
    const tipoDocumento = document.getElementById('perfil-tipo-documento').value;
    const numeroDocumento = document.getElementById('perfil-numero-documento').value.trim();
    
    if (!nombre || !apellido || !correo) {
        mostrarNotificacionPerfil('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    const usuarioActualizado = {
        id: usuarioActual.id,
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento,
        rol: usuarioActual.rol
    };
    
    fetch(`${API_USUARIOS}/${usuarioActual.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar perfil');
        return response.json();
    })
    .then(data => {
        usuarioActual = data;
        sessionStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
        actualizarHeaderUsuario();
        mostrarNotificacionPerfil('Perfil actualizado exitosamente', 'success');
        closeModal('modal-mi-perfil');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionPerfil('Error al actualizar perfil: ' + error.message, 'error');
    });
}

// ===== FUNCIONES AUXILIARES =====
function mostrarNotificacionPerfil(mensaje, tipo = 'info') {
    if (typeof mostrarNotificacionGlobal === 'function') {
        mostrarNotificacionGlobal(mensaje, tipo);
    } else {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        alert(mensaje);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== GUARDAR USUARIO ACTUAL EN SESION =====
// Función que debe ser llamada desde el login
function guardarUsuarioActual(usuario) {
    usuarioActual = usuario;
    sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    actualizarHeaderUsuario();
}
