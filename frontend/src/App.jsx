import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [testText, setTestText] = useState('');
  const [results, setResults] = useState(null);
  const [resultTitle, setResultTitle] = useState('');
  const [perplexity, setPerplexity] = useState(null);
  const [perplexityDetails, setPerplexityDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Distance State
  const [sourceStr, setSourceStr] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [editDistance, setEditDistance] = useState(null);

  // Morph Analysis State
  const [morphWord, setMorphWord] = useState('');
  const [morphResult, setMorphResult] = useState(null);

  const resultsRef = useRef(null);

  const scrollToResults = () => {
    // Only scroll on mobile/tablet where the layout is stacked (lg breakpoint is 1024px)
    if (window.innerWidth < 1024 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Determine API Base URL (env var for prod, localhost for dev)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleNgram = async (type) => {
    setLoading(true);
    setResults(null);
    setPerplexity(null);
    setEditDistance(null);
    setMorphResult(null);
    setErrorMsg('');
    setResultTitle(`${type.charAt(0).toUpperCase() + type.slice(1)}s`);
    scrollToResults(); // Scroll to results panel
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, type: type }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Error analyzing text. Is backend running?");
    }
    setLoading(false);
  };

  const handlePerplexity = async () => {
    setLoading(true);
    setResults(null);
    setPerplexity(null);
    setEditDistance(null);
    setMorphResult(null);
    setErrorMsg('');
    scrollToResults();
    try {
      const response = await fetch(`${API_BASE_URL}/api/perplexity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ training_text: inputText, test_text: testText }),
      });
      const data = await response.json();

      if (response.ok) {
        setPerplexity(data.perplexity);
        setPerplexityDetails(data.details);
      } else {
        setErrorMsg(data.error || "Error calculating perplexity");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Error connecting to backend.");
    }
    setLoading(false);
  };

  const handleEditDistance = async () => {
    setLoading(true);
    setResults(null);
    setPerplexity(null);
    setEditDistance(null);
    setMorphResult(null);
    setErrorMsg('');
    scrollToResults();
    try {
      const response = await fetch(`${API_BASE_URL}/api/edit-distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: sourceStr, target: targetStr }),
      });
      const data = await response.json();
      setEditDistance(data.distance);
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Error connecting to backend.");
    }
    setLoading(false);
  };

  const handleTokenize = async () => {
    setLoading(true);
    setResults(null);
    setPerplexity(null);
    setEditDistance(null);
    setMorphResult(null);
    setErrorMsg('');
    setResultTitle("Tokens (Regex)");
    scrollToResults();
    try {
      const response = await fetch(`${API_BASE_URL}/api/tokenize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Error connecting to backend.");
    }
    setLoading(false);
  };

  const handleMorphAnalysis = async () => {
    setLoading(true);
    setResults(null);
    setPerplexity(null);
    setEditDistance(null);
    setMorphResult(null);
    setErrorMsg('');
    scrollToResults();
    try {
      const response = await fetch(`${API_BASE_URL}/api/morph-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: morphWord }),
      });
      const data = await response.json();
      setMorphResult(data);
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 font-sans text-slate-200 selection:bg-cyan-500/30">

      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/logo.avif" alt="App Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              NLP <span className="text-white">Project</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-7 space-y-8">

            {/* 1. N-Gram & Perplexity Section */}
            <div className="bg-[#0f172a]/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/30 group">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-4 text-white">
                  <span className="flex items-center justify-center w-8 h-8 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-bold border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">1</span>
                  Language Models
                </h2>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">N-Grams</span>
              </div>

              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Training Corpus</label>
              <textarea
                className="w-full h-32 p-4 bg-[#020617]/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-slate-600 text-slate-300 resize-none mb-6 transition-all text-sm font-mono leading-relaxed"
                placeholder="enter the sentence..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleTokenize}
                  disabled={loading || !inputText}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-sm rounded-xl transition disabled:opacity-50 font-semibold cursor-pointer border border-slate-700 hover:border-slate-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                  Char Tokenize
                </button>
                <div className="h-10 w-px bg-slate-800 mx-2 hidden md:block"></div>
                <button
                  onClick={() => handleNgram('unigram')}
                  disabled={loading || !inputText}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-[#0f172a] hover:bg-cyan-950/30 active:scale-95 text-cyan-400 text-sm rounded-xl transition disabled:opacity-50 font-bold cursor-pointer border border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  Unigrams
                </button>
                <button
                  onClick={() => handleNgram('bigram')}
                  disabled={loading || !inputText}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-[#0f172a] hover:bg-cyan-950/30 active:scale-95 text-cyan-400 text-sm rounded-xl transition disabled:opacity-50 font-bold cursor-pointer border border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  Bigrams
                </button>
                <button
                  onClick={() => handleNgram('trigram')}
                  disabled={loading || !inputText}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-[#0f172a] hover:bg-cyan-950/30 active:scale-95 text-cyan-400 text-sm rounded-xl transition disabled:opacity-50 font-bold cursor-pointer border border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  Trigrams
                </button>
              </div>

              <div className="pt-8 border-t border-slate-800/50">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Perplexity Test</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="flex-1 p-3 bg-[#020617]/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 placeholder-slate-600 text-sm transition-all font-mono"
                    placeholder="Sentence to evaluate..."
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                  />
                  <button
                    onClick={handlePerplexity}
                    disabled={loading || !inputText || !testText}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 active:scale-95 transition disabled:opacity-50 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] whitespace-nowrap cursor-pointer text-sm tracking-wide"
                  >
                    CALCULATE
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Edit Distance Section */}
            <div className="bg-[#0f172a]/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all hover:border-purple-500/30">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-4 text-white">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-500/10 text-purple-400 rounded-lg text-sm font-bold border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">2</span>
                  Min. Edit Distance
                </h2>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-950/50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">Metric</span>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Source</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-[#020617]/50 border border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200 placeholder-slate-600 text-sm transition-all font-mono"
                    placeholder="kitten"
                    value={sourceStr}
                    onChange={(e) => setSourceStr(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Target</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-[#020617]/50 border border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200 placeholder-slate-600 text-sm transition-all font-mono"
                    placeholder="sitting"
                    value={targetStr}
                    onChange={(e) => setTargetStr(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleEditDistance}
                  disabled={loading || !sourceStr || !targetStr}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 active:scale-95 transition disabled:opacity-50 font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] whitespace-nowrap h-[48px] cursor-pointer text-sm tracking-wide"
                >
                  DIFF
                </button>
              </div>
            </div>

            {/* 3. Morphological Analysis Section */}
            <div className="bg-[#0f172a]/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all hover:border-amber-500/30">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-4 text-white">
                  <span className="flex items-center justify-center w-8 h-8 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-bold border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">3</span>
                  Morphology
                </h2>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">BERT</span>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Word</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-[#020617]/50 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-600 text-sm transition-all font-mono"
                    placeholder="Running..."
                    value={morphWord}
                    onChange={(e) => setMorphWord(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleMorphAnalysis}
                  disabled={loading || !morphWord}
                  className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-500 hover:to-orange-500 active:scale-95 transition disabled:opacity-50 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] whitespace-nowrap h-[48px] cursor-pointer text-sm tracking-wide"
                >
                  HF TOKENIZE
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Results Dashboard (Span 5 cols) */}
          <div className="lg:col-span-5 h-full" ref={resultsRef}>
            <div className="bg-[#0f172a]/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.7)] p-8 sticky top-6 border border-slate-700/50 min-h-[600px] flex flex-col">
              <h2 className="text-xl font-bold mb-8 text-white border-b border-slate-700 pb-4 flex items-center justify-between tracking-wide">
                <span>SYSTEM OUTPUT</span>
                {loading && <span className="text-xs text-cyan-400 font-bold animate-pulse uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span>Processing</span>}
              </h2>

              <div className="space-y-6 flex-1 flex flex-col">
                {/* Loading State */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-24 opacity-80 flex-1">
                    <div className="relative mb-8">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
                      <div className="absolute top-0 left-0 w-full h-full animate-ping rounded-full bg-cyan-500/20"></div>
                    </div>
                    <p className="text-sm text-cyan-400 font-mono animate-pulse">EXECUTING ALGORITHMS...</p>
                  </div>
                )}

                {/* Error State */}
                {errorMsg && (
                  <div className="p-4 bg-red-950/30 text-red-400 text-sm rounded-xl border border-red-500/30 flex items-start gap-3 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                    <span className="font-bold text-lg">⚠️</span>
                    <p className="mt-0.5 font-mono">{errorMsg}</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && !errorMsg && !results && perplexity === null && editDistance === null && !morphResult && (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-600 flex-1">
                    <div className="h-24 w-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700 shadow-inner">
                      <span className="text-4xl opacity-50 grayscale">📊</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">System Ready</p>
                    <p className="text-xs mt-3 text-center max-w-[200px] text-slate-600 font-mono">Awaiting Input Parameters...</p>
                  </div>
                )}

                {/* 1. Perplexity Result */}
                {perplexity !== null && (
                  <div className="relative text-center p-8 bg-slate-900/50 rounded-2xl border border-cyan-900/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                    <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-[0.2em] mb-2">Perplexity Score</h3>
                    <p className="text-7xl font-black text-white my-6 tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">{perplexity}</p>
                    <div className="inline-block">
                      <p className="text-[10px] text-cyan-300 font-mono px-4 py-2 bg-cyan-950/30 rounded border border-cyan-900/50 uppercase">{perplexityDetails}</p>
                    </div>
                  </div>
                )}

                {/* 2. Edit Distance Result */}
                {editDistance !== null && (
                  <div className="relative text-center p-8 bg-slate-900/50 rounded-2xl border border-purple-900/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                    <h3 className="text-xs font-bold text-purple-500 uppercase tracking-[0.2em] mb-8">Transform Cost</h3>
                    <div className="flex items-center justify-center gap-6 mb-8">
                      <span className="px-5 py-3 bg-[#020617] rounded-lg text-sm font-mono text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">{sourceStr}</span>
                      <span className="text-purple-500 text-2xl animate-pulse">→</span>
                      <span className="px-5 py-3 bg-[#020617] rounded-lg text-sm font-mono text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">{targetStr}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">{editDistance}</p>
                      <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest opacity-80">Edits Required</span>
                    </div>
                  </div>
                )}

                {/* 3. Morph Result */}
                {morphResult && (
                  <div className="relative p-8 bg-slate-900/50 rounded-2xl border border-amber-900/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-8 text-center">Morphological Analysis</h3>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 bg-[#020617] rounded-xl border border-amber-900/30 shadow-inner">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Input Word</span>
                        <span className="text-lg font-bold text-amber-100 font-mono">{morphResult.original}</span>
                      </div>
                      <div className="flex items-center justify-center text-amber-500/50 text-xl">▼</div>

                      {/* Grid for Analysis Results */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* BERT Root */}
                        <div className="p-4 bg-slate-800/40 rounded-xl border border-amber-500/20 shadow-lg text-center backdrop-blur-sm">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">BERT Root</span>
                          <span className="block text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{morphResult.root}</span>
                        </div>
                        {/* BERT Suffix */}
                        <div className="p-4 bg-slate-800/40 rounded-xl border border-amber-500/20 shadow-lg text-center backdrop-blur-sm">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sub-tokens</span>
                          <span className="block text-lg font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] break-all">{morphResult.suffix || "—"}</span>
                        </div>
                        {/* Stem */}
                        <div className="p-4 bg-slate-800/40 rounded-xl border border-blue-500/20 shadow-lg text-center backdrop-blur-sm">
                          <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Stem (Porter)</span>
                          <span className="block text-lg font-bold text-blue-200">{morphResult.stem}</span>
                        </div>
                        {/* Lemma */}
                        <div className="p-4 bg-slate-800/40 rounded-xl border border-green-500/20 shadow-lg text-center backdrop-blur-sm">
                          <span className="block text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Lemma (WordNet)</span>
                          <span className="block text-lg font-bold text-green-200">{morphResult.lemma}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. List Results (N-Grams / Tokens) */}
                {results && (
                  <div className="bg-[#020617]/50 p-5 rounded-2xl border border-slate-700/50 h-full max-h-[500px] flex flex-col shadow-inner">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{resultTitle}</h3>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-3 py-1 rounded-full font-bold border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">{results.length} ITEMS</span>
                    </div>

                    {results.length === 0 ? (
                      <div className="text-center py-12 text-slate-600 italic text-sm font-mono">No matches found in corpus.</div>
                    ) : (
                      <div className="overflow-y-auto pr-2 custom-scrollbar">
                        <ul className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                          {results.map((item, index) => (
                            <li key={index} className="text-cyan-100 bg-slate-800/50 px-4 py-3 rounded-lg shadow-sm text-xs border border-slate-700/50 flex items-center gap-3 group hover:border-cyan-500/50 hover:bg-slate-700 stroke-cyan-500 transition-all cursor-default">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgb(34,211,238)] transition-all"></span>
                              <span className="truncate font-mono opacity-80 group-hover:opacity-100" title={item}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
