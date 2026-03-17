// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateManager
 * @dev Manages the issuance, multi-signature approval, and verification of certificates.
 * Designed to minimize gas by storing only essential hashes and metadata.
 */
contract CertificateManager {
    
    // Roles
    address public superAdmin;
    mapping(address => bool) public admins;
    mapping(address => bool) public authorities;

    // Certificate Status Tracking
    enum CertificateStatus {
        None,
        Draft,
        Valid,
        Revoked
    }

    struct Certificate {
        CertificateStatus status;
        uint256 requiredSignatures;
        uint256 currentSignatures;
    }

    // Storage
    // Maps IPFS/Certificate Hash to its details
    mapping(string => Certificate) public certificates;
    
    // Tracks which authority has signed which certificate draft
    // certificateHash => (authorityAddress => hasSigned)
    mapping(string => mapping(address => bool)) public signatures;

    // Events (used heavily to avoid on-chain storage)
    event RoleGranted(address indexed account, string role);
    event RoleRevoked(address indexed account, string role);
    event CertificateDrafted(string indexed certificateHash, uint256 requiredSignatures);
    event CertificateSigned(string indexed certificateHash, address indexed authority);
    event CertificateIssued(string indexed certificateHash);
    event CertificateRevoked(string indexed certificateHash);

    // Modifiers
    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Not super admin");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == superAdmin, "Not admin");
        _;
    }

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Not authority");
        _;
    }

    modifier certificateExists(string memory _certificateHash) {
        require(certificates[_certificateHash].status != CertificateStatus.None, "Certificate does not exist");
        _;
    }

    constructor() {
        superAdmin = msg.sender;
        admins[msg.sender] = true;
    }

    // Role Management
    function grantAdmin(address _account) external onlySuperAdmin {
        admins[_account] = true;
        emit RoleGranted(_account, "Admin");
    }

    function revokeAdmin(address _account) external onlySuperAdmin {
        admins[_account] = false;
        emit RoleRevoked(_account, "Admin");
    }

    function grantAuthority(address _account) external onlyAdmin {
        authorities[_account] = true;
        emit RoleGranted(_account, "Authority");
    }

    function revokeAuthority(address _account) external onlyAdmin {
        authorities[_account] = false;
        emit RoleRevoked(_account, "Authority");
    }

    // Core Certificate Logic
    
    /**
     * @dev Creates a new certificate draft requiring a certain number of signatures.
     * @param _certificateHash The unique hash/IPFS CID of the certificate
     * @param _requiredSignatures Number of authorities needed to make it valid
     */
    function draftCertificate(string memory _certificateHash, uint256 _requiredSignatures) external onlyAdmin {
        require(certificates[_certificateHash].status == CertificateStatus.None, "Certificate already exists");
        require(_requiredSignatures > 0, "Requires at least 1 signature");

        certificates[_certificateHash] = Certificate({
            status: CertificateStatus.Draft,
            requiredSignatures: _requiredSignatures,
            currentSignatures: 0
        });

        emit CertificateDrafted(_certificateHash, _requiredSignatures);
    }

    /**
     * @dev Authority signs a pending certificate draft.
     * @param _certificateHash The hash of the certificate to sign
     */
    function signCertificate(string memory _certificateHash) 
        external 
        onlyAuthority 
        certificateExists(_certificateHash) 
    {
        Certificate storage cert = certificates[_certificateHash];
        
        require(cert.status == CertificateStatus.Draft, "Certificate is not in Draft status");
        require(!signatures[_certificateHash][msg.sender], "Already signed by this authority");

        signatures[_certificateHash][msg.sender] = true;
        cert.currentSignatures += 1;

        emit CertificateSigned(_certificateHash, msg.sender);

        // Check if threshold met
        if (cert.currentSignatures >= cert.requiredSignatures) {
            cert.status = CertificateStatus.Valid;
            emit CertificateIssued(_certificateHash);
        }
    }

    /**
     * @dev Revoke a certificate (e.g. if issued by mistake or compromised)
     */
    function revokeCertificate(string memory _certificateHash) 
        external 
        onlyAdmin 
        certificateExists(_certificateHash) 
    {
        require(certificates[_certificateHash].status != CertificateStatus.Revoked, "Already revoked");
        certificates[_certificateHash].status = CertificateStatus.Revoked;
        emit CertificateRevoked(_certificateHash);
    }

    /**
     * @dev Gas-free read function to verify a certificate status.
     * @return status The current status of the certificate (0=None, 1=Draft, 2=Valid, 3=Revoked)
     */
    function verifyCertificate(string memory _certificateHash) external view returns (CertificateStatus) {
        return certificates[_certificateHash].status;
    }
}
