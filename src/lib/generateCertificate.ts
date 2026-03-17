import { Jimp, loadFont } from "jimp";
import QRCode from "qrcode";
import path from "path";

// Fonts will be loaded dynamically via absolute HTTP URL to bypass Vercel serverless FS constraints.
export interface CertificateData {
  studentName: string;
  courseName: string;
  issueDate: string;
}

export async function generateCertificate(
  templateBuffer: Buffer,
  data: CertificateData,
  verificationUrl: string,
  baseUrl: string
): Promise<Buffer> {
  // 1. Load the template image
  const image = await Jimp.read(templateBuffer);
  
  // 2. Generate QR Code
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(base64Data, "base64");
  const qrImage = await Jimp.read(qrBuffer);

  // 3. Load Fonts using absolute HTTP paths
  const font64Url = `${baseUrl}/fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt`;
  const font32Url = `${baseUrl}/fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt`;
  
  const font64 = await loadFont(font64Url);
  const font32 = await loadFont(font32Url);

  // 4. Print text
  // Coordinates are hardcoded for the mockup, assuming a standard template
  const imgWidth = image.bitmap.width;
  
  // Example placement: Student name centered middle
  image.print({
    font: font64,
    x: 0,
    y: image.bitmap.height / 2 - 50,
    text: { text: data.studentName, alignmentX: 1 as any, alignmentY: 1 as any } // 1 is center
  });

  // Example placement: Course name centered below
  image.print({
    font: font32,
    x: 0,
    y: image.bitmap.height / 2 + 50,
    text: { text: `For successfully completing the course: ${data.courseName}`, alignmentX: 1 as any, alignmentY: 1 as any }
  });

  // Example placement: Date bottom left
  image.print({
    font: font32,
    x: 100,
    y: image.bitmap.height - 150,
    text: { text: `Date: ${data.issueDate}`, alignmentX: 0 as any, alignmentY: 1 as any }
  });

  // 5. Composite QR Code in the bottom right corner
  const qrX = image.bitmap.width - 300;
  const qrY = image.bitmap.height - 300;
  image.composite(qrImage, qrX, qrY);

  // 6. Return as buffer
  return await image.getBuffer("image/jpeg");
}
