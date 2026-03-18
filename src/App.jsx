import React, { useState, useCallback, useEffect } from 'react';

const STOP_WORDS = ["a","about","above","after","again","against","all","am","an","and","any","are","as","at","be","because","been","before","being","below","between","both","but","by","can","did","do","does","doing","down","during","each","few","for","from","further","had","has","have","having","he","her","here","hers","him","his","how","i","if","in","into","is","it","its","me","more","most","my","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","out","over","own","same","she","should","so","some","such","than","that","the","their","theirs","them","then","there","these","they","this","those","through","to","too","under","until","up","very","was","we","were","what","when","where","which","while","who","whom","why","with","you","your","yours"];

const QuickBrief = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState(0.25);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    document.title = "QuickBrief | AI Distiller";
  }, []);

  const theme = {
    bg: isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900',
    card: isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200',
    input: isDarkMode ? 'bg-zinc-900 border-zinc-800 focus:ring-blue-500/20' : 'bg-slate-100 border-slate-200 focus:ring-blue-600/10',
    subText: isDarkMode ? 'text-zinc-500' : 'text-slate-400',
    btnSec: isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700',
    accent: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
  };

  const handleSummarize = useCallback(() => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setSummary('');
    setTimeout(() => {
      const cleanText = inputText.replace(/\s+/g, " ").replace(/\n/g, " ").trim();
      const sentences = cleanText.match(/[^\.!\?]+[\.!\?]+/g) || [cleanText];
      const words = cleanText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      const wordFreq = {};
      words.forEach(word => { if (!STOP_WORDS.includes(word)) wordFreq[word] = (wordFreq[word] || 0) + 1; });
      const sentenceScores = sentences.map(sentence => {
        let score = 0;
        const sentenceWords = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        sentenceWords.forEach(word => { if (wordFreq[word]) score += wordFreq[word]; });
        return { sentence: sentence.trim(), score };
      });
      sentenceScores.sort((a, b) => b.score - a.score);
      const keep = Math.ceil(sentences.length * length);
      const topSentences = sentenceScores.slice(0, keep).map(s => s.sentence);
      setSummary(topSentences.join(" "));
      setIsLoading(false);
    }, 800);
  }, [inputText, length]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quickbrief_summary.txt";
    link.click();
  };

  return (
    <div className={`h-screen w-full flex flex-col font-mono p-4 md:p-8 transition-colors duration-500 overflow-hidden ${theme.bg}`}>
      <div className={`max-w-4xl mx-auto w-full flex flex-col h-full rounded-[3rem] border shadow-2xl overflow-hidden ${theme.card}`}>
        
        <header className={`flex items-center justify-between p-8 border-b ${isDarkMode ? 'border-zinc-900' : 'border-slate-100'}`}>
          <h1 className="text-2xl font-black tracking-tighter uppercase leading-none italic">Quick<span className="text-blue-600">Brief</span></h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-2xl border transition-all ${theme.btnSec} ${isDarkMode ? 'border-zinc-800' : 'border-slate-300'}`}>
            {isDarkMode ? 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> 
              : 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </header>

        <main className="flex-1 p-8 space-y-6 overflow-hidden flex flex-col">
          <div className="flex flex-col flex-1 min-h-0 space-y-3">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ml-2 ${theme.subText}`}>Input Feed</span>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="PASTE SOURCE CONTENT..."
              className={`flex-1 w-full p-8 rounded-[2rem] border outline-none focus:ring-4 transition-all resize-none text-[14px] font-bold tracking-tight uppercase leading-relaxed overflow-y-auto ${theme.input}`}
            />
          </div>

          <div className={`flex flex-col md:flex-row gap-6 items-center justify-between p-5 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-900' : 'bg-slate-100 border-slate-200'}`}>
            <div className="flex items-center gap-5">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.subText}`}>Brief Scale</span>
              <div className="flex p-1 rounded-2xl bg-black/10 dark:bg-white/5">
                {[0.1, 0.25, 0.5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setLength(val)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                      length === val ? theme.accent : `${theme.subText} hover:text-blue-500`
                    }`}
                  >
                    {val * 100}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => {setInputText(''); setSummary('');}} className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${theme.btnSec}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Reset
              </button>
              <button onClick={handleSummarize} disabled={isLoading || !inputText} className={`flex-1 md:flex-none px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center justify-center gap-2 ${theme.accent}`}>
                {isLoading ? 
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> 
                  : 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                }
                Brief
              </button>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 relative">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <svg className="animate-spin text-blue-600" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <span className="text-[10px] font-black uppercase tracking-[0.8em] animate-pulse opacity-40">Distilling Content</span>
              </div>
            ) : summary ? (
              <div className={`flex-1 flex flex-col min-h-0 p-10 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-zinc-900/20 border-zinc-800' : 'bg-blue-50/30 border-blue-100'}`}>
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">The Summary</h2>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className={`p-2.5 rounded-xl transition-colors ${theme.btnSec}`}>
                      {isCopied ? 
                        <svg className="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg> 
                        : 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      }
                    </button>
                    <button onClick={handleDownload} className={`p-2.5 rounded-xl transition-colors ${theme.btnSec}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                  </div>
                </div>
                <p className="flex-1 text-[16px] leading-relaxed font-semibold tracking-tight italic overflow-y-auto pr-6 scrollbar-none">
                  {summary}
                </p>
              </div>
            ) : (
              <div className={`flex-1 flex items-center justify-center border-4 border-dashed rounded-[2.5rem] opacity-10 transition-opacity ${isDarkMode ? 'border-zinc-800' : 'border-slate-300'}`}>
                <span className="text-[10px] font-black uppercase tracking-[1em] -mr-[1em]">Empty</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuickBrief;