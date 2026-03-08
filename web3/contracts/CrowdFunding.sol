// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {

    // ─── Enums ────────────────────────────────────────────────────────────────
    enum CampaignStatus {
        Active,       // 0 – accepting donations
        GoalReached,  // 1 – target met but deadline not yet passed
        Expired,      // 2 – deadline passed, goal NOT met
        Cancelled,    // 3 – owner cancelled
        Withdrawn     // 4 – owner has withdrawn the funds
    }

    // ─── Structs ──────────────────────────────────────────────────────────────
    struct Campaign {
        address owner;
        string  title;
        string  description;
        string  category;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string  image;
        address[] donators;
        uint256[] donations;
        bool    cancelled;
        bool    withdrawn;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────
    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    // Track how much each donor gave per campaign (for refunds)
    // donorContributions[campaignId][donorAddress] = totalWei
    mapping(uint256 => mapping(address => uint256)) public donorContributions;

    // ─── Events ───────────────────────────────────────────────────────────────
    event CampaignCreated(uint256 indexed id, address indexed owner, string title);
    event DonationReceived(uint256 indexed id, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);
    event CampaignCancelled(uint256 indexed id, address indexed owner);
    event RefundClaimed(uint256 indexed id, address indexed donor, uint256 amount);

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier campaignExists(uint256 _id) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        _;
    }

    modifier onlyOwner(uint256 _id) {
        require(msg.sender == campaigns[_id].owner, "Only campaign owner can do this");
        _;
    }

    modifier notCancelled(uint256 _id) {
        require(!campaigns[_id].cancelled, "Campaign is cancelled");
        _;
    }

    modifier notWithdrawn(uint256 _id) {
        require(!campaigns[_id].withdrawn, "Funds already withdrawn");
        _;
    }

    // ─── Functions ────────────────────────────────────────────────────────────

    /**
     * @dev Create a new crowdfunding campaign.
     */
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_target > 0, "Target must be greater than 0");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner          = _owner;
        campaign.title          = _title;
        campaign.description    = _description;
        campaign.category       = _category;
        campaign.target         = _target;
        campaign.deadline       = _deadline;
        campaign.amountCollected = 0;
        campaign.image          = _image;
        campaign.cancelled      = false;
        campaign.withdrawn      = false;

        emit CampaignCreated(numberOfCampaigns, _owner, _title);
        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    /**
     * @dev Donate ETH to a campaign. Funds are held in the contract (escrow).
     */
    function donateToCampaign(uint256 _id)
        public
        payable
        campaignExists(_id)
        notCancelled(_id)
        notWithdrawn(_id)
    {
        Campaign storage campaign = campaigns[_id];

        require(msg.value > 0, "Donation must be greater than 0");
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;

        // Track per-donor total for refund calculation
        donorContributions[_id][msg.sender] += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
        // Funds intentionally held in contract until owner withdraws
    }

    /**
     * @dev Campaign owner withdraws all collected funds.
     *      Allowed when: goal is reached OR deadline has passed (regardless of goal).
     *      Cannot withdraw from a cancelled campaign.
     */
    function withdrawFunds(uint256 _id)
        public
        campaignExists(_id)
        onlyOwner(_id)
        notCancelled(_id)
        notWithdrawn(_id)
    {
        Campaign storage campaign = campaigns[_id];

        bool goalReached  = campaign.amountCollected >= campaign.target;
        bool deadlinePast = block.timestamp >= campaign.deadline;

        require(goalReached || deadlinePast, "Cannot withdraw: campaign still active and goal not reached");
        require(campaign.amountCollected > 0, "Nothing to withdraw");

        uint256 amount = campaign.amountCollected;
        campaign.withdrawn = true;

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Withdrawal transfer failed");

        emit FundsWithdrawn(_id, campaign.owner, amount);
    }

    /**
     * @dev Owner cancels the campaign. Stops new donations.
     *      Donors can then claim full refunds via claimRefund().
     */
    function cancelCampaign(uint256 _id)
        public
        campaignExists(_id)
        onlyOwner(_id)
        notCancelled(_id)
        notWithdrawn(_id)
    {
        require(block.timestamp < campaigns[_id].deadline, "Campaign already ended");

        campaigns[_id].cancelled = true;

        emit CampaignCancelled(_id, msg.sender);
    }

    /**
     * @dev A donor reclaims their full contribution.
     *      Available when: campaign is cancelled OR deadline passed & goal not met.
     */
    function claimRefund(uint256 _id)
        public
        campaignExists(_id)
    {
        Campaign storage campaign = campaigns[_id];
        require(!campaign.withdrawn, "Funds already withdrawn by owner");

        bool isCancelled = campaign.cancelled;
        bool isExpiredUnfunded =
            block.timestamp >= campaign.deadline &&
            campaign.amountCollected < campaign.target;

        require(isCancelled || isExpiredUnfunded, "Refund not available for this campaign");

        uint256 refundAmount = donorContributions[_id][msg.sender];
        require(refundAmount > 0, "No contribution to refund");

        // Zero out before transfer to prevent re-entrancy
        donorContributions[_id][msg.sender] = 0;
        campaign.amountCollected -= refundAmount;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundClaimed(_id, msg.sender, refundAmount);
    }

    /**
     * @dev Returns the live on-chain status of a campaign.
     */
    function getCampaignStatus(uint256 _id)
        public
        view
        campaignExists(_id)
        returns (CampaignStatus)
    {
        Campaign storage c = campaigns[_id];

        if (c.withdrawn)                                              return CampaignStatus.Withdrawn;
        if (c.cancelled)                                              return CampaignStatus.Cancelled;
        if (c.amountCollected >= c.target)                            return CampaignStatus.GoalReached;
        if (block.timestamp >= c.deadline)                            return CampaignStatus.Expired;
        return CampaignStatus.Active;
    }

    // ─── Read helpers ─────────────────────────────────────────────────────────

    function getDonators(uint256 _id)
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    /**
     * @dev Returns how much a specific donor contributed to a campaign.
     */
    function getDonorContribution(uint256 _id, address _donor)
        public
        view
        returns (uint256)
    {
        return donorContributions[_id][_donor];
    }
}
