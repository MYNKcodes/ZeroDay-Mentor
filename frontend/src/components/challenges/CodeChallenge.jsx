import React, { useState, useEffect } from 'react';

const SNIPPETS = [
  {
    language: 'javascript',
    code: `app.post('/login', (req, res) => {\n  const username = req.body.username;\n  const query = "SELECT * FROM users WHERE username = '" + username + "'";\n  db.execute(query);\n});`,
    trapLine: 3,
    type: 'trap',
    issue: 'SQL Injection'
  },
  {
    language: 'python',
    code: `import os\n\ndef backup_data(filename):\n    command = f"tar -czf backup.tar.gz {filename}"\n    os.system(command)\n    return "Success"`,
    trapLine: 4,
    type: 'trap',
    issue: 'Command Injection'
  },
  {
    language: 'javascript',
    code: `const crypto = require('crypto');\n\nfunction hashPassword(password) {\n  return crypto.createHash('md5').update(password).digest('hex');\n}`,
    trapLine: 4,
    type: 'trap',
    issue: 'Weak Hash Algorithm (MD5)'
  },
  {
    language: 'javascript',
    code: `const bcrypt = require('bcrypt');\n\nasync function hashPassword(password) {\n  const salt = await bcrypt.genSalt(10);\n  return await bcrypt.hash(password, salt);\n}`,
    trapLine: -1, // No trap line
    type: 'safe',
    issue: 'None'
  }
];

const CodeChallenge = ({ onAction }) => {
  const [snippet, setSnippet] = useState(null);

  useEffect(() => {
    setSnippet(SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]);
  }, []);

  if (!snippet) return null;

  const handleLineClick = (lineNumber) => {
    if (snippet.type === 'trap') {
      if (lineNumber === snippet.trapLine) {
        onAction(`SUCCESS: User correctly identified the vulnerable line of code (${snippet.issue}).`);
      } else {
        onAction(`CRITICAL FAIL: User was reviewing code with a glaring ${snippet.issue} vulnerability, but clicked the wrong line. They approved vulnerable code for production.`);
      }
    } else {
      onAction(`FAIL: User flagged a perfectly safe, best-practice implementation. They are slowing down the development pipeline for no reason.`);
    }
  };

  const handleApprove = () => {
    if (snippet.type === 'trap') {
      onAction(`CRITICAL FAIL: User approved a pull request containing a severe ${snippet.issue} vulnerability. Production is compromised.`);
    } else {
      onAction(`SUCCESS: User correctly approved secure code.`);
    }
  };

  const lines = snippet.code.split('\n');

  return (
    <div className="bg-[#1e1e1e] text-gray-300 font-mono rounded overflow-hidden shadow-xl border border-gray-700 w-full max-w-2xl mx-auto text-sm">
      <div className="bg-[#2d2d2d] border-b border-gray-700 p-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">Review Pull Request #404</span>
        <div className="flex gap-2">
          <button 
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
          >
            Approve PR
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <p className="mb-4 text-xs text-gray-400">Click on the specific line of code if you spot a vulnerability.</p>
        <div className="bg-[#1e1e1e] rounded overflow-x-auto">
          {lines.map((line, idx) => (
            <div 
              key={idx} 
              className="flex hover:bg-[#2a2d2e] cursor-pointer group"
              onClick={() => handleLineClick(idx + 1)}
            >
              <div className="w-8 flex-shrink-0 text-right pr-2 text-gray-600 select-none group-hover:text-gray-400">
                {idx + 1}
              </div>
              <div className="whitespace-pre pl-2 border-l border-gray-700 group-hover:border-red-500 transition-colors">
                {line}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeChallenge;
