import React from 'react';

interface ContactV1Props {
  tagline: string;
  whatsappMessage: string;
}

export default function ContactV1({ tagline, whatsappMessage }: ContactV1Props) {
  return (
    <section id="contact" className="contact-v1">
      <h2>Get in Touch</h2>
      <p>{tagline}</p>
      <a href={`https://wa.me/91xxxxxxxxxx?text=${encodeURIComponent(whatsappMessage)}`} className="contact-btn">
        Message us on WhatsApp
      </a>
    </section>
  );
}
