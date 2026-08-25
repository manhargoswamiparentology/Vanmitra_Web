'use client'

import { useState } from 'react'
import { FAQS } from '@/data/constants'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section id="faq">
      <div className="container-text" style={{ textAlign: 'center' }}>
        <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: '20px' }}>FAQ</p>
        <h2 style={{ marginBottom: '52px' }}>Honest answers</h2>

        <div style={{ display: 'grid', gap: '0', textAlign: 'left' }}>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                style={{
                  borderTop: '1px solid var(--line)',
                  borderBottom: i === FAQS.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '20px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--display)',
                    fontSize: '17px',
                    fontWeight: 500,
                    color: 'var(--ink)',
                    lineHeight: 1.35,
                    flex: 1,
                  }}>
                    {faq.q}
                  </span>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid var(--line)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    fontFamily: 'var(--display)',
                    fontSize: '18px',
                    color: 'var(--ink-mute)',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform 200ms cubic-bezier(.2,.8,.2,1)',
                    background: isOpen
                      ? 'color-mix(in oklch, var(--forest) 8%, var(--paper))'
                      : 'transparent',
                    borderColor: isOpen ? 'var(--moss)' : 'var(--line)',
                  }}>
                    +
                  </span>
                </button>

                <div style={{
                  maxHeight: isOpen ? '300px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 280ms cubic-bezier(.2,.8,.2,1)',
                }}>
                  <p style={{
                    fontFamily: 'var(--serif)',
                    fontSize: '16px',
                    color: 'var(--ink-soft)',
                    lineHeight: 1.7,
                    paddingBottom: '20px',
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
