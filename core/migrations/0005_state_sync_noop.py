import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_ficha_nivel'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.DeleteModel(name='Evaluacion'),
                migrations.DeleteModel(name='Entregable'),
                migrations.DeleteModel(name='Proyecto'),
                migrations.DeleteModel(name='Trimestre'),
                migrations.DeleteModel(name='Administrador'),
                migrations.DeleteModel(name='Instructor'),
                migrations.DeleteModel(name='Aprendiz'),
                migrations.DeleteModel(name='Gaes'),
                migrations.DeleteModel(name='Usuario'),
                migrations.DeleteModel(name='Ficha'),
                migrations.DeleteModel(name='Rol'),
                migrations.CreateModel(
                    name='Rol',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('nombre_rol', models.CharField(max_length=50)),
                    ],
                    options={
                        'db_table': 'rol',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Ficha',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('codigo_ficha', models.CharField(max_length=20, unique=True)),
                        ('programa_formacion', models.CharField(max_length=100)),
                        ('nivel', models.CharField(choices=[('tecnico', 'Tecnico'), ('tecnologo', 'Tecnologo')], default='tecnico', max_length=20)),
                        ('jornada', models.CharField(choices=[('maÃ±ana', 'Manana'), ('tarde', 'Tarde'), ('noche', 'Noche'), ('mixta', 'Mixta')], max_length=20)),
                        ('modalidad', models.CharField(choices=[('presencial', 'Presencial'), ('virtual', 'Virtual'), ('mixta', 'Mixta')], max_length=20)),
                        ('fecha_inicio', models.DateField()),
                        ('fecha_fin', models.DateField()),
                        ('estado', models.CharField(choices=[('activa', 'Activa'), ('inactiva', 'Inactiva')], default='activa', max_length=20)),
                    ],
                    options={
                        'db_table': 'ficha',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Usuario',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('nombre', models.CharField(max_length=45)),
                        ('apellido', models.CharField(max_length=45)),
                        ('correo', models.EmailField(max_length=100, unique=True)),
                        ('password', models.CharField(max_length=255)),
                        ('tipo_documento', models.CharField(max_length=20)),
                        ('numero_documento', models.CharField(max_length=10, unique=True)),
                        ('estado', models.CharField(choices=[('activo', 'Activo'), ('inactivo', 'Inactivo')], default='activo', max_length=20)),
                        ('debe_cambiar_password', models.BooleanField(default=False)),
                        ('password_temporal', models.BooleanField(default=False)),
                        ('rol', models.ForeignKey(db_column='rol_id', on_delete=django.db.models.deletion.PROTECT, related_name='usuarios', to='core.rol')),
                    ],
                    options={
                        'db_table': 'usuario',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Gaes',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('nombre', models.CharField(max_length=100)),
                        ('ficha', models.ForeignKey(db_column='ficha_id', on_delete=django.db.models.deletion.CASCADE, related_name='gaes', to='core.ficha')),
                    ],
                    options={
                        'db_table': 'gaes',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Aprendiz',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('ficha', models.ForeignKey(db_column='ficha_id', on_delete=django.db.models.deletion.CASCADE, related_name='aprendices', to='core.ficha')),
                        ('usuario', models.ForeignKey(db_column='usuario_id', on_delete=django.db.models.deletion.CASCADE, related_name='aprendiz_perfiles', to='core.usuario')),
                    ],
                    options={
                        'db_table': 'aprendiz',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Instructor',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('especialidad', models.CharField(blank=True, max_length=100, null=True)),
                        ('ficha', models.ForeignKey(blank=True, db_column='ficha_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='instructores', to='core.ficha')),
                        ('usuario', models.ForeignKey(db_column='usuario_id', on_delete=django.db.models.deletion.CASCADE, related_name='instructor_perfiles', to='core.usuario')),
                    ],
                    options={
                        'db_table': 'instructor',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Administrador',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('usuario', models.OneToOneField(db_column='usuario_id', on_delete=django.db.models.deletion.CASCADE, related_name='administrador_perfil', to='core.usuario')),
                    ],
                    options={
                        'db_table': 'administrador',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Trimestre',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('numero', models.PositiveIntegerField()),
                        ('fecha_inicio', models.DateField()),
                        ('fecha_fin', models.DateField()),
                        ('estado', models.CharField(choices=[('activo', 'Activo'), ('finalizado', 'Finalizado'), ('pendiente', 'Pendiente')], default='activo', max_length=20)),
                        ('ficha', models.ForeignKey(db_column='ficha_id', on_delete=django.db.models.deletion.CASCADE, related_name='trimestres', to='core.ficha')),
                    ],
                    options={
                        'db_table': 'trimestre',
                        'ordering': ['ficha_id', 'numero'],
                    },
                ),
                migrations.CreateModel(
                    name='AprendizGaes',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('aprendiz', models.ForeignKey(db_column='aprendiz_id', on_delete=django.db.models.deletion.CASCADE, related_name='gaes_links', to='core.aprendiz')),
                        ('gaes', models.ForeignKey(db_column='gaes_id', on_delete=django.db.models.deletion.CASCADE, related_name='aprendiz_links', to='core.gaes')),
                    ],
                    options={
                        'db_table': 'aprendiz_gaes',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Proyecto',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('nombre', models.CharField(max_length=100)),
                        ('descripcion', models.TextField(blank=True, null=True)),
                        ('fecha_inicio', models.DateField(blank=True, null=True)),
                        ('fecha_fin', models.DateField(blank=True, null=True)),
                        ('estado', models.CharField(choices=[('en_proceso', 'En proceso'), ('finalizado', 'Finalizado'), ('cancelado', 'Cancelado')], default='en_proceso', max_length=20)),
                        ('gaes', models.ForeignKey(db_column='gaes_id', on_delete=django.db.models.deletion.CASCADE, related_name='proyectos', to='core.gaes')),
                    ],
                    options={
                        'db_table': 'proyecto',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Entregable',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('nombre', models.CharField(max_length=100)),
                        ('descripcion', models.TextField(blank=True, null=True)),
                        ('url', models.CharField(blank=True, max_length=200, null=True)),
                        ('archivo', models.BinaryField(blank=True, null=True)),
                        ('nombre_archivo', models.CharField(blank=True, max_length=255, null=True)),
                        ('aprendiz', models.ForeignKey(blank=True, db_column='aprendiz_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='entregables', to='core.aprendiz')),
                        ('proyecto', models.ForeignKey(db_column='proyecto_id', on_delete=django.db.models.deletion.CASCADE, related_name='entregables', to='core.proyecto')),
                        ('trimestre', models.ForeignKey(db_column='trimestre_id', on_delete=django.db.models.deletion.CASCADE, related_name='entregables', to='core.trimestre')),
                    ],
                    options={
                        'db_table': 'entregable',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='ProyectoEntregable',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('entregable', models.ForeignKey(db_column='entregable_id', on_delete=django.db.models.deletion.CASCADE, to='core.entregable')),
                        ('proyecto', models.ForeignKey(db_column='proyecto_id', on_delete=django.db.models.deletion.CASCADE, to='core.proyecto')),
                    ],
                    options={
                        'db_table': 'proyecto_entregable',
                        'ordering': ['id'],
                    },
                ),
                migrations.CreateModel(
                    name='Evaluacion',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('calificacion', models.DecimalField(decimal_places=2, max_digits=5)),
                        ('observaciones', models.TextField(blank=True, null=True)),
                        ('fecha', models.DateField()),
                        ('aprendiz', models.ForeignKey(blank=True, db_column='aprendiz_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='evaluaciones', to='core.aprendiz')),
                        ('entregable', models.ForeignKey(db_column='entregable_id', on_delete=django.db.models.deletion.CASCADE, related_name='evaluaciones', to='core.entregable')),
                        ('evaluador', models.ForeignKey(db_column='evaluador_id', on_delete=django.db.models.deletion.CASCADE, related_name='evaluaciones_realizadas', to='core.instructor')),
                        ('gaes', models.ForeignKey(blank=True, db_column='gaes_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='evaluaciones', to='core.gaes')),
                    ],
                    options={
                        'db_table': 'evaluacion',
                        'ordering': ['-id'],
                    },
                ),
            ],
        ),
    ]
