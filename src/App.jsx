import React, { useState, useCallback, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  RotateCcw, 
  ChevronRight, 
  Copy, 
  Download, 
  Loader2,
  Check,
  Zap
} from 'lucide-react';

const STOP_WORDS = ["a","about","above","after","again","against","all","am","an","and","any","are","as","at","be","because","been","before","being","below","between","both","but","by","can","did","do","does","doing","down","during","each","few","for","from","further","had","has","have","having","he","her","here","hers","him","his","how","i","if","in","into","is","it","its","me","more","most","my","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","out","over","own","same","she","should","so","some","such","than","that","the","their","theirs","them","then","there","these","they","this","those","through","to","too","under","until","up","very","was","we","were","what","when","where","which","while","who","whom","why","with","you","your","yours"];

const QuickBrief = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState(0.25);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'shortcut icon';
    link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>`;
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = "QuickBrief | AI Distiller";
  }, []);

  const colors = {
    bg: isDarkMode ? 'bg-[#000000]' : 'bg-[#f8fafc]',
    card: isDarkMode ? 'bg-[#080808]' : 'bg-[#ffffff]',
    text: isDarkMode ? 'text-white' : 'text-[#111111]',
    subText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-white/10' : 'border-slate-200',
    input: isDarkMode ? 'bg-white/5' : 'bg-slate-100',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondary: isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-200 hover:bg-slate-300 text-black',
    scaleBg: isDarkMode ? 'bg-white/5' : 'bg-slate-100',
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
    <div className={`h-screen w-full flex flex-col font-mono p-4 md:p-6 transition-colors duration-300 overflow-hidden ${colors.bg} ${colors.text}`}>
      <div className={`max-w-4xl mx-auto w-full flex flex-col h-full rounded-[2rem] border ${colors.border} ${colors.card} shadow-2xl overflow-hidden`}>
        
        <header className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-[1000] tracking-tighter uppercase leading-none">Quick<span className="text-blue-600">Brief</span></h1>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl border ${colors.border} ${colors.buttonSecondary} transition-all`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 p-6 space-y-4 overflow-hidden flex flex-col">
          
          <div className="flex flex-col flex-1 min-h-0 space-y-2">
            <span className={`text-[12px] font-black uppercase tracking-[0.2em] ${colors.subText} ml-1`}>Input Content</span>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="PASTE TEXT HERE..."
              className={`flex-1 w-full p-5 rounded-2xl border ${colors.border} ${colors.input} outline-none focus:ring-2 focus:ring-blue-600/20 transition-all resize-none text-[15px] font-bold tracking-wide uppercase leading-relaxed overflow-y-auto`}
            />
          </div>

          <div className={`flex flex-col md:flex-row gap-4 items-center justify-between ${colors.scaleBg} p-4 rounded-2xl border ${colors.border}`}>
            <div className="flex items-center gap-4">
              <span className={`text-[12px] font-black uppercase tracking-[0.2em] ${colors.subText}`}>Briefing Scale:</span>
              <div className="flex p-1 rounded-lg bg-black/5 dark:bg-white/5">
                {[0.1, 0.25, 0.5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setLength(val)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                      length === val 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : `${colors.subText} hover:text-blue-500`
                    }`}
                  >
                    {val * 100}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {setInputText(''); setSummary('');}} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${colors.buttonSecondary} flex items-center gap-2`}>
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={handleSummarize} disabled={isLoading || !inputText} className={`px-8 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-30 ${colors.buttonPrimary} flex items-center gap-2`}>
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />} Brief
              </button>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 relative">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 size={28} className="animate-spin text-blue-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-50">Distilling...</span>
              </div>
            ) : summary ? (
              <div className={`flex-1 flex flex-col min-h-0 p-6 rounded-3xl border ${colors.border} ${isDarkMode ? 'bg-white/[0.02]' : 'bg-black/[0.01]'} transition-all`}>
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-600">The Brief</h2>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className={`p-2 rounded-lg ${colors.buttonSecondary}`}>
                      {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                    <button onClick={handleDownload} className={`p-2 rounded-lg ${colors.buttonSecondary}`}>
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <p className="flex-1 text-[16px] leading-7 font-medium tracking-wide opacity-90 italic overflow-y-auto pr-3">
                  {summary}
                </p>
              </div>
            ) : (
              <div className={`flex-1 flex items-center justify-center border-2 border-dashed ${colors.border} rounded-3xl opacity-20`}>
                <span className="text-[11px] font-black uppercase tracking-[0.5em]">Waiting for Context</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuickBrief;