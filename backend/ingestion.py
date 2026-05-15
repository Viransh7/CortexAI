import re
import os
import shutil

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


def clean_document_text(text):

    # Remove generic repeated headers/footers
    text = re.sub(
        r'Page \d+',
        '',
        text
    )

    text = re.sub(
        r'Version\s+\d+(\.\d+)?',
        '',
        text
    )

    # Remove excessive newlines
    text = re.sub(r'\n+', '\n', text)

    return text.strip()


def load_pdf(file_path):

    loader = PyPDFLoader(file_path)

    documents = loader.load()

    # Clean each page before chunking
    for doc in documents:
        doc.page_content = clean_document_text(doc.page_content)

    return documents


def chunk_documents(documents):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = splitter.split_documents(documents)

    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = i

    return chunks


def create_embeddings():

    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )


def rebuild_index(pdf_path="../data/sample.pdf"):

    docs = load_pdf(pdf_path)

    chunks = chunk_documents(docs)

    embeddings = create_embeddings()

    # Delete old FAISS index completely
    if os.path.exists("faiss_index"):
        shutil.rmtree("faiss_index")

    vectorstore = FAISS.from_documents(
        chunks,
        embeddings
    )

    vectorstore.save_local("faiss_index")

    print("✅ Index rebuilt successfully")
    print(f"Loaded {len(docs)} pages")
    print(f"Created {len(chunks)} chunks")


if __name__ == "__main__":

    rebuild_index()