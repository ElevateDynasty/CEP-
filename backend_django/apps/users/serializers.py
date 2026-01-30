"""
User serializers
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework.authtoken.models import Token

from .models import User, UserFavoriteBreed, UserComparison


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'full_name',
            'phone', 'user_type', 'state', 'district', 'preferred_language'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': "Passwords don't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        user = authenticate(email=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer"""
    
    state_name = serializers.CharField(source='state.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'user_type',
            'state', 'state_name', 'district', 'village',
            'preferred_language', 'receive_notifications', 'receive_scheme_alerts',
            'total_predictions', 'avatar', 'bio',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'email', 'total_predictions', 'date_joined', 'last_login']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'full_name', 'phone', 'user_type',
            'state', 'district', 'village',
            'preferred_language', 'receive_notifications', 'receive_scheme_alerts',
            'avatar', 'bio'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is not correct.')
        return value


class UserFavoriteBreedSerializer(serializers.ModelSerializer):
    """Serializer for favorite breeds"""
    
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    breed_type = serializers.CharField(source='breed.animal_type', read_only=True)
    breed_image = serializers.CharField(source='breed.image', read_only=True)
    
    class Meta:
        model = UserFavoriteBreed
        fields = ['id', 'breed', 'breed_name', 'breed_type', 'breed_image', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserComparisonSerializer(serializers.ModelSerializer):
    """Serializer for saved comparisons"""
    
    breed_1_name = serializers.CharField(source='breed_1.name', read_only=True)
    breed_2_name = serializers.CharField(source='breed_2.name', read_only=True)
    
    class Meta:
        model = UserComparison
        fields = ['id', 'breed_1', 'breed_1_name', 'breed_2', 'breed_2_name', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
