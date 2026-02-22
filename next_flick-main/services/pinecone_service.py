import os
from config import constants
from utils.backgroud_exeption import handleExceptions
from utils.processor import parse_pdf,parse_text
from dotenv import load_dotenv
from pinecone import Pinecone
load_dotenv()
from langchain_pinecone import  PineconeVectorStore
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
#from langchain.prompts import ChatPromptTemplate 
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI,MistralAIEmbeddings
from services.tmdb_service import TMDBService

tmdb_service = TMDBService()
 

embed_model = MistralAIEmbeddings(
    model=os.getenv('MISTRAL_EMBED_MODEL'), 
    api_key=os.getenv('MISTRAL_API_KEY'),
    
)

llm = ChatMistralAI(
            mistral_api_key=os.getenv('MISTRAL_API_KEY'),
            model=os.getenv('MISTRAL_MODEL'),
            temperature=0, 
             )

pc=Pinecone(api_key=os.getenv('PINECONE_API_KEY'), environment=os.getenv('PINECONE_ENV'))

class PineconeService:  
    
    @handleExceptions
    async def vectorize_documents_main(self,namespace_id: str):
            in_process_dir: str = os.path.join(constants.UPLOAD_DIR, namespace_id, constants.PRIMARY_FOLDER)
    
            documents = dict()
            documents[namespace_id] = list()

            for file in os.listdir(in_process_dir):
                if os.path.isdir(file):
                    print(f"Skipping {file}")
                    continue

                if not os.path.isdir(file):
                    file_path: str = os.path.join(in_process_dir, file)
                    print(f"Processing file: {file}")
                    file_ext = file.split('.')[-1]
                    if file_ext == 'txt':
                        documents[namespace_id].extend(parse_text(file_path))
                    elif file_ext == 'pdf':
                        documents[namespace_id].extend(parse_pdf(file_path))

                    os.remove(file_path)

            pinecone_namespace = namespace_id

            for key, val in documents.items(): 
                vectorstore_from_docs_faq = PineconeVectorStore.from_documents(
                    documents[key],
                    index_name=os.getenv('PINECONE_INDEX'),
                    embedding=embed_model,
                    namespace=pinecone_namespace
                )
            return {"message":"File uploaded successful !"}

    @handleExceptions
    async def delete_vectorized_docs(self, namespace_id: str, key: str, values: list[str]):
        index = pc.Index(os.getenv('PINECONE_INDEX'))   
        filter_condition = {key: {"$in": values}}
        response = index.delete(delete_all=False, namespace=namespace_id, filter=filter_condition)
        return response   

    async def chain_resp(self,namespace_id: str,question: str, chatHistory: str):
         
        template = """
        You are NEXTFLICK, a friendly and intelligent movie recommendation assistant.

        Your job:
        - Respond in a warm, conversational way.
        - Recommend 3 to 5 movies or TV shows.
        - Keep the tone natural and engaging.
        - Use the provided Movie Data and Chat History to personalize recommendations.

        ------------------------------------
        INPUT CONTEXT
        ------------------------------------

        Movie Data:
        {fileContent}

        Chat History:
        {chatHistory}

        User Question:
        {question}

        ------------------------------------
        IMPORTANT OUTPUT RULES
        ------------------------------------

        Return ONLY valid JSON in this format:

        {{
        "message": "Friendly conversational response WITHOUT mentioning any movie titles.",
        "recommendations": [
            {{ "title": "Movie Name 1" }},
            {{ "title": "Movie Name 2" }},
            {{ "title": "Movie Name 3" }}
        ]
        }}

        RULES:
        - The "message" must NOT contain any movie titles.
        - Use Movie Data only if relevant.
        - Use Chat History to avoid repeating recommendations.
        - Do NOT format titles in bold.
        - Do NOT include numbered lists.
        - Do NOT add extra text outside JSON.
        - Return JSON only.
        """


        index = pc.Index(os.getenv('PINECONE_INDEX'))
     
        vectorstore = PineconeVectorStore(
            index=index, 
            embedding=embed_model, 
            text_key=os.getenv('PINECONE_TEXT_FIELD'), 
            namespace=namespace_id
        ) 
 
        retrieved_data = vectorstore.similarity_search(question,namespace=namespace_id, k=20)
         
        fileContent = ""
  
        for doc in retrieved_data:
            if doc.metadata.get("type") == "pdf":
                fileContent += f"{doc.page_content.strip()}\n"
            else:
                fileContent += f"{doc.page_content.strip()}\n"

        prompt_template = ChatPromptTemplate.from_template(template)

        prompt = prompt_template.format(
            question=question,
            chatHistory=chatHistory,
            fileContent=fileContent
        )

        parser = JsonOutputParser()
        chain = llm | parser

        try:
            llm_response = chain.invoke(prompt)
        except Exception as e:
            print("LLM JSON Parse Error:", e)
            return {
                "type": "message",
                "message": "Sorry, something went wrong while generating recommendations."
            }

        friendly_message = llm_response.get("message", "")
        recommendations = llm_response.get("recommendations", [])

        movies = []

        for rec in recommendations:
            title = rec.get("title")
            if not title:
                continue

            results = tmdb_service.search_movie_or_tv(title)

            if results:
                movies.append(results[0])  

        return {
            "type": "mixed",
            "message": friendly_message,
            "movies": movies
        }           