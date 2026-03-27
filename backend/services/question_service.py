from typing import List, Dict, Optional
from models.question import Question, QuestionType
from utils.sample_data import get_all_sample_questions, get_questions_by_subject, get_questions_by_type
import random

class QuestionService:
    def get_daily_task_set(self, count: int, subjects: Optional[List[str]] = None, difficulty: Optional[str] = None) -> List[Dict]:
        """Generate daily task set of questions"""
        all_questions = get_all_sample_questions()
        
        # Filter by subjects if provided
        if subjects:
            all_questions = [q for q in all_questions if q['subject'] in subjects]
        
        # Filter by difficulty if provided
        if difficulty:
            all_questions = [q for q in all_questions if q.get('difficulty') == difficulty]
        
        # Randomly select questions
        if len(all_questions) <= count:
            return all_questions
        
        return random.sample(all_questions, count)
    
    def get_revision_questions(self, wrong_question_ids: List[str]) -> List[Dict]:
        """Get questions for revision (previously answered incorrectly)"""
        # In a real app, fetch from database
        # For demo, return random MCQ questions
        all_questions = get_questions_by_type("mcq")
        return random.sample(all_questions, min(5, len(all_questions)))
    
    def get_subject_wise_questions(self, subject: str) -> List[Dict]:
        """Get all questions for a specific subject"""
        return get_questions_by_subject(subject)
    
    def get_topic_wise_questions(self, subject: str, topic: str) -> List[Dict]:
        """Get questions filtered by subject and topic"""
        all_questions = get_questions_by_subject(subject)
        return [q for q in all_questions if q.get('topic', '').lower() == topic.lower()]
    
    def create_custom_test(self, subjects: List[str], question_count: int, question_type: str = "mcq") -> List[Dict]:
        """Create a custom test with specified parameters"""
        questions = []
        
        for subject in subjects:
            subject_questions = get_questions_by_subject(subject)
            subject_questions = [q for q in subject_questions if q['question_type'] == question_type]
            
            # Get proportional questions from each subject
            count = question_count // len(subjects)
            if len(subject_questions) <= count:
                questions.extend(subject_questions)
            else:
                questions.extend(random.sample(subject_questions, count))
        
        return questions[:question_count]
    
    def get_available_subjects(self) -> List[str]:
        """Get list of all available subjects"""
        all_questions = get_all_sample_questions()
        subjects = set(q['subject'] for q in all_questions)
        return sorted(list(subjects))
    
    def get_available_topics(self, subject: str) -> List[str]:
        """Get list of all available topics for a subject"""
        subject_questions = get_questions_by_subject(subject)
        topics = set(q.get('topic', 'General') for q in subject_questions)
        return sorted(list(topics))

question_service = QuestionService()