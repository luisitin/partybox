// The stage says "scan to join", so it needs a QR even with no server to draw one. `qrcode` ships
// a browser build; it is generated once per room and handed to the info provider (net/info.ts).
import QRCode from 'qrcode';

export async function qrSvg(url: string): Promise<string> {
  try {
    return await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: { dark: '#000000ff', light: '#ffffffff' },
    });
  } catch {
    // No QR is a supported state: TvLobby falls back to the URL on its own.
    return '';
  }
}
