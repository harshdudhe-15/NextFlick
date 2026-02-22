from datetime import datetime
import uuid
from fastapi import BackgroundTasks
from utils.success import error, result,success
from models.schemas import KnowledgeBot, User
from dotenv import load_dotenv
from bson import ObjectId
from fastapi.responses import StreamingResponse
load_dotenv()

 

class ChatBot:
    
    def __init__(self,pineconeService):
        self.pineconeService = pineconeService
    
    # =====================================================
    # ✅ AUTO CREATE DEFAULT CHATBOT (ONE USER = ONE BOT)
    # =====================================================
    async def create_default_bot_for_user(self, user_id: str):
        # Safety check: bot already exists
        existing_bot = KnowledgeBot.objects(
            user_id=ObjectId(user_id)
        ).first()

        if existing_bot:
            return existing_bot

        namespace_id = str(uuid.uuid4())

        bot = KnowledgeBot(
            bot_name=f"defaultchat_bot_{user_id}",
            description="Default chatbot",
            namespace_id=namespace_id,
            user_id=ObjectId(user_id),
            created_at=datetime.utcnow()
        )

        bot.save()
        return bot
    
    # =====================================================
    # ✅ FETCH BOT(S) FOR USER
    # =====================================================
    async def getBotByUserId(self,request):  
         id = request.query_params.get('id') if request.query_params.get('id') else request.state.user['id']
         items = KnowledgeBot.objects(user_id =ObjectId(id))

         return result([item.to_mongo().to_dict() for item in items])
        
    
    async def getBotById(self,id): 
         cursor = KnowledgeBot.objects(id = ObjectId(id))  
         return result(cursor.first().to_mongo().to_dict())
      
    # =====================================================
    # ✅ CHAT STREAMING (NO CHANGE)
    # =====================================================
    async def chat_conversation(self,data):  
            question = data.question
            namespace_id = data.namespace_id 
            chatHistory = ""
            for chat in data.chatHistory:
                chatHistory += f"User: {chat.question}\nAI: {chat.Ai_response}\n"
            
            response = await self.pineconeService.chain_resp(
                namespace_id,
                question,
                chatHistory
            )

            return response
    




    


