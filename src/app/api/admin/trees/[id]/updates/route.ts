import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadTreePhoto } from '@/lib/blob'

// POST /api/admin/trees/[id]/updates
// id is the Dedication id — attaches update to the underlying InventoryTree
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

    if (!id) {
      return NextResponse.json({ error: 'Missing dedication id' }, { status: 400 })
    }

    // Resolve Dedication → InventoryTree
    const dedication = await prisma.dedication.findUnique({
      where: { id },
      select: { treeId: true },
    })
    if (!dedication) {
      console.error(`POST /api/admin/trees/${id}/updates — dedication not found in DB`)
      return NextResponse.json({ error: `Dedication ${id} not found. Try refreshing the page.` }, { status: 404 })
    }
    const inventoryTreeId = dedication.treeId

    const formData = await request.formData()
    const message = formData.get('message')
    const photoFile = formData.get('photo')

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let photoUrl: string | null = null
    if (photoFile && photoFile instanceof File && photoFile.size > 0) {
      photoUrl = await uploadTreePhoto(photoFile, inventoryTreeId)
    }

    const update = await prisma.treeUpdate.create({
      data: {
        treeId: inventoryTreeId,
        message: message.trim(),
        photoUrl,
        createdBy: session.name,
      },
    })

    return NextResponse.json({ update }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/trees/[id]/updates', err)
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 })
  }
}
