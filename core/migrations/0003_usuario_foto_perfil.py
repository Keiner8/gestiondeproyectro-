from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_instructor_ficha'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='foto_perfil',
            field=models.TextField(blank=True, null=True),
        ),
    ]
