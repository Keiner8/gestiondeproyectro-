// ============================================================
// GRÁFICOS DINÁMICOS PARA EL DASHBOARD DEL INSTRUCTOR
// ============================================================

let instructorChartsInstances = {
    aprendicesFicha: null,
    calificacionesProm: null,
    gaes: null,
    proyectos: null
};

// Cargar gráficos cuando se carga el dashboard
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadInstructorCharts, 500);
});

function loadInstructorCharts() {
    console.log('📊 Cargando gráficos del instructor...');
    
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        console.warn('No hay usuario ID en localStorage');
        return;
    }
    
    // Cargar datos en paralelo
    Promise.all([
        cargarAprendicesPorFicha(usuarioId),
        cargarCalificacionesPromedio(usuarioId),
        cargarGaes(usuarioId),
        cargarProyectos(usuarioId)
    ]).then(() => {
        console.log('✅ Todos los gráficos del instructor cargados');
    }).catch(error => {
        console.error('❌ Error cargando gráficos:', error);
    });
}

// ============================================================
// GRÁFICO 1: APRENDICES POR FICHA
// ============================================================
function cargarAprendicesPorFicha(instructorId) {
    return fetchWithAuth(`/api/fichas?instructorId=${instructorId}`)
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
                if (aprendiz.ficha?.codigo && aprendicesPorFicha.hasOwnProperty(aprendiz.ficha.codigo)) {
                    aprendicesPorFicha[aprendiz.ficha.codigo]++;
                }
            });
            
            const canvas = document.getElementById('aprendicesFichaChart');
            if (!canvas) return;
            
            if (instructorChartsInstances.aprendicesFicha) {
                instructorChartsInstances.aprendicesFicha.destroy();
            }
            
            instructorChartsInstances.aprendicesFicha = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(aprendicesPorFicha).length > 0 ? Object.keys(aprendicesPorFicha) : ['Sin fichas'],
                    datasets: [{
                        label: 'Cantidad',
                        data: Object.keys(aprendicesPorFicha).length > 0 ? Object.values(aprendicesPorFicha) : [0],
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
            mostrarGraficoVacioInstructor('aprendicesFichaChart');
        });
}

// ============================================================
// GRÁFICO 2: PROMEDIO DE CALIFICACIONES
// ============================================================
function cargarCalificacionesPromedio(instructorId) {
    return fetchWithAuth('/api/evaluaciones')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando evaluaciones');
            return response.json();
        })
        .then(evaluaciones => {
            // Calcular promedio general
            if (evaluaciones.length === 0) {
                const canvas = document.getElementById('calificacionesPromChart');
                if (canvas) {
                    mostrarGraficoVacioInstructor('calificacionesPromChart');
                }
                return;
            }
            
            const promedio = (evaluaciones.reduce((sum, e) => sum + (e.calificacion || 0), 0) / evaluaciones.length).toFixed(2);
            
            // Contar por rango de calificación
            const rangos = {
                '0-1': 0,
                '1-2': 0,
                '2-3': 0,
                '3-4': 0,
                '4-5': 0
            };
            
            evaluaciones.forEach(eval => {
                const cal = eval.calificacion || 0;
                if (cal < 1) rangos['0-1']++;
                else if (cal < 2) rangos['1-2']++;
                else if (cal < 3) rangos['2-3']++;
                else if (cal < 4) rangos['3-4']++;
                else rangos['4-5']++;
            });
            
            const canvas = document.getElementById('calificacionesPromChart');
            if (!canvas) return;
            
            if (instructorChartsInstances.calificacionesProm) {
                instructorChartsInstances.calificacionesProm.destroy();
            }
            
            instructorChartsInstances.calificacionesProm = new Chart(canvas, {
                type: 'radar',
                data: {
                    labels: Object.keys(rangos),
                    datasets: [{
                        label: 'Cantidad de Estudiantes',
                        data: Object.values(rangos),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#667eea'
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
            
            console.log('✅ Gráfico de calificaciones cargado. Promedio: ' + promedio);
        })
        .catch(error => {
            console.error('Error cargando calificaciones:', error);
            mostrarGraficoVacioInstructor('calificacionesPromChart');
        });
}

// ============================================================
// GRÁFICO 3: GAES BAJO MI SUPERVISIÓN
// ============================================================
function cargarGaes(instructorId) {
    return fetchWithAuth(`/api/gaes`)
        .then(response => {
            if (!response.ok) throw new Error('Error cargando GAES');
            return response.json();
        })
        .then(gaes => {
            // Filtrar GAES del instructor y contar miembros
            const gaesData = {};
            
            gaes.forEach(gae => {
                const cantidad = gae.integrantes ? gae.integrantes.length : 0;
                gaesData[gae.nombre || 'GAES ' + gae.id] = cantidad;
            });
            
            const canvas = document.getElementById('gaesChart');
            if (!canvas) return;
            
            if (instructorChartsInstances.gaes) {
                instructorChartsInstances.gaes.destroy();
            }
            
            instructorChartsInstances.gaes = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(gaesData),
                    datasets: [{
                        data: Object.values(gaesData),
                        backgroundColor: [
                            '#667eea',
                            '#48bb78',
                            '#f6ad55',
                            '#fc8181',
                            '#a78bfa',
                            '#38b2ac'
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
            
            console.log('✅ Gráfico de GAES cargado');
        })
        .catch(error => {
            console.error('Error cargando GAES:', error);
            mostrarGraficoVacioInstructor('gaesChart');
        });
}

// ============================================================
// GRÁFICO 4: ESTADO DE PROYECTOS
// ============================================================
function cargarProyectos(instructorId) {
    return fetchWithAuth('/api/proyectos')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando proyectos');
            return response.json();
        })
        .then(proyectos => {
            // Contar estados
            const estados = {
                'En Progreso': 0,
                'Completado': 0,
                'Retrasado': 0,
                'No Iniciado': 0
            };
            
            proyectos.forEach(proyecto => {
                const estado = proyecto.estado || 'No Iniciado';
                if (estados.hasOwnProperty(estado)) {
                    estados[estado]++;
                } else {
                    estados[estado] = 1;
                }
            });
            
            const canvas = document.getElementById('proyectosChart');
            if (!canvas) return;
            
            if (instructorChartsInstances.proyectos) {
                instructorChartsInstances.proyectos.destroy();
            }
            
            instructorChartsInstances.proyectos = new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: Object.keys(estados),
                    datasets: [{
                        data: Object.values(estados),
                        backgroundColor: [
                            '#667eea',
                            '#48bb78',
                            '#f6ad55',
                            '#fc8181'
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
            
            console.log('✅ Gráfico de proyectos cargado');
        })
        .catch(error => {
            console.error('Error cargando proyectos:', error);
            mostrarGraficoVacioInstructor('proyectosChart');
        });
}

// ============================================================
// FUNCIÓN AUXILIAR: Mostrar gráfico vacío
// ============================================================
function mostrarGraficoVacioInstructor(canvasId) {
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
// Actualizar gráficos cada 45 segundos
setInterval(function() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.classList.contains('active')) {
        console.log('🔄 Actualizando gráficos del instructor...');
        loadInstructorCharts();
    }
}, 45000); // 45 segundos

// Actualizar cuando se cambia de sección y vuelve al dashboard
document.addEventListener('sectionChange', function(e) {
    if (e.detail.section === 'dashboard') {
        loadInstructorCharts();
    }
});
