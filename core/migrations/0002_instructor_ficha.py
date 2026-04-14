from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name='instructor',
                    name='ficha',
                    field=models.ForeignKey(
                        blank=True,
                        db_column='ficha_id',
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name='instructores',
                        to='core.ficha',
                    ),
                ),
            ],
        ),
    ]
