import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" style={{ color: 'var(--forest)' }}>
              <ellipse cx="18" cy="18" rx="7" ry="9" fill="currentColor" opacity="0.7" />
              <ellipse cx="13" cy="16" rx="5" ry="6" fill="currentColor" opacity="0.5" />
              <ellipse cx="23" cy="16" rx="5" ry="6" fill="currentColor" opacity="0.5" />
              <rect x="17" y="22" width="2" height="8" fill="currentColor" opacity="0.6" />
            </svg>
            <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500 }}>
              Van<em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--moss)' }}>amitra</em>
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 280 }}>
            A 10-acre tree farm in Vasna village, Kheda, Gujarat.<br />
            Open every Saturday, 8 am – 5 pm.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 12, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Kheda · Gujarat · Est. 2024
          </p>
        </div>

        <div>
          <h4>Dedicate</h4>
          <ul>
            <li><Link href="/plant?occasion=mother" style={{ textDecoration: 'none', color: 'inherit' }}>For Mother</Link></li>
            <li><Link href="/plant?occasion=memory" style={{ textDecoration: 'none', color: 'inherit' }}>In Memory</Link></li>
            <li><Link href="/plant?occasion=newborn" style={{ textDecoration: 'none', color: 'inherit' }}>For a Newborn</Link></li>
            <li><Link href="/plant?occasion=anniversary" style={{ textDecoration: 'none', color: 'inherit' }}>Anniversary</Link></li>
            <li><Link href="/plant?occasion=festival" style={{ textDecoration: 'none', color: 'inherit' }}>Festivals</Link></li>
            <li><Link href="/csr" style={{ textDecoration: 'none', color: 'inherit' }}>CSR / Corporate</Link></li>
          </ul>
        </div>

        <div>
          <h4>Learn</h4>
          <ul>
            <li><Link href="/farm" style={{ textDecoration: 'none', color: 'inherit' }}>Our farm</Link></li>
            <li><Link href="/journal" style={{ textDecoration: 'none', color: 'inherit' }}>Journal</Link></li>
            <li><Link href="/#how-it-works" style={{ textDecoration: 'none', color: 'inherit' }}>How it works</Link></li>
            <li><Link href="/#species" style={{ textDecoration: 'none', color: 'inherit' }}>Our species</Link></li>
            <li><Link href="/#faq" style={{ textDecoration: 'none', color: 'inherit' }}>FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul>
            <li><Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>My forest</Link></li>
            <li><Link href="/dashboard/certificates" style={{ textDecoration: 'none', color: 'inherit' }}>Certificates</Link></li>
            <li><Link href="/auth/login" style={{ textDecoration: 'none', color: 'inherit' }}>Sign in</Link></li>
            <li><Link href="/auth/register" style={{ textDecoration: 'none', color: 'inherit' }}>Create account</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Vanamitra · Vasna, Kheda, Gujarat</span>
        <span>UPI · Cards · Net Banking · Tax deductible under 80G</span>
      </div>
    </footer>
  )
}
