'use client'

interface CustomSectionProps {
  html: string
  css?: string
}

export default function CustomSection({ html, css }: CustomSectionProps) {
  return (
    <>
      {css && <style>{css}</style>}
      <section
        className="custom-section"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
