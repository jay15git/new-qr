export type QrLayout = {
  cols: number
  rows: number
  groups: number[]
  direction: "rows" | "columns"
}

export function getQrLayout(count: number, isPortrait: boolean): QrLayout {
  if (count < 1 || count > 10) {
    throw new Error(`QR count must be between 1 and 10, got ${count}`)
  }

  const key = `${count}-${isPortrait ? "portrait" : "landscape"}`

  switch (key) {
    case "1-landscape":
      return { cols: 1, rows: 1, groups: [1], direction: "rows" }
    case "1-portrait":
      return { cols: 1, rows: 1, groups: [1], direction: "columns" }
    case "2-landscape":
      return { cols: 2, rows: 1, groups: [2], direction: "rows" }
    case "2-portrait":
      return { cols: 1, rows: 2, groups: [2], direction: "columns" }
    case "3-landscape":
      return { cols: 3, rows: 1, groups: [3], direction: "rows" }
    case "3-portrait":
      return { cols: 1, rows: 3, groups: [3], direction: "columns" }
    case "4-landscape":
      return { cols: 2, rows: 2, groups: [2, 2], direction: "rows" }
    case "4-portrait":
      return { cols: 2, rows: 2, groups: [2, 2], direction: "columns" }
    case "5-landscape":
      return { cols: 3, rows: 2, groups: [3, 2], direction: "rows" }
    case "5-portrait":
      return { cols: 2, rows: 3, groups: [3, 2], direction: "columns" }
    case "6-landscape":
      return { cols: 3, rows: 2, groups: [3, 3], direction: "rows" }
    case "6-portrait":
      return { cols: 2, rows: 3, groups: [3, 3], direction: "columns" }
    case "7-landscape":
      return { cols: 4, rows: 2, groups: [4, 3], direction: "rows" }
    case "7-portrait":
      return { cols: 2, rows: 4, groups: [4, 3], direction: "columns" }
    case "8-landscape":
      return { cols: 4, rows: 2, groups: [4, 4], direction: "rows" }
    case "8-portrait":
      return { cols: 2, rows: 4, groups: [4, 4], direction: "columns" }
    case "9-landscape":
      return { cols: 5, rows: 2, groups: [5, 4], direction: "rows" }
    case "9-portrait":
      return { cols: 2, rows: 5, groups: [5, 4], direction: "columns" }
    case "10-landscape":
      return { cols: 5, rows: 2, groups: [5, 5], direction: "rows" }
    case "10-portrait":
      return { cols: 2, rows: 5, groups: [5, 5], direction: "columns" }
    default:
      throw new Error(`Unhandled layout: ${key}`)
  }
}
