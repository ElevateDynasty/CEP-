"""
Custom User model with extended profile fields
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as the primary identifier"""
    
    USER_TYPES = [
        ('farmer', 'Farmer'),
        ('veterinarian', 'Veterinarian'),
        ('researcher', 'Researcher'),
        ('student', 'Student'),
        ('business', 'Livestock Business'),
        ('government', 'Government Official'),
        ('other', 'Other'),
    ]
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    
    # Profile fields
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='other')
    
    # Location
    state = models.ForeignKey(
        'core.State',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    district = models.CharField(max_length=100, blank=True)
    village = models.CharField(max_length=100, blank=True)
    
    # Preferences
    preferred_language = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('hi', 'Hindi')],
        default='en'
    )
    receive_notifications = models.BooleanField(default=True)
    receive_scheme_alerts = models.BooleanField(default=True)
    
    # Stats
    total_predictions = models.IntegerField(default=0)
    
    # Metadata
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return self.full_name or self.email
    
    def get_short_name(self):
        return self.full_name.split()[0] if self.full_name else self.email.split('@')[0]


class UserFavoriteBreed(models.Model):
    """User's favorite breeds"""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorite_breeds'
    )
    breed = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'breed']
        ordering = ['-created_at']
        verbose_name = _('Favorite Breed')
        verbose_name_plural = _('Favorite Breeds')
    
    def __str__(self):
        return f"{self.user.email} - {self.breed.name}"


class UserComparison(models.Model):
    """Saved breed comparisons"""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='saved_comparisons'
    )
    breed_1 = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.CASCADE,
        related_name='comparisons_as_first'
    )
    breed_2 = models.ForeignKey(
        'breeds.Breed',
        on_delete=models.CASCADE,
        related_name='comparisons_as_second'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Saved Comparison')
        verbose_name_plural = _('Saved Comparisons')
    
    def __str__(self):
        return f"{self.user.email}: {self.breed_1.name} vs {self.breed_2.name}"
