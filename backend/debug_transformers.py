
try:
    print("Importing AutoTokenizer...")
    from transformers import AutoTokenizer
    print("Import successful.")
    
    print("Loading bert-base-uncased...")
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    print("Model loaded successfully.")
    
    tokens = tokenizer.tokenize("unfriendly")
    print(f"Test tokenization: {tokens}")

except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
