from flask import Flask, jsonify, request
from flask_cors import CORS
import string
import math
from collections import defaultdict, Counter
import re

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# --- Load NLP Models (Global) ---
try:
    print("Loading Hugging Face Tokenizer...")
    from transformers import AutoTokenizer
    # Pre-load the tokenizer to avoid delays/crashes during requests
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    print("Tokenizer loaded successfully.")
except Exception as e:
    print(f"WARNING: Failed to load transformers tokenizer: {e}")
    tokenizer = None

# Initialize NLTK
import nltk
from nltk.stem import PorterStemmer, WordNetLemmatizer
try:
    print("Checking NLTK resources...")
    nltk.data.find('corpora/wordnet')
    nltk.data.find('corpora/omw-1.4')
except LookupError:
    print("Downloading NLTK resources...")
    nltk.download('wordnet')
    nltk.download('omw-1.4')

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
# --------------------------------

# Helper for Standard Word Tokenization (for N-Grams/Perplexity)
def standard_word_tokenize(text):
    # Basic tokenization: remove punctuation, lowercase, split on whitespace
    translator = str.maketrans('', '', string.punctuation)
    clean_text = text.translate(translator).lower()
    return clean_text.split()

# Helper for BERT Tokenization (if needed explicitly)
def bert_tokenize(text):
    if tokenizer:
        return tokenizer.tokenize(text)
    return standard_word_tokenize(text)



@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running!"})

@app.route('/api/analyze', methods=['POST'])

def analyze_text():
    data = request.json
    text = data.get('text', '')
    ngram_type = data.get('type', 'unigram')

    if not text:
        return jsonify([])

    # Use standard word tokens for N-Grams to avoid "##subword" confusion
    tokens = standard_word_tokenize(text)
    result = []
    
    if ngram_type == 'unigram':
        result = tokens
    elif ngram_type == 'bigram':
        result = [f"{tokens[i]} {tokens[i+1]}" for i in range(len(tokens) - 1)]
    elif ngram_type == 'trigram':
        result = [f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}" for i in range(len(tokens) - 2)]

    return jsonify(result)

@app.route('/api/perplexity', methods=['POST'])
def calculate_perplexity():
    data = request.json
    training_text = data.get('training_text', '')
    test_text = data.get('test_text', '')

    if not training_text or not test_text:
        return jsonify({"error": "Both training text and test text are required."}), 400

    # 1. Train Model (Bigram) - Using Standard Words
    train_tokens = standard_word_tokenize(training_text)
    
    if len(train_tokens) < 1:
         return jsonify({"error": "Training text is empty."}), 400

    vocab = set(train_tokens)
    vocab_size = len(vocab)
    
    unigram_counts = Counter(train_tokens)
    bigram_counts = defaultdict(int)
    for i in range(len(train_tokens) - 1):
        bigram = (train_tokens[i], train_tokens[i+1])
        bigram_counts[bigram] += 1

    # 2. Evaluate Test Text
    test_tokens = standard_word_tokenize(test_text)
    if len(test_tokens) < 2:
         return jsonify({"error": "Test text must have at least 2 words for bigram perplexity."}), 400

    log_prob_sum = 0
    N = len(test_tokens)
    
    count_evaluated = 0

    for i in range(1, N):
        w_prev = test_tokens[i-1]
        w_curr = test_tokens[i]

        bigram_count = bigram_counts[(w_prev, w_curr)]
        unigram_count = unigram_counts[w_prev]
        
        prob = (bigram_count + 1) / (unigram_count + vocab_size)
        log_prob_sum += math.log(prob)
        count_evaluated += 1
    
    if count_evaluated == 0:
        return jsonify({"perplexity": 0, "message": "Not enough tokens."})

    avg_log_prob = log_prob_sum / count_evaluated
    perplexity = math.exp(-avg_log_prob)

    return jsonify({
        "perplexity": round(perplexity, 4),
        "details": f"Calculated on {count_evaluated} bigram transitions."
    })

def levenshtein_distance(s1, s2):
    m, n = len(s1), len(s2)
    # Create a matrix of size (m+1) x (n+1)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Initialize first row and column
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    # Fill the matrix
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                cost = 0
            else:
                cost = 1
            
            dp[i][j] = min(
                dp[i - 1][j] + 1,      # Deletion
                dp[i][j - 1] + 1,      # Insertion
                dp[i - 1][j - 1] + cost # Substitution
            )
    return dp[m][n]

@app.route('/api/edit-distance', methods=['POST'])
def calculate_edit_distance():
    data = request.json
    source = data.get('source', '')
    target = data.get('target', '')
    
    # We could strip whitespace or keep it. The algorithm works either way.
    # Let's strip simply to avoid " " vs "" confusion.
    source = source.strip()
    target = target.strip()

    distance = levenshtein_distance(source, target)

    return jsonify({
        "distance": distance,
        "source": source,
        "target": target
    })

@app.route('/api/tokenize', methods=['POST'])
def tokenize_text():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify([])

    # Character Tokenization (User Request Step 97)
    tokens = list(text)
    
    return jsonify(tokens)

@app.route('/api/morph-analysis', methods=['POST'])
def morph_analysis():
    data = request.json
    word = data.get('word', '').strip()
    
    if not word:
        return jsonify({"error": "Word is required"}), 400
    
    # Check Tokenizer (used only here now)
    if tokenizer is None:
        return jsonify({"error": "Tokenizer model not loaded."}), 500

    try:
        # 1. BERT Subword Tokenizer
        tokens = tokenizer.tokenize(word)
        root = tokens[0] if tokens else ""
        rest = tokens[1:] if len(tokens) > 1 else []
        suffix = ", ".join(rest).replace("##", "-") if rest else ""
        
        # 2. NLTK Stemming & Lemmatization
        stem = stemmer.stem(word)
        # NLTK Lemmatizer defaults to noun, 'v' gives better verb lemmas usually, but let's stick to default or try both if needed.
        # Simple default lemmatization for now.
        lemma = lemmatizer.lemmatize(word, pos='v') 
        
        return jsonify({
            "original": word,
            "root": root,     # First token (BERT)
            "suffix": suffix, # Rest of tokens (BERT)
            "tokens": tokens, # Raw tokens
            "stem": stem,     # Porter Stemmer
            "lemma": lemma    # WordNet Lemmatizer
        })
        
    except Exception as e:
        print(f"Error executing model: {e}")
        return jsonify({"error": f"Model error: {str(e)}"}), 500

import os

# ... existing imports ...

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=(os.environ.get('RENDER') is None))
