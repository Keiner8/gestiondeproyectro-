import json

from django.contrib.auth.hashers import make_password
from django.test import Client, TestCase

from .models import Aprendiz, Ficha, Rol, Trimestre, Usuario
from .views import issue_token


class BaseApiTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.rol_admin = Rol.objects.create(nombre_rol='administrador')
        self.rol_aprendiz = Rol.objects.create(nombre_rol='aprendiz')
        self.admin = Usuario.objects.create(
            nombre='Admin',
            apellido='Principal',
            correo='admin@test.com',
            password=make_password('Clave123*'),
            numero_documento='99999999',
            tipo_documento='CC',
            estado='ACTIVO',
            rol=self.rol_admin,
        )
        self.auth_headers = {
            'HTTP_AUTHORIZATION': f'Bearer {issue_token(self.admin)}',
        }


class AuthFlowTests(TestCase):
    def test_register_and_login_returns_dashboard(self):
        Rol.objects.create(id=3, nombre_rol='aprendiz')
        payload = {
            'nombre': 'Ana',
            'apellido': 'Lopez',
            'correo': 'ana@test.com',
            'password': 'Clave123*',
            'tipoDocumento': 'CC',
            'numeroDocumento': '12345678',
            'rolId': 3,
        }

        register_response = self.client.post(
            '/api/auth/register',
            data=json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(register_response.status_code, 201)

        login_response = self.client.post(
            '/api/auth/login',
            data=json.dumps({'correo': 'ana@test.com', 'password': 'Clave123*'}),
            content_type='application/json',
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()['dashboard'], '/dashboard/aprendiz')
        self.assertTrue(Aprendiz.objects.filter(usuario__correo='ana@test.com').exists())


class UsuariosCrudTests(BaseApiTestCase):
    def test_create_and_update_usuario(self):
        payload = {
            'nombre': 'Carlos',
            'apellido': 'Perez',
            'correo': 'carlos@test.com',
            'tipoDocumento': 'CC',
            'numeroDocumento': '11112222',
            'estado': 'ACTIVO',
            'rolId': self.rol_aprendiz.id,
            'password': 'Temporal123*',
        }

        create_response = self.client.post(
            '/api/usuarios',
            data=json.dumps(payload),
            content_type='application/json',
            **self.auth_headers,
        )
        self.assertEqual(create_response.status_code, 201)
        usuario_id = create_response.json()['id']

        update_response = self.client.put(
            f'/api/usuarios/{usuario_id}',
            data=json.dumps({'nombre': 'Carlos Editado', 'estado': 'INACTIVO', 'rolId': self.rol_aprendiz.id}),
            content_type='application/json',
            **self.auth_headers,
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()['nombre'], 'Carlos Editado')
        self.assertEqual(update_response.json()['estado'], 'INACTIVO')


class FichasYTrimestresCrudTests(BaseApiTestCase):
    def test_create_ficha_and_trimestre(self):
        ficha_payload = {
            'codigoFicha': '289001',
            'programaFormacion': 'Analisis y Desarrollo de Software',
            'jornada': 'TARDE',
            'modalidad': 'PRESENCIAL',
            'fechaInicio': '2026-01-10',
            'fechaFin': '2026-12-10',
            'estado': 'ACTIVO',
            'nivel': 'TECNOLOGO',
        }
        ficha_response = self.client.post(
            '/api/fichas',
            data=json.dumps(ficha_payload),
            content_type='application/json',
            **self.auth_headers,
        )
        self.assertEqual(ficha_response.status_code, 201)
        ficha_id = ficha_response.json()['id']

        trimestre_response = self.client.post(
            '/api/trimestres',
            data=json.dumps(
                {
                    'numero': 1,
                    'fichaId': ficha_id,
                    'fechaInicio': '2026-01-10',
                    'fechaFin': '2026-04-10',
                    'estado': 'ACTIVO',
                }
            ),
            content_type='application/json',
            **self.auth_headers,
        )
        self.assertEqual(trimestre_response.status_code, 201)
        self.assertEqual(trimestre_response.json()['fichaId'], ficha_id)


class AprendicesCrudTests(BaseApiTestCase):
    def setUp(self):
        super().setUp()
        self.ficha = Ficha.objects.create(
            codigo_ficha='300100',
            programa_formacion='Programacion',
            jornada='MANANA',
            modalidad='VIRTUAL',
            fecha_inicio='2026-02-01',
            fecha_fin='2026-11-30',
            estado='ACTIVO',
            nivel='TECNICO',
        )
        self.usuario_aprendiz = Usuario.objects.create(
            nombre='Luisa',
            apellido='Rios',
            correo='luisa@test.com',
            password=make_password('Clave123*'),
            numero_documento='33334444',
            tipo_documento='CC',
            estado='ACTIVO',
            rol=self.rol_aprendiz,
        )

    def test_create_and_disable_aprendiz(self):
        create_response = self.client.post(
            '/api/aprendices',
            data=json.dumps(
                {
                    'usuarioId': self.usuario_aprendiz.id,
                    'fichaId': self.ficha.id,
                    'estado': 'ACTIVO',
                    'esLider': True,
                }
            ),
            content_type='application/json',
            **self.auth_headers,
        )
        self.assertEqual(create_response.status_code, 201)
        aprendiz_id = create_response.json()['id']

        disable_response = self.client.patch(
            f'/api/aprendices/{aprendiz_id}/desactivar',
            data='{}',
            content_type='application/json',
            **self.auth_headers,
        )
        self.assertEqual(disable_response.status_code, 200)
        self.assertEqual(disable_response.json()['estado'], 'INACTIVO')


class AuthorizationTests(BaseApiTestCase):
    def test_usuarios_requires_token(self):
        response = self.client.get('/api/usuarios')
        self.assertEqual(response.status_code, 401)
