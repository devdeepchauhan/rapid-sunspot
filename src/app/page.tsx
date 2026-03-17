import Link from "next/link";
import { ShieldCheck, FileKey, CheckSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <div className="mt-24 sm:mt-32 lg:mt-16">
                  <a href="#" className="inline-flex space-x-6">
                    <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                      Web3 Native
                    </span>
                    <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                      <span>Powered by Polygon/Hardhat</span>
                    </span>
                  </a>
                </div>
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Tamper-Proof Certificates at Scale
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Securely generate, multi-sign, and instantly verify certificates using advanced blockchain cryptographic records and IPFS decentralzied storage.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/verify"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Verify a Certificate
                  </Link>
                  <Link href="/admin" className="text-sm font-semibold leading-6 text-gray-900">
                    Admin Login <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div
              className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 md:-mr-20 lg:-mr-36"
              aria-hidden="true"
            />
            <div className="shadow-lg md:rounded-3xl">
              <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div
                  className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36"
                  aria-hidden="true"
                />
                <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                  <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                    <div className="overflow-hidden rounded-tl-xl bg-gray-900">
                      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                            VerifyCertificate.sol
                          </div>
                          <div className="border-r border-gray-600/10 px-4 py-2">deploy.ts</div>
                        </div>
                      </div>
                      <div className="px-6 pb-14 pt-6 text-white font-mono text-sm leading-6">
                        <span className="text-indigo-400">function</span> <span className="text-yellow-200">verifyCertificate</span>(
                        <span className="text-indigo-400">string memory</span> _certificateHash
                        ) <span className="text-indigo-400">external view returns</span> (<span className="text-indigo-400">CertificateStatus</span>) {"{"}<br/>
                        &nbsp;&nbsp;<span className="text-indigo-400">return</span> certificates[_certificateHash].status;<br/>
                        {"}"}
                      </div>
                    </div>
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Secure Forever</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for verifiable credentials
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Ditch paper and centralized PDFs. Use Ethereum or L2 networks to permanently secure educational or professional achievements.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <FileKey className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Cryptographic Hashes
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                 The certificate contents and media are hashed and stored on-chain, rendering the document instantly verifiable as authentic without exposing PII redundantly.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <CheckSquare className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Multi-Signature Authorities
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Require multiple institutional wallets to endorse the draft before it becomes publicly verified.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Revocation Mechanics
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                If credentials are revoked, the smart contract is updated instantly. All subsequent verifications of the QR code or hash will show as Revoked.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
