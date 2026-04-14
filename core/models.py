from django.db import models


class Rol(models.Model):
    nombre_rol = models.CharField(max_length=50)

    class Meta:
        db_table = 'rol'
        ordering = ['id']

    def __str__(self):
        return self.nombre_rol


class Usuario(models.Model):
    class Estado(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        INACTIVO = 'inactivo', 'Inactivo'

    nombre = models.CharField(max_length=45)
    apellido = models.CharField(max_length=45)
    correo = models.EmailField(unique=True, max_length=100)
    password = models.CharField(max_length=255)
    tipo_documento = models.CharField(max_length=20)
    numero_documento = models.CharField(max_length=10, unique=True)
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, db_column='rol_id', related_name='usuarios')
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.ACTIVO)
    debe_cambiar_password = models.BooleanField(default=False)
    password_temporal = models.BooleanField(default=False)

    class Meta:
        db_table = 'usuario'
        ordering = ['id']

    def __str__(self):
        return f'{self.nombre} {self.apellido}'.strip()


class Ficha(models.Model):
    class Nivel(models.TextChoices):
        TECNICO = 'tecnico', 'Tecnico'
        TECNOLOGO = 'tecnologo', 'Tecnologo'

    class Jornada(models.TextChoices):
        MANANA = 'mañana', 'Manana'
        TARDE = 'tarde', 'Tarde'
        NOCHE = 'noche', 'Noche'
        MIXTA = 'mixta', 'Mixta'

    class Modalidad(models.TextChoices):
        PRESENCIAL = 'presencial', 'Presencial'
        VIRTUAL = 'virtual', 'Virtual'
        MIXTA = 'mixta', 'Mixta'

    class Estado(models.TextChoices):
        ACTIVA = 'activa', 'Activa'
        INACTIVA = 'inactiva', 'Inactiva'

    codigo_ficha = models.CharField(max_length=20, unique=True)
    programa_formacion = models.CharField(max_length=100)
    nivel = models.CharField(max_length=20, choices=Nivel.choices, default=Nivel.TECNICO)
    jornada = models.CharField(max_length=20, choices=Jornada.choices)
    modalidad = models.CharField(max_length=20, choices=Modalidad.choices)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.ACTIVA)

    class Meta:
        db_table = 'ficha'
        ordering = ['id']

    def __str__(self):
        return f'{self.codigo_ficha} - {self.programa_formacion}'


class Aprendiz(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='usuario_id', related_name='aprendiz_perfiles')
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, db_column='ficha_id', related_name='aprendices')

    class Meta:
        db_table = 'aprendiz'
        ordering = ['id']

    def __str__(self):
        return f'Aprendiz {self.usuario_id}'


class Instructor(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='usuario_id', related_name='instructor_perfiles')
    ficha = models.ForeignKey(Ficha, on_delete=models.SET_NULL, db_column='ficha_id', related_name='instructores', null=True, blank=True)
    especialidad = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'instructor'
        ordering = ['id']

    def __str__(self):
        return f'Instructor {self.usuario_id}'


class Administrador(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, db_column='usuario_id', related_name='administrador_perfil')

    class Meta:
        db_table = 'administrador'
        ordering = ['id']

    def __str__(self):
        return f'Administrador {self.usuario_id}'


class Trimestre(models.Model):
    class Estado(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        FINALIZADO = 'finalizado', 'Finalizado'
        PENDIENTE = 'pendiente', 'Pendiente'

    numero = models.PositiveIntegerField()
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, db_column='ficha_id', related_name='trimestres')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.ACTIVO)

    class Meta:
        db_table = 'trimestre'
        ordering = ['ficha_id', 'numero']


class Gaes(models.Model):
    nombre = models.CharField(max_length=100)
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, db_column='ficha_id', related_name='gaes')

    class Meta:
        db_table = 'gaes'
        ordering = ['id']

    def __str__(self):
        return self.nombre


class AprendizGaes(models.Model):
    aprendiz = models.ForeignKey(Aprendiz, on_delete=models.CASCADE, db_column='aprendiz_id', related_name='gaes_links')
    gaes = models.ForeignKey(Gaes, on_delete=models.CASCADE, db_column='gaes_id', related_name='aprendiz_links')

    class Meta:
        db_table = 'aprendiz_gaes'
        ordering = ['id']


class Proyecto(models.Model):
    class Estado(models.TextChoices):
        EN_PROCESO = 'en_proceso', 'En proceso'
        FINALIZADO = 'finalizado', 'Finalizado'
        CANCELADO = 'cancelado', 'Cancelado'

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    gaes = models.ForeignKey(Gaes, on_delete=models.CASCADE, db_column='gaes_id', related_name='proyectos')
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.EN_PROCESO)

    class Meta:
        db_table = 'proyecto'
        ordering = ['id']


class Entregable(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, db_column='proyecto_id', related_name='entregables')
    trimestre = models.ForeignKey(Trimestre, on_delete=models.CASCADE, db_column='trimestre_id', related_name='entregables')
    aprendiz = models.ForeignKey(Aprendiz, on_delete=models.SET_NULL, db_column='aprendiz_id', related_name='entregables', null=True, blank=True)
    url = models.CharField(max_length=200, blank=True, null=True)
    archivo = models.BinaryField(blank=True, null=True)
    nombre_archivo = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'entregable'
        ordering = ['id']


class ProyectoEntregable(models.Model):
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, db_column='proyecto_id')
    entregable = models.ForeignKey(Entregable, on_delete=models.CASCADE, db_column='entregable_id')

    class Meta:
        db_table = 'proyecto_entregable'
        ordering = ['id']


class Evaluacion(models.Model):
    entregable = models.ForeignKey(Entregable, on_delete=models.CASCADE, db_column='entregable_id', related_name='evaluaciones')
    aprendiz = models.ForeignKey(Aprendiz, on_delete=models.SET_NULL, db_column='aprendiz_id', related_name='evaluaciones', null=True, blank=True)
    gaes = models.ForeignKey(Gaes, on_delete=models.SET_NULL, db_column='gaes_id', related_name='evaluaciones', null=True, blank=True)
    evaluador = models.ForeignKey(Instructor, on_delete=models.CASCADE, db_column='evaluador_id', related_name='evaluaciones_realizadas')
    calificacion = models.DecimalField(max_digits=5, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)
    fecha = models.DateField()

    class Meta:
        db_table = 'evaluacion'
        ordering = ['-id']
