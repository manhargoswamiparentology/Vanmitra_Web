export interface CertificateCardProps {
  recipientName: string
  recipientFrom: string | null
  message: string | null
  speciesName: string
  speciesLatin?: string
  occasionTitle: string
  plantedDate: string
  plotLabel: string
  certNumber: string
}

export default function CertificateCard({
  recipientName,
  recipientFrom,
  message,
  speciesName,
  speciesLatin,
  occasionTitle,
  plantedDate,
  plotLabel,
  certNumber,
}: CertificateCardProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 580,
        background: 'oklch(0.97 0.012 75)',
        border: '1px solid oklch(0.85 0.025 75)',
        borderRadius: 4,
        padding: '48px 52px',
        position: 'relative',
      }}
    >
      {/* Double border inset */}
      <div
        style={{
          position: 'absolute',
          inset: 12,
          border: '2px double oklch(0.72 0.05 75)',
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--moss)',
            marginBottom: 6,
          }}
        >
          Vanamitra · Kheda, Gujarat
        </div>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            marginBottom: 22,
          }}
        >
          Certificate of Tree Dedication
        </div>

        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 15,
            color: 'var(--ink-soft)',
            marginBottom: 10,
          }}
        >
          This certifies that
        </div>

        <div
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 32,
            fontWeight: 400,
            color: 'var(--forest)',
            lineHeight: 1.15,
            marginBottom: 10,
          }}
        >
          {recipientName}
        </div>

        {recipientFrom && (
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 14,
              color: 'var(--ink-soft)',
              marginBottom: 14,
            }}
          >
            gifted by {recipientFrom}
          </div>
        )}

        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 15,
            color: 'var(--ink-soft)',
            marginBottom: 8,
          }}
        >
          has a dedicated
        </div>

        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: 4,
          }}
        >
          {speciesName}
        </div>
        {speciesLatin && (
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--ink-mute)',
              marginBottom: 20,
            }}
          >
            {speciesLatin}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 1,
            background: 'oklch(0.72 0.05 75)',
            margin: '4px 0 20px',
          }}
        />

        {/* Details grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px 32px',
            width: '100%',
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          {[
            { label: 'Occasion', value: occasionTitle },
            { label: 'Planted', value: plantedDate },
            { label: 'Plot', value: plotLabel },
            { label: 'Certificate No.', value: certNumber },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                  marginBottom: 3,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 14,
                  color: 'var(--ink)',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--ink-soft)',
              borderTop: '1px solid oklch(0.85 0.025 75)',
              borderBottom: '1px solid oklch(0.85 0.025 75)',
              padding: '14px 0',
              width: '100%',
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            "{message}"
          </div>
        )}

        {/* Footer stamp */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          marginTop: 8,
          paddingTop: 16,
          borderTop: '1px dotted oklch(0.72 0.05 75)',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', lineHeight: 1.7 }}>
            Plot: {plotLabel}<br />
            Cert: {certNumber}
          </div>
          <div className="stamp" style={{ width: 72, height: 72, fontSize: 7.5, padding: 9, lineHeight: 1.6 }}>
            Living<br />tribute<br />· est 2026 ·
          </div>
        </div>
      </div>
    </div>
  )
}
