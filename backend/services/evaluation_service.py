from typing import Dict, List
from models.answer import AnswerEvaluation
from datetime import datetime, timedelta

class EvaluationService:
    def calculate_overall_score(self, evaluation: Dict) -> float:
        """Calculate overall score from individual scores"""
        scores = [
            evaluation.get('structure_score', 0),
            evaluation.get('content_score', 0),
            evaluation.get('depth_score', 0),
            evaluation.get('keyword_score', 0)
        ]
        return round(sum(scores) / len(scores), 2)
    
    def identify_weak_areas(self, evaluation: Dict) -> List[str]:
        """Identify weak areas based on evaluation scores"""
        weak_areas = []
        
        if evaluation.get('structure_score', 0) < 6:
            weak_areas.append('Answer Structure')
        if evaluation.get('content_score', 0) < 6:
            weak_areas.append('Content Quality')
        if evaluation.get('depth_score', 0) < 6:
            weak_areas.append('Analytical Depth')
        if evaluation.get('keyword_score', 0) < 6:
            weak_areas.append('Keyword Usage')
        
        return weak_areas
    
    def identify_strong_areas(self, evaluation: Dict) -> List[str]:
        """Identify strong areas based on evaluation scores"""
        strong_areas = []
        
        if evaluation.get('structure_score', 0) >= 8:
            strong_areas.append('Answer Structure')
        if evaluation.get('content_score', 0) >= 8:
            strong_areas.append('Content Quality')
        if evaluation.get('depth_score', 0) >= 8:
            strong_areas.append('Analytical Depth')
        if evaluation.get('keyword_score', 0) >= 8:
            strong_areas.append('Keyword Usage')
        
        return strong_areas

evaluation_service = EvaluationService()