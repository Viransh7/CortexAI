from model_loader import llm_pipeline


def get_llm():
    return llm_pipeline


def get_prompt():
    return """Answer using ONLY the provided context.

If answer is not found in context, say:
"Answer not found in context."

Context:
{context}

Question:
{question}

Answer:
"""