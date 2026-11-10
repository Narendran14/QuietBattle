from email.mime import image
from fileinput import filename
import os
from functools import wraps
from unicodedata import category

from flask import Flask, request, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from uuid import uuid4
from supabase_config import supabase


from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY", "quiet-battles-local-development-key"
)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgresql://", "postgresql+psycopg2://", 1
        )

    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///quite_battles.db"


app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# Session cookie configuration
IS_PRODUCTION = os.getenv("FLASK_ENV") == "production"

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None" if IS_PRODUCTION else "Lax"
app.config["SESSION_COOKIE_SECURE"] = IS_PRODUCTION

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
]

if FRONTEND_URL:
    ALLOWED_ORIGINS.append(FRONTEND_URL.rstrip("/"))

CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)


db = SQLAlchemy(app)

UPLOAD_FOLDER = os.path.join(app.root_path, "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024


class series(db.Model):
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(120), nullable=False)
    Description = db.Column(db.Text, nullable=True)


class chapter(db.Model):
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(120), nullable=False)
    Story = db.Column(db.Text, nullable=True)
    series_Id = db.Column(db.Integer, db.ForeignKey("series.Id"), nullable=False)
    product_Id = db.Column(db.Integer, db.ForeignKey("product.Id"), nullable=False)


class product(db.Model):
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(120), nullable=False)
    Description = db.Column(db.Text, nullable=False)
    Price = db.Column(db.Float, nullable=False)


class Admin(db.Model):
    Id = db.Column(db.Integer, primary_key=True)

    Username = db.Column(db.String(100), unique=True, nullable=False)

    Password = db.Column(db.String(255), nullable=False)


class Media(db.Model):
    Id = db.Column(db.Integer, primary_key=True)
    Filename = db.Column(db.String(255), nullable=False)
    OriginalName = db.Column(db.String(255), nullable=False)
    Category = db.Column(db.String(50), nullable=False)
    CreatedAt = db.Column(db.DateTime, server_default=db.func.now())


def admin_required(function):

    @wraps(function)
    def wrapper(*args, **kwargs):

        if "admin_id" not in session:
            return {"error": "Admin login required"}, 401

        return function(*args, **kwargs)

    return wrapper


@app.route("/")
def home():
    return {"message": "Quite Battles backend is running"}


@app.route("/api/series")
def get_series():
    series_items = series.query.all()
    return [
        {
            "id": item.Id,
            "title": item.Title,
            "description": item.Description,
        }
        for item in series_items
    ]


@app.route("/api/series", methods=["POST"])
@admin_required
def add_series():
    data = request.get_json()

    if not data or not data.get("title"):
        return {"error": "A title is required"}, 400

    new_series = series(
        Title=data["title"],
        Description=data.get("description", ""),
    )
    db.session.add(new_series)
    db.session.commit()

    return {"id": new_series.Id, "title": new_series.Title}, 201


@app.route("/api/series/<int:series_id>", methods=["PUT"])
@admin_required
def update_series(series_id):
    item = db.session.get(series, series_id)

    if item is None:
        return {"error": "series is not found"}, 404

    data = request.get_json()

    if not data:
        return {"error": "json body is required"}, 400

    if "title" in data:
        item.Title = data["title"]

    if "description" in data:
        item.Description = data["description"]

    db.session.commit()

    return {"id": item.Id, "title": item.Title, "description": item.Description}


@app.route("/api/series/<int:series_id>", methods=["DELETE"])
@admin_required
def delete_series(series_id):
    series_item = db.session.get(series, series_id)

    if series_item is None:
        return {"error": "Series not found"}, 404

    db.session.delete(series_item)
    db.session.commit()
    return {"message": "series deleted"}


@app.route("/api/products", methods=["POST"])
@admin_required
def add_product():
    data = request.get_json()

    if (
        not data
        or not data.get("title")
        or not data.get("description")
        or data.get("price") is None
    ):
        return {"error": "Title,Description and Price are required"}, 400

    new_product = product(
        Title=data["title"],
        Description=data["description"],
        Price=data["price"],
    )
    db.session.add(new_product)
    db.session.commit()

    return {"id": new_product.Id, "title": new_product.Title}, 201


