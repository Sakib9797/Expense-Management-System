"""
ML Engine for Expense Management System.

Provides three AI/ML capabilities:
1. Smart Expense Categorization — TF-IDF + Logistic Regression text classifier
2. Anomaly Detection — Isolation Forest for unusual spending
3. Expense Forecasting — Linear Regression time-series prediction

All models are trained on-the-fly from user data and cached in memory.
When sufficient user data is unavailable, models fall back to sensible defaults.
"""

import os
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from database.db_config import get_db_connection

# ---------------------------------------------------------------------------
# Training-data helpers
# ---------------------------------------------------------------------------

# Seed data so the categoriser works even for brand-new users
_SEED_DATA: list[tuple[str, str]] = [
    # food
    ("lunch at restaurant", "food"), ("dinner takeout", "food"),
    ("grocery shopping", "food"), ("coffee shop", "food"),
    ("breakfast bagel", "food"), ("pizza delivery", "food"),
    ("snacks and drinks", "food"), ("fast food meal", "food"),
    ("sushi dinner", "food"), ("meal prep ingredients", "food"),
    ("brunch with friends", "food"), ("ice cream", "food"),
    ("protein bars", "food"), ("smoothie bowl", "food"),
    ("burger king", "food"), ("starbucks coffee", "food"),
    # transportation
    ("uber ride", "transportation"), ("gas station fuel", "transportation"),
    ("bus pass monthly", "transportation"), ("train ticket", "transportation"),
    ("parking fee", "transportation"), ("car maintenance oil change", "transportation"),
    ("lyft to airport", "transportation"), ("toll road payment", "transportation"),
    ("metro card refill", "transportation"), ("bike repair", "transportation"),
    ("taxi fare", "transportation"), ("car wash", "transportation"),
    ("flight ticket domestic", "transportation"), ("rental car", "transportation"),
    # entertainment
    ("movie tickets", "entertainment"), ("netflix subscription", "entertainment"),
    ("concert tickets", "entertainment"), ("video game purchase", "entertainment"),
    ("spotify premium", "entertainment"), ("book purchase", "entertainment"),
    ("bowling night", "entertainment"), ("museum admission", "entertainment"),
    ("streaming service", "entertainment"), ("theme park pass", "entertainment"),
    ("board game", "entertainment"), ("music festival", "entertainment"),
    ("youtube premium", "entertainment"), ("escape room", "entertainment"),
    # utilities
    ("electric bill payment", "utilities"), ("water bill", "utilities"),
    ("internet monthly bill", "utilities"), ("phone bill", "utilities"),
    ("heating bill", "utilities"), ("trash collection", "utilities"),
    ("gas utility bill", "utilities"), ("cable tv bill", "utilities"),
    ("cell phone plan", "utilities"), ("home insurance", "utilities"),
    ("sewer bill", "utilities"), ("electricity deposit", "utilities"),
    # shopping
    ("new shoes purchase", "shopping"), ("clothing store", "shopping"),
    ("amazon order", "shopping"), ("electronics headphones", "shopping"),
    ("furniture desk chair", "shopping"), ("kitchen appliance", "shopping"),
    ("birthday gift for friend", "shopping"), ("online shopping delivery", "shopping"),
    ("home decor items", "shopping"), ("office supplies", "shopping"),
    ("backpack new", "shopping"), ("sunglasses purchase", "shopping"),
    ("jewelry gift", "shopping"), ("cosmetics makeup", "shopping"),
    # health
    ("gym membership", "health"), ("doctor visit copay", "health"),
    ("pharmacy prescription", "health"), ("dental cleaning", "health"),
    ("vitamins supplements", "health"), ("eye exam glasses", "health"),
    ("therapy session", "health"), ("first aid supplies", "health"),
    ("yoga class monthly", "health"), ("health insurance copay", "health"),
    ("blood test lab", "health"), ("physical therapy", "health"),
    # education
    ("textbook purchase", "education"), ("online course udemy", "education"),
    ("tuition fee payment", "education"), ("school supplies", "education"),
    ("language learning app", "education"), ("certification exam fee", "education"),
    ("tutorial subscription", "education"), ("workshop registration", "education"),
    ("study materials", "education"), ("coding bootcamp", "education"),
    ("library fine", "education"), ("research paper access", "education"),
    # other
    ("miscellaneous expense", "other"), ("donation charity", "other"),
    ("pet food and supplies", "other"), ("laundry dry cleaning", "other"),
    ("haircut salon", "other"), ("bank fee", "other"),
    ("postage shipping", "other"), ("tips and gratuity", "other"),
    ("storage unit monthly", "other"), ("subscription box", "other"),
]


# ---------------------------------------------------------------------------
# ML Engine
# ---------------------------------------------------------------------------

