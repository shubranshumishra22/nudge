import React from 'react';

interface HeroV2Props {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage?: string;
  styleTokens: {
    primary_color: string;
    accent_color: string;
  };
}

export default function HeroV2({ headline, subheadline, ctaText, backgroundImage, styleTokens }: HeroV2Props) {
  const imgUrl = backgroundImage || 'https://images.unsplash.com/photo-1556740772-1a741367c93e?w=800&q=80';
  return (
    <section id="hero" className="hero-v2">
      <div className="hero-v2-grid">
        <div className="hero-v2-text">
          <h1>{headline}</h1>
          {subheadline && <p>{subheadline}</p>}
          <button className="btn-primary">{ctaText}</button>
        </div>
        <div className="hero-v2-image-container">
          <img src={imgUrl} alt={headline} className="hero-v2-image" />
        </div>
      </div>
    </section>
  );
}
