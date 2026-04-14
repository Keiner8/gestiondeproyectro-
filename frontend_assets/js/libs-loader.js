/**
 * Cargador de librerías externas con reintentos
 * Asegura que las librerías CDN estén disponibles antes de usarlas
 */

// Variable para controlar si las librerías están listas
window.libsReady = false;

// Función para verificar si las librerías necesarias están cargadas
function checkLibrariesLoaded() {
    const xlsxLoaded = typeof window.XLSX !== 'undefined';
    const jspdfLoaded = typeof window.jspdf !== 'undefined';
    
    return xlsxLoaded && jspdfLoaded;
}

// Función para esperar a que las librerías estén disponibles
function waitForLibraries(callback, timeout = 30000) {
    const startTime = Date.now();
    
    function check() {
        if (checkLibrariesLoaded()) {
            window.libsReady = true;
            console.log('✓ Todas las librerías externas están cargadas');
            if (callback) callback();
            return;
        }
        
        const elapsed = Date.now() - startTime;
        if (elapsed > timeout) {
            console.error('⚠ Timeout esperando librerías:', {
                XLSX: typeof window.XLSX,
                jspdf: typeof window.jspdf
            });
            if (callback) callback();
            return;
        }
        
        setTimeout(check, 100);
    }
    
    check();
}

// Esperar a que el DOM esté listo y luego a las librerías
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        waitForLibraries();
    });
} else {
    waitForLibraries();
}

// Alternativa: Cargar librerías manualmente si los CDN fallan
function loadLibrariesFallback() {
    // Esta función se puede usar para cargar desde alternativas si es necesario
    console.warn('Intentando fallback para librerías...');
}
