import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("CertificateManager", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCertificateManagerFixture() {
    // Contracts are deployed using the first signer/account by default
    const [superAdmin, admin, authority1, authority2, otherAccount] = await hre.ethers.getSigners();

    const CertificateManager = await hre.ethers.getContractFactory("CertificateManager");
    const certManager = await CertificateManager.deploy();

    return { certManager, superAdmin, admin, authority1, authority2, otherAccount };
  }

  describe("Deployment & Roles", function () {
    it("Should set the right superAdmin", async function () {
      const { certManager, superAdmin } = await loadFixture(deployCertificateManagerFixture);
      expect(await certManager.superAdmin()).to.equal(superAdmin.address);
      expect(await certManager.admins(superAdmin.address)).to.equal(true);
    });

    it("Should allow superAdmin to grant admin role", async function () {
      const { certManager, superAdmin, admin } = await loadFixture(deployCertificateManagerFixture);
      await certManager.connect(superAdmin).grantAdmin(admin.address);
      expect(await certManager.admins(admin.address)).to.equal(true);
    });

    it("Should allow admin to grant authority role", async function () {
      const { certManager, superAdmin, admin, authority1 } = await loadFixture(deployCertificateManagerFixture);
      await certManager.connect(superAdmin).grantAdmin(admin.address);
      await certManager.connect(admin).grantAuthority(authority1.address);
      expect(await certManager.authorities(authority1.address)).to.equal(true);
    });
  });

  describe("Certificate Issuance", function () {
    const certHash = "QmTestHash1234567890";

    it("Should allow admin to draft a certificate", async function () {
      const { certManager, superAdmin, admin } = await loadFixture(deployCertificateManagerFixture);
      await certManager.connect(superAdmin).grantAdmin(admin.address);
      
      const requiredSignatures = 2;
      await expect(certManager.connect(admin).draftCertificate(certHash, requiredSignatures))
        .to.emit(certManager, "CertificateDrafted")
        .withArgs(certHash, requiredSignatures);

      const certDetail = await certManager.certificates(certHash);
      expect(certDetail.status).to.equal(1); // 1 is Draft
      expect(certDetail.requiredSignatures).to.equal(requiredSignatures);
      expect(certDetail.currentSignatures).to.equal(0);
    });

    it("Should allow authorities to sign and issue", async function () {
      const { certManager, superAdmin, admin, authority1, authority2 } = await loadFixture(deployCertificateManagerFixture);
      await certManager.connect(superAdmin).grantAdmin(admin.address);
      await certManager.connect(admin).grantAuthority(authority1.address);
      await certManager.connect(admin).grantAuthority(authority2.address);
      
      const requiredSignatures = 2;
      await certManager.connect(admin).draftCertificate(certHash, requiredSignatures);

      // First signature
      await expect(certManager.connect(authority1).signCertificate(certHash))
        .to.emit(certManager, "CertificateSigned")
        .withArgs(certHash, authority1.address);
      
      let certDetail = await certManager.certificates(certHash);
      expect(certDetail.status).to.equal(1); // Still Draft

      // Second signature triggers Valid status
      await expect(certManager.connect(authority2).signCertificate(certHash))
        .to.emit(certManager, "CertificateSigned")
        .withArgs(certHash, authority2.address)
        .and.to.emit(certManager, "CertificateIssued")
        .withArgs(certHash);

      certDetail = await certManager.certificates(certHash);
      expect(certDetail.status).to.equal(2); // 2 is Valid
    });

    it("Should revert if an authority signs twice", async function () {
      const { certManager, superAdmin, admin, authority1 } = await loadFixture(deployCertificateManagerFixture);
      await certManager.grantAdmin(admin.address);
      await certManager.connect(admin).grantAuthority(authority1.address);
      
      await certManager.connect(admin).draftCertificate(certHash, 2);
      await certManager.connect(authority1).signCertificate(certHash);
      
      await expect(certManager.connect(authority1).signCertificate(certHash)).to.be.revertedWith("Already signed by this authority");
    });
  });
});
