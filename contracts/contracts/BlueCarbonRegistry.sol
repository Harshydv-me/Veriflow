// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BlueCarbonRegistry
 * @dev Registry for blue carbon restoration projects and their MRV data
 * Stores IPFS hashes of project documentation and field data
 */
contract BlueCarbonRegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant FIELD_AGENT_ROLE = keccak256("FIELD_AGENT_ROLE");

    enum ProjectStatus {
        Pending,
        Verified,
        Rejected,
        Active,
        Completed
    }

    struct Project {
        string projectId;
        address owner;
        string ipfsHash; // IPFS hash of project documentation
        string location; // GPS coordinates or location description
        uint256 area; // Area in square meters
        string ecosystemType; // e.g., "Mangrove", "Seagrass", "Salt Marsh"
        ProjectStatus status;
        uint256 createdAt;
        uint256 verifiedAt;
        address verifiedBy;
        uint256 estimatedCredits; // Estimated carbon credits (tons CO2)
        uint256 issuedCredits; // Actual credits issued
    }

    struct FieldData {
        string dataId;
        string projectId;
        address collector;
        string ipfsHash; // IPFS hash of field measurements and photos
        string gpsLocation;
        uint256 timestamp;
        bool verified;
        address verifiedBy;
        string notes;
    }

    // Storage
    mapping(string => Project) public projects;
    mapping(string => FieldData) public fieldData;
    mapping(address => string[]) public userProjects;
    mapping(string => string[]) public projectFieldData;

    string[] public allProjectIds;
    string[] public allFieldDataIds;

    // Events
    event ProjectRegistered(
        string indexed projectId,
        address indexed owner,
        string ipfsHash,
        uint256 timestamp
    );

    event ProjectVerified(
        string indexed projectId,
        address indexed verifier,
        ProjectStatus status,
        uint256 estimatedCredits
    );

    event FieldDataSubmitted(
        string indexed dataId,
        string indexed projectId,
        address indexed collector,
        string ipfsHash,
        uint256 timestamp
    );

    event FieldDataVerified(
        string indexed dataId,
        address indexed verifier,
        bool approved
    );

    event CreditsIssued(
        string indexed projectId,
        uint256 amount
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Register a new blue carbon restoration project
     */
    function registerProject(
        string memory projectId,
        string memory ipfsHash,
        string memory location,
        uint256 area,
        string memory ecosystemType
    ) external whenNotPaused nonReentrant {
        require(bytes(projects[projectId].projectId).length == 0, "Project ID already exists");
        require(bytes(projectId).length > 0, "Project ID required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(area > 0, "Area must be greater than zero");

        Project memory newProject = Project({
            projectId: projectId,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            location: location,
            area: area,
            ecosystemType: ecosystemType,
            status: ProjectStatus.Pending,
            createdAt: block.timestamp,
            verifiedAt: 0,
            verifiedBy: address(0),
            estimatedCredits: 0,
            issuedCredits: 0
        });

        projects[projectId] = newProject;
        userProjects[msg.sender].push(projectId);
        allProjectIds.push(projectId);

        emit ProjectRegistered(projectId, msg.sender, ipfsHash, block.timestamp);
    }

    /**
     * @dev Submit field data for a project
     */
    function submitFieldData(
        string memory dataId,
        string memory projectId,
        string memory ipfsHash,
        string memory gpsLocation,
        string memory notes
    ) external whenNotPaused nonReentrant {
        require(bytes(projects[projectId].projectId).length > 0, "Project does not exist");
        require(bytes(fieldData[dataId].dataId).length == 0, "Data ID already exists");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");

        FieldData memory newData = FieldData({
            dataId: dataId,
            projectId: projectId,
            collector: msg.sender,
            ipfsHash: ipfsHash,
            gpsLocation: gpsLocation,
            timestamp: block.timestamp,
            verified: false,
            verifiedBy: address(0),
            notes: notes
        });

        fieldData[dataId] = newData;
        projectFieldData[projectId].push(dataId);
        allFieldDataIds.push(dataId);

        emit FieldDataSubmitted(dataId, projectId, msg.sender, ipfsHash, block.timestamp);
    }

    /**
     * @dev Verify a project and set estimated credits
     */
    function verifyProject(
        string memory projectId,
        ProjectStatus status,
        uint256 estimatedCredits
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(bytes(projects[projectId].projectId).length > 0, "Project does not exist");
        require(
            status == ProjectStatus.Verified || status == ProjectStatus.Rejected,
            "Invalid status"
        );

        Project storage project = projects[projectId];
        project.status = status;
        project.verifiedAt = block.timestamp;
        project.verifiedBy = msg.sender;
        project.estimatedCredits = estimatedCredits;

        if (status == ProjectStatus.Verified) {
            project.status = ProjectStatus.Active;
        }

        emit ProjectVerified(projectId, msg.sender, status, estimatedCredits);
    }

    /**
     * @dev Verify field data
     */
    function verifyFieldData(
        string memory dataId,
        bool approved
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(bytes(fieldData[dataId].dataId).length > 0, "Data does not exist");

        FieldData storage data = fieldData[dataId];
        data.verified = approved;
        data.verifiedBy = msg.sender;

        emit FieldDataVerified(dataId, msg.sender, approved);
    }

    /**
     * @dev Record issued credits for a project
     */
    function recordIssuedCredits(
        string memory projectId,
        uint256 amount
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(bytes(projects[projectId].projectId).length > 0, "Project does not exist");
        require(projects[projectId].status == ProjectStatus.Active, "Project not active");

        Project storage project = projects[projectId];
        project.issuedCredits += amount;

        emit CreditsIssued(projectId, amount);
    }

    /**
     * @dev Get project details
     */
    function getProject(string memory projectId) external view returns (Project memory) {
        require(bytes(projects[projectId].projectId).length > 0, "Project does not exist");
        return projects[projectId];
    }

    /**
     * @dev Get field data details
     */
    function getFieldData(string memory dataId) external view returns (FieldData memory) {
        require(bytes(fieldData[dataId].dataId).length > 0, "Data does not exist");
        return fieldData[dataId];
    }

    /**
     * @dev Get all projects for a user
     */
    function getUserProjects(address user) external view returns (string[] memory) {
        return userProjects[user];
    }

    /**
     * @dev Get all field data for a project
     */
    function getProjectFieldData(string memory projectId) external view returns (string[] memory) {
        return projectFieldData[projectId];
    }

    /**
     * @dev Get total number of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return allProjectIds.length;
    }

    /**
     * @dev Get total number of field data submissions
     */
    function getTotalFieldData() external view returns (uint256) {
        return allFieldDataIds.length;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
