import React, { useState, useEffect } from 'react';

const URLS = [
  { url: 'https://login.microsoftonline.com', type: 'safe' },
  { url: 'http://micros0ft-login-secure.net/auth', type: 'trap' },
  { url: 'https://login.microsoft.com.auth-update.info', type: 'trap' },
  { url: 'http://10.0.0.5/login', type: 'trap' }
];

const LoginChallenge = ({ onAction }) => {
  const [urlObj, setUrlObj] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Randomize URL, mostly traps
    const randomUrl = URLS[Math.floor(Math.random() * URLS.length)];
    setUrlObj(randomUrl);
  }, []);

  if (!urlObj) return null;

  const handleUrlClick = () => {
    if (urlObj.type === 'trap') {
      onAction(`SUCCESS: User identified the fake URL domain: ${urlObj.url}`);
    } else {
      onAction(`FAIL: User flagged the legitimate Microsoft login URL: ${urlObj.url}. Paranoia is good, but precision is better.`);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (urlObj.type === 'trap') {
      onAction(`CRITICAL FAIL: User submitted credentials to a phishing portal without checking the URL. Domain was: ${urlObj.url}`);
    } else {
      onAction(`SUCCESS: User securely logged into the legitimate portal: ${urlObj.url}`);
    }
  };

  const isHttps = urlObj.url.startsWith('https');

  return (
    <div className="bg-[#f0f2f5] text-black font-sans rounded overflow-hidden shadow-lg border border-gray-300 w-full max-w-md mx-auto">
      {/* Fake Browser Chrome */}
      <div className="bg-gray-200 border-b border-gray-300 flex flex-col">
        <div className="flex items-center p-2 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="bg-white mx-2 mb-2 p-1.5 rounded flex items-center text-sm text-gray-600 border border-gray-300">
          <span className={`mr-2 ${isHttps ? 'text-green-600' : 'text-red-500 font-bold'}`}>
            {isHttps ? '🔒' : '⚠️ Not Secure'}
          </span>
          <span className="cursor-pointer hover:bg-yellow-200 px-1 rounded transition-colors" onClick={handleUrlClick}>
            {urlObj.url}
          </span>
        </div>
      </div>

      {/* Fake Microsoft Login UI */}
      <div className="p-8 bg-white m-4 shadow-sm border border-gray-200">
        <img src="https://logincdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" alt="Microsoft" className="h-6 mb-4" />
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Sign in</h2>
        
        <form onSubmit={handleLoginClick} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email, phone, or Skype" 
            className="w-full border-b border-gray-400 py-1 focus:border-blue-600 focus:outline-none transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full border-b border-gray-400 py-1 focus:border-blue-600 focus:outline-none transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            No account? Create one!
          </div>
          <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            Can't access your account?
          </div>
          
          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="bg-[#0067b8] text-white px-8 py-1.5 hover:bg-[#005da6] transition-colors"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginChallenge;