class MLEngine:
    """Central ML engine providing categorisation, anomaly detection, and forecasting."""

    # In-memory caches keyed by (user_id, group_id) or "global"
    _categoriser_cache: dict = {}
    _anomaly_cache: dict = {}

    # ------------------------------------------------------------------
    # 1. SMART EXPENSE CATEGORIZATION
    # ------------------------------------------------------------------

    @classmethod
    def _build_categoriser(cls, user_id: int | None = None, group_id: int | None = None):
        """Train a TF-IDF + LogisticRegression pipeline on seed + user data."""
        texts = [t for t, _ in _SEED_DATA]
        labels = [l for _, l in _SEED_DATA]

        # Augment with real user expenses that have descriptions
        if user_id and group_id:
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute(
                    "SELECT description, category FROM expenses "
                    "WHERE user_id = ? AND group_id = ? AND description IS NOT NULL AND description != ''",
                    (user_id, group_id),
                )
                for row in cur.fetchall():
                    texts.append(row[0])
                    labels.append(row[1])
                conn.close()
            except Exception:
                pass

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words="english",
                lowercase=True,
            )),
            ("clf", LogisticRegression(
                max_iter=1000,
                C=1.0,
                solver="lbfgs",
            )),
        ])
        pipeline.fit(texts, labels)
        return pipeline

    @classmethod
    def predict_category(cls, description: str, user_id: int | None = None, group_id: int | None = None):
        """
        Predict the expense category from a text description.

        Returns dict with:
            predicted_category  – best guess
            confidence          – probability of top class (0-1)
            all_probabilities   – dict mapping each category to its probability
        """
        cache_key = (user_id, group_id) if user_id and group_id else "global"
        if cache_key not in cls._categoriser_cache:
            cls._categoriser_cache[cache_key] = cls._build_categoriser(user_id, group_id)

        pipe = cls._categoriser_cache[cache_key]
        proba = pipe.predict_proba([description])[0]
        classes = pipe.classes_
        idx = int(np.argmax(proba))

        all_probs = {c: round(float(p), 4) for c, p in zip(classes, proba)}

        return {
            "predicted_category": classes[idx],
            "confidence": round(float(proba[idx]), 4),
            "all_probabilities": all_probs,
        }

    @classmethod
    def retrain_categoriser(cls, user_id: int, group_id: int):
        """Force-retrain the categoriser for a specific user+group (after new expenses)."""
        cache_key = (user_id, group_id)
        cls._categoriser_cache[cache_key] = cls._build_categoriser(user_id, group_id)

    # ------------------------------------------------------------------
    # 2. ANOMALY DETECTION
    # ------------------------------------------------------------------

    @classmethod
    def detect_anomalies(cls, user_id: int, group_id: int, lookback_days: int = 90):
        """
        Run Isolation Forest on the user's recent expenses.

        Returns a list of anomalous expense dicts, each annotated with:
            is_anomaly  – True
            anomaly_score – the sklearn decision_function score (more negative = more anomalous)
            reason – human-readable explanation
        """
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cutoff = (datetime.now() - timedelta(days=lookback_days)).isoformat()
            cur.execute(
                "SELECT id, amount, category, description, expense_date "
                "FROM expenses WHERE user_id = ? AND group_id = ? AND expense_date >= ? "
                "ORDER BY expense_date DESC",
                (user_id, group_id, cutoff),
            )
            rows = cur.fetchall()
            conn.close()
        except Exception:
            return []

        if len(rows) < 5:
            return []  # need a minimum dataset

        # Build a simple feature matrix: amount, day_of_week, hour, category_encoded
        categories = sorted(set(r[2] for r in rows))
        cat_map = {c: i for i, c in enumerate(categories)}

        records = []
        for r in rows:
            try:
                dt = datetime.fromisoformat(r[4])
            except Exception:
                dt = datetime.now()
            records.append({
                "id": r[0],
                "amount": float(r[1]),
                "category": r[2],
                "description": r[3] or "",
                "expense_date": r[4],
                "day_of_week": dt.weekday(),
                "category_code": cat_map.get(r[2], 0),
            })

        df = pd.DataFrame(records)
        feature_cols = ["amount", "day_of_week", "category_code"]
        X = df[feature_cols].values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        contamination = min(0.15, max(0.05, 2.0 / len(rows)))
        model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42,
        )
        model.fit(X_scaled)
        preds = model.predict(X_scaled)
        scores = model.decision_function(X_scaled)

        # Compute per-category stats for explanation
        cat_stats: dict[str, dict] = {}
        for cat in categories:
            cat_amounts = df[df["category"] == cat]["amount"]
            cat_stats[cat] = {
                "mean": float(cat_amounts.mean()),
                "std": float(cat_amounts.std()) if len(cat_amounts) > 1 else 0,
            }

        anomalies = []
        for i, (pred, score) in enumerate(zip(preds, scores)):
            if pred == -1:  # anomaly
                rec = records[i]
                cat = rec["category"]
                amt = rec["amount"]
                mean = cat_stats[cat]["mean"]
                std = cat_stats[cat]["std"]

                if std > 0:
                    z = (amt - mean) / std
                    if z > 0:
                        reason = (
                            f"This ${amt:.2f} {cat} expense is {z:.1f}σ above "
                            f"your average of ${mean:.2f} for {cat}"
                        )
                    else:
                        reason = (
                            f"This ${amt:.2f} {cat} expense is unusual compared "
                            f"to your typical spending pattern"
                        )
                else:
                    reason = (
                        f"This ${amt:.2f} {cat} expense stands out in your spending history"
                    )

                anomalies.append({
                    "expense_id": rec["id"],
                    "amount": amt,
                    "category": cat,
                    "description": rec["description"],
                    "expense_date": rec["expense_date"],
                    "is_anomaly": True,
                    "anomaly_score": round(float(score), 4),
                    "reason": reason,
                })

        # Sort most anomalous first
        anomalies.sort(key=lambda a: a["anomaly_score"])
        return anomalies

    # ------------------------------------------------------------------
    # 3. EXPENSE FORECASTING
    # ------------------------------------------------------------------

    @classmethod
    def forecast_spending(cls, user_id: int, group_id: int, periods: int = 4):
        """
        Forecast future weekly spending using Linear Regression on historical weekly totals.

        Returns dict with:
            historical – list of {week, total} for past weeks
            forecast   – list of {week, predicted_total, lower_bound, upper_bound}
            trend      – 'increasing' | 'decreasing' | 'stable'
            monthly_estimate – predicted total for the coming 30 days
        """
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            # Grab all expenses for this user+group
            cur.execute(
                "SELECT amount, expense_date FROM expenses "
                "WHERE user_id = ? AND group_id = ? ORDER BY expense_date ASC",
                (user_id, group_id),
            )
            rows = cur.fetchall()
            conn.close()
        except Exception:
            return {"historical": [], "forecast": [], "trend": "stable", "monthly_estimate": 0}

        if len(rows) < 3:
            return {"historical": [], "forecast": [], "trend": "stable", "monthly_estimate": 0}

        # Aggregate into weekly buckets
        weekly: dict[str, float] = defaultdict(float)
        for r in rows:
            try:
                dt = datetime.fromisoformat(r[1])
            except Exception:
                continue
            # ISO week label
            week_label = dt.strftime("%Y-W%U")
            weekly[week_label] += float(r[0])

        if len(weekly) < 2:
            return {"historical": [], "forecast": [], "trend": "stable", "monthly_estimate": 0}

        sorted_weeks = sorted(weekly.keys())
        totals = [weekly[w] for w in sorted_weeks]

        # Feature: simple ordinal index
        X_train = np.arange(len(totals)).reshape(-1, 1)
        y_train = np.array(totals)

        model = LinearRegression()
        model.fit(X_train, y_train)

        # Compute residual std for confidence bands
        preds_train = model.predict(X_train)
        residuals = y_train - preds_train
        residual_std = float(np.std(residuals)) if len(residuals) > 1 else 0

        # Forecast next `periods` weeks
        start_idx = len(totals)
        last_week_dt = datetime.strptime(sorted_weeks[-1] + "-1", "%Y-W%U-%w")

        forecast = []
        for i in range(periods):
            idx = start_idx + i
            pred_val = float(model.predict([[idx]])[0])
            pred_val = max(pred_val, 0)  # spending can't be negative
            week_dt = last_week_dt + timedelta(weeks=i + 1)
            forecast.append({
                "week": week_dt.strftime("%Y-W%U"),
                "week_start": week_dt.strftime("%b %d"),
                "predicted_total": round(pred_val, 2),
                "lower_bound": round(max(pred_val - 1.96 * residual_std, 0), 2),
                "upper_bound": round(pred_val + 1.96 * residual_std, 2),
            })

        # Determine trend from slope
        slope = float(model.coef_[0])
        avg_spending = float(np.mean(totals))
        if avg_spending > 0:
            relative_slope = slope / avg_spending
        else:
            relative_slope = 0

        if relative_slope > 0.05:
            trend = "increasing"
        elif relative_slope < -0.05:
            trend = "decreasing"
        else:
            trend = "stable"

        # Monthly estimate ≈ sum of next 4 weeks
        monthly_estimate = round(sum(f["predicted_total"] for f in forecast[:4]), 2)

        historical = [
            {"week": w, "total": round(weekly[w], 2)}
            for w in sorted_weeks[-12:]  # last 12 weeks
        ]

        return {
            "historical": historical,
            "forecast": forecast,
            "trend": trend,
            "monthly_estimate": monthly_estimate,
            "model_info": {
                "type": "LinearRegression",
                "slope": round(slope, 4),
                "intercept": round(float(model.intercept_), 4),
                "residual_std": round(residual_std, 4),
                "data_points": len(totals),
            },
        }
