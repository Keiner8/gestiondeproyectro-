from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_usuario_foto_perfil'),
    ]

    operations = [
        migrations.AddField(
            model_name='ficha',
            name='nivel',
            field=models.CharField(
                choices=[('tecnico', 'Tecnico'), ('tecnologo', 'Tecnologo')],
                default='tecnico',
                max_length=20,
            ),
        ),
    ]
