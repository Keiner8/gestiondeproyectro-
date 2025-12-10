# Objetivo Específico para Aprendices - Sistema Mapeo

---

## 🎯 OBJETIVO GENERAL DEL APRENDIZ

**Proporcionar a los aprendices una plataforma donde puedan acceder a su información académica, visualizar sus calificaciones, monitorear sus proyectos asignados y comunicarse con sus instructores de forma segura y en tiempo real.**

---

## 📋 OBJETIVOS ESPECÍFICOS POR MÓDULO

### **Objetivo 1: Autenticación y Acceso Seguro**

**Específico**: El aprendiz debe poder autenticarse en el sistema con credenciales seguras (email + contraseña) y acceder a su información personalizada.

**Medibles**:
- ✓ Registrarse con email único y contraseña segura
- ✓ Iniciar sesión en <500ms
- ✓ Token JWT válido por 24 horas
- ✓ Recuperar contraseña olvidada
- ✓ 0 acceso no autorizado a otros aprendices

**Indicadores de éxito**:
- Tasa de login exitoso: >99%
- Tiempo de autenticación: <500ms
- Intentos de fuerza bruta bloqueados automáticamente

---

### **Objetivo 2: Ver Mis Calificaciones**

**Específico**: El aprendiz puede visualizar todas sus calificaciones por GAES, con promedio general y tendencias.

**Medibles**:
- ✓ Ver calificaciones de todas sus evaluaciones
- ✓ Promedio calculado automáticamente
- ✓ Filtrar por GAES o fecha
- ✓ Actualización en tiempo real
- ✓ Exportar calificaciones (opcional)

**Estructura de datos**:
```
Mis Calificaciones:
├─ GAES-01: Promedio 4.2
│  ├─ Evaluación 1: 4.0 (15/01/2025)
│  ├─ Evaluación 2: 4.5 (22/01/2025)
│  └─ Evaluación 3: 4.1 (29/01/2025)
├─ GAES-02: Promedio 3.8
│  ├─ Evaluación 1: 3.8 (10/01/2025)
│  └─ Evaluación 2: 3.8 (20/01/2025)
└─ Promedio Total: 4.0
```

**Indicadores de éxito**:
- Tiempo de carga: <1 segundo
- Precisión de cálculos: 100%
- Actualización automática: cada 5 minutos

---

### **Objetivo 3: Ver Mis Proyectos Asignados**

**Específico**: El aprendiz puede visualizar los proyectos que le han asignado con estado, entregables y fechas.

**Medibles**:
- ✓ Listar todos los proyectos asignados
- ✓ Ver estado (En proceso, Finalizado, Cancelado)
- ✓ Ver entregables por proyecto
- ✓ Ver fechas de plazo
- ✓ Ver porcentaje de completitud

**Estructura de datos**:
```
Mis Proyectos:
├─ Proyecto: Sistema de Ventas (GAES-01)
│  ├─ Estado: En Proceso (75%)
│  ├─ Fecha Inicio: 01/01/2025
│  ├─ Fecha Plazo: 31/03/2025
│  ├─ Entregables:
│  │  ├─ ✓ T1: Diseño UI (15/01/25) - Completado
│  │  ├─ ✓ T2: Backend API (22/01/25) - Completado
│  │  ├─ ⧗ T3: Testing (En progreso 80%)
│  │  ├─ ○ T4: Documentación (No iniciado)
│  │  └─ ○ T5: Deploy (No iniciado)
│  └─ Descripción: Aplicación web para gestión...

└─ Proyecto: App Móvil (GAES-02)
   ├─ Estado: En Proceso (40%)
   └─ ...
```

**Indicadores de éxito**:
- Proyectos cargados: <1 segundo
- Información actualizada: cada 10 minutos
- Claridad visual: fácil identificar pendientes

---

### **Objetivo 4: Ver Integrantes de Mi GAES**

**Específico**: El aprendiz puede visualizar quiénes son sus compañeros en el grupo GAES.

**Medibles**:
- ✓ Listar todos los integrantes del GAES
- ✓ Ver nombre, email, documento
- ✓ Filtrar integrantes
- ✓ Ver estado (Activo, Inactivo, Retirado)

**Estructura de datos**:
```
Mi GAES: GAES-01 (5 integrantes)
├─ 1. Juan Pérez López
│  ├─ Email: juan.perez@sena.edu.co
│  ├─ Documento: CC 1234567890
│  └─ Estado: Activo
├─ 2. María López García
│  ├─ Email: maria.lopez@sena.edu.co
│  ├─ Documento: CC 9876543210
│  └─ Estado: Activo
├─ 3. Carlos Martínez
│  ├─ Email: carlos.martinez@sena.edu.co
│  ├─ Documento: CC 5555555555
│  └─ Estado: Activo
├─ 4. Ana García Rodríguez
├─ 5. Pedro Rodríguez Torres
└─ Total: 5 aprendices
```

**Indicadores de éxito**:
- Carga de integrantes: <500ms
- Información completa: 100%
- Actualización automática

