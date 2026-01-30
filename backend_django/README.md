# Indian Cattle & Buffalo Breed Recognition - Django Backend

A Django-based REST API for AI-powered breed identification of Indian cattle and buffaloes.

## Features

### Core Features
- **Two-Stage ML Classification**: Animal type detection (cattle/buffalo) followed by breed identification
- **Grad-CAM Visualization**: Explainable AI with heatmap generation
- **Comprehensive Breed Database**: Detailed information on Indian cattle and buffalo breeds
- **Breed Comparison**: Side-by-side comparison of multiple breeds

### Django-Specific Features
- **User Authentication**: Token-based authentication with registration/login
- **Prediction History**: Track and review past predictions
- **User Favorites**: Save favorite breeds and comparisons
- **Government Schemes**: Database of livestock-related government programs
- **Analytics Dashboard**: Usage statistics and insights
- **Admin Panel**: Full Django admin interface for content management
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Tech Stack

- **Django 5.0+**: Web framework
- **Django REST Framework**: RESTful API toolkit
- **PyTorch**: Deep learning framework
- **PostgreSQL/SQLite**: Database
- **Redis**: Caching and Celery broker (optional)
- **Celery**: Async task processing (optional)

## Quick Start

### 1. Setup Virtual Environment

```bash
cd backend_django
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Setup Initial Data

```bash
python manage.py setup_initial_data
python manage.py import_breeds
```

### 5. Create Superuser (for admin access)

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/v1/users/register/` - Register new user
- `POST /api/v1/users/login/` - Login and get token
- `POST /api/v1/users/logout/` - Logout
- `GET /api/v1/users/profile/` - Get/update profile

### Predictions
- `POST /api/v1/predict/` - Upload image for breed prediction
- `GET /api/v1/predict/history/` - Get prediction history (authenticated)
- `GET /api/v1/predict/{id}/` - Get prediction details
- `PATCH /api/v1/predict/{id}/feedback/` - Submit feedback

### Breeds
- `GET /api/v1/breeds/` - List all breeds (with filtering)
- `GET /api/v1/breeds/{breed_id}/` - Get breed details
- `POST /api/v1/breeds/compare/` - Compare multiple breeds
- `GET /api/v1/breeds/stats/` - Get breed statistics

### User Features
- `GET /api/v1/users/favorites/` - List favorite breeds
- `POST /api/v1/users/favorites/` - Add favorite
- `GET /api/v1/users/comparisons/` - Saved comparisons

### Analytics
- `GET /api/v1/analytics/dashboard/` - Dashboard stats
- `GET /api/v1/analytics/breeds/` - Breed analytics
- `GET /api/v1/analytics/popular/` - Popular breeds

### Other
- `GET /api/v1/schemes/` - Government schemes
- `POST /api/v1/feedback/` - Submit feedback
- `GET /api/v1/health/` - Health check

## API Documentation

- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## Admin Panel

Access the Django admin at `http://localhost:8000/admin/`

Features:
- Manage breeds, schemes, and users
- View prediction history
- Monitor analytics
- Content moderation

## Environment Variables

Create a `.env` file:

```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional - uses SQLite by default)
DB_NAME=breed_recognition
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis (optional)
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0
```

## Project Structure

```
backend_django/
├── breed_recognition/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── core/                   # Core app (schemes, states, feedback)
│   ├── breeds/                 # Breed information
│   ├── predictions/            # ML predictions
│   ├── users/                  # User authentication
│   └── analytics/              # Usage analytics
├── manage.py
└── requirements.txt
```

## Migration from FastAPI

This Django backend is compatible with the existing frontend. The main API endpoints remain the same:
- `/api/v1/predict` - Same request/response format
- `/api/v1/breeds` - Same data structure
- `/api/v1/compare` - Same comparison functionality

New features are available under additional endpoints.

## License

MIT License
