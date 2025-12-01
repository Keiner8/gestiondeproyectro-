// ============================================================
// GRÁFICOS DINÁMICOS PARA EL DASHBOARD DEL APRENDIZ
// ============================================================

let chartsInstances = {
    calificaciones: null,
    proyectos: null,
    entregables: null,
    competencias: null
};

// Cargar gráficos cuando se carga el dashboard
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadAprendizCharts, 500);
});

function loadAprendizCharts() {
    console.log('📊 Cargando gráficos del aprendiz...');
    
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        console.warn('No hay usuario ID en localStorage');
        return;
    }
    
    // Cargar datos en paralelo
    Promise.all([
        cargarCalificaciones(usuarioId),
        cargarProyectos(usuarioId),
        cargarEntregables(usuarioId),
        cargarCompetencias(usuarioId)
    ]).then(() => {
        console.log('✅ Todos los gráficos cargados');
    }).catch(error => {
        console.error('❌ Error cargando gráficos:', error);
    });
}

// ============================================================
// GRÁFICO 1: CALIFICACIONES POR PERÍODO
// ============================================================
function cargarCalificaciones(usuarioId) {
    return fetchWithAuth(`/api/evaluaciones?usuarioId=${usuarioId}`)
        .then(response => {
            if (!response.ok) throw new Error('Error cargando calificaciones');
            return response.json();
        })
        .then(evaluaciones => {
            // Agrupar calificaciones por período
            const calificacionesPorMes = {};
            
            evaluaciones.forEach(eval => {
                const fecha = new Date(eval.fechaEvaluacion);
                const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                
                if (!calificacionesPorMes[mes]) {
                    calificacionesPorMes[mes] = [];
                }
                if (eval.calificacion) {
                    calificacionesPorMes[mes].push(parseFloat(eval.calificacion));
                }
            });
            
            // Calcular promedio por mes
            const meses = Object.keys(calificacionesPorMes).sort();
            const promedios = meses.map(mes => {
                const notas = calificacionesPorMes[mes];
                return (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2);
            });
            
            // Crear gráfico de línea
            const canvas = document.getElementById('calificacionesChart');
            if (!canvas) return;
            
            if (chartsInstances.calificaciones) {
                chartsInstances.calificaciones.destroy();
            }
            
            chartsInstances.calificaciones = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: meses.length > 0 ? meses : ['Sin datos'],
                    datasets: [{
                        label: 'Promedio de Calificación',
                        data: meses.length > 0 ? promedios : [0],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointRadius: 6,
                        pointBackgroundColor: '#667eea',
                        pointHoverRadius: 8
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
                            max: 5,
                            title: { display: true, text: 'Calificación' }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico de calificaciones cargado');
        })
        .catch(error => {
            console.error('Error cargando calificaciones:', error);
            mostrarGraficoVacio('calificacionesChart');
        });
}

// ============================================================
// GRÁFICO 2: PROGRESO DE PROYECTOS
// ============================================================
function cargarProyectos(usuarioId) {
    return fetchWithAuth(`/api/proyectos?aprendizId=${usuarioId}`)
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
            
            if (chartsInstances.proyectos) {
                chartsInstances.proyectos.destroy();
            }
            
            chartsInstances.proyectos = new Chart(canvas, {
                type: 'doughnut',
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
            mostrarGraficoVacio('proyectosChart');
        });
}

// ============================================================
// GRÁFICO 3: ESTADO DE ENTREGABLES
// ============================================================
function cargarEntregables(usuarioId) {
    return fetchWithAuth(`/api/entregables`)
        .then(response => {
            if (!response.ok) throw new Error('Error cargando entregables');
            return response.json();
        })
        .then(entregables => {
            // Contar estados
            const estados = {
                'Pendiente': 0,
                'Entregado': 0,
                'Aprobado': 0,
                'Rechazado': 0
            };
            
            entregables.forEach(entregable => {
                const estado = entregable.estado || 'Pendiente';
                if (estados.hasOwnProperty(estado)) {
                    estados[estado]++;
                } else {
                    estados[estado] = 1;
                }
            });
            
            const canvas = document.getElementById('entregablesChart');
            if (!canvas) return;
            
            if (chartsInstances.entregables) {
                chartsInstances.entregables.destroy();
            }
            
            chartsInstances.entregables = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(estados),
                    datasets: [{
                        label: 'Cantidad',
                        data: Object.values(estados),
                        backgroundColor: [
                            '#fbbf24',
                            '#3b82f6',
                            '#10b981',
                            '#ef4444'
                        ]
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
            
            console.log('✅ Gráfico de entregables cargado');
        })
        .catch(error => {
            console.error('Error cargando entregables:', error);
            mostrarGraficoVacio('entregablesChart');
        });
}

// ============================================================
// GRÁFICO 4: DESEMPEÑO POR COMPETENCIA
// ============================================================
function cargarCompetencias(usuarioId) {
    return fetchWithAuth(`/api/evaluaciones?usuarioId=${usuarioId}`)
        .then(response => {
            if (!response.ok) throw new Error('Error cargando evaluaciones');
            return response.json();
        })
        .then(evaluaciones => {
            // Agrupar calificaciones por competencia
            const competencias = {};
            
            evaluaciones.forEach(eval => {
                const competencia = eval.competencia || 'General';
                if (!competencias[competencia]) {
                    competencias[competencia] = [];
                }
                if (eval.calificacion) {
                    competencias[competencia].push(parseFloat(eval.calificacion));
                }
            });
            
            // Calcular promedio por competencia
            const competenciasArray = Object.keys(competencias);
            const promedios = competenciasArray.map(comp => {
                const notas = competencias[comp];
                return (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2);
            });
            
            const canvas = document.getElementById('competenciasChart');
            if (!canvas) return;
            
            if (chartsInstances.competencias) {
                chartsInstances.competencias.destroy();
            }
            
            chartsInstances.competencias = new Chart(canvas, {
                type: 'radar',
                data: {
                    labels: competenciasArray.length > 0 ? competenciasArray : ['Sin datos'],
                    datasets: [{
                        label: 'Desempeño',
                        data: competenciasArray.length > 0 ? promedios : [0],
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
                            beginAtZero: true,
                            max: 5
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico de competencias cargado');
        })
        .catch(error => {
            console.error('Error cargando competencias:', error);
            mostrarGraficoVacio('competenciasChart');
        });
}

// ============================================================
// FUNCIÓN AUXILIAR: Mostrar gráfico vacío
// ============================================================
function mostrarGraficoVacio(canvasId) {
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
// Actualizar gráficos cada 30 segundos
setInterval(function() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId && document.getElementById('dashboard').classList.contains('active')) {
        console.log('🔄 Actualizando gráficos...');
        loadAprendizCharts();
    }
}, 30000); // 30 segundos

// Actualizar cuando se cambia de sección y vuelve al dashboard
document.addEventListener('sectionChange', function(e) {
    if (e.detail.section === 'dashboard') {
        loadAprendizCharts();
    }
});
