import { NextResponse } from "next/server";
import { generateCertificate } from "../../../lib/generateCertificate";
import { uploadToIPFS, uploadMetadataToIPFS } from "../../../lib/ipfs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const templateFile = formData.get("template") as File | null;
    const studentName = formData.get("studentName") as string;
    const courseName = formData.get("courseName") as string;
    const issueDate = formData.get("issueDate") as string;

    if (!templateFile || !studentName || !courseName || !issueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await templateFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Base URL is required for Jimp to fetch its fonts over HTTP
    const currentUrl = new URL(req.url);
    const baseUrl = currentUrl.origin;
    
    // 1. Generate the final certificate image with overlaid text and QR
    // The QR code will point to a temporary ID (or standard verification path)
    const verifId = `tmp_${Date.now()}`;
    const verificationUrl = `${baseUrl}/verify/${verifId}`;
    
    const finalBuffer = await generateCertificate(
      buffer,
      { studentName, courseName, issueDate },
      verificationUrl,
      baseUrl
    );

    // 2. Upload the new image to IPFS
    const imageCID = await uploadToIPFS(finalBuffer, `${studentName}_cert.jpg`);

    // 3. Upload metadata
    const metadata = {
      name: `Certificate for ${studentName}`,
      description: `Completed ${courseName} on ${issueDate}`,
      image: `ipfs://${imageCID}`,
      attributes: [
        { trait_type: "Student", value: studentName },
        { trait_type: "Course", value: courseName },
        { trait_type: "Issue Date", value: issueDate }
      ]
    };

    const metadataCID = await uploadMetadataToIPFS(metadata);

    return NextResponse.json({
      success: true,
      imageCID,
      metadataCID,
      certificateUrl: `/api/mock-ipfs/${imageCID}` // Mocking direct IPFS gateway resolution
    });
  } catch (error: any) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
