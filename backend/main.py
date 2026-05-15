from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from rag_pipeline import ask_question
import shutil
from ingestion import *
import os

app = FastAPI(title="CortexAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "CortexAI is running 🚀"}


@app.post("/query")
def query_system(request: QueryRequest):
    result = ask_question(request.question)
    return result

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    save_path = f"data/{file.filename}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    rebuild_index(save_path)

    return {
        "message": f"{file.filename} uploaded and indexed successfully"
    }

def rebuild_index(file_path):

    docs = load_pdf(file_path)

    chunks = chunk_documents(docs)

    embeddings = create_embeddings()

    vectorstore = FAISS.from_documents(
        chunks,
        embeddings
    )

    vectorstore.save_local("faiss_index")

    print("✅ Index rebuilt successfully")

@app.delete("/delete/{filename}")
async def delete_pdf(filename: str):

    file_path = f"../data/{filename}"

    if os.path.exists(file_path):
        os.remove(file_path)

        return {
            "message": f"{filename} deleted successfully"
        }

    return {
        "message": "File not found"
    }