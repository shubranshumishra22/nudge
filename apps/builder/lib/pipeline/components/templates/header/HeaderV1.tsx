import React from 'react';

interface LinkItem {
  label: string;
  href: string;
}

interface HeaderV1Props {
  businessName: string;
  links?: LinkItem[];
  styleTokens: {
    primary_color: string;
  };
}

export default function HeaderV1({ businessName, links, styleTokens }: HeaderV1Props) {
  const finalLinks = links || [
    { label: 'Products', href: '#products' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="header-v1">
      <div className="header-v1-container">
        <div className="logo">{businessName}</div>
        <nav className="nav-links">
          {finalLinks.map((link, idx) => (
            <a key={idx} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <div className="cart-icon">
          <span>🛒</span>
          <span className="cart-badge" id="cart-badge">0</span>
        </div>
      </div>
    </header>
  );
}
