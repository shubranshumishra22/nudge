import React from 'react';

interface AboutV1Props {
  title: string;
  body: string;
}

export default function AboutV1({ title, body }: AboutV1Props) {
  return (
    <section id="about" className="about-v1">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}
