'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  url: string
  caption: string | null
  takenAt: string
}

interface Update {
  id: string
  message: string
  photoUrl: string | null
  createdAt: string
  createdBy: string | null
}

interface Props {
  treeId: string
  photos: Photo[]
  updates: Update[]
}

function msgStyle(type: 'ok' | 'err'): React.CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'var(--display)',
    background:
      type === 'ok'
        ? 'color-mix(in oklch, var(--moss) 12%, var(--paper))'
        : 'color-mix(in oklch, var(--terra) 12%, var(--paper))',
    color: type === 'ok' ? 'var(--forest)' : 'var(--terra-deep)',
    border: `1px solid ${
      type === 'ok'
        ? 'color-mix(in oklch, var(--moss) 30%, transparent)'
        : 'color-mix(in oklch, var(--terra) 30%, transparent)'
    }`,
  }
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: 'var(--ink-mute)',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: '1px solid var(--line)',
      }}
    >
      {children}
    </div>
  )
}

export default function PhotoUploadAndUpdates({ treeId, photos, updates }: Props) {
  const router = useRouter()

  // Photo upload state
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photosMsg, setPhotosMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Send update state
  const [updateMessage, setUpdateMessage] = useState('')
  const [updatePhoto, setUpdatePhoto] = useState<File | null>(null)
  const [sendingUpdate, setSendingUpdate] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleUploadPhotos(e: React.FormEvent) {
    e.preventDefault()
    if (!photoFiles || photoFiles.length === 0) return
    setUploadingPhotos(true)
    setPhotosMsg(null)

    try {
      const fd = new FormData()
      for (let i = 0; i < photoFiles.length; i++) {
        fd.append('photos', photoFiles[i])
      }
      if (photoCaption) fd.append('caption', photoCaption)

      const res = await fetch(`/api/admin/trees/${treeId}/photos`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload')

      setPhotosMsg({
        type: 'ok',
        text: `${data.uploaded} photo${data.uploaded !== 1 ? 's' : ''} uploaded.`,
      })
      setPhotoFiles(null)
      setPhotoCaption('')
      const fileInput = document.getElementById('inv-photo-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      router.refresh()
    } catch (err) {
      setPhotosMsg({ type: 'err', text: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      setUploadingPhotos(false)
    }
  }

  async function handleSendUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!updateMessage.trim()) return
    setSendingUpdate(true)
    setUpdateMsg(null)

    try {
      const fd = new FormData()
      fd.append('message', updateMessage)
      if (updatePhoto) fd.append('photo', updatePhoto)

      const res = await fetch(`/api/admin/trees/${treeId}/updates`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send update')

      setUpdateMsg({ type: 'ok', text: 'Update sent.' })
      setUpdateMessage('')
      setUpdatePhoto(null)
      router.refresh()
    } catch (err) {
      setUpdateMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error sending' })
    } finally {
      setSendingUpdate(false)
    }
  }

  const fileInputStyle: React.CSSProperties = {
    fontFamily: 'var(--serif)',
    fontSize: 14,
    color: 'var(--ink)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    padding: '10px 12px',
    background: 'var(--paper)',
    width: '100%',
  }

  return (
    <>
      {/* 5. Photos grid */}
      <div className="card" style={{ padding: '28px', marginBottom: 24 }}>
        <SectionHeading>Photos ({photos.length})</SectionHeading>

        {photos.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                }}
              >
                <img
                  src={`/api/blob?url=${encodeURIComponent(photo.url)}`}
                  alt={photo.caption || 'Tree photo'}
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div style={{ padding: '8px 10px', background: 'var(--paper-2)' }}>
                  {photo.caption && (
                    <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 3 }}>
                      {photo.caption}
                    </p>
                  )}
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      color: 'var(--ink-mute)',
                    }}
                  >
                    {new Date(photo.takenAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p
            style={{
              color: 'var(--ink-mute)',
              fontStyle: 'italic',
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            No photos yet.
          </p>
        )}

        {/* 6. Photo upload form */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              marginBottom: 14,
            }}
          >
            Upload Photos
          </div>
          <form onSubmit={handleUploadPhotos} style={{ display: 'grid', gap: 12 }}>
            <div className="field">
              <label>Photos (multiple allowed)</label>
              <input
                id="inv-photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotoFiles(e.target.files)}
                style={fileInputStyle}
              />
            </div>
            <div className="field">
              <label>Caption (optional)</label>
              <input
                type="text"
                placeholder="e.g. Week 4 growth"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
              />
            </div>
            {photosMsg && <div style={msgStyle(photosMsg.type)}>{photosMsg.text}</div>}
            <div>
              <button
                type="submit"
                className="btn btn-ghost btn-sm"
                disabled={uploadingPhotos || !photoFiles || photoFiles.length === 0}
                style={{
                  opacity:
                    uploadingPhotos || !photoFiles || photoFiles.length === 0 ? 0.6 : 1,
                }}
              >
                {uploadingPhotos
                  ? 'Uploading…'
                  : photoFiles && photoFiles.length > 0
                  ? `Upload ${photoFiles.length} file${photoFiles.length !== 1 ? 's' : ''}`
                  : 'Upload Photos'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 7. Updates list + 8. Send update form */}
      <div className="card" style={{ padding: '28px' }}>
        <SectionHeading>Updates ({updates.length})</SectionHeading>

        {updates.length > 0 ? (
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {updates.map((update, i) => (
              <div key={update.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <p style={{ fontSize: 15, color: 'var(--ink)', flex: 1, margin: 0 }}>
                    {update.message}
                  </p>
                  <div
                    style={{
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        color: 'var(--ink-mute)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(update.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    {update.createdBy && (
                      <div
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 10,
                          color: 'var(--ink-mute)',
                        }}
                      >
                        {update.createdBy}
                      </div>
                    )}
                  </div>
                </div>
                {update.photoUrl && (
                  <img
                    src={`/api/blob?url=${encodeURIComponent(update.photoUrl!)}`}
                    alt="Update photo"
                    style={{
                      width: 200,
                      height: 130,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      marginTop: 4,
                    }}
                  />
                )}
                {i < updates.length - 1 && (
                  <hr className="dotted-rule" style={{ margin: '12px 0 0' }} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p
            style={{
              color: 'var(--ink-mute)',
              fontStyle: 'italic',
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            No updates sent yet.
          </p>
        )}

        {/* 8. Send update form */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              marginBottom: 14,
            }}
          >
            Send Update to User
          </div>
          <form onSubmit={handleSendUpdate} style={{ display: 'grid', gap: 12 }}>
            <div className="field">
              <label>Message</label>
              <textarea
                placeholder="Write an update about this tree…"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="field">
              <label>Attach Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUpdatePhoto(e.target.files?.[0] || null)}
                style={fileInputStyle}
              />
            </div>
            {updateMsg && <div style={msgStyle(updateMsg.type)}>{updateMsg.text}</div>}
            <div>
              <button
                type="submit"
                className="btn btn-terra btn-sm"
                disabled={sendingUpdate || !updateMessage.trim()}
                style={{
                  opacity: sendingUpdate || !updateMessage.trim() ? 0.6 : 1,
                }}
              >
                {sendingUpdate ? 'Sending…' : 'Send Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
