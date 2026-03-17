import { NextResponse } from "next/server";
import { getFromIPFSMock } from "../../../../lib/ipfs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cid: string }> }
) {
  const { cid } = await params;

  if (!cid) {
    return new NextResponse("Missing CID", { status: 400 });
  }

  const fileBuffer = await getFromIPFSMock(cid);

  if (!fileBuffer) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Determine content type based on if it's JSON or an image
  let contentType = "application/octet-stream";
  let content = fileBuffer;

  // Extremely basic heuristic for this mock
  if (cid.endsWith("Meta")) {
    contentType = "application/json";
  } else if (cid.endsWith("File")) {
    contentType = "image/jpeg";
  }

  return new NextResponse(content as any, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
