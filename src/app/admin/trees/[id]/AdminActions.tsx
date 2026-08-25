'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminActionsProps {
  dedicationId: string
  currentStatus: string
  photoCount: number
}

export default function AdminActions({ dedicationId, currentStatus, photoCount }: AdminActionsProps) {
  const router = useRouter()

  // Send update to user
  const [updateMessage, setUpdateMessage] = useState('')
  const [updatePhoto, setUpdatePhoto] = useState<File | null>(null)
  const [sendingUpdate, setSendingUpdate] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Upload photos
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photosMsg, setPhotosMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Cancel booking (edge case)
  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg, setCancelMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleSendUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!updateMessage.trim()) return
    setSendingUpdate(true)
    setUpdateMsg(null)
    try {
      const fd = new FormData()
      fd.append('message', updateMessage)
      if (updatePhoto) fd.append('photo', updatePhoto)
      const res = await fetch(`/api/admin/trees/${dedicationId}/updates`, { method: 'POST', body: fd })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setUpdateMsg({ type: 'ok', text: 'Update sent to user.' })
      setUpdateMessage('')
      setUpdatePhoto(null)
      router.refresh()
    } catch (err) {
      setUpdateMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setSendingUpdate(false)
    }
  }

  async function handleUploadPhotos(e: React.FormEvent) {
    e.preventDefault()
    if (!photoFiles || photoFiles.length === 0) return
    setUploadingPhotos(true)
    setPhotosMsg(null)
    try {
      const fd = new FormData()
      for (let i = 0; i < photoFiles.length; i++) fd.append('photos', photoFiles[i])
      if (photoCaption) fd.append('caption', photoCaption)
      const res = await fetch(`/api/admin/trees/${dedicationId}/photos`, { method: 'POST', body: fd })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      const data = await res.json()
      setPhotosMsg({ type: 'ok', text: `${data.uploaded} photo${data.uploaded !== 1 ? 's' : ''} uploaded.` })
      setPhotoFiles(null)
      setPhotoCaption('')
      const fi = document.getElementById('photo-upload-input') as HTMLInputElement
      if (fi) fi.value = ''
      router.refresh()
    } catch (err) {
      setPhotosMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setUploadingPhotos(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel this booking? The tree will be freed back to inventory.')) return
    setCancelling(true)
    setCancelMsg(null)
    try {
      const res = await fetch(`/api/admin/trees/${dedicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setCancelMsg({ type: 'ok', text: 'Booking cancelled.' })
      router.refresh()
    } catch (err) {
      setCancelMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setCancelling(false)
    }
  }

  const msgStyle = (type: 'ok' | 'err') => ({
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'var(--display)' as const,
    background: type === 'ok'
      ? 'color-mix(in oklch, var(--moss) 12%, var(--paper))'
      : 'color-mix(in oklch, var(--terra) 12%, var(--paper))',
    color: type === 'ok' ? 'var(--forest)' : 'var(--terra-deep)',
    border: `1px solid ${type === 'ok' ? 'color-mix(in oklch, var(--moss) 30%, transparent)' : 'color-mix(in oklch, var(--terra) 30%, transparent)'}`,
  })

  const sectionTitle = (text: string) => (
    <div style={{
      fontFamily: 'var(--mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      color: 'var(--ink-mute)',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottom: '1px solid var(--line)',
    }}>
      {text}
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
      {/* Send update to user */}
      <div className="card" style={{ padding: '24px' }}>
        {sectionTitle('Send Update to User')}
        <form onSubmit={handleSendUpdate} style={{ display: 'grid', gap: 14 }}>
          <div className="field">
            <label>Message</label>
            <textarea
              placeholder="Write an update about this tree for the recipient…"
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
              style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', background: 'var(--paper)', width: '100%' }}
            />
          </div>
          {updateMsg && <div style={msgStyle(updateMsg.type)}>{updateMsg.text}</div>}
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={sendingUpdate || !updateMessage.trim()}
            style={{ opacity: sendingUpdate || !updateMessage.trim() ? 0.6 : 1, alignSelf: 'flex-start' }}
          >
            {sendingUpdate ? 'Sending…' : 'Send Update'}
          </button>
        </form>
      </div>

      {/* Upload photos + cancel */}
      <div style={{ display: 'grid', gap: 20 }}>
        <div className="card" style={{ padding: '24px' }}>
          {sectionTitle(`Upload Photos (${photoCount} existing)`)}
          <form onSubmit={handleUploadPhotos} style={{ display: 'grid', gap: 14 }}>
            <div className="field">
              <label>Photos (multiple allowed)</label>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotoFiles(e.target.files)}
                style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', background: 'var(--paper)', width: '100%' }}
              />
            </div>
            <div className="field">
              <label>Caption (optional)</label>
              <input
                type="text"
                placeholder="e.g. Week 4 growth update"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
              />
            </div>
            {photosMsg && <div style={msgStyle(photosMsg.type)}>{photosMsg.text}</div>}
            <button
              type="submit"
              className="btn btn-ghost btn-sm"
              disabled={uploadingPhotos || !photoFiles || photoFiles.length === 0}
              style={{ opacity: uploadingPhotos || !photoFiles || photoFiles.length === 0 ? 0.6 : 1, alignSelf: 'flex-start' }}
            >
              {uploadingPhotos ? 'Uploading…' : photoFiles && photoFiles.length > 0 ? `Upload ${photoFiles.length} file${photoFiles.length !== 1 ? 's' : ''}` : 'Upload Photos'}
            </button>
          </form>
        </div>

        {/* Cancel booking — only show if not already cancelled */}
        {currentStatus !== 'CANCELLED' && (
          <div className="card" style={{ padding: '24px', borderTop: '3px solid color-mix(in oklch, var(--terra) 50%, var(--line))' }}>
            {sectionTitle('Cancel Booking')}
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
              Only use this if the user requested a refund or if there was an error. The tree will return to free inventory.
            </p>
            {cancelMsg && <div style={{ ...msgStyle(cancelMsg.type), marginBottom: 12 }}>{cancelMsg.text}</div>}
            <button
              onClick={handleCancel}
              className="btn btn-ghost btn-sm"
              disabled={cancelling}
              style={{ opacity: cancelling ? 0.6 : 1, color: 'var(--terra-deep)', borderColor: 'var(--terra-deep)' }}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
