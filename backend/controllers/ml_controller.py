"""ML Controller — handles AI/ML API requests."""

from flask import request, jsonify
from database.models.user_model import User
from backend.ml.engine import MLEngine


class MLController:
    """Controller for AI/ML endpoints."""

    # ------------------------------------------------------------------
    # 1. Smart Categorisation
    # ------------------------------------------------------------------

    @staticmethod
    def predict_category():
        """Predict expense category from description text.

        Body JSON: { description, email? , group_id? }
        """
        data = request.get_json()
        description = (data.get("description") or "").strip()

        if not description:
            return jsonify({"message": "description is required"}), 400

        user_id = None
        group_id = data.get("group_id")
        email = data.get("email")
        if email:
            user = User.get_by_email(email)
            if user:
                user_id = user["id"]

        result = MLEngine.predict_category(description, user_id, group_id)
        return jsonify(result), 200

    # ------------------------------------------------------------------
    # 2. Anomaly Detection
    # ------------------------------------------------------------------

    @staticmethod
    def detect_anomalies(email, group_id):
        """Detect unusual expenses for a user in a group."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({"message": "User not found"}), 404

        anomalies = MLEngine.detect_anomalies(user["id"], int(group_id))
        return jsonify({"anomalies": anomalies, "count": len(anomalies)}), 200

    # ------------------------------------------------------------------
    # 3. Expense Forecasting
    # ------------------------------------------------------------------

    @staticmethod
    def forecast(email, group_id):
        """Forecast future weekly spending."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({"message": "User not found"}), 404

        periods = request.args.get("periods", 4, type=int)
        periods = min(periods, 12)

        result = MLEngine.forecast_spending(user["id"], int(group_id), periods)
        return jsonify(result), 200

    # ------------------------------------------------------------------
    # 4. Combined ML dashboard data (single call for frontend)
    # ------------------------------------------------------------------

    @staticmethod
    def ml_dashboard(email, group_id):
        """Return all ML insights in one response for the dashboard."""
        user = User.get_by_email(email)
        if not user:
            return jsonify({"message": "User not found"}), 404

        uid = user["id"]
        gid = int(group_id)

        anomalies = MLEngine.detect_anomalies(uid, gid)
        forecast = MLEngine.forecast_spending(uid, gid)

        return jsonify({
            "anomalies": anomalies,
            "anomaly_count": len(anomalies),
            "forecast": forecast,
        }), 200
