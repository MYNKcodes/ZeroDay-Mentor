import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const VulnerabilityRadar = ({ score, tags }) => {
  // Generate dummy data based on score and tags to make the chart look dynamic
  // A higher score increases the area.
  const data = [
    { subject: 'Auth', A: tags.includes('authentication') ? score : score * 0.4, fullMark: 100 },
    { subject: 'Config', A: tags.includes('misconfiguration') ? score : score * 0.5, fullMark: 100 },
    { subject: 'Injection', A: tags.includes('sqli') ? score : score * 0.3, fullMark: 100 },
    { subject: 'Awareness', A: tags.includes('phishing') ? score : score * 0.6, fullMark: 100 },
    { subject: 'Crypto', A: tags.includes('cryptography') ? score : score * 0.4, fullMark: 100 },
    { subject: 'Logic', A: score * 0.5, fullMark: 100 },
  ];

  // Determine color based on score severity
  let strokeColor = '#00FF41'; // Green (Low)
  let fillColor = 'rgba(0, 255, 65, 0.5)';
  
  if (score > 50) {
    strokeColor = '#00FFFF'; // Cyan (Medium)
    fillColor = 'rgba(0, 255, 255, 0.5)';
  }
  if (score >= 80) {
    strokeColor = '#FF003C'; // Red (High/Critical)
    fillColor = 'rgba(255, 0, 60, 0.5)';
  }

  return (
    <div className="w-full h-64 flex items-center justify-center relative">
      {score >= 80 && (
         <div className="absolute inset-0 bg-zero-red/10 animate-pulse pointer-events-none z-0"></div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#1A1A1A" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: strokeColor, fontSize: 12, fontFamily: 'Fira Code' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Vuln Score" dataKey="A" stroke={strokeColor} fill={fillColor} fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VulnerabilityRadar;
