import React from 'react';

interface HeroV1Props {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage?: string;
  styleTokens: {
    primary_color: string;
    accent_color: string;
  };
}

export default function HeroV1({ headline, subheadline, ctaText, backgroundImage, styleTokens }: HeroV1Props) {
  const bgStyle = backgroundImage
    ? { backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%), url(${backgroundImage})` }
    : { background: `linear-gradient(135deg, ${styleTokens.primary_color}15 0%, ${styleTokens.accent_color}10 100%)` };

  return (
    <section id="hero" className="hero-v1" style={bgStyle}>
      <div className="hero-v1-content">
        <h1>{headline}</h1>
        {subheadline && <p>{subheadline}</p>}
        <button className="btn-primary">{ctaText}</button>
      </div>
    </section>
  );
}
