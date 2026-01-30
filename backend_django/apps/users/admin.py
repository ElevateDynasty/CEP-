from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserFavoriteBreed, UserComparison


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'user_type', 'state', 'is_active', 'date_joined']
    list_filter = ['user_type', 'state', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'full_name', 'phone']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone', 'user_type', 'avatar', 'bio')}),
        ('Location', {'fields': ('state', 'district', 'village')}),
        ('Preferences', {'fields': ('preferred_language', 'receive_notifications', 'receive_scheme_alerts')}),
        ('Stats', {'fields': ('total_predictions',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'full_name', 'user_type'),
        }),
    )


@admin.register(UserFavoriteBreed)
class UserFavoriteBreedAdmin(admin.ModelAdmin):
    list_display = ['user', 'breed', 'created_at']
    list_filter = ['created_at']
    raw_id_fields = ['user', 'breed']


@admin.register(UserComparison)
class UserComparisonAdmin(admin.ModelAdmin):
    list_display = ['user', 'breed_1', 'breed_2', 'created_at']
    list_filter = ['created_at']
    raw_id_fields = ['user', 'breed_1', 'breed_2']
