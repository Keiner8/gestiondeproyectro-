// ============================================================
// GRÁFICOS DINÁMICOS PARA EL DASHBOARD DEL ADMINISTRADOR
// ============================================================

let adminChartsInstances = {
    usuariosRol: null,
    fichasEstado: null,
    aprendicesFicha: null,
    trimestres: null,
    evaluacionesFicha: null,
    gaes: null
};

// Cargar gráficos cuando se carga el dashboard
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadAdminCharts, 500);
});

function loadAdminCharts() {
    console.log('📊 Cargando gráficos administrativos...');
    
    // Cargar datos en paralelo
    Promise.all([
        cargarUsuariosPorRol(),
        cargarEstadoFichas(),
        cargarAprendicesPorFicha(),
        cargarTrimestres(),
        cargarEvaluacionesPorFicha(),
        cargarGaes()
    ]).then(() => {
        console.log('✅ Todos los gráficos administrativos cargados');
    }).catch(error => {
        console.error('❌ Error cargando gráficos:', error);
    });
}

// ============================================================
// GRÁFICO 1: USUARIOS POR ROL
// ============================================================
function cargarUsuariosPorRol() {
    return fetchWithAuth('/api/usuarios')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando usuarios');
            return response.json();
        })
        .then(usuarios => {
            // Agrupar por rol
            const usuariosPorRol = {};
            
            usuarios.forEach(usuario => {
                const rol = usuario.rol?.nombreRol || 'Sin rol';
                usuariosPorRol[rol] = (usuariosPorRol[rol] || 0) + 1;
            });
            
            const canvas = document.getElementById('usuariosRolChart');
            if (!canvas) return;
            
            if (adminChartsInstances.usuariosRol) {
                adminChartsInstances.usuariosRol.destroy();
            }
            
            adminChartsInstances.usuariosRol = new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: Object.keys(usuariosPorRol),
                    datasets: [{
                        data: Object.values(usuariosPorRol),
                        backgroundColor: [
                            '#667eea',
                            '#48bb78',
                            '#f6ad55',
                            '#fc8181',
                            '#a78bfa'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            
            console.log('✅ Gráfico de usuarios por rol cargado');
        })
        .catch(error => {
            console.error('Error cargando usuarios por rol:', error);
            mostrarGraficoVacioAdmin('usuariosRolChart');
        });
}

// ============================================================
// GRÁFICO 2: ESTADO DE FICHAS
// ============================================================
function cargarEstadoFichas() {
    return fetchWithAuth('/api/fichas')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando fichas');
            return response.json();
        })
        .then(fichas => {
            // Contar por estado
            const estados = {
                'Activa': 0,
                'Completada': 0,
                'Cancelada': 0,
                'En Progreso': 0
            };
            
            fichas.forEach(ficha => {
                const estado = ficha.estado || 'En Progreso';
                if (estados.hasOwnProperty(estado)) {
                    estados[estado]++;
                } else {
                    estados[estado] = 1;
                }
            });
            
            const canvas = document.getElementById('fichasEstadoChart');
            if (!canvas) return;
            
            if (adminChartsInstances.fichasEstado) {
                adminChartsInstances.fichasEstado.destroy();
            }
            
            adminChartsInstances.fichasEstado = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(estados),
                    datasets: [{
                        data: Object.values(estados),
                        backgroundColor: [
                            '#10b981',
                            '#3b82f6',
                            '#ef4444',
                            '#f59e0b'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            
            console.log('✅ Gráfico de estado de fichas cargado');
        })
        .catch(error => {
            console.error('Error cargando fichas:', error);
            mostrarGraficoVacioAdmin('fichasEstadoChart');
        });
}

// ============================================================
// GRÁFICO 3: APRENDICES POR FICHA
// ============================================================
function cargarAprendicesPorFicha() {
    return fetchWithAuth('/api/fichas')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando fichas');
            return response.json();
        })
        .then(fichas => {
            return fetchWithAuth('/api/aprendices').then(response => {
                if (!response.ok) throw new Error('Error cargando aprendices');
                return response.json().then(aprendices => ({fichas, aprendices}));
            });
        })
        .then(({fichas, aprendices}) => {
            // Contar aprendices por ficha
            const aprendicesPorFicha = {};
            
            fichas.forEach(ficha => {
                aprendicesPorFicha[ficha.codigo] = 0;
            });
            
            aprendices.forEach(aprendiz => {
                if (aprendiz.ficha?.codigo) {
                    aprendicesPorFicha[aprendiz.ficha.codigo] = 
                        (aprendicesPorFicha[aprendiz.ficha.codigo] || 0) + 1;
                }
            });
            
            const canvas = document.getElementById('aprendicesFichaChart');
            if (!canvas) return;
            
            if (adminChartsInstances.aprendicesFicha) {
                adminChartsInstances.aprendicesFicha.destroy();
            }
            
            adminChartsInstances.aprendicesFicha = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(aprendicesPorFicha),
                    datasets: [{
                        label: 'Cantidad',
                        data: Object.values(aprendicesPorFicha),
                        backgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico de aprendices por ficha cargado');
        })
        .catch(error => {
            console.error('Error cargando aprendices por ficha:', error);
            mostrarGraficoVacioAdmin('aprendicesFichaChart');
        });
}

// ============================================================
// GRÁFICO 4: TRIMESTRES ACTIVOS
// ============================================================
function cargarTrimestres() {
    return fetchWithAuth('/api/trimestres')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando trimestres');
            return response.json();
        })
        .then(trimestres => {
            // Contar por estado
            const estados = {
                'Activo': 0,
                'Completado': 0,
                'Pendiente': 0
            };
            
            trimestres.forEach(trimestre => {
                const estado = trimestre.estado || 'Pendiente';
                if (estados.hasOwnProperty(estado)) {
                    estados[estado]++;
                } else {
                    estados[estado] = 1;
                }
            });
            
            const canvas = document.getElementById('trimestresChart');
            if (!canvas) return;
            
            if (adminChartsInstances.trimestres) {
                adminChartsInstances.trimestres.destroy();
            }
            
            adminChartsInstances.trimestres = new Chart(canvas, {
                type: 'polar',
                data: {
                    labels: Object.keys(estados),
                    datasets: [{
                        label: 'Cantidad',
                        data: Object.values(estados),
                        backgroundColor: [
                            'rgba(102, 126, 234, 0.5)',
                            'rgba(72, 187, 120, 0.5)',
                            'rgba(246, 173, 85, 0.5)'
                        ],
                        borderColor: [
                            '#667eea',
                            '#48bb78',
                            '#f6ad55'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        r: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico de trimestres cargado');
        })
        .catch(error => {
            console.error('Error cargando trimestres:', error);
            mostrarGraficoVacioAdmin('trimestresChart');
        });
}

// ============================================================
// GRÁFICO 5: CALIFICACIONES PROMEDIO POR FICHA
// ============================================================
function cargarEvaluacionesPorFicha() {
    return fetchWithAuth('/api/fichas')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando fichas');
            return response.json();
        })
        .then(fichas => {
            return fetchWithAuth('/api/evaluaciones').then(response => {
                if (!response.ok) throw new Error('Error cargando evaluaciones');
                return response.json().then(evaluaciones => ({fichas, evaluaciones}));
            });
        })
        .then(({fichas, evaluaciones}) => {
            // Calcular promedio por ficha
            const promediosPorFicha = {};
            const contadores = {};
            
            fichas.forEach(ficha => {
                promediosPorFicha[ficha.codigo] = 0;
                contadores[ficha.codigo] = 0;
            });
            
            evaluaciones.forEach(eval => {
                // Aquí asumimos que la evaluación está vinculada a una ficha
                fichas.forEach(ficha => {
                    promediosPorFicha[ficha.codigo] += eval.calificacion || 0;
                    if (eval.calificacion) contadores[ficha.codigo]++;
                });
            });
            
            // Calcular promedios
            Object.keys(promediosPorFicha).forEach(ficha => {
                if (contadores[ficha] > 0) {
                    promediosPorFicha[ficha] = 
                        (promediosPorFicha[ficha] / contadores[ficha]).toFixed(2);
                }
            });
            
            const canvas = document.getElementById('evaluacionesFichaChart');
            if (!canvas) return;
            
            if (adminChartsInstances.evaluacionesFicha) {
                adminChartsInstances.evaluacionesFicha.destroy();
            }
            
            adminChartsInstances.evaluacionesFicha = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: Object.keys(promediosPorFicha),
                    datasets: [{
                        label: 'Promedio',
                        data: Object.values(promediosPorFicha),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointRadius: 5,
                        pointBackgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico de evaluaciones por ficha cargado');
        })
        .catch(error => {
            console.error('Error cargando evaluaciones por ficha:', error);
            mostrarGraficoVacioAdmin('evaluacionesFichaChart');
        });
}

// ============================================================
// GRÁFICO 6: MIEMBROS POR GAES
// ============================================================
function cargarGaes() {
    return fetchWithAuth('/api/gaes')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando GAES');
            return response.json();
        })
        .then(gaes => {
            // Contar miembros por GAES
            const miembrosPorGaes = {};
            
            gaes.forEach(gae => {
                const cantidad = gae.integrantes ? gae.integrantes.length : 0;
                miembrosPorGaes[gae.nombre || 'GAES ' + gae.id] = cantidad;
            });
            
            const canvas = document.getElementById('gaesChart');
            if (!canvas) return;
            
            if (adminChartsInstances.gaes) {
                adminChartsInstances.gaes.destroy();
            }
            
            adminChartsInstances.gaes = new Chart(canvas, {
                type: 'scatter',
                data: {
                    labels: Object.keys(miembrosPorGaes),
                    datasets: [{
                        label: 'Miembros por GAES',
                        data: Object.entries(miembrosPorGaes).map((item, idx) => ({
                            x: idx,
                            y: item[1]
                        })),
                        backgroundColor: '#667eea',
                        borderColor: '#667eea',
                        pointRadius: 8,
                        pointHoverRadius: 10
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'GAES' }
                        },
                        y: {
                            title: { display: true, text: 'Cantidad de Miembros' },
                            beginAtZero: true
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico de GAES cargado');
        })
        .catch(error => {
            console.error('Error cargando GAES:', error);
            mostrarGraficoVacioAdmin('gaesChart');
        });
}

// ============================================================
// FUNCIÓN AUXILIAR: Mostrar gráfico vacío
// ============================================================
function mostrarGraficoVacioAdmin(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ccc';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos disponibles', canvas.width / 2, canvas.height / 2);
}

// ============================================================
// ACTUALIZAR GRÁFICOS AUTOMÁTICAMENTE
// ============================================================
// Actualizar gráficos cada 60 segundos
setInterval(function() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.classList.contains('active')) {
        console.log('🔄 Actualizando gráficos administrativos...');
        loadAdminCharts();
    }
}, 60000); // 60 segundos

// Actualizar cuando se cambia de sección y vuelve al dashboard
document.addEventListener('sectionChange', function(e) {
    if (e.detail.section === 'dashboard') {
        loadAdminCharts();
    }
});
