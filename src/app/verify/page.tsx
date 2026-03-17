"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { Search, ShieldAlert, ShieldCheck, Clock, FileWarning } from "lucide-react";
import contractAddress from "@/config/contractAddress.json";
import Image from "next/image";

const certManagerAbi = parseAbi([
  "function verifyCertificate(string _certificateHash) external view returns (uint8)"
]);

export default function VerifyPage() {
  const [hashInput, setHashInput] = useState("");
  const [activeHash, setActiveHash] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const { data: statusData, isLoading: contractLoading } = useReadContract({
    address: contractAddress.contractAddress as `0x${string}`,
    abi: certManagerAbi,
    functionName: "verifyCertificate",
    args: [activeHash],
    query: {
      enabled: !!activeHash,
    }
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput) return;
    setActiveHash(hashInput);
    
    // Fetch Metadata from Mock IPFS
    setLoadingMeta(true);
    setMetadata(null);
    try {
      const res = await fetch(`/api/mock-ipfs/${hashInput}`);
      if (res.ok) {
        const data = await res.json();
        setMetadata(data);
      }
    } catch (e) {
      console.error("Meta fetch failed", e);
    } finally {
      setLoadingMeta(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Certificate Verification
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Enter a certificate ID (IPFS Hash) to verify its cryptographic authenticity on the blockchain.
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8 transform transition-all">
        <form onSubmit={handleVerify} className="p-2 sm:p-4 bg-gray-50 flex flex-col sm:flex-row gap-4 border-b">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Enter Certificate Hash..." 
                className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-xl p-4 border" 
                value={hashInput} 
                onChange={(e) => setHashInput(e.target.value)} 
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center items-center px-8 py-4 border border-transparent shadow-sm text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Verify Now
            </button>
        </form>

        {activeHash && (
          <div className="p-8">
            {contractLoading || loadingMeta ? (
               <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               </div>
            ) : statusData === 2 ? (
                // VALID
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Authentic Certificate</h3>
                  <p className="text-green-600 font-medium mb-8">This certificate is fully signed and cryptographically verified.</p>
                  
                  {metadata && (
                    <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">{metadata.name}</h4>
                      <p className="text-gray-600">{metadata.description}</p>
                      
                      <div className="mt-6">
                         <img 
                           src={metadata.image.replace("ipfs://", "/api/mock-ipfs/")} 
                           alt="Certificate" 
                           className="w-full h-auto rounded shadow-sm border"
                         />
                      </div>
                    </div>
                  )}
                </div>
            ) : statusData === 1 ? (
                // PENDING DRAFT
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-12 h-12 text-yellow-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Pending Signatures</h3>
                  <p className="text-yellow-600 font-medium text-center">This certificate exists but has not collected all required authority signatures.</p>
                </div>
            ) : statusData === 3 ? (
               // REVOKED
               <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <FileWarning className="w-12 h-12 text-red-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Certificate Revoked</h3>
                  <p className="text-red-600 font-medium">This certificate was revoked by an administrator and is no longer valid.</p>
                </div>
            ) : (
                // NOT FOUND / INVALID
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Record Not Found</h3>
                  <p className="text-gray-500 font-medium max-w-md text-center">No valid record exists on the blockchain for this hash. The certificate may be tampered or invalid.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
