from typing import Dict, List
from datetime import datetime, date, timedelta
from models.progress import PerformanceMetrics

class ProgressService:
    def calculate_performance_metrics(self, evaluations: List[Dict]) -> PerformanceMetrics:
        """Calculate average performance metrics from evaluations"""
        if not evaluations:
            return PerformanceMetrics()
        
        total = len(evaluations)
        structure_sum = sum(e.get('structure_score', 0) for e in evaluations)
        content_sum = sum(e.get('content_score', 0) for e in evaluations)
        depth_sum = sum(e.get('depth_score', 0) for e in evaluations)
        keyword_sum = sum(e.get('keyword_score', 0) for e in evaluations)
        overall_sum = sum(e.get('overall_score', 0) for e in evaluations)
        
        return PerformanceMetrics(
            structure_avg=round(structure_sum / total, 2),
            content_avg=round(content_sum / total, 2),
            depth_avg=round(depth_sum / total, 2),
            keyword_avg=round(keyword_sum / total, 2),
            overall_avg=round(overall_sum / total, 2)
        )
    
    def calculate_improvement_rate(self, recent_scores: List[float], period_days: int = 7) -> Dict:
        """Calculate improvement rate over a period"""
        if len(recent_scores) < 2:
            return {"improvement": 0.0, "trend": "neutral", "message": "Need more data"}
        
        # Calculate trend
        first_half = recent_scores[:len(recent_scores)//2]
        second_half = recent_scores[len(recent_scores)//2:]
        
        avg_first = sum(first_half) / len(first_half)
        avg_second = sum(second_half) / len(second_half)
        
        improvement = round(((avg_second - avg_first) / avg_first) * 100, 2) if avg_first > 0 else 0
        
        if improvement > 5:
            trend = "improving"
            message = f"Great! You're improving by {improvement}%"
        elif improvement < -5:
            trend = "declining"
            message = f"Need attention! Performance dropped by {abs(improvement)}%"
        else:
            trend = "stable"
            message = "Performance is stable. Keep consistent!"
        
        return {
            "improvement": improvement,
            "trend": trend,
            "message": message
        }
    
    def generate_progress_alerts(self, user_data: Dict) -> List[Dict]:
        """Generate progress alerts based on user performance"""
        alerts = []
        
        # Check streak
        if user_data.get('streak_days', 0) >= 7:
            alerts.append({
                "type": "achievement",
                "message": f"🔥 Amazing! {user_data['streak_days']} day streak!",
                "priority": "high"
            })
        
        # Check improvement
        if user_data.get('recent_improvement', 0) > 10:
            alerts.append({
                "type": "success",
                "message": "📈 You're consistently improving!",
                "priority": "medium"
            })
        
        # Check weak areas
        if user_data.get('weak_areas', []):
            alerts.append({
                "type": "warning",
                "message": f"⚠️ Focus needed: {', '.join(user_data['weak_areas'][:2])}",
                "priority": "high"
            })
        
        # Check if repeating mistakes
        if user_data.get('repeated_mistakes', 0) > 5:
            alerts.append({
                "type": "error",
                "message": "🔄 You're repeating similar mistakes. Review previous feedback!",
                "priority": "high"
            })
        
        return alerts
    
    def predict_readiness(self, performance_data: Dict) -> Dict:
        """Predict exam readiness based on performance"""
        overall_avg = performance_data.get('overall_avg', 0)
        consistency = performance_data.get('consistency', 0)
        weak_areas_count = len(performance_data.get('weak_areas', []))
        
        # Simple readiness calculation
        readiness_score = overall_avg * 10  # Convert to percentage
        
        # Adjust for consistency
        readiness_score = readiness_score * (0.7 + (consistency * 0.3))
        
        # Penalize for weak areas
        readiness_score = readiness_score - (weak_areas_count * 5)
        
        readiness_score = max(0, min(100, readiness_score))  # Clamp between 0-100
        
        if readiness_score >= 75:
            readiness_level = "Excellent"
            message = "You're well-prepared! Keep up the momentum."
        elif readiness_score >= 60:
            readiness_level = "Good"
            message = "Good progress! Focus on weak areas."
        elif readiness_score >= 45:
            readiness_level = "Moderate"
            message = "You're getting there. Increase practice."
        else:
            readiness_level = "Needs Work"
            message = "Focus on fundamentals. Consistent practice needed."
        
        return {
            "readiness_score": round(readiness_score, 2),
            "readiness_level": readiness_level,
            "message": message
        }

progress_service = ProgressService()