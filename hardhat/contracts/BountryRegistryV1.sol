pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "./Verifier.sol";

contract BountyRegistryV1 is ReentrancyGuard {
    Verifier public verifier;

    mapping(bytes32 => mapping(IERC20 => uint256)) public bounties;

    event Funded(
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
        bytes32 id = keccak256(abi.encodePacked(_repo, _issue));
        return bounties[id][_token];
    }

    function fund(
        string calldata _repo,
        uint32 _issue,
        IERC20 _token,
        uint256 _amount
    ) public nonReentrant {
        bytes32 id = keccak256(abi.encodePacked(_repo, _issue));
        bounties[id][_token] += _amount;

        _token.transferFrom(msg.sender, address(this), _amount);

        emit Funded(_repo, _issue, _token, _amount, msg.sender);
    }

    function claim(
        string calldata _repo,
        uint32 _issue,
        IERC20 _token,
        bytes32 _hash,
        bytes calldata _signature
    ) public nonReentrant {
        require(verifier.verify(_hash, _signature), "Signature invalid");

        bytes32 id = keccak256(abi.encodePacked(_repo, _issue));
        uint256 amount = bounties[id][_token];

        bounties[id][_token] = 0;

        IERC20(_token).transfer(msg.sender, amount);
        emit Claimed(_repo, _issue, _token, amount, msg.sender);
    }
}
