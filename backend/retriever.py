from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

# SAME MODEL as ingestion
embedding_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

def load_vectorstore():
    vectorstore = FAISS.load_local(
        "faiss_index",
        embedding_model,
        allow_dangerous_deserialization=True
    )
    return vectorstore


def get_retriever():
    vectorstore = load_vectorstore()

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 8}
    )

    return retriever