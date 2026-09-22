// QR code for the join URL, rendered locally as SVG (ADR-012: no network at runtime).
import QRCode from 'qrcode';

export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'H' }); // I-075: H so a centre mark never breaks a scan
}
