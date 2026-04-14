from django.contrib import admin
from .models import Administrador, Aprendiz, AprendizGaes, Entregable, Evaluacion, Ficha, Gaes, Instructor, Proyecto, ProyectoEntregable, Rol, Trimestre, Usuario

admin.site.register(Rol)
admin.site.register(Usuario)
admin.site.register(Ficha)
admin.site.register(Gaes)
admin.site.register(Trimestre)
admin.site.register(Aprendiz)
admin.site.register(AprendizGaes)
admin.site.register(Instructor)
admin.site.register(Administrador)
admin.site.register(Proyecto)
admin.site.register(ProyectoEntregable)
admin.site.register(Evaluacion)
admin.site.register(Entregable)
