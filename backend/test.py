from retriever import get_retriever

retriever = get_retriever()

query = "Explain the embedded OSA system"

docs = retriever.invoke(query)

print(f"\nQUERY: {query}\n")

for i, doc in enumerate(docs):
    print(f"\n--- Document {i+1} ---\n")
    print(doc.page_content[:300])