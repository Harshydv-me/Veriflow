// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CarbonCreditToken.sol";
import "./BlueCarbonRegistry.sol";

/**
 * @title BlueCarbonVerification
 * @dev Multi-signature verification system for issuing carbon credits
 * Requires multiple verifiers to approve before credits are minted
 */
contract BlueCarbonVerification is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    CarbonCreditToken public carbonToken;
    BlueCarbonRegistry public registry;

    uint256 public requiredApprovals = 2; // Number of approvals needed
    uint256 public verificationTimeout = 7 days; // Time window for verification

    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Expired
    }

    struct CreditRequest {
        string projectId;
        address recipient;
        uint256 amount;
        string ipfsProof; // IPFS hash of supporting documents
        uint256 createdAt;
        uint256 approvalCount;
        uint256 rejectionCount;
        VerificationStatus status;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // Storage
    mapping(uint256 => CreditRequest) public creditRequests;
    uint256 public requestCounter;

    // Events
    event CreditRequestCreated(
        uint256 indexed requestId,
        string indexed projectId,
        address recipient,
        uint256 amount
    );

    event CreditRequestVoted(
        uint256 indexed requestId,
        address indexed verifier,
        bool approved
    );

    event CreditRequestExecuted(
        uint256 indexed requestId,
        string indexed projectId,
        uint256 amount,
        bool approved
    );

    constructor(
        address _carbonToken,
        address _registry
    ) {
        require(_carbonToken != address(0), "Invalid token address");
        require(_registry != address(0), "Invalid registry address");

        carbonToken = CarbonCreditToken(_carbonToken);
        registry = BlueCarbonRegistry(_registry);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new credit issuance request
     */
    function createCreditRequest(
        string memory projectId,
        address recipient,
        uint256 amount,
        string memory ipfsProof
    ) external onlyRole(VERIFIER_ROLE) returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(ipfsProof).length > 0, "IPFS proof required");

        uint256 requestId = requestCounter++;

        CreditRequest storage request = creditRequests[requestId];
        request.projectId = projectId;
        request.recipient = recipient;
        request.amount = amount;
        request.ipfsProof = ipfsProof;
        request.createdAt = block.timestamp;
        request.approvalCount = 0;
        request.rejectionCount = 0;
        request.status = VerificationStatus.Pending;
        request.executed = false;

        emit CreditRequestCreated(requestId, projectId, recipient, amount);

        return requestId;
    }

    /**
     * @dev Vote on a credit request
     */
    function voteOnRequest(
        uint256 requestId,
        bool approve
    ) external onlyRole(VERIFIER_ROLE) {
        CreditRequest storage request = creditRequests[requestId];

        require(request.createdAt > 0, "Request does not exist");
        require(!request.executed, "Request already executed");
        require(!request.hasVoted[msg.sender], "Already voted");
        require(
            block.timestamp <= request.createdAt + verificationTimeout,
            "Verification period expired"
        );

        request.hasVoted[msg.sender] = true;

        if (approve) {
            request.approvalCount++;
        } else {
            request.rejectionCount++;
        }

        emit CreditRequestVoted(requestId, msg.sender, approve);

        // Auto-execute if threshold reached
        if (request.approvalCount >= requiredApprovals) {
            _executeRequest(requestId, true);
        } else if (request.rejectionCount >= requiredApprovals) {
            _executeRequest(requestId, false);
        }
    }

    /**
     * @dev Execute a credit request
     */
    function _executeRequest(uint256 requestId, bool approved) internal {
        CreditRequest storage request = creditRequests[requestId];

        require(!request.executed, "Request already executed");

        request.executed = true;
        request.status = approved ? VerificationStatus.Approved : VerificationStatus.Rejected;

        if (approved) {
            // Issue credits through the token contract
            carbonToken.issueCredits(
                request.recipient,
                request.amount,
                request.projectId
            );

            // Record in registry
            registry.recordIssuedCredits(request.projectId, request.amount);
        }

        emit CreditRequestExecuted(requestId, request.projectId, request.amount, approved);
    }

    /**
     * @dev Mark expired requests
     */
    function markExpired(uint256 requestId) external {
        CreditRequest storage request = creditRequests[requestId];

        require(request.createdAt > 0, "Request does not exist");
        require(!request.executed, "Request already executed");
        require(
            block.timestamp > request.createdAt + verificationTimeout,
            "Not expired yet"
        );

        request.executed = true;
        request.status = VerificationStatus.Expired;

        emit CreditRequestExecuted(requestId, request.projectId, 0, false);
    }

    /**
     * @dev Update required approvals
     */
    function setRequiredApprovals(uint256 _requiredApprovals) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_requiredApprovals > 0, "Must require at least 1 approval");
        requiredApprovals = _requiredApprovals;
    }

    /**
     * @dev Update verification timeout
     */
    function setVerificationTimeout(uint256 _timeout) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_timeout > 0, "Timeout must be greater than zero");
        verificationTimeout = _timeout;
    }

    /**
     * @dev Get request details
     */
    function getRequestStatus(uint256 requestId) external view returns (
        string memory projectId,
        address recipient,
        uint256 amount,
        uint256 approvalCount,
        uint256 rejectionCount,
        VerificationStatus status,
        bool executed
    ) {
        CreditRequest storage request = creditRequests[requestId];
        return (
            request.projectId,
            request.recipient,
            request.amount,
            request.approvalCount,
            request.rejectionCount,
            request.status,
            request.executed
        );
    }

    /**
     * @dev Check if verifier has voted
     */
    function hasVoted(uint256 requestId, address verifier) external view returns (bool) {
        return creditRequests[requestId].hasVoted[verifier];
    }
}
