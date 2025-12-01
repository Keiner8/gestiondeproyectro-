/**
 * ============================================================
 * UTILIDADES DE API Y AUTENTICACIÓN
 * ============================================================
 */

/**
 * Obtiene el token JWT del localStorage
 */
function getToken() {
    return localStorage.getItem('jwtToken');
}

/**
 * Verifica si el usuario está autenticado
 */
function isAuthenticated() {
    const token = getToken();
    return !!token;
}

/**
 * Realiza una petición fetch con autenticación JWT
 * @param {string} url - URL de la petición
 * @param {object} options - Opciones de fetch (method, body, etc.)
 */
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    
    // Si no hay token y no es una petición a /api/auth, redirigir a login
    if (!token && url.includes('/api/') && !url.includes('/api/auth/')) {
        console.warn('No hay token de autenticación. Redirigiendo a login...');
        window.location.href = '/login';
        return;
    }
    
    // Preparar headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Agregar token si existe
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Realizar petición
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Si es 401 (no autorizado), limpiar token y redirigir
    if (response.status === 401) {
        console.error('Token inválido o expirado');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('usuarioRol');
        window.location.href = '/login';
        return;
    }
    
    return response;
}

/**
 * Realiza una petición GET con autenticación
 */
function fetchGet(url) {
    return fetchWithAuth(url, {
        method: 'GET'
    });
}

/**
 * Realiza una petición POST con autenticación
 */
function fetchPost(url, data) {
    return fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Realiza una petición PUT con autenticación
 */
function fetchPut(url, data) {
    return fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Realiza una petición DELETE con autenticación
 */
function fetchDelete(url) {
    return fetchWithAuth(url, {
        method: 'DELETE'
    });
}

/**
 * Realiza una petición POST con autenticación para archivos (FormData)
 * @param {string} url - URL de la petición
 * @param {FormData} formData - FormData con archivo y parámetros
 */
async function fetchPostFormData(url, formData) {
    const token = getToken();
    
    // Si no hay token y no es una petición a /api/auth, redirigir a login
    if (!token && url.includes('/api/') && !url.includes('/api/auth/')) {
        console.warn('No hay token de autenticación. Redirigiendo a login...');
        window.location.href = '/login';
        return;
    }
    
    // Preparar headers (sin Content-Type para que el navegador lo agregue automáticamente)
    const headers = {};
    
    // Agregar token si existe
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Realizar petición
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
    });
    
    // Si es 401 (no autorizado), limpiar token y redirigir
    if (response.status === 401) {
        console.error('Token inválido o expirado');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('usuarioRol');
        window.location.href = '/login';
        return;
    }
    
    return response;
}
