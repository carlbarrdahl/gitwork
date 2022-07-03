pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "./Verifier.sol";

contract BountyRegistryV1 is Ownable, ReentrancyGuard {
    Verifier public verifier;
    uint64 public lockedDuration = 60 * 60 * 24 * 7; // 1 week

    struct Funding {
        address funder;
        uint256 amount;
        uint64 lockedUntil;
    }

    mapping(bytes32 => uint256) public bounties;
    mapping(bytes32 => mapping(address => Funding)) public funders;

    event Funded(
        string indexed repo,
        uint32 issue,
        IERC20 indexed token,
        uint256 amount,
        uint64 lockedUntil,
        address indexed funder
    );
    event Withdraw(
        string indexed repo,
        uint32 issue,
        IERC20 indexed token,
        uint256 amount,
        address indexed funder
    );
    event Claimed(
        string indexed repo,
        uint32 issue,
        IERC20 indexed token,
        uint256 amount,
        address indexed claimer
    );

    constructor(Verifier _verifier) {
        verifier = _verifier;
    }

    function getBounty(
        string calldata _repo,
        uint32 _issue,
        IERC20 _token
    ) public view returns (uint256) {
        bytes32 id = keccak256(abi.encodePacked(_repo, _issue, _token));
        return bounties[id];
    }

    /// @dev Funds are locked up for a set amount of time
    function fund(
        string calldata _repo,
        uint32 _issue,
        IERC20 _token,
        uint256 _amount
    ) public nonReentrant {
        bytes32 id = keccak256(abi.encodePacked(_repo, _issue, _token));
        bounties[id] += _amount;

        Funding storage funding = funders[id][msg.sender];
        funding.funder = msg.sender;
        funding.amount += _amount;
        funding.lockedUntil = uint64(block.timestamp + lockedDuration);
        _token.transferFrom(msg.sender, address(this), _amount);

        emit Funded(
            _repo,
            _issue,
            _token,
            _amount,
            funding.lockedUntil,
            msg.sender
        );
    }

    /// @dev Funder can withdraw funds if `lockedDuration` has passed
    function withdraw(
        string calldata _repo,
        uint32 _issue,
        IERC20 _token
    ) public nonReentrant {
        bytes32 id = keccak256(abi.encodePacked(_repo, _issue, _token));
        Funding storage funding = funders[id][msg.sender];
        require(funding.amount > 0, "Not funded");
        require(
            block.timestamp >= funding.lockedUntil,
            "Funds are still locked"
        );
        _token.transfer(msg.sender, funding.amount);
        bounties[id] -= funding.amount;
        funding.amount = 0;
        emit Withdraw(_repo, _issue, _token, funding.amount, msg.sender);
    }

    function claim(
        string calldata _repo,
        uint32 _issue,
        IERC20 _token,
        bytes32 _hash,
        bytes calldata _signature
    ) public nonReentrant {
        require(verifier.verify(_hash, _signature), "Signature invalid");

        bytes32 id = keccak256(abi.encodePacked(_repo, _issue, _token));
        uint256 amount = bounties[id];

        bounties[id] = 0;

        IERC20(_token).transfer(msg.sender, amount);
        emit Claimed(_repo, _issue, _token, amount, msg.sender);
    }

    function setLockedDuration(uint64 _duration) public onlyOwner {
        lockedDuration = _duration;
    }
}
