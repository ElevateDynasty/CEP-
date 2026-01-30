from django.contrib import admin
from .models import GovernmentScheme, State, Feedback


@admin.register(GovernmentScheme)
class GovernmentSchemeAdmin(admin.ModelAdmin):
    list_display = ['name', 'scheme_type', 'status', 'max_subsidy_amount', 'created_at']
    list_filter = ['scheme_type', 'status', 'created_at']
    search_fields = ['name', 'name_hindi', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'name_hindi', 'description', 'description_hindi', 'scheme_type')
        }),
        ('Eligibility', {
            'fields': ('eligible_states', 'eligible_breeds', 'eligibility_criteria')
        }),
        ('Benefits', {
            'fields': ('benefits', 'max_subsidy_amount', 'subsidy_percentage')
        }),
        ('Application', {
            'fields': ('application_process', 'required_documents', 'application_url')
        }),
        ('Status', {
            'fields': ('status', 'launch_date', 'end_date', 'implementing_agency', 'contact_info')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'region']
    list_filter = ['region']
    search_fields = ['name', 'name_hindi', 'code']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['subject', 'feedback_type', 'user', 'status', 'created_at']
    list_filter = ['feedback_type', 'status', 'created_at']
    search_fields = ['subject', 'message', 'email']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['user', 'related_breed', 'related_prediction']
