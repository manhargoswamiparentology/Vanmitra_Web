import { put, del } from '@vercel/blob'

// Vercel names the token BLOB_V_READ_WRITE_TOKEN in some setups — normalise it
const token =
  process.env.BLOB_READ_WRITE_TOKEN ||
  process.env.BLOB_V_READ_WRITE_TOKEN ||
  ''

export async function uploadTreePhoto(
  file: File,
  treeId: string,
  fileName?: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const name = fileName || `tree-${treeId}-${Date.now()}.${ext}`
  const blob = await put(`trees/${treeId}/${name}`, file, {
    access: 'public',
    contentType: file.type,
    token,
  })
  return blob.url
}

export async function deleteBlob(url: string) {
  await del(url, { token })
}
