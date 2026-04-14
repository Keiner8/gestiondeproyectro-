from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('css/<path:path>', serve, {'document_root': settings.BASE_DIR / 'frontend_assets' / 'css'}),
    path('js/<path:path>', serve, {'document_root': settings.BASE_DIR / 'frontend_assets' / 'js'}),
    path('img/<path:path>', serve, {'document_root': settings.BASE_DIR / 'frontend_assets' / 'img'}),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
