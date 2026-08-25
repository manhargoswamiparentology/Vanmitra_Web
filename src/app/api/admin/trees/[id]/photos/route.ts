import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadTreePhoto } from '@/lib/blob'

// POST /api/admin/trees/[id]/photos
// id is the Dedication id — uploads photos to the underlying InventoryTree
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Resolve Dedication → InventoryTree
    const dedication = await prisma.dedication.findUnique({
      where: { id },
      select: { treeId: true },
    })
    if (!dedication) {
      return NextResponse.json({ error: 'Dedication not found' }, { status: 404 })
    }
    const inventoryTreeId = dedication.treeId

    const formData = await request.formData()
    const photos = formData.getAll('photos')
    const caption = formData.get('caption')
    const captionStr = typeof caption === 'string' ? caption.trim() || null : null

    if (!photos || photos.length === 0) {
      return NextResponse.json({ error: 'No photos provided' }, { status: 400 })
    }

    const files = photos.filter(
      (p): p is File => p instanceof File && p.size > 0
    )

    if (files.length === 0) {
      return NextResponse.json({ error: 'No valid photo files provided' }, { status: 400 })
    }

    const created = await Promise.all(
      files.map(async (file) => {
        const url = await uploadTreePhoto(file, inventoryTreeId)
        return prisma.treePhoto.create({
          data: {
            treeId: inventoryTreeId,
            url,
            caption: captionStr,
            uploadedBy: session.name,
          },
        })
      })
    )

    return NextResponse.json({ uploaded: created.length, photos: created }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/trees/[id]/photos', err)
    return NextResponse.json({ error: 'Failed to upload photos' }, { status: 500 })
  }
}
