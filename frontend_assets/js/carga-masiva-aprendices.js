document.addEventListener('DOMContentLoaded', function() {
    inicializarCargaMasiva();
});

const CARGA_MASIVA_CONFIG = {
    aprendices: {
        key: 'aprendices',
        endpoint: () => `${window.API_APRENDICES}/carga-masiva`,
        titulo: 'JSON de aprendices *',
        boton: 'Cargar Aprendices',
        success: 'Aprendices cargados exitosamente',
        ejemplo: {
            aprendices: [
                {
                    nombre: 'Juan',
                    apellido: 'Perez',
                    correo: 'juan.perez01@gmail.com',
                    tipoDocumento: 'CC',
                    numeroDocumento: '1001001',
                },
                {
                    nombre: 'Ana',
                    apellido: 'Lopez',
                    correo: 'ana.lopez02@gmail.com',
                    tipoDocumento: 'TI',
                    numeroDocumento: '1001002',
                },
            ],
        },
        extra: item => item.numeroDocumento || '',
        extraHeader: 'Documento',
        resumenValido: total => [
            `Aprendices detectados: ${total}`,
            'Si la ficha ya tiene aprendices, el sistema validara el maximo de 30 al guardar.',
        ],
        resumenExito: data => [
            data.message,
            `Total creados: ${data.totalCreados}`,
            'La contrasena inicial de cada aprendiz corresponde a su numero de documento.',
        ],
        afterSuccess: () => {
            if (typeof cargarAprendices === 'function') cargarAprendices();
            if (typeof cargarUsuarios === 'function') cargarUsuarios();
            if (typeof cargarUsuariosParaAprendices === 'function') cargarUsuariosParaAprendices();
        },
    },
    instructores: {
        key: 'instructores',
        endpoint: () => `${window.API_INSTRUCTORES}/carga-masiva`,
        titulo: 'JSON de instructores *',
        boton: 'Cargar Instructores',
        success: 'Instructores cargados exitosamente',
        ejemplo: {
            instructores: [
                {
                    nombre: 'Carlos',
                    apellido: 'Ruiz',
                    correo: 'carlos.ruiz01@gmail.com',
                    tipoDocumento: 'CC',
                    numeroDocumento: '2001001',
                    especialidad: 'Analisis y desarrollo',
                },
                {
                    nombre: 'Martha',
                    apellido: 'Soto',
                    correo: 'martha.soto02@gmail.com',
                    tipoDocumento: 'CC',
                    numeroDocumento: '2001002',
                    especialidad: 'Bases de datos',
                },
            ],
        },
        extra: item => item.especialidad || 'Sin especialidad',
        extraHeader: 'Especialidad',
        resumenValido: total => [
            `Instructores detectados: ${total}`,
            'Cada instructor quedara asociado a la ficha seleccionada y con cambio obligatorio de contrasena.',
        ],
        resumenExito: data => [
            data.message,
            `Total creados: ${data.totalCreados}`,
            'La contrasena inicial de cada instructor corresponde a su numero de documento.',
        ],
        afterSuccess: () => {
            if (typeof cargarInstructores === 'function') cargarInstructores();
            if (typeof cargarUsuarios === 'function') cargarUsuarios();
            if (typeof cargarUsuariosParaInstructores === 'function') cargarUsuariosParaInstructores();
        },
    },
};

function inicializarCargaMasiva() {
    llenarSelectFichasCargaMasiva();
    actualizarModoCargaMasiva();
}

function obtenerModoCargaMasiva() {
    return document.getElementById('carga-masiva-tipo')?.value || 'aprendices';
}

function obtenerConfiguracionCargaMasiva() {
    return CARGA_MASIVA_CONFIG[obtenerModoCargaMasiva()] || CARGA_MASIVA_CONFIG.aprendices;
}

function actualizarModoCargaMasiva() {
    const config = obtenerConfiguracionCargaMasiva();
    const label = document.getElementById('carga-masiva-json-label');
    const textarea = document.getElementById('carga-masiva-json');
    const submit = document.getElementById('carga-masiva-submit');
    const extraHeader = document.querySelector('#carga-masiva-preview thead th:last-child');

    if (label) label.textContent = config.titulo;
    if (submit) submit.textContent = config.boton;
    if (textarea) textarea.placeholder = JSON.stringify(config.ejemplo, null, 2);
    if (extraHeader) extraHeader.textContent = config.extraHeader;

    mostrarPreviewCargaMasiva([]);
    const resumen = document.getElementById('carga-masiva-resumen');
    if (resumen) resumen.style.display = 'none';
}

function llenarSelectFichasCargaMasiva() {
    const select = document.getElementById('carga-masiva-ficha');
    if (!select) return;

    const render = fichas => {
        while (select.options.length > 1) {
            select.remove(1);
        }

        fichas.forEach(ficha => {
            const option = document.createElement('option');
            option.value = ficha.id;
            option.textContent = `${ficha.codigoFicha} - ${ficha.programaFormacion}`;
            select.appendChild(option);
        });
    };

    if (Array.isArray(window.fichasListaCompleta) && window.fichasListaCompleta.length > 0) {
        render(window.fichasListaCompleta);
        return;
    }

    fetchWithAuth(window.API_FICHAS)
        .then(response => {
            if (!response.ok) throw new Error('No se pudieron cargar las fichas');
            return response.json();
        })
        .then(data => {
            window.fichasListaCompleta = Array.isArray(data) ? data : [];
            render(window.fichasListaCompleta);
        })
        .catch(error => {
            console.error('Error cargando fichas para carga masiva:', error);
            mostrarNotificacionGlobal('Error al cargar fichas para la carga masiva', 'error');
        });
}

