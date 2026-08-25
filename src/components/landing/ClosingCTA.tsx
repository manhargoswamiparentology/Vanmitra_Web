import Link from 'next/link'

export default function ClosingCTA() {
  return (
    <section>
      <div className="container-text" style={{ textAlign: 'center' }}>
        <p className="eyebrow" style={{ justifyContent: 'center', marginBottom: '28px' }}>
          Plant today
        </p>

        <h2 style={{ marginBottom: '36px', lineHeight: 1.1 }}>
          One tree, in{' '}
          <span style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 400,
          }}>their name</span>
          , that
          <br />
          you will visit again.
        </h2>

        <Link href="/plant" className="btn btn-primary btn-lg" style={{ marginBottom: '24px' }}>
          Plant a tree
        </Link>

        <div style={{ marginTop: '24px' }}>
          <p className="mono-sm" style={{ color: 'var(--ink-mute)', textAlign: 'center' }}>
            UPI · Cards · Net Banking · Tax deductible under 80G
          </p>
        </div>
      </div>
    </section>
  )
}
