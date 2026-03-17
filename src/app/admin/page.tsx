"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { Upload, FileText, CheckCircle2, RotateCw } from "lucide-react";
import contractAddress from "@/config/contractAddress.json";

const certManagerAbi = parseAbi([
  "function draftCertificate(string _certificateHash, uint256 _requiredSignatures) external"
]);

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [requiredSignatures, setRequiredSignatures] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHash, setGeneratedHash] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateAndDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !studentName || !courseName || !issueDate) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("template", file);
      formData.append("studentName", studentName);
      formData.append("courseName", courseName);
      formData.append("issueDate", issueDate);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedHash(data.metadataCID); // Using metadata CID as the primary identifier on-chain
        
        // Draft it on chain
        writeContract({
          address: contractAddress.contractAddress as `0x${string}`,
          abi: certManagerAbi,
          functionName: "draftCertificate",
          args: [data.metadataCID, BigInt(requiredSignatures)]
        });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate certificate.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isConnected) return <div className="p-8 text-center text-gray-500 mt-20">Please connect your wallet to access the Admin Panel.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload base templates and issue new certificate drafts.
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={generateAndDraft} className="p-6 space-y-6 flex flex-col">
          <div>
            <label className="block text-sm font-medium text-gray-700">Certificate Base Template (Image)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                {file && <p className="text-sm font-bold text-indigo-600 mt-2">{file.name}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <input type="text" required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Course Name</label>
              <input type="text" required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Date</label>
              <input type="date" required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Authorities Required (Signatures)</label>
              <input type="number" min="1" required className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 bg-white" value={requiredSignatures} onChange={(e) => setRequiredSignatures(parseInt(e.target.value))} />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={isGenerating || isPending || isConfirming}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {(isGenerating || isPending || isConfirming) ? (
                <><RotateCw className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing...</>
              ) : (
                <><FileText className="-ml-1 mr-2 h-5 w-5" /> Generate & Draft</>
              )}
            </button>
          </div>
        </form>

        {isConfirmed && (
          <div className="bg-green-50 p-6 border-t border-green-200 flex items-start">
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-green-800 font-medium text-lg">Certificate Drafted Successfully!</h3>
              <p className="text-green-700 mt-1">IPFS Hash (CID): <span className="font-mono bg-green-100 px-1 rounded">{generatedHash}</span></p>
              <p className="text-green-700 text-sm mt-1 break-all">Transaction: {txHash}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
