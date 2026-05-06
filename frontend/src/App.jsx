import React, { useState, useEffect, useRef } from 'react';
import VulnerabilityRadar from './components/RadarChartComponent';
import Sandbox from './components/Sandbox';
import { Terminal as TerminalIcon, Send, ShieldAlert, Cpu } from 'lucide-react';
import { checkPasswordCompromise } from './utils/pwncheck';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [mode, setMode] = useState('Forum');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputMessage(val);
    if (val === '/') {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const fetchZeroDayResponse = async (userMessage, currentMode) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, mode: currentMode }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.bot_response, isGlitch: data.vuln_impact_score >= 80 }]);
      setLatestAnalysis(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'ERR_CONNECTION_REFUSED: Could not reach ZeroDay core.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setShowAutocomplete(false);

    if (userMessage.startsWith('/pwncheck ')) {
      const password = userMessage.slice(10).trim();
      setMessages(prev => [...prev, { role: 'user', content: `/pwncheck ************` }]);
      setIsLoading(true);
      
      const leakCount = await checkPasswordCompromise(password);
      
      if (leakCount === -1) {
        setMessages(prev => [...prev, { role: 'ai', content: '[SYSTEM ERROR] HIBP API connection failed.' }]);
        setIsLoading(false);
      } else {
        const payload = `[PWNCHECK COMMAND] The user just checked a password using the k-Anonymity HIBP API. The exact leak count returned from the database is: ${leakCount.toLocaleString()} times. If > 0, absolutely roast them for using a compromised password. If 0, tell them it's clean but remind them length/entropy still matters.`;
        fetchZeroDayResponse(payload, 'PwnCheck');
      }
    } else {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      fetchZeroDayResponse(userMessage, mode);
    }
  };

  const handleSandboxAction = (actionPayload) => {
    setMessages(prev => [...prev, { role: 'user', content: `[ACTION TAKEN] ${actionPayload}` }]);
    fetchZeroDayResponse(actionPayload, 'Sandbox');
  };

  return (
    <div className="min-h-screen bg-zero-black text-zero-green font-mono flex flex-col md:flex-row overflow-hidden selection:bg-zero-green selection:text-zero-black">
      
      {/* Sidebar / Analytics Dashboard */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zero-border p-4 flex flex-col h-screen overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <Cpu className="w-8 h-8 text-zero-cyan" />
          <h1 className="text-2xl font-bold tracking-widest text-zero-cyan glitch" data-text="ZERODAY_OS">ZERODAY_OS</h1>
        </div>

        <div className="mb-6 flex gap-4">
          <button 
            onClick={() => setMode('Forum')}
            className={`px-4 py-2 border flex-1 text-center transition-colors ${mode === 'Forum' ? 'border-zero-green bg-zero-green/10' : 'border-zero-border hover:border-zero-green/50'}`}
          >
            FORUM
          </button>
          <button 
            onClick={() => setMode('Sandbox')}
            className={`px-4 py-2 border flex-1 text-center transition-colors ${mode === 'Sandbox' ? 'border-zero-cyan bg-zero-cyan/10' : 'border-zero-border hover:border-zero-cyan/50'}`}
          >
            SANDBOX
          </button>
        </div>

        {latestAnalysis ? (
          <div className="flex flex-col gap-6">
            <div className="border border-zero-border p-4 relative overflow-hidden group hover:border-zero-cyan transition-colors">
              <h2 className="text-sm text-gray-500 mb-2">VULN_IMPACT_SCORE</h2>
              <div className={`text-5xl font-bold ${latestAnalysis.vuln_impact_score >= 80 ? 'text-zero-red glitch' : latestAnalysis.vuln_impact_score > 50 ? 'text-zero-cyan' : 'text-zero-green'}`} data-text={latestAnalysis.vuln_impact_score}>
                {latestAnalysis.vuln_impact_score}
              </div>
              <VulnerabilityRadar score={latestAnalysis.vuln_impact_score} tags={latestAnalysis.tags} />
            </div>

            {latestAnalysis.detected_vulnerabilities?.length > 0 && (
              <div className="border border-zero-border p-4 hover:border-zero-red transition-colors">
                <h2 className="text-sm text-gray-500 mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-zero-red" /> DETECTED_FLAWS</h2>
                <ul className="list-disc list-inside text-sm text-zero-red space-y-1">
                  {latestAnalysis.detected_vulnerabilities.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            {latestAnalysis.suggested_mitigations?.length > 0 && (
              <div className="border border-zero-border p-4 hover:border-zero-green transition-colors">
                <h2 className="text-sm text-gray-500 mb-2">SUGGESTED_MITIGATION</h2>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {latestAnalysis.suggested_mitigations.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {latestAnalysis.tags?.map((tag, i) => (
                <span key={i} className="text-xs border border-zero-cyan text-zero-cyan px-2 py-1 bg-zero-cyan/5">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zero-border text-sm border border-dashed border-zero-border p-4 text-center">
            {mode === 'Forum' ? 'AWAITING_INPUT_STREAM...' : 'AWAITING_SANDBOX_INTERACTION...'}
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-screen relative bg-[#0a0a0a] min-w-0">
        
        {mode === 'Sandbox' && (
          <div className="flex-[2] min-h-0 border-b border-zero-border flex flex-col relative overflow-hidden">
             <Sandbox onAction={handleSandboxAction} />
          </div>
        )}

        {/* Terminal Chat Area */}
        <div className={`flex flex-col ${mode === 'Sandbox' ? 'flex-[1]' : 'flex-1'} min-h-0 relative`}>
          {/* Terminal Header */}
          <div className="h-10 border-b border-zero-border flex items-center px-4 bg-zero-black/50 backdrop-blur shrink-0">
            <TerminalIcon className="w-4 h-4 mr-2" />
            <span className="text-xs text-gray-500">root@zeroday:~# tail -f /var/log/mentor.log</span>
          </div>

          {/* Chat History */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
            <div className="text-gray-500 text-sm mb-8">
              <p>Welcome to ZeroDay {mode}.</p>
              {mode === 'Forum' 
                ? <p>Post your code, architecture, or scenario. I will find the flaws.</p>
                : <p>Find the trap in the UI above. Click to interact.</p>
              }
              <p className="mt-2 text-zero-red">Warning: I do not sugarcoat incompetence.</p>
            </div>
            
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                <span className={`text-xs mb-1 ${msg.role === 'user' ? 'text-zero-cyan' : 'text-zero-green'}`}>
                  {msg.role === 'user' ? 'guest@local:~#' : 'root@zeroday:~#'}
                </span>
                <p className={`pl-4 border-l-2 py-1 ${msg.role === 'user' ? 'border-zero-cyan text-gray-300' : 'border-zero-green text-zero-green'} ${msg.isGlitch ? 'glitch text-zero-red border-zero-red' : ''}`} data-text={msg.content}>
                  {msg.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col">
                 <span className="text-xs mb-1 text-zero-green">root@zeroday:~#</span>
                 <p className="pl-4 border-l-2 border-zero-green animate-pulse">Analyzing payload...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area (Only in Forum Mode) */}
          {mode === 'Forum' && (
            <div className="p-4 bg-zero-black border-t border-zero-border shrink-0 relative">
              {showAutocomplete && (
                <div className="absolute bottom-full left-4 mb-2 bg-[#1A1A1A] border border-zero-cyan text-zero-cyan text-sm shadow-xl z-50">
                  <div 
                    className="p-3 cursor-pointer hover:bg-zero-cyan/20 transition-colors"
                    onClick={() => {
                      setInputMessage('/pwncheck ');
                      setShowAutocomplete(false);
                      inputRef.current?.focus();
                    }}
                  >
                    <span className="font-bold">/pwncheck</span> [password] - Check k-anonymity leak count
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <span className="absolute left-4 text-zero-cyan">guest@local:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (showAutocomplete && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                      e.preventDefault();
                      setInputMessage('/pwncheck ');
                      setShowAutocomplete(false);
                    }
                  }}
                  className="w-full bg-transparent border border-zero-border hover:border-zero-cyan focus:border-zero-cyan focus:outline-none py-3 pl-36 pr-12 transition-colors rounded-none"
                  placeholder="_"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="absolute right-4 text-zero-border hover:text-zero-cyan transition-colors disabled:opacity-50"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
