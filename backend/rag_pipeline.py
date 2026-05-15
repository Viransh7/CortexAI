from retriever import get_retriever
from generator import get_llm, get_prompt


prompt = get_prompt()

# lazy-loaded global
llm = None


def get_cached_llm():
    global llm

    if llm is None:
        print("Loading LLM...")
        llm = get_llm()
        print("LLM loaded successfully.")

    return llm


def clean_text(text):
    lines = text.split("\n")

    cleaned = []

    for line in lines:
        line = line.strip()

        if len(line) < 20:
            continue

        if line.lower().startswith(("table", "figure", "page")):
            continue

        cleaned.append(line)

    return " ".join(cleaned)


def run_rag(query: str):

    model = get_cached_llm()

    retriever = get_retriever()

    docs = retriever.invoke(query)

    cleaned_chunks = []

    for doc in docs:
        cleaned = clean_text(doc.page_content)

        if cleaned:
            cleaned_chunks.append(cleaned)

    context = "\n\n".join(cleaned_chunks[:3])

    print("\n======= CONTEXT =======\n")
    print(context)
    print("\n=======================\n")

    final_prompt = prompt.format(
        context=context,
        question=query
    )

    response = model(final_prompt)

    answer = response[0]["generated_text"]

    sources = []

    for doc in docs:
        sources.append({
            "content": doc.page_content,
            "metadata": {
                "page": doc.metadata.get("page"),
                "chunk_id": doc.metadata.get("chunk_id"),
                "source": doc.metadata.get("source")
            }
        })

    return {
        "answer": answer,
        "sources": sources
    }


def ask_question(query: str):
    return run_rag(query)