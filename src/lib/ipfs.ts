import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

// This is a mock IPFS service for development purposes
// In production, you would use a service like Pinata, NFT.storage, or Web3.storage

const mockDir = path.join(process.cwd(), "public", "mock-ipfs");

async function ensureDir() {
  try {
    await fs.access(mockDir);
  } catch {
    await fs.mkdir(mockDir, { recursive: true });
  }
}

export async function uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string> {
  console.log(`Mock uploading file ${fileName} to IPFS...`);
  await ensureDir();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate a fake IPFS Hash (CID v0 style)
  const mockCID = `Qm${uuidv4().replace(/-/g, '')}File`;
  
  await fs.writeFile(path.join(mockDir, mockCID), fileBuffer);
  
  return mockCID;
}

export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  console.log(`Mock uploading metadata to IPFS...`);
  await ensureDir();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockCID = `Qm${uuidv4().replace(/-/g, '')}Meta`;
  
  await fs.writeFile(path.join(mockDir, mockCID), JSON.stringify(metadata, null, 2));
  
  return mockCID;
}

export async function getFromIPFSMock(cid: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(mockDir, cid));
  } catch {
    return null;
  }
}
