from typing import Dict, List

def calculate_score(correct: int, total: int) -> float:
    """Calculate percentage score"""
    if total == 0:
        return 0.0
    return round((correct / total) * 100, 2)

def format_evaluation(evaluation: Dict) -> str:
    """Format evaluation results into a readable string"""
    formatted = f"""
## Answer Evaluation Results

**Overall Score:** {evaluation.get('overall_score', 0)}/10

### Detailed Scores:
- Structure: {evaluation.get('structure_score', 0)}/10
- Content: {evaluation.get('content_score', 0)}/10
- Depth: {evaluation.get('depth_score', 0)}/10
- Keywords: {evaluation.get('keyword_score', 0)}/10

### Strengths:
{chr(10).join('- ' + s for s in evaluation.get('strengths', []))}

### Areas for Improvement:
{chr(10).join('- ' + w for w in evaluation.get('weaknesses', []))}

### Suggestions:
{chr(10).join('- ' + s for s in evaluation.get('suggestions', []))}
    """
    return formatted.strip()
