// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        address[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;

    uint public numberOfCampaigns = 0;

    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) {
      Campaign storage campaign = campaigns[numberOfCampaigns];

      // Validating that the deadline is a date in the future
      require(campaign.deadline < block.timestamp, "The deadline should be a date in the future.");

      campaign.owner = _owner;
      campaign.title = _title;
      campaign.description = _description;
      campaign.target = _target;
      campaign.deadline = _deadline;
      campaign.amountCollected = 0;
      campaign.image = _image;

      numberOfCampaigns++;

      return numberOfCampaigns - 1;
    }

    function donateToCompaign() {}

    function getDonators() {}

    function getCampaigns() {}
}
