"""ML routes — AI/ML API endpoints."""

from flask import Blueprint
from backend.controllers.ml_controller import MLController

ml_bp = Blueprint("ml", __name__, url_prefix="/api/ml")


# --- Smart Categorisation ---
@ml_bp.route("/predict-category", methods=["POST"])
def predict_category():
    """Predict expense category from description."""
    return MLController.predict_category()


# --- Anomaly Detection ---
@ml_bp.route("/anomalies/<string:email>/<int:group_id>", methods=["GET"])
def detect_anomalies(email, group_id):
    """Detect unusual expenses."""
    return MLController.detect_anomalies(email, group_id)


# --- Expense Forecasting ---
@ml_bp.route("/forecast/<string:email>/<int:group_id>", methods=["GET"])
def forecast(email, group_id):
    """Get spending forecast."""
    return MLController.forecast(email, group_id)


# --- Combined Dashboard ---
@ml_bp.route("/dashboard/<string:email>/<int:group_id>", methods=["GET"])
def ml_dashboard(email, group_id):
    """Get all ML insights in one call."""
    return MLController.ml_dashboard(email, group_id)
