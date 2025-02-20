import React from 'react';

function Logo() {
  return (
    <svg width="120" height="40" viewBox="0 0 300 100">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#ffffff' }} />
          <stop offset="100%" style={{ stopColor: '#e0e0e0' }} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="72"
        fontWeight="bold"
        fill="url(#logoGradient)"
        style={{
          filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        OnRank
      </text>
      <text
        x="95%"
        y="30%"
        fontSize="16"
        fill="#ffffff"
        textAnchor="end"
      >
        TM
      </text>
    </svg>
  );
}

export default Logo; 