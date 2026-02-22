from datetime import timedelta
import os
from models.dto import UpdateUser
from models.schemas import User  
from utils.success import result,success,error
from bson import ObjectId
import bcrypt
# 🔹 IMPORT CHATBOT SERVICE
from services.chat_bot_service import ChatBot

class UserQueries:

    def __init__(self, pineconeService=None):
         #pineconeService is required for ChatBot service
          self.pineconeService = pineconeService
         #pass

    async def register_user(self,user): 
        # ============================
        # CHECK EXISTING USER
        # ============================ 
        existing = User.objects(email=user.email).first()
        if existing:
             return error('User already exist')
        # ============================
        # CREATE USER
        # ============================
        userData = User(**user.dict())      
        userData.save()
        # ============================
        # ✅ AUTO CREATE DEFAULT CHATBOT
        # ============================
        try:
            chatbot_service = ChatBot(self.pineconeService)
            await chatbot_service.create_default_bot_for_user(
                str(userData.id)
            )
        except Exception as e:
            # Optional: log error (do not fail registration)
            print("Chatbot auto-creation failed:", e)
        
        return success("User registered successfully!")

    async def get_all_users(self):
       items = User.objects()
       return result([item.to_mongo().to_dict() for item in items])
    
    async def delete_user(self, id:int):
          item = User.objects(id=id).first()
          if not item:
               return error('User Not Found')
          item.delete()
          return success("User deleted successfully")
    
    async def login(self, data):
        existing = User.objects(email=data.email).first()
 
        if not existing:
             return error('User Not Found')
        
        if not existing.check_password(data.password):
             return error('Password is incorrect')
        else:
             payload={"id":str(existing.to_mongo().to_dict()['_id'])}
              
             token = existing.generate_token(payload) 
             return result({"token":token},'Login successfully')
    
    async def get_user_by_id(self, id:int):
        user = User.objects(id = ObjectId(id)).first()
        if not user:
             return error('User Not Found')
        return result(user.to_mongo().to_mongo().to_dict()())

    async def getUserByRole(self,role:str):
         items = User.objects(role=role)
         return result([item.to_mongo().to_dict() for item in items])
    
    async def updateUser(self,data:UpdateUser):
          item = User.objects(id=ObjectId(data._id)).first()
          if not item:
               raise error("User not found")
          
          item.update(**data.dict())
          item.reload()
          return result(item.to_mongo().to_mongo().to_dict()())

  
        
        
    