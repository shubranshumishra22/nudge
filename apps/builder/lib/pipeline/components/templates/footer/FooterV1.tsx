import React from 'react';

interface FooterV1Props {
  tagline: string;
  businessName: string;
}

export default function FooterV1({ tagline, businessName }: FooterV1Props) {
  return (
    <footer className="footer-v1">
      <div className="footer-v1-content">
        <h3>{businessName}</h3>
        <p className="footer-tagline">{tagline}</p>
        <p className="footer-copyright">&copy; {new Date().getFullYear()} {businessName}. Powered by Nudge Commerce.</p>
      </div>
    </footer>
  );
}