@app.route("/api/products", methods=["GET"])
def get_products():

    products = product.query.all()

    return [
        {
            "id": item.Id,
            "title": item.Title,
            "description": item.Description,
            "price": item.Price,
        }
        for item in products
    ], 200


@app.route("/api/products/<int:product_id>", methods=["PUT"])
@admin_required
def update_product(product_id):
    item = db.session.get(product, product_id)

    if item is None:
        return {"error": "product not found"}, 404

    data = request.get_json()

    if not data:
        return {"error": "json body is required"}, 400

    if "title" in data:
        item.Title = data["title"]

    if "description" in data:
        item.Description = data["description"]

    if "price" in data:
        item.Price = data["price"]

    db.session.commit()

    return {
        "id": item.Id,
        "title": item.Title,
        "description": item.Description,
        "price": item.Price,
    }


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):

    item = db.session.get(product, product_id)

    if item is None:
        return {"error": "Product not found"}, 404

    if chapter.query.filter_by(product_Id=product_id).first():
        return {
            "error": "This product is linked to a chapter. Reassign the chapter first."
        }, 409

    db.session.delete(item)
    db.session.commit()

    return {"message": "Product deleted successfully"}, 200


@app.route("/api/series/<int:series_id>/chapters", methods=["POST"])
@admin_required
def add_chapter(series_id):
    data = request.get_json()

    if not data or not data.get("title") or not data.get("product_id"):
        return {"error": "Title and Product_id are required"}, 400

    new_chapter = chapter(
        Title=data["title"],
        Story=data.get("story", ""),
        series_Id=series_id,
        product_Id=data["product_id"],
    )
    db.session.add(new_chapter)
    db.session.commit()

    return {"id": new_chapter.Id, "title": new_chapter.Title}, 201


@app.route("/api/series/<int:series_id>/chapters", methods=["GET"])
def get_chapters(series_id):
    chapter_items = chapter.query.filter_by(series_Id=series_id).all()

    return [
        {
            "id": item.Id,
            "title": item.Title,
            "story": item.Story,
            "product_id": item.product_Id,
        }
        for item in chapter_items
    ]


@app.route("/api/chapters/<int:chapter_id>", methods=["PUT"])
@admin_required
def update_chapter(chapter_id):
    item = db.session.get(chapter, chapter_id)

    if item is None:
        return {"error": "chapter not found"}, 404

    data = request.get_json()

    if not data:
        return {"error": "json body is required"}, 400

    if "title" in data:
        item.Title = data["title"]

    if "story" in data:
        item.Story = data["story"]

    if "product_id" in data:
        item.product_Id = data["product_id"]

    db.session.commit()

    return {"id": item.Id, "title": item.Title, "story": item.Story}


@app.route("/api/chapters/<int:chapter_id>", methods=["DELETE"])
@admin_required
def delete_chapter(chapter_id):

    item = db.session.get(chapter, chapter_id)

    if item is None:
        return {"error": "Chapter not found"}, 404

    db.session.delete(item)
    db.session.commit()

    return {"message": "Chapter deleted successfully"}, 200


@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:
        return {"error": "JSON body required"}, 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    admin = Admin.query.filter_by(Username=username).first()

    if not admin or not check_password_hash(admin.Password, password):
        return {"error": "Invalid username or password"}, 401

    session.clear()
    session["admin_id"] = admin.Id

    return {"message": "Login successful", "username": admin.Username}, 200


@app.route("/api/admin/logout", methods=["POST"])
@admin_required
def admin_logout():

    session.clear()

    return {"message": "Logged out successfully"}, 200


@app.route("/api/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():

    return {
        "total_series": series.query.count(),
        "total_chapters": chapter.query.count(),
        "total_products": product.query.count(),
        "admin": True,
    }, 200


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def storage_public_url(filename):
    return supabase.storage.from_("quiet-battles").get_public_url(filename)


# List uploaded images
@app.route("/api/admin/images", methods=["GET"])
@admin_required
def get_images():
    images = Media.query.order_by(Media.Id.desc()).all()

    return [
        {
            "id": item.Id,
            "filename": item.Filename,
            "original_name": item.OriginalName,
            "category": item.Category,
            "url": storage_public_url(item.Filename),
        }
        for item in images
    ], 200


# Upload an image


# Upload an image to Supabase Storage
@app.route("/api/admin/images", methods=["POST"])
@admin_required
def upload_image():
    if "image" not in request.files:
        return {"error": "Please select an image"}, 400

    file = request.files["image"]
    category = request.form.get("category", "").strip()

    allowed_categories = {"Homepage Hero", "Series", "Chapters", "Product"}

    if category not in allowed_categories:
        return {"error": "Invalid image category"}, 400

    if not file or file.filename == "":
        return {"error": "No image selected"}, 400

    if not allowed_file(file.filename):
        return {"error": "Unsupported image format"}, 400

    original_name = secure_filename(file.filename)
    extension = original_name.rsplit(".", 1)[1].lower()
    filename = f"{uuid4().hex}.{extension}"

    try:
        file_data = file.read()

        supabase.storage.from_("quiet-battles").upload(
            path=filename,
            file=file_data,
            file_options={
                "content-type": file.mimetype or "application/octet-stream",
                "upsert": "false",
            },
        )

        image_url = storage_public_url(filename)

        image = Media(Filename=filename, OriginalName=original_name, Category=category)

        db.session.add(image)
        db.session.commit()

        return {
            "message": "Image uploaded successfully",
            "id": image.Id,
            "filename": filename,
            "category": category,
            "url": image_url,
        }, 201

    except Exception as error:
        db.session.rollback()

        try:
            supabase.storage.from_("quiet-battles").remove([filename])
        except Exception:
            pass

        print("Image upload error:", error)

        return {"error": "Could not upload image"}, 500


# Delete an image


# Delete an image from Supabase Storage
@app.route("/api/admin/images/<int:image_id>", methods=["DELETE"])
@admin_required
def delete_image(image_id):
    image = db.session.get(Media, image_id)

    if image is None:
        return {"error": "Image not found"}, 404

    try:
        supabase.storage.from_("quiet-battles").remove([image.Filename])

        db.session.delete(image)
        db.session.commit()

        return {"message": "Image deleted successfully"}, 200

    except Exception as error:
        db.session.rollback()
        print("Image delete error:", error)

        return {"error": "Could not delete image"}, 500


@app.route("/api/media/hero", methods=["GET"])
def get_hero_image():
    image = (
        Media.query.filter_by(Category="Homepage Hero")
        .order_by(Media.Id.desc())
        .first()
    )

    if not image:
        return {"url": None}, 200

    return {"url": storage_public_url(image.Filename)}, 200


@app.route("/api/media/chapter", methods=["GET"])
def get_chapter_image():
    image = Media.query.filter_by(Category="Chapters").order_by(Media.Id.desc()).first()

    return {"url": storage_public_url(image.Filename) if image else None}, 200


@app.route("/api/media/product", methods=["GET"])
def get_product_image():
    image = Media.query.filter_by(Category="Product").order_by(Media.Id.desc()).first()

    return {"url": storage_public_url(image.Filename) if image else None}, 200


# Serve uploaded images
@app.route("/uploads/<path:filename>")
def serve_uploaded_image(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


with app.app_context():

    db.create_all()

    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if admin_username and admin_password:

        existing_admin = Admin.query.filter_by(Username=admin_username).first()

        if not existing_admin:

            new_admin = Admin(
                Username=admin_username, Password=generate_password_hash(admin_password)
            )

            db.session.add(new_admin)
            db.session.commit()

            print("Admin account created successfully!")
