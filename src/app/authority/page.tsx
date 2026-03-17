"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { PenTool, CheckCircle, Clock } from "lucide-react";
import contractAddress from "@/config/contractAddress.json";

const certManagerAbi = parseAbi([
  "function signCertificate(string _certificateHash) external",
  "function verifyCertificate(string _certificateHash) external view returns (uint8)"
]);

// In a real app, this would be fetched from a database / indexer
// For this demo, we'll just allow looking up a specific hash to sign
export default function AuthorityPage() {
  const { address, isConnected } = useAccount();
  const [hashInput, setHashInput] = useState("");
  const [activeHash, setActiveHash] = useState("");
  
  const { data: statusData, refetch } = useReadContract({
    address: contractAddress.contractAddress as `0x${string}`,
    abi: certManagerAbi,
    functionName: "verifyCertificate",
    args: [activeHash],
    query: {
      enabled: !!activeHash,
    }
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed) refetch();
  }, [isConfirmed, refetch]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (hashInput) setActiveHash(hashInput);
  };

  const handleSign = () => {
    if (!activeHash) return;
    writeContract({
      address: contractAddress.contractAddress as `0x${string}`,
      abi: certManagerAbi,
      functionName: "signCertificate",
      args: [activeHash],
      gas: BigInt(3000000) // Explicit high gas limit to fix Brave Wallet "Missing gas limit" error on Testnets
    });
  };

  const getStatusBadge = (status: number | undefined) => {
    switch(status) {
      case 1: return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Clock className="w-4 h-4 mr-1.5"/> Pending Signatures (Draft)</span>;
      case 2: return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1.5"/> Valid (Fully Signed)</span>;
      case 3: return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Revoked</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Unknown / Not Found</span>;
    }
  };

  if (!isConnected) return <div className="p-8 text-center text-gray-500 mt-20">Please connect your wallet to access the Authority Panel.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Authority Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and cryptographically sign pending certificate drafts.
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <form onSubmit={handleLookup} className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4">
            <input 
              type="text" 
              placeholder="Enter Certificate IPFS Hash (CID)" 
              className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" 
              value={hashInput} 
              onChange={(e) => setHashInput(e.target.value)} 
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
            >
              Lookup Draft
            </button>
        </form>

        {activeHash && statusData !== undefined && (
          <div className="p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate Details</h3>
            
            <div className="bg-gray-50 w-full p-4 rounded-lg flex flex-col md:flex-row justify-between items-center mb-6">
               <div className="mb-4 md:mb-0">
                 <p className="text-sm text-gray-500">Certificate Hash</p>
                 <p className="font-mono text-gray-900">{activeHash}</p>
               </div>
               <div>
                  {getStatusBadge(statusData)}
               </div>
            </div>

            {statusData === 1 && (
              <button
                onClick={handleSign}
                disabled={isPending || isConfirming}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isPending || isConfirming ? "Signing..." : <><PenTool className="-ml-1 mr-2 h-5 w-5" /> Sign Certificate Off-Chain & On-Chain</>}
              </button>
            )}

            {isConfirmed && statusData !== 2 && (
              <p className="mt-4 text-green-600 font-medium">Signature accepted. Waiting for other authorities...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