---

### **Objetivo 5: Recibir Notificaciones**

**Específico**: El aprendiz recibe notificaciones en tiempo real sobre cambios en sus calificaciones, proyectos y mensajes.

**Medibles**:
- ✓ Notificación cuando se registra calificación
- ✓ Notificación cuando cambiar estado proyecto
- ✓ Notificación de nuevos mensajes
- ✓ Notificación de próximos plazos
- ✓ Recibir en <1 segundo

**Tipos de notificaciones**:
```
🔔 Se registró tu calificación en GAES-01: 4.5
📋 El estado del proyecto "Sistema de Ventas" cambió a En Proceso
💬 Nuevo mensaje del Instructor Juan Pérez
⏰ Faltan 5 días para entregar "T3: Testing"
✅ Tu compañero María López completó un entregable
```

**Indicadores de éxito**:
- Notificaciones entregadas: >99%
- Tiempo de entrega: <1 segundo
- Claridad del mensaje: entendible para cualquiera

---

### **Objetivo 6: Enviar y Recibir Mensajes**

**Específico**: El aprendiz puede comunicarse con instructores mediante un sistema de mensajería seguro.

**Medibles**:
- ✓ Enviar mensajes a instructores
- ✓ Recibir y leer mensajes
- ✓ Ver historial de conversaciones
- ✓ Marcar como leído/no leído
- ✓ Búsqueda en mensajes

**Estructura de datos**:
```
Mis Mensajes:
├─ De: Juan Pérez (Instructor GAES-01)
│  ├─ Último mensaje: "Excelente trabajo en el entregable..."
│  ├─ Fecha: 10/02/2025 14:30
│  └─ Sin leer: 2 mensajes
├─ De: María López (Instructor GAES-02)
│  ├─ Último mensaje: "Por favor revisar los cambios..."
│  ├─ Fecha: 09/02/2025 10:15
│  └─ Sin leer: 0 mensajes
└─ De: Carlos García (Compañero)
   ├─ Último mensaje: "¿Terminaste tu parte?"
   └─ Fecha: 08/02/2025 16:45
```

**Indicadores de éxito**:
- Mensaje enviado: <500ms
- Mensaje recibido: <1 segundo
- Historial accesible: siempre
- Almacenamiento: 2 años

---

### **Objetivo 7: Actualizar Mi Perfil**

**Específico**: El aprendiz puede actualizar su información personal y cambiar contraseña.

**Medibles**:
- ✓ Actualizar nombre y apellido
- ✓ Cambiar foto de perfil (JPG, PNG, máx 5MB)
- ✓ Cambiar correo (si es único)
- ✓ Cambiar contraseña con validación
- ✓ Guardar cambios en <1 segundo

**Campos editables**:
```
Mi Perfil:
├─ Nombre: [Juan Pérez] ← Editable
├─ Apellido: [López García] ← Editable
├─ Email: juan.perez@sena.edu.co ← Editable
├─ Documento: CC 1234567890 (fijo)
├─ Foto de Perfil: [Cambiar Foto] ← Editable
├─ GAES: GAES-01 (fijo)
├─ Ficha: Ficha 2024-001 (fijo)
└─ Cambiar Contraseña ← Editable
```

**Indicadores de éxito**:
- Cambios guardados: <1 segundo
- Validación en tiempo real
- Foto cargada: <2 segundos
- Foto visible inmediatamente

---

### **Objetivo 8: Acceso desde Cualquier Dispositivo**

**Específico**: El aprendiz puede acceder desde desktop, tablet o móvil con la misma funcionalidad.

**Medibles**:
- ✓ Funcionalidad 100% en desktop (>1200px)
- ✓ Funcionalidad 100% en tablet (768-1200px)
- ✓ Funcionalidad 85% en móvil (<768px)
- ✓ Carga <4 segundos en móvil
- ✓ Batería: <10% consumo por hora

**Resoluciones soportadas**:
```
Desktop: 1920x1080, 1440x900, 1024x768 ✓ 100%
Tablet:  iPad (768x1024), iPad Pro (1024x1366) ✓ 100%
Mobile:  iPhone (375x667), Samsung (360x740) ✓ 85%
```

**Indicadores de éxito**:
- Usuarios móvil: 30-40% del total
- Satisfacción móvil: >4/5 estrellas
- Tasa abandono móvil: <5%

---

### **Objetivo 9: Ver Dashboard Personal**

**Específico**: El aprendiz tiene un panel de control que resume su información académica.

**Medibles**:
- ✓ Ver promedio general
- ✓ Proyectos activos
- ✓ Próximos plazos
- ✓ Mensajes sin leer
- ✓ Notificaciones recientes
- ✓ Gráfico de progreso

