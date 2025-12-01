// ============================================================
// PREVENCIÓN ROBUSTA DE NAVEGACIÓN HACIA ATRÁS
// ============================================================

(function() {
    // Solo bloquear en dashboards
    const isDashboard = window.location.href.includes('/dashboard') || 
                       window.location.href.includes('aprendiz') || 
                       window.location.href.includes('instructor') || 
                       window.location.href.includes('administrador');
    
    const isAuthenticated = localStorage.getItem('jwtToken');
    
    if (isDashboard && isAuthenticated) {
        console.log('🔒 Protección ROBUSTA contra back navigation: ACTIVA');
        
        // ===== ESTRATEGIA 1: Llenar el historial =====
        // Crear un stack de history muy grande
        for (let i = 0; i < 50; i++) {
            window.history.pushState({blocked: true, index: i}, null);
        }
        
        // ===== ESTRATEGIA 2: Interceptar popstate =====
        // Esta es la clave - debemos capturar TODOS los intentos de navegación
        let preventNavigation = true;
        
        window.addEventListener('popstate', function(event) {
            if (preventNavigation) {
                console.warn('❌ NAVEGACIÓN HACIA ATRÁS BLOQUEADA');
                event.preventDefault();
                
                // Recuperar el stack
                setTimeout(function() {
                    window.history.pushState({blocked: true}, null);
                }, 1);
            }
        });
        
        // ===== ESTRATEGIA 3: Bloquear con beforeunload =====
        window.addEventListener('beforeunload', function(e) {
            // Detectar si intenta ir a otra página
            const currentUrl = window.location.href;
            
            // Si intenta cambiar de URL, limpiar token
            return undefined;
        });
        
        // ===== ESTRATEGIA 4: Detectar cambios en la URL =====
        let lastUrl = window.location.href;
        setInterval(function() {
            if (lastUrl !== window.location.href) {
                console.warn('⚠️ Intento de cambio de URL detectado');
                // Volver a la URL anterior
                if (!isDashboard || !isAuthenticated) {
                    // Si no estamos en dashboard o no hay token, redirect a login
                    window.location.href = '/login';
                } else {
                    window.history.pushState(null, null, lastUrl);
                }
                lastUrl = window.location.href;
            }
        }, 100);
        
        // ===== ESTRATEGIA 5: Capturar eventos de navegación del navegador =====
        // Mouse button 3 y 4 (back/forward)
        document.addEventListener('mousedown', function(e) {
            if (e.button === 3 || e.button === 4) {
                e.preventDefault();
                e.stopImmediatePropagation();
                console.warn('❌ Click en botón back/forward bloqueado');
                return false;
            }
        }, true);
        
        // ===== ESTRATEGIA 6: Atajos de teclado =====
        document.addEventListener('keydown', function(event) {
            // Alt + Flecha Izquierda
            if (event.altKey && event.keyCode === 37) {
                event.preventDefault();
                event.stopImmediatePropagation();
                alert('❌ Navegación hacia atrás deshabilitada.');
                return false;
            }
            // Alt + Flecha Derecha  
            if (event.altKey && event.keyCode === 39) {
                event.preventDefault();
                event.stopImmediatePropagation();
                alert('❌ Navegación hacia delante deshabilitada.');
                return false;
            }
            // Cmd/Ctrl + Flecha Izquierda (Mac/Windows)
            if ((event.metaKey || event.ctrlKey) && event.keyCode === 37) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }
        }, true);
        
        // ===== ESTRATEGIA 7: Bloquear navegación con estado =====
        window.onpopstate = function(event) {
            console.warn('⚠️ Popstate detectado - bloqueando');
            window.history.pushState({blocked: true}, null);
            return false;
        };
    }
})();
