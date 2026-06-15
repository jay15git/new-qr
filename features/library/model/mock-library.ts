import type { LibraryCollection, LibraryQrDesign } from "@/features/library/model/types"

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

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
  {
    id: "qr-1",
    title: "Spring Menu",
    inputType: "menu",
    thumbnailHue: 210,
    updatedAt: now - DAY * 1,
    collectionIds: ["brand"],
  },
  {
    id: "qr-2",
    title: "Contact Card",
    inputType: "vcard",
    thumbnailHue: 160,
    updatedAt: now - DAY * 2,
    collectionIds: ["brand", "personal"],
  },
  {
    id: "qr-3",
    title: "Launch RSVP",
    inputType: "event",
    thumbnailHue: 24,
    updatedAt: now - DAY * 3,
    collectionIds: ["events"],
  },
  {
    id: "qr-4",
    title: "Instagram Bio",
    inputType: "instagram",
    thumbnailHue: 320,
    updatedAt: now - DAY * 4,
    collectionIds: ["social"],
  },
  {
    id: "qr-5",
    title: "Storefront Link",
    inputType: "link",
    thumbnailHue: 200,
    updatedAt: now - DAY * 5,
    collectionIds: ["brand", "archive"],
  },
  {
    id: "qr-6",
    title: "YouTube Channel",
    inputType: "youtube",
    thumbnailHue: 0,
    updatedAt: now - DAY * 6,
    collectionIds: ["social"],
  },
  {
    id: "qr-7",
    title: "Workshop Wi-Fi",
    inputType: "wifi",
    thumbnailHue: 140,
    updatedAt: now - DAY * 7,
    collectionIds: ["events"],
  },
  {
    id: "qr-8",
    title: "LinkedIn Profile",
    inputType: "linkedin",
    thumbnailHue: 205,
    updatedAt: now - DAY * 8,
    collectionIds: ["social"],
  },
  {
    id: "qr-9",
    title: "Payment Link",
    inputType: "payment-link",
    thumbnailHue: 45,
    updatedAt: now - DAY * 9,
    collectionIds: ["social", "personal"],
  },
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