function cargarEjemploCargaMasiva() {
    const textarea = document.getElementById('carga-masiva-json');
    const config = obtenerConfiguracionCargaMasiva();
    if (!textarea) return;

    textarea.value = JSON.stringify(config.ejemplo, null, 2);
    validarJsonCargaMasiva();
}

function obtenerPayloadCargaMasiva() {
    const config = obtenerConfiguracionCargaMasiva();
    const textarea = document.getElementById('carga-masiva-json');
    const texto = (textarea?.value || '').trim();

    if (!texto) {
        throw new Error(`Debes pegar un JSON con ${config.key}`);
    }

    let payload;
    try {
        payload = JSON.parse(texto);
    } catch (error) {
        throw new Error('El contenido no es un JSON valido');
    }

    if (!payload || !Array.isArray(payload[config.key])) {
        throw new Error(`El JSON debe tener la propiedad "${config.key}" como lista`);
    }

    return payload;
}

function validarJsonCargaMasiva() {
    const config = obtenerConfiguracionCargaMasiva();

    try {
        const payload = obtenerPayloadCargaMasiva();
        mostrarPreviewCargaMasiva(payload[config.key]);
        mostrarResumenCargaMasiva({
            tipo: 'info',
            titulo: 'JSON valido',
            lineas: config.resumenValido(payload[config.key].length),
        });
        mostrarNotificacionGlobal('JSON validado correctamente', 'success');
    } catch (error) {
        mostrarPreviewCargaMasiva([]);
        mostrarResumenCargaMasiva({
            tipo: 'error',
            titulo: 'JSON invalido',
            lineas: [error.message],
        });
        mostrarNotificacionGlobal(error.message, 'error');
    }
}

function mostrarPreviewCargaMasiva(registros) {
    const container = document.getElementById('carga-masiva-preview');
    const tbody = document.getElementById('carga-masiva-preview-tbody');
    const config = obtenerConfiguracionCargaMasiva();
    if (!container || !tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(registros) || registros.length === 0) {
        container.style.display = 'none';
        return;
    }

    registros.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.nombre || ''}</td>
            <td>${item.apellido || ''}</td>
            <td>${item.correo || ''}</td>
            <td>${item.numeroDocumento || ''}</td>
            <td>${config.extra(item)}</td>
        `;
        tbody.appendChild(row);
    });

    container.style.display = 'block';
}

function mostrarResumenCargaMasiva({ tipo = 'info', titulo = '', lineas = [] }) {
    const resumen = document.getElementById('carga-masiva-resumen');
    if (!resumen) return;

    const colores = {
        info: '#355070',
        success: '#166534',
        error: '#991b1b',
    };

    resumen.style.display = 'block';
    resumen.style.borderLeft = `5px solid ${colores[tipo] || colores.info}`;
    resumen.innerHTML = `
        <h3 style="margin-bottom: 10px; color: ${colores[tipo] || colores.info};">${titulo}</h3>
        <ul style="margin: 0; padding-left: 20px;">
            ${lineas.map(linea => `<li style="margin-bottom: 6px;">${linea}</li>`).join('')}
        </ul>
    `;
}

function procesarCargaMasivaAprendices() {
    const fichaId = document.getElementById('carga-masiva-ficha')?.value;
    const config = obtenerConfiguracionCargaMasiva();
    const submit = document.getElementById('carga-masiva-submit');

    if (!fichaId) {
        mostrarNotificacionGlobal('Debes seleccionar una ficha', 'warning');
        return;
    }

    let payload;
    try {
        payload = obtenerPayloadCargaMasiva();
    } catch (error) {
        mostrarNotificacionGlobal(error.message, 'error');
        return;
    }

    if (submit) {
        submit.disabled = true;
        submit.textContent = 'Cargando...';
    }

    fetchWithAuth(config.endpoint(), {
        method: 'POST',
        body: JSON.stringify({
            fichaId: parseInt(fichaId, 10),
            [config.key]: payload[config.key],
        }),
    })
        .then(async response => {
            const body = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw body;
            }
            return body;
        })
        .then(data => {
            mostrarResumenCargaMasiva({
                tipo: 'success',
                titulo: 'Carga masiva completada',
                lineas: config.resumenExito(data),
            });
            mostrarNotificacionGlobal(config.success, 'success');
            mostrarAlertaGlobal(
                `${data.message}\nTotal creados: ${data.totalCreados}`,
                'success',
                'Carga exitosa'
            );
            config.afterSuccess();
            document.getElementById('carga-masiva-json').value = '';
        })
        .catch(error => {
            const errores = Array.isArray(error?.errores) ? error.errores : [];
            const mensajeError = error.detail || error.message || 'Error inesperado en la carga masiva';
            mostrarResumenCargaMasiva({
                tipo: 'error',
                titulo: 'No se pudo completar la carga masiva',
                lineas: errores.length > 0
                    ? errores.map(item => `Fila ${item.fila}: ${item.mensaje}`)
                    : [mensajeError],
            });
            mostrarNotificacionGlobal(mensajeError, 'error');
            mostrarAlertaGlobal(
                errores.length > 0 ? errores.map(item => `Fila ${item.fila}: ${item.mensaje}`).join('\n') : mensajeError,
                'error',
                'Error de carga'
            );
        })
        .finally(() => {
            if (submit) {
                submit.disabled = false;
                submit.textContent = config.boton;
            }
        });
}
