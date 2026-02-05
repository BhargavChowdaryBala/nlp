
from transformers import AutoTokenizer

try:
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    
    text = "Tokenization is fun"
    tokens = tokenizer.tokenize(text)
    
    print(f"Tokens: {tokens}")
    
    bigrams = [f"{tokens[i]} {tokens[i+1]}" for i in range(len(tokens) - 1)]
    print(f"Bigrams: {bigrams}")
    
    trigrams = [f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}" for i in range(len(tokens) - 2)]
    print(f"Trigrams: {trigrams}")
    
    text2 = "Hello"
    tokens2 = tokenizer.tokenize(text2)
    print(f"Tokens2: {tokens2}")

except Exception as e:
    print(e)
