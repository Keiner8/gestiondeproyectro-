from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_state_sync_noop'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterField(
                    model_name='ficha',
                    name='jornada',
                    field=models.CharField(
                        choices=[('mañana', 'Manana'), ('tarde', 'Tarde'), ('noche', 'Noche'), ('mixta', 'Mixta')],
                        max_length=20,
                    ),
                ),
            ],
        ),
    ]
