// Short, human-typeable codes for records that get physically printed (e.g.
// ID wristbands) — a QR code covers the scan case, but the code itself needs
// to be readable and re-typeable if a phone camera isn't available. Excludes
// visually ambiguous characters (0/O, 1/I/L).
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateShortCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}
