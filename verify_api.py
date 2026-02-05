import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_ngram(text, type):
    try:
        response = requests.post(f"{BASE_URL}/analyze", json={"text": text, "type": type})
        print(f"N-gram ({type}): {response.status_code} - Retrieved {len(response.json())} items")
    except Exception as e:
        print(f"{type.capitalize()} Failed: {e}")

def test_perplexity(train_text, test_text):
    try:
        payload = {"training_text": train_text, "test_text": test_text}
        response = requests.post(f"{BASE_URL}/perplexity", json=payload)
        print(f"Perplexity: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Perplexity Failed: {e}")

def test_edit_distance(s1, s2):
    try:
        response = requests.post(f"{BASE_URL}/edit-distance", json={"source": s1, "target": s2})
        data = response.json()
        print(f"Edit Distance ({s1} -> {s2}): {data['distance']}")
    except Exception as e:
        print(f"Edit Distance Failed: {e}")

def test_morph(word):
    try:
        response = requests.post(f"{BASE_URL}/morph-analysis", json={"word": word})
        data = response.json()
        print(f"Morph Analysis ('{word}'): {data}")
    except Exception as e:
        print(f"Morph Analysis Failed: {e}")

def test_tokenize(text):
    try:
        response = requests.post(f"{BASE_URL}/tokenize", json={"text": text})
        data = response.json()
        print(f"Tokenization ('{text}'): {data}")
    except Exception as e:
        print(f"Tokenization Failed: {e}")

if __name__ == "__main__":
    train_text = "The quick brown fox jumps over the lazy dog."
    test_text = "The quick brown fox"
    
    # Test N-grams
    test_ngram(train_text, "unigram")
    test_ngram(train_text, "bigram")

    # Test Perplexity
    test_perplexity(train_text, test_text)
    
    # Test Edit Distance
    test_edit_distance("kitten", "sitting")
    test_edit_distance("flaw", "lawn")
    
    # User Case (Edit Distance)
    long_source = "fherfree dfhysgosdhds 8s7hsoefdhsh dsfgd hfsggogsfdsyf " 
    test_edit_distance(long_source, "edit")

    # Test Tokenization
    test_tokenize("Hello! This is a test. 10.5")

    # Test Morph Analysis
    test_morph("Running")
    test_morph("played")
    test_morph("Cats")
