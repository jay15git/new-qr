import type { LibraryCollection, LibraryQrDesign } from "@/features/library/model/types"

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

function design(
  partial: Omit<LibraryQrDesign, "qrCount"> & { qrCount?: number },
): LibraryQrDesign {
  const qrSummaries = partial.qrSummaries
  return {
    ...partial,
    qrCount: partial.qrCount ?? qrSummaries.length,
  }
}

export const MOCK_LIBRARY_COLLECTIONS: LibraryCollection[] = [
  {
    id: "brand",
    name: "Brand",
    folderColor: "blue",
    itemIds: ["qr-1", "qr-2", "qr-5"],
    updatedAt: now - DAY * 1,
  },
  {
    id: "events",
    name: "Events",
    folderColor: "orange",
    itemIds: ["qr-3", "qr-7"],
    updatedAt: now - DAY * 3,
  },
  {
    id: "social",
    name: "Social",
    folderColor: "yellow",
    itemIds: ["qr-4", "qr-6", "qr-8", "qr-9"],
    updatedAt: now - DAY * 2,
  },
  {
    id: "personal",
    name: "Personal",
    folderColor: "grey",
    itemIds: ["qr-2", "qr-9"],
    updatedAt: now - DAY * 5,
  },
  {
    id: "archive",
    name: "Archive",
    folderColor: "black",
    itemIds: ["qr-5"],
    updatedAt: now - DAY * 12,
  },
]

export const MOCK_LIBRARY_DESIGNS: LibraryQrDesign[] = [
  design({
    id: "qr-1",
    title: "Spring Menu",
    contentTags: ["menu"],
    qrSummaries: [
      { nodeId: "qr-1-a", inputType: "menu", destinationPreview: "cafe.example.com/menu" },
    ],
    createdAt: now - DAY * 14,
    updatedAt: now - DAY * 1,
    destinationPreview: "cafe.example.com/menu",
    thumbnailHue: 210,
    collectionIds: ["brand"],
  }),
  design({
    id: "qr-2",
    title: "Contact Card",
    contentTags: ["vcard"],
    qrSummaries: [
      { nodeId: "qr-2-a", inputType: "vcard", destinationPreview: "Alex Morgan" },
    ],
    createdAt: now - DAY * 20,
    updatedAt: now - DAY * 2,
    destinationPreview: "Alex Morgan",
    thumbnailHue: 160,
    collectionIds: ["brand", "personal"],
  }),
  design({
    id: "qr-3",
    title: "Event Kit",
    contentTags: ["wifi", "link", "instagram"],
    qrSummaries: [
      { nodeId: "qr-3-a", inputType: "wifi", destinationPreview: "LaunchGuest" },
      { nodeId: "qr-3-b", inputType: "link", destinationPreview: "events.example.com/rsvp" },
      { nodeId: "qr-3-c", inputType: "instagram", destinationPreview: "@launchweek" },
    ],
    createdAt: now - DAY * 10,
    updatedAt: now - DAY * 3,
    destinationPreview: "LaunchGuest · +2 more",
    thumbnailHue: 24,
    collectionIds: ["events"],
  }),
  design({
    id: "qr-4",
    title: "Instagram Bio",
    contentTags: ["instagram"],
    qrSummaries: [
      { nodeId: "qr-4-a", inputType: "instagram", destinationPreview: "@studioqr" },
    ],
    createdAt: now - DAY * 18,
    updatedAt: now - DAY * 4,
    destinationPreview: "@studioqr",
    thumbnailHue: 320,
    collectionIds: ["social"],
  }),
  design({
    id: "qr-5",
    title: "Storefront Link",
    contentTags: ["link"],
    qrSummaries: [
      { nodeId: "qr-5-a", inputType: "link", destinationPreview: "shop.example.com" },
    ],
    createdAt: now - DAY * 30,
    updatedAt: now - DAY * 5,
    destinationPreview: "shop.example.com",
    thumbnailHue: 200,
    collectionIds: ["brand", "archive"],
  }),
  design({
    id: "qr-6",
    title: "YouTube Channel",
    contentTags: ["youtube"],
    qrSummaries: [
      {
        nodeId: "qr-6-a",
        inputType: "youtube",
        destinationPreview: "youtube.com/@studioqr",
      },
    ],
    createdAt: now - DAY * 25,
    updatedAt: now - DAY * 6,
    destinationPreview: "youtube.com/@studioqr",
    thumbnailHue: 0,
    collectionIds: ["social"],
  }),
  design({
    id: "qr-7",
    title: "Workshop Wi-Fi",
    contentTags: ["wifi"],
    qrSummaries: [
      { nodeId: "qr-7-a", inputType: "wifi", destinationPreview: "Workshop5G" },
    ],
    createdAt: now - DAY * 12,
    updatedAt: now - DAY * 7,
    destinationPreview: "Workshop5G",
    thumbnailHue: 140,
    collectionIds: ["events"],
  }),
  design({
    id: "qr-8",
    title: "LinkedIn Profile",
    contentTags: ["linkedin"],
    qrSummaries: [
      {
        nodeId: "qr-8-a",
        inputType: "linkedin",
        destinationPreview: "linkedin.com/in/alex-morgan",
      },
    ],
    createdAt: now - DAY * 16,
    updatedAt: now - DAY * 8,
    destinationPreview: "linkedin.com/in/alex-morgan",
    thumbnailHue: 205,
    collectionIds: ["social"],
  }),
  design({
    id: "qr-9",
    title: "Payment Link",
    contentTags: ["payment-link"],
    qrSummaries: [
      {
        nodeId: "qr-9-a",
        inputType: "payment-link",
        destinationPreview: "pay.example.com/checkout",
      },
    ],
    createdAt: now - DAY * 22,
    updatedAt: now - DAY * 9,
    destinationPreview: "pay.example.com/checkout",
    thumbnailHue: 45,
    collectionIds: ["social", "personal"],
  }),
]

export function getMockCollectionById(id: string): LibraryCollection | undefined {
  return MOCK_LIBRARY_COLLECTIONS.find((collection) => collection.id === id)
}

export function getMockDesignsForCollection(collectionId: string): LibraryQrDesign[] {
  const collection = getMockCollectionById(collectionId)
  if (!collection) {
    return []
  }

  return MOCK_LIBRARY_DESIGNS.filter((design) => collection.itemIds.includes(design.id))
}
