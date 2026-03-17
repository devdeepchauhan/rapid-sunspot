import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            <Link href="/" className="font-bold text-xl text-gray-900">
              CertVerify
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
            <Link
              href="/admin"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/authority"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Authority Dashboard
            </Link>
            <Link
              href="/verify"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Verify Certificate
            </Link>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
