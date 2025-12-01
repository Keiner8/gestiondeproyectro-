// ============================================================
// Actualizar Header con Datos del Usuario Autenticado
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    actualizarHeaderDesdeLocalStorage();
});

function actualizarHeaderDesdeLocalStorage() {
    // Obtener datos del localStorage
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    const usuarioRol = localStorage.getItem('usuarioRol');
    
    console.log('📝 Actualizando header del usuario:', {
        usuarioId,
        usuarioNombre,
        usuarioRol
    });
    
    // Actualizar nombre en el header
    if (usuarioNombre) {
        const nameElement = document.getElementById('user-name');
        if (nameElement) {
            nameElement.textContent = usuarioNombre;
            console.log('✓ Nombre actualizado en header:', usuarioNombre);
        }
    }
    
    // Actualizar iniciales
    if (usuarioNombre) {
        const initialsElement = document.getElementById('user-initials');
        if (initialsElement) {
            // Obtener primera letra del nombre
            const iniciales = usuarioNombre.charAt(0).toUpperCase();
            initialsElement.textContent = iniciales;
            console.log('✓ Iniciales actualizadas en avatar:', iniciales);
        }
    }
    
    // Si existe usuarioId, obtener datos completos del usuario
    if (usuarioId) {
        obtenerDatosCompletos(usuarioId);
    }
}

function obtenerDatosCompletos(usuarioId) {
    // Obtener datos completos del usuario desde la API
    fetchWithAuth(`/api/usuarios/${usuarioId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener usuario');
            }
            return response.json();
        })
        .then(usuario => {
            console.log('✓ Datos completos del usuario obtenidos:', usuario.nombre);
            
            // Actualizar el nombre con nombre + apellido si está disponible
            if (usuario.nombre && usuario.apellido) {
                const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
                const nameElement = document.getElementById('user-name');
                if (nameElement) {
                    nameElement.textContent = nombreCompleto;
                }
                
                // Actualizar iniciales con nombre + apellido
                const initialsElement = document.getElementById('user-initials');
                if (initialsElement) {
                    const iniciales = (usuario.nombre.charAt(0) + usuario.apellido.charAt(0)).toUpperCase();
                    initialsElement.textContent = iniciales;
                }
                
                console.log('✓ Header actualizado con datos completos:', nombreCompleto);
            }
        })
        .catch(error => {
            console.error('Error al obtener datos completos del usuario:', error);
            // Mantener lo que ya está en el header
        });
}
