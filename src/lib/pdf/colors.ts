import { rgb } from 'pdf-lib'

function hex(h: string) {
  const n = parseInt(h.replace('#', ''), 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

export const COLORS = {
  paper: hex('#FBF7EE'),      // cream parchment background
  paperBorder: hex('#D9A98A'),
  forest: hex('#22503A'),
  forestDeep: hex('#173B29'),
  terra: hex('#C0603E'),
  terraSoft: hex('#E8C9BB'),
  ink: hex('#2B2620'),
  inkSoft: hex('#4A4238'),
  inkMute: hex('#8C8375'),
  white: hex('#FFFFFF'),
}
