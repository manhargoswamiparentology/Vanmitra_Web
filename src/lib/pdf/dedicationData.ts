import { prisma } from '@/lib/db'
import { SPECIES, OCCASIONS } from '@/data/constants'

// Shared by the purchase emails and the certificate/invoice download routes,
// so the "how do we describe this dedication" logic only lives in one place.
export async function getDedicationPdfContext(dedicationId: string, baseUrl: string) {
  const dedication = await prisma.dedication.findUnique({
    where: { id: dedicationId },
    select: {
      id: true,
      createdAt: true,
      recipientName: true,
      message: true,
      occasionId: true,
      preferredDate: true,
      corporateName: true,
      employeeEmail: true,
      shareToken: true,
      user: { select: { name: true, email: true } },
      tree: {
        select: {
          uniqueId: true,
          speciesId: true,
          plotBlock: true,
          plotRow: true,
          plotPosition: true,
          locationAddress: true,
          price: true,
        },
      },
    },
  })

  if (!dedication) return null

  const species = SPECIES.find(s => s.id === dedication.tree.speciesId)
  const occasion = OCCASIONS.find(o => o.id === dedication.occasionId)
  const speciesName = species?.name ?? 'native'
  const occasionTitle = occasion?.title ?? 'A living tribute'

  const shortId = dedication.id.slice(-8).toUpperCase()
  const invoiceNo = `INV-${shortId}`
  const invoiceDate = dedication.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const dateLabel = (dedication.preferredDate ?? dedication.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const location = dedication.tree.locationAddress
    || (dedication.tree.plotBlock
        ? `Block ${dedication.tree.plotBlock}${dedication.tree.plotRow ? `, Row ${dedication.tree.plotRow}` : ''}${dedication.tree.plotPosition ? `, Position ${dedication.tree.plotPosition}` : ''} — Vasna Village, Kheda, Gujarat`
        : 'Vasna Village, Kheda, Gujarat')

  const dedicationUrl = `${baseUrl}/dedications/${dedication.id}`
  const shareUrl = dedication.shareToken ? `${baseUrl}/certificate/${dedication.shareToken}` : null

  const recipientEmail = dedication.employeeEmail?.trim() || null
  const purchaserEmailAddr = dedication.user.email.trim()
  const isGift = !!recipientEmail && recipientEmail.toLowerCase() !== purchaserEmailAddr.toLowerCase()
  const dedicatedBy = dedication.corporateName || dedication.user.name

  return {
    dedication,
    species,
    occasion,
    speciesName,
    occasionTitle,
    shortId,
    invoiceNo,
    invoiceDate,
    dateLabel,
    location,
    dedicationUrl,
    shareUrl,
    recipientEmail,
    purchaserEmailAddr,
    isGift,
    dedicatedBy,
  }
}

export type DedicationPdfContext = NonNullable<Awaited<ReturnType<typeof getDedicationPdfContext>>>
