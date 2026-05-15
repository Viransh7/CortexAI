from rag_pipeline import run_rag

query = "Explain the proposed system."

result = run_rag(query)

print("\n================ ANSWER ================\n")
print(result["answer"])

print("\n================ SOURCES ================\n")

for i, src in enumerate(result["sources"]):
    print(f"\n--- Source {i+1} ---\n")
    print(src["content"][:300])