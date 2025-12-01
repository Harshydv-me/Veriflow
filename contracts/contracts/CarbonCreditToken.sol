// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CarbonCreditToken
 * @dev ERC20 token representing verified carbon credits from blue carbon projects
 * Each token represents 1 metric ton of CO2 equivalent sequestered
 */
contract CarbonCreditToken is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Mapping from token holder to their retired (burned) credits
    mapping(address => uint256) public retiredCredits;

    // Total credits retired
    uint256 public totalRetiredCredits;

    // Events
    event CreditsIssued(address indexed to, uint256 amount, string projectId);
    event CreditsRetired(address indexed from, uint256 amount, string reason);

    constructor() ERC20("Blue Carbon Credit", "BCC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @dev Mint new carbon credits - only callable by MINTER_ROLE
     * @param to Address to receive the credits
     * @param amount Amount of credits to mint (in whole tokens)
     * @param projectId Reference to the verified project
     */
    function issueCredits(
        address to,
        uint256 amount,
        string memory projectId
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot issue to zero address");
        require(amount > 0, "Amount must be greater than zero");

        _mint(to, amount * 10**decimals());
        emit CreditsIssued(to, amount, projectId);
    }

    /**
     * @dev Retire (burn) carbon credits to offset emissions
     * @param amount Amount of credits to retire (in whole tokens)
     * @param reason Reason for retirement (e.g., "Corporate offset Q4 2024")
     */
    function retireCredits(
        uint256 amount,
        string memory reason
    ) external whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        uint256 amountWithDecimals = amount * 10**decimals();
        require(balanceOf(msg.sender) >= amountWithDecimals, "Insufficient balance");

        _burn(msg.sender, amountWithDecimals);
        retiredCredits[msg.sender] += amount;
        totalRetiredCredits += amount;

        emit CreditsRetired(msg.sender, amount, reason);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual whenNotPaused {
        super._update(from, to, amount);
    }

    /**
     * @dev Get retired credits for an address
     */
    function getRetiredCredits(address account) external view returns (uint256) {
        return retiredCredits[account];
    }
}
