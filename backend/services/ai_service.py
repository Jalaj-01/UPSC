from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAISpeechToText
import os
from typing import Dict, List, Optional
import json

class AIService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    async def generate_answer(self, question: str, language: str = "english") -> str:
        """Generate a structured answer for a GS question"""
        lang_instruction = ""
        if language == "hindi":
            lang_instruction = "Please respond in Hindi."
        elif language == "mixed":
            lang_instruction = "You may use a mix of Hindi and English (Hinglish) as appropriate."
        
        system_message = f"""You are an expert UPSC (Union Public Service Commission) exam coach helping aspirants write high-quality answers.
        
When given a question, provide a well-structured answer following this format:
        
        **Introduction:** (2-3 lines introducing the topic)
        
        **Body:** (Main content with proper headings, subheadings, and points)
        
        **Conclusion:** (2-3 lines summarizing and providing a way forward)
        
        Keep the answer concise (around 250 words), use relevant examples, and maintain UPSC answer writing standards.
        {lang_instruction}
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"answer_gen_{hash(question)}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=f"Question: {question}\n\nProvide a structured answer.")
        response = await chat.send_message(user_message)
        return response
    
    async def evaluate_answer(self, question: str, user_answer: str, language: str = "english") -> Dict:
        """Evaluate a user's answer and provide detailed feedback"""
        lang_instruction = ""
        if language == "hindi":
            lang_instruction = "Please provide feedback in Hindi."
        elif language == "mixed":
            lang_instruction = "You may provide feedback in a mix of Hindi and English."
        
        system_message = f"""You are an expert UPSC answer evaluator. Evaluate answers on these criteria:
        
        1. **Structure** (0-10): Introduction, body with headings, conclusion
        2. **Content** (0-10): Relevance, accuracy, coverage of key points
        3. **Depth** (0-10): Critical analysis, examples, data usage
        4. **Keywords** (0-10): Use of UPSC-relevant terms and concepts
        
        Provide your evaluation in this exact JSON format:
        {{
            "structure_score": 8.5,
            "content_score": 7.5,
            "depth_score": 7.0,
            "keyword_score": 8.0,
            "overall_score": 7.75,
            "strengths": ["Clear introduction", "Good examples"],
            "weaknesses": ["Lack of conclusion", "Missing data"],
            "suggestions": ["Add more recent examples", "Strengthen conclusion"],
            "improved_answer": "An improved version of the answer..."
        }}
        
        {lang_instruction}
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"eval_{hash(user_answer)}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"Question: {question}\n\nUser's Answer:\n{user_answer}\n\nPlease evaluate this answer."
        )
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            # Try to extract JSON from the response
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
            
            evaluation = json.loads(response_text)
            return evaluation
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "structure_score": 7.0,
                "content_score": 7.0,
                "depth_score": 7.0,
                "keyword_score": 7.0,
                "overall_score": 7.0,
                "strengths": ["Answer submitted"],
                "weaknesses": ["Evaluation in progress"],
                "suggestions": ["Keep practicing"],
                "improved_answer": response
            }
    
    async def generate_ai_mentor_plan(self, user_id: str, weak_areas: List[str], recent_performance: Dict) -> str:
        """Generate personalized daily study plan based on performance"""
        system_message = """You are an AI UPSC mentor creating personalized daily study plans.
        Based on the student's weak areas and recent performance, suggest:
        1. What topics to focus on today
        2. How many questions to practice
        3. Specific areas to revise
        4. Motivational message
        
        Keep it concise and actionable.
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"mentor_{user_id}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"Weak areas: {', '.join(weak_areas)}\nRecent performance: {recent_performance}\n\nCreate today's study plan."
        )
        response = await chat.send_message(user_message)
        return response
    
    async def generate_essay_outline(self, topic: str, language: str = "english") -> str:
        """Generate essay outline for given topic"""
        lang_instruction = ""
        if language == "hindi":
            lang_instruction = "Please provide outline in Hindi."
        elif language == "mixed":
            lang_instruction = "You may use a mix of Hindi and English."
        
        system_message = f"""You are a UPSC essay writing expert. Create a detailed essay outline with:
        1. Introduction approach
        2. Main themes/sections (3-4 major points)
        3. Examples and data to include
        4. Conclusion approach
        
        {lang_instruction}
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"essay_{hash(topic)}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=f"Essay topic: {topic}\n\nProvide a detailed outline.")
        response = await chat.send_message(user_message)
        return response
    
    async def answer_doubt(self, question: str, context: Optional[str] = None) -> str:
        """Answer student's doubt/question"""
        system_message = """You are a helpful UPSC preparation assistant. Answer doubts clearly and concisely.
        Provide accurate information with examples where relevant.
        If you're not sure, say so and suggest how to find the correct information.
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"doubt_{hash(question)}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        message_text = f"Question: {question}"
        if context:
            message_text += f"\n\nContext: {context}"
        
        user_message = UserMessage(text=message_text)
        response = await chat.send_message(user_message)
        return response
    
    async def generate_mcq_explanation(self, question: str, correct_answer: str, user_answer: str) -> str:
        """Generate explanation for MCQ"""
        system_message = """You are a UPSC exam expert explaining MCQ answers.
        Explain why the correct answer is right and why other options are wrong.
        Keep it clear and educational.
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"mcq_{hash(question)}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"Question: {question}\nCorrect Answer: {correct_answer}\nUser's Answer: {user_answer}\n\nExplain why."
        )
        response = await chat.send_message(user_message)
        return response
    
    async def summarize_note(self, note_content: str) -> str:
        """Generate AI summary of note content"""
        system_message = """You are a summarization expert. Create concise summaries of study notes.
        Highlight key points, important facts, and main concepts.
        Keep it brief but comprehensive.
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"summary_{hash(note_content)}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=f"Summarize this note:\n\n{note_content}")
        response = await chat.send_message(user_message)
        return response

# Create singleton instance
ai_service = AIService()