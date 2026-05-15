from transformers import pipeline

print("Loading FLAN-T5 model...")

llm_pipeline = pipeline(
    "text2text-generation",
    model="google/flan-t5-base",
    max_new_tokens=100,
    temperature=0.0,
    do_sample=False
)

print("FLAN-T5 model loaded successfully.")