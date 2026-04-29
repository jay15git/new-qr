export type QrLayout = {
  cols: number
  rows: number
  areas: string | null
}

export function getQrLayout(count: number, isPortrait: boolean): QrLayout {
  if (count < 1 || count > 10) {
    throw new Error(`QR count must be between 1 and 10, got ${count}`)
  }

  const key = `${count}-${isPortrait ? "portrait" : "landscape"}`

  switch (key) {
    case "1-landscape":
      return { cols: 1, rows: 1, areas: null }
    case "1-portrait":
      return { cols: 1, rows: 1, areas: null }
    case "2-landscape":
      return { cols: 2, rows: 1, areas: null }
    case "2-portrait":
      return { cols: 1, rows: 2, areas: null }
    case "3-landscape":
      return { cols: 3, rows: 1, areas: null }
    case "3-portrait":
      return { cols: 1, rows: 3, areas: null }
    case "4-landscape":
      return { cols: 2, rows: 2, areas: null }
    case "4-portrait":
      return { cols: 2, rows: 2, areas: null }
    case "5-landscape":
      return { cols: 3, rows: 2, areas: '"a a b" "c d e"' }
    case "5-portrait":
      return { cols: 2, rows: 3, areas: '"a b" "a c" "d e"' }
    case "6-landscape":
      return { cols: 3, rows: 2, areas: null }
    case "6-portrait":
      return { cols: 2, rows: 3, areas: null }
    case "7-landscape":
      return { cols: 3, rows: 3, areas: '"a a b" "c d e" "f g ."' }
    case "7-portrait":
      return { cols: 2, rows: 4, areas: '"a b" "a c" "d e" "f g"' }
    case "8-landscape":
      return { cols: 4, rows: 2, areas: null }
    case "8-portrait":
      return { cols: 2, rows: 4, areas: null }
    case "9-landscape":
      return { cols: 3, rows: 4, areas: '"a a b" "a a c" "d e f" "g h i"' }
    case "9-portrait":
      return { cols: 4, rows: 3, areas: '"a a b c" "a a d e" "f g h i"' }
    case "10-landscape":
      return { cols: 5, rows: 2, areas: null }
    case "10-portrait":
      return { cols: 2, rows: 5, areas: null }
    default:
      throw new Error(`Unhandled layout: ${key}`)
  }
}