**Dashboard contiene**:
```
┌─────────────────────────────────────────┐
│  Mi Dashboard - APRENDIZ               │
├─────────────────────────────────────────┤
│                                         │
│  📊 Mis Estadísticas                    │
│  ├─ Promedio General: 4.0 (Bueno)      │
│  ├─ Proyectos Activos: 2                │
│  ├─ Evaluaciones: 8 realizadas          │
│  └─ Entregables Completados: 6/10       │
│                                         │
│  ⏰ Próximos Plazos                     │
│  ├─ 15/02 - T3: Testing (5 días)       │
│  └─ 28/02 - Proyecto Final (18 días)   │
│                                         │
│  💬 Mensajes: 2 sin leer               │
│                                         │
│  📈 Mi Progreso                        │
│  Proyectos: ████████░░░░░░░░░░ 60%     │
│                                         │
└─────────────────────────────────────────┘
```

**Indicadores de éxito**:
- Carga dashboard: <2 segundos
- Datos actualizados: cada 5 minutos
- Gráficos claros: fácil interpretación

---

### **Objetivo 10: Descargar Mis Reportes**

**Específico**: El aprendiz puede descargar un reporte de sus calificaciones en PDF.

**Medibles**:
- ✓ Descargar PDF con todas mis calificaciones
- ✓ Incluir promedio general
- ✓ Incluir gráfico de distribución
- ✓ Incluir fecha de generación
- ✓ Descargar en <5 segundos

**Contenido del PDF**:
```
┌────────────────────────────────────────┐
│  MI REPORTE ACADÉMICO                  │
│  Período: 01/01/2025 - 31/01/2025     │
│  Generado: 10/02/2025                 │
├────────────────────────────────────────┤
│                                        │
│  Información Personal                 │
│  • Nombre: Juan Pérez López           │
│  • GAES: GAES-01                      │
│  • Ficha: Ficha 2024-001              │
│                                        │
│  Resumen de Calificaciones             │
│  • Total Evaluaciones: 8               │
│  • Promedio General: 4.0 (Bueno)      │
│  • Calificación Máxima: 4.5            │
│  • Calificación Mínima: 3.5            │
│                                        │
│  Detalle por GAES                      │
│  GAES-01 (Promedio: 4.2)               │
│  ├─ Eval 1: 4.0                       │
│  ├─ Eval 2: 4.5                       │
│  └─ Eval 3: 4.1                       │
│                                        │
│  Gráfico de Distribución               │
│  Excelente (4.5-5): ███ 25%            │
│  Bueno (3.5-4.4):   █████ 65%         │
│  Regular (2.5-3.4):  █ 10%             │
│                                        │
└────────────────────────────────────────┘
```

**Indicadores de éxito**:
- PDF generado: <5 segundos
- Formato correcto: 100%
- Información completa: 100%

---

## 🎯 RESUMEN DE OBJETIVOS

| # | Objetivo | Tipo | Prioridad |
|---|----------|------|-----------|
| 1 | Autenticación segura | Seguridad | 🔴 Crítica |
| 2 | Ver calificaciones | Académico | 🔴 Crítica |
| 3 | Ver proyectos asignados | Académico | 🔴 Crítica |
| 4 | Ver integrantes GAES | Social | 🟠 Alta |
| 5 | Recibir notificaciones | Comunicación | 🟠 Alta |
| 6 | Mensajería | Comunicación | 🟠 Alta |
| 7 | Actualizar perfil | Personal | 🟡 Media |
| 8 | Acceso multi-dispositivo | UX | 🟠 Alta |
| 9 | Dashboard personal | Visualización | 🟠 Alta |
| 10 | Descargar reportes | Reportes | 🟡 Media |

---

## 📊 MÉTRICAS DE ÉXITO APRENDIZ

| Métrica | Objetivo |
|---------|----------|
| **Tiempo respuesta** | <1 segundo (promedio) |
| **Disponibilidad** | 99.5% uptime |
| **Carga página** | <2 segundos |
| **Precisión datos** | 100% |
| **Satisfacción usuario** | >4.5/5 estrellas |
| **Acceso móvil** | 30-40% de total |

---

## 🔄 FLUJO DE USO TÍPICO DEL APRENDIZ

```
1. Inicio de Sesión
   ↓
2. Ve Dashboard (Resumen de académico)
   ↓
3. Verifica Calificaciones
   ↓
4. Revisa Proyectos Pendientes
   ↓
5. Envía Mensaje al Instructor (si tiene duda)
   ↓
6. Recibe Notificación de Respuesta
   ↓
7. Descarga Reporte (opcional)
   ↓
8. Cierra Sesión
```

---

## ✅ ÉXITO = CUANDO EL APRENDIZ PUEDE:

✓ Entrar con sus credenciales en <500ms
✓ Ver todas sus calificaciones en tiempo real
✓ Saber qué proyectos tiene pendientes
✓ Comunicarse con instructores
✓ Acceder desde el celular
✓ Descargar su reporte en cualquier momento
✓ Estar informado de cambios (notificaciones)
✓ Actualizar su información cuando sea necesario

---

**Documento:** OBJETIVO_ESPECIFICO_APRENDIZ.md
**Versión:** 1.0
**Fecha:** 2025
