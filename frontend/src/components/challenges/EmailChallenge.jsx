import React, { useState, useEffect } from 'react';

const SENDERS = [
  { name: 'PayPal Support', email: 'security@paypa1-support.com', type: 'trap' },
  { name: 'IT Helpdesk', email: 'admin@company-it-portal.net', type: 'trap' },
  { name: 'Netflix', email: 'alerts@netfIix-billing.com', type: 'trap' },
  { name: 'Amazon', email: 'orders@amazon.com', type: 'safe' }
];

const LINKS = [
  { text: 'Verify Account Now', url: 'http://login.secure-auth-gateway.net/pay', type: 'trap' },
  { text: 'Update Billing Info', url: 'http://192.168.1.45/login.php', type: 'trap' },
  { text: 'Reset Password', url: 'https://bit.ly/3x8Zq9', type: 'trap' },
  { text: 'View Order', url: 'https://amazon.com/orders', type: 'safe' }
];

const EmailChallenge = ({ onAction }) => {
  const [sender, setSender] = useState(null);
  const [link, setLink] = useState(null);
  const [hoverLink, setHoverLink] = useState(false);

  useEffect(() => {
    // Randomize scenario
    const s = SENDERS[Math.floor(Math.random() * SENDERS.length)];
    // Ensure we don't accidentally create a perfectly safe email in the sandbox (boring)
    // Always include at least one trap
    const l = s.type === 'safe' 
      ? LINKS.find(x => x.type === 'trap') 
      : LINKS[Math.floor(Math.random() * LINKS.length)];
    
    setSender(s);
    setLink(l);
  }, []);

  if (!sender || !link) return null;

  const handleSenderClick = () => {
    if (sender.type === 'trap') {
      onAction(`SUCCESS: User accurately identified the suspicious sender email: ${sender.email}`);
    } else {
      onAction(`FAIL: User flagged a legitimate sender email: ${sender.email}. Paranoia is good, but precision is better.`);
    }
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    if (link.type === 'trap') {
      onAction(`CRITICAL FAIL: User clicked the malicious payload link without inspecting it. URL: ${link.url}`);
    } else {
      onAction(`FAIL: User clicked a link in an email without verifying the sender first. Even safe links shouldn't be blindly trusted.`);
    }
  };

  const handleInspectLink = () => {
    if (link.type === 'trap') {
      onAction(`SUCCESS: User hovered and inspected the malicious URL: ${link.url}`);
    } else {
      onAction(`SUCCESS: User verified the URL was safe: ${link.url}`);
    }
  };

  return (
    <div className="bg-white text-black font-sans rounded overflow-hidden">
      {/* Email Header */}
      <div className="border-b border-gray-300 p-4 bg-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1">URGENT: Action Required on your account</h3>
          <p className="text-sm text-gray-600">
            From: <span className="font-semibold cursor-pointer hover:bg-yellow-200 transition-colors p-1 rounded" onClick={handleSenderClick}>{sender.name} &lt;{sender.email}&gt;</span>
          </p>
          <p className="text-sm text-gray-600">To: you@company.com</p>
        </div>
      </div>
      
      {/* Email Body */}
      <div className="p-6">
        <p className="mb-4">Dear Customer,</p>
        <p className="mb-4">We have detected unusual activity on your account. For your security, your access has been temporarily restricted.</p>
        <p className="mb-6">Please click the button below to verify your identity and restore access immediately. If you do not verify within 24 hours, your account will be permanently suspended.</p>
        
        <div className="text-center mb-8 relative">
          <button 
            onClick={handleLinkClick}
            onMouseEnter={() => setHoverLink(true)}
            onMouseLeave={() => setHoverLink(false)}
            onContextMenu={(e) => { e.preventDefault(); handleInspectLink(); }}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-blue-700"
          >
            {link.text}
          </button>
          <div className="mt-2 text-xs text-gray-400 italic">
            (Right-click button to "Inspect" URL)
          </div>
        </div>

        <p className="text-sm text-gray-500">Thank you,<br/>The Security Team</p>
      </div>

      {/* Simulated Browser URL bar popup */}
      {hoverLink && (
        <div className="bg-gray-200 border-t border-gray-300 p-1 px-3 text-xs text-gray-600 absolute bottom-0 left-0">
          {link.url}
        </div>
      )}
    </div>
  );
};

export default EmailChallenge;
