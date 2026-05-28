// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DigitalCheque
 * @notice ChainCheck Sprint 1 — Custom digital cheque smart contract.
 *         No ERC standards. No real money transfer. Source of truth.
 * @dev    identityHash is a demo hash string (not real TC/VKN).
 *         maskedReceiverName is demo masked text (e.g. "Ahmet Y.").
 */
contract DigitalCheque {
    // ───────────────────────── Enums ─────────────────────────

    enum ChequeStatus {
        PendingApproval,   // 0 — Onay Bekliyor
        Active,            // 1 — Aktif
        Rejected,          // 2 — Reddedildi          (final)
        TransferPending,   // 3 — Devir Bekliyor
        PaymentRequested,  // 4 — Ödemeye Gönderildi
        Paid,              // 5 — Ödendi              (final)
        Cancelled          // 6 — İptal Edildi         (final)
    }

    // ───────────────────────── Structs ─────────────────────────

    struct Cheque {
        uint256 id;
        address creator;
        address firstReceiver;
        address currentOwner;
        address pendingReceiver;
        address intermediary;
        uint256 amount;
        uint256 dueDate;
        string identityHash;
        string maskedReceiverName;
        ChequeStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct HistoryItem {
        uint256 timestamp;
        address actor;
        string action;
    }

    // ───────────────────────── State Variables ─────────────────────────

    address public intermediary;
    uint256 public chequeCounter;

    mapping(uint256 => Cheque) public cheques;
    mapping(address => uint256[]) private userCheques;
    mapping(uint256 => HistoryItem[]) private chequeHistories;

    // ───────────────────────── Events ─────────────────────────

    event ChequeCreated(
        uint256 indexed chequeId,
        address indexed creator,
        address indexed firstReceiver,
        uint256 amount
    );

    event ChequeAccepted(uint256 indexed chequeId, address indexed receiver);

    event ChequeRejected(uint256 indexed chequeId, address indexed receiver);

    event TransferRequested(
        uint256 indexed chequeId,
        address indexed from,
        address indexed to
    );

    event TransferAccepted(uint256 indexed chequeId, address indexed newOwner);

    event TransferRejected(uint256 indexed chequeId, address indexed rejectedBy);

    event PaymentRequested(uint256 indexed chequeId, address indexed requestedBy);

    event ChequePaid(uint256 indexed chequeId, address indexed intermediaryAddr);

    event ChequeCancelled(uint256 indexed chequeId, string reason);

    // ───────────────────────── Modifiers ─────────────────────────

    modifier onlyIntermediary() {
        require(msg.sender == intermediary, "Only intermediary can perform this action");
        _;
    }

    modifier chequeExists(uint256 chequeId) {
        require(chequeId > 0 && chequeId <= chequeCounter, "Cheque does not exist");
        _;
    }

    // ───────────────────────── Constructor ─────────────────────────

    constructor(address _intermediary) {
        require(_intermediary != address(0), "Invalid intermediary address");
        intermediary = _intermediary;
    }

    // ───────────────────────── Write Functions ─────────────────────────

    /**
     * @notice Create a new digital cheque in PendingApproval state.
     * @param _firstReceiver  Wallet address of the first receiver (lehtar).
     * @param _amount         Nominal cheque amount (no real money transfer).
     * @param _dueDate        Due date as Unix timestamp.
     * @param _identityHash   Demo hash representation of TC/VKN.
     * @param _maskedReceiverName  Masked receiver name, e.g. "Ahmet Y."
     * @return chequeId       The ID of the newly created cheque.
     */
    function createCheque(
        address _firstReceiver,
        uint256 _amount,
        uint256 _dueDate,
        string memory _identityHash,
        string memory _maskedReceiverName
    ) external returns (uint256) {
        require(_firstReceiver != address(0), "Invalid receiver address");
        require(_firstReceiver != msg.sender, "Creator cannot be the first receiver");
        require(_amount > 0, "Amount must be greater than zero");

        chequeCounter++;
        uint256 newId = chequeCounter;

        Cheque storage c = cheques[newId];
        c.id = newId;
        c.creator = msg.sender;
        c.firstReceiver = _firstReceiver;
        c.currentOwner = msg.sender;        // creator holds until accepted
        c.pendingReceiver = address(0);
        c.intermediary = intermediary;
        c.amount = _amount;
        c.dueDate = _dueDate;
        c.identityHash = _identityHash;
        c.maskedReceiverName = _maskedReceiverName;
        c.status = ChequeStatus.PendingApproval;
        c.createdAt = block.timestamp;
        c.updatedAt = block.timestamp;

        // Track cheque for both creator and first receiver
        userCheques[msg.sender].push(newId);
        userCheques[_firstReceiver].push(newId);

        _addHistory(newId, msg.sender, "CREATED");

        emit ChequeCreated(newId, msg.sender, _firstReceiver, _amount);

        return newId;
    }

    /**
     * @notice First receiver accepts the cheque. Status → Active.
     * @param chequeId  The ID of the cheque to accept.
     */
    function acceptCheque(uint256 chequeId) external chequeExists(chequeId) {
        Cheque storage c = cheques[chequeId];

        require(msg.sender == c.firstReceiver, "Only first receiver can accept");
        require(c.status == ChequeStatus.PendingApproval, "Invalid cheque status");

        c.currentOwner = c.firstReceiver;
        c.status = ChequeStatus.Active;
        c.updatedAt = block.timestamp;

        _addHistory(chequeId, msg.sender, "ACCEPTED");

        emit ChequeAccepted(chequeId, msg.sender);
    }

    /**
     * @notice First receiver rejects the cheque. Status → Rejected (final).
     * @param chequeId  The ID of the cheque to reject.
     */
    function rejectCheque(uint256 chequeId) external chequeExists(chequeId) {
        Cheque storage c = cheques[chequeId];

        require(msg.sender == c.firstReceiver, "Only first receiver can reject");
        require(c.status == ChequeStatus.PendingApproval, "Invalid cheque status");

        c.status = ChequeStatus.Rejected;
        c.updatedAt = block.timestamp;

        _addHistory(chequeId, msg.sender, "REJECTED");

        emit ChequeRejected(chequeId, msg.sender);
    }

    /**
     * @notice Current owner requests transfer to a new receiver. Status → TransferPending.
     * @param chequeId     The ID of the cheque to transfer.
     * @param newReceiver  The wallet address of the intended new receiver.
     */
    function requestTransfer(uint256 chequeId, address newReceiver) external chequeExists(chequeId) {
        Cheque storage c = cheques[chequeId];

        require(msg.sender == c.currentOwner, "Only current owner can transfer");
        require(c.status == ChequeStatus.Active, "Invalid cheque status");
        require(newReceiver != address(0), "Invalid receiver address");
        require(newReceiver != msg.sender, "Cannot transfer to yourself");

        c.pendingReceiver = newReceiver;
        c.status = ChequeStatus.TransferPending;
        c.updatedAt = block.timestamp;

        // Track cheque for the new receiver (if not already tracked)
        if (!_hasUserCheque(newReceiver, chequeId)) {
            userCheques[newReceiver].push(chequeId);
        }

        _addHistory(chequeId, msg.sender, "TRANSFER_REQUESTED");

        emit TransferRequested(chequeId, msg.sender, newReceiver);
    }

    /**
     * @notice Pending receiver accepts transfer. Status → Active.
     *         If pendingReceiver == creator, cheque is Cancelled instead.
     * @param chequeId  The ID of the cheque to accept transfer for.
     */
    function acceptTransfer(uint256 chequeId) external chequeExists(chequeId) {
        Cheque storage c = cheques[chequeId];

        require(msg.sender == c.pendingReceiver, "Only pending receiver can accept transfer");
        require(c.status == ChequeStatus.TransferPending, "Invalid cheque status");

        // If transferred back to creator → cancel
        if (c.pendingReceiver == c.creator) {
            c.currentOwner = c.creator;
            c.pendingReceiver = address(0);
            c.status = ChequeStatus.Cancelled;
            c.updatedAt = block.timestamp;

            _addHistory(chequeId, msg.sender, "CANCELLED");

            emit ChequeCancelled(chequeId, "Transferred back to creator");
            return;
        }

        c.currentOwner = c.pendingReceiver;
        c.pendingReceiver = address(0);
        c.status = ChequeStatus.Active;
        c.updatedAt = block.timestamp;

        _addHistory(chequeId, msg.sender, "TRANSFER_ACCEPTED");

        emit TransferAccepted(chequeId, msg.sender);
    }

    /**
     * @notice Pending receiver rejects transfer. Status → Active, pendingReceiver reset.
     * @param chequeId  The ID of the cheque to reject transfer for.
     */
    function rejectTransfer(uint256 chequeId) external chequeExists(chequeId) {
        Cheque storage c = cheques[chequeId];

        require(msg.sender == c.pendingReceiver, "Only pending receiver can reject transfer");
        require(c.status == ChequeStatus.TransferPending, "Invalid cheque status");

        c.pendingReceiver = address(0);
        c.status = ChequeStatus.Active;
        c.updatedAt = block.timestamp;

        _addHistory(chequeId, msg.sender, "TRANSFER_REJECTED");

        emit TransferRejected(chequeId, msg.sender);
    }

    /**
     * @notice Current owner requests payment. Status → PaymentRequested.
     * @param chequeId  The ID of the cheque to request payment for.
     */
    function requestPayment(uint256 chequeId) external chequeExists(chequeId) {
        Cheque storage c = cheques[chequeId];

        require(msg.sender == c.currentOwner, "Only current owner can request payment");
        require(c.status == ChequeStatus.Active, "Invalid cheque status");

        c.status = ChequeStatus.PaymentRequested;
        c.updatedAt = block.timestamp;

        _addHistory(chequeId, msg.sender, "PAYMENT_REQUESTED");

        emit PaymentRequested(chequeId, msg.sender);
    }

    /**
     * @notice Intermediary marks cheque as paid. Status → Paid (final).
     * @param chequeId  The ID of the cheque to mark as paid.
     */
    function markAsPaid(uint256 chequeId) external chequeExists(chequeId) onlyIntermediary {
        Cheque storage c = cheques[chequeId];

        require(c.status == ChequeStatus.PaymentRequested, "Invalid cheque status");

        c.status = ChequeStatus.Paid;
        c.updatedAt = block.timestamp;

        _addHistory(chequeId, msg.sender, "PAID");

        emit ChequePaid(chequeId, msg.sender);
    }

    // ───────────────────────── Read Functions ─────────────────────────

    /**
     * @notice Get full cheque data by ID.
     * @param chequeId  The ID of the cheque.
     * @return Cheque struct with all fields.
     */
    function getCheque(uint256 chequeId) external view chequeExists(chequeId) returns (Cheque memory) {
        return cheques[chequeId];
    }

    /**
     * @notice Get all cheque IDs associated with a user address.
     * @param user  The wallet address to query.
     * @return Array of cheque IDs.
     */
    function getUserCheques(address user) external view returns (uint256[] memory) {
        return userCheques[user];
    }

    /**
     * @notice Get the full history of a cheque.
     * @param chequeId  The ID of the cheque.
     * @return Array of HistoryItem structs.
     */
    function getChequeHistory(uint256 chequeId) external view chequeExists(chequeId) returns (HistoryItem[] memory) {
        return chequeHistories[chequeId];
    }

    // ───────────────────────── Internal Helpers ─────────────────────────

    /**
     * @dev Appends a history entry for the given cheque.
     */
    function _addHistory(uint256 chequeId, address actor, string memory action) internal {
        chequeHistories[chequeId].push(
            HistoryItem({
                timestamp: block.timestamp,
                actor: actor,
                action: action
            })
        );
    }

    /**
     * @dev Checks if a cheque ID already exists in a user's cheque list.
     */
    function _hasUserCheque(address user, uint256 chequeId) internal view returns (bool) {
        uint256[] storage ids = userCheques[user];
        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == chequeId) {
                return true;
            }
        }
        return false;
    }
}
