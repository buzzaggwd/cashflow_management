from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('dds.urls')),  # Frontend
    path('api/', include('dds.api_urls')),  # API
]