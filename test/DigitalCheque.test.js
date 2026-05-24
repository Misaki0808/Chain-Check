import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

/**
 * DigitalCheque Smart Contract — Unit Tests
 * Sprint 1 — ChainCheck Project
 *
 * Account mapping (per docs/blockchain.md §13):
 *   Account 0 = Aracı Kurum (Intermediary)
 *   Account 1 = Çeki Oluşturan (Creator)
 *   Account 2 = İlk Alıcı (First Receiver)
 *   Account 3 = Yeni Alıcı (New Receiver)
 *   Account 4 = İkinci Yeni Alıcı (Second New Receiver)
 */

// ChequeStatus enum values (must match contract)
const Status = {
  PendingApproval: 0,
  Active: 1,
  Rejected: 2,
  TransferPending: 3,
  PaymentRequested: 4,
  Paid: 5,
  Cancelled: 6,
};

// Demo test data
const AMOUNT = 50000n;
const DUE_DATE = 1750000000n; // future Unix timestamp
const IDENTITY_HASH = "0x8a3f5c9e1b7d2f4a6e0c3b8d5f7a1e9c4b6d2f91bc";
const MASKED_NAME = "Ahmet Y.";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("DigitalCheque", async function () {
  // Create a fresh network connection with viem helpers
  const { viem } = await network.create();
  const wallets = await viem.getWalletClients();

  const intermediaryWallet = wallets[0];
  const creatorWallet = wallets[1];
  const firstReceiverWallet = wallets[2];
  const newReceiverWallet = wallets[3];
  const secondNewReceiverWallet = wallets[4];

  // Helper: deploy a fresh contract with intermediary = Account 0
  async function deployContract() {
    const contract = await viem.deployContract(
      "DigitalCheque",
      [intermediaryWallet.account.address],
      { client: { wallet: intermediaryWallet } }
    );
    return contract;
  }

  // Helper: deploy and create a cheque (creator=Account1, firstReceiver=Account2)
  async function deployAndCreateCheque() {
    const contract = await deployContract();
    const creatorContract = await viem.getContractAt(
      "DigitalCheque",
      contract.address,
      { client: { wallet: creatorWallet } }
    );
    await creatorContract.write.createCheque([
      firstReceiverWallet.account.address,
      AMOUNT,
      DUE_DATE,
      IDENTITY_HASH,
      MASKED_NAME,
    ]);
    return { contract, creatorContract };
  }

  // Helper: deploy, create, and accept cheque
  async function deployCreateAndAccept() {
    const { contract, creatorContract } = await deployAndCreateCheque();
    const receiverContract = await viem.getContractAt(
      "DigitalCheque",
      contract.address,
      { client: { wallet: firstReceiverWallet } }
    );
    await receiverContract.write.acceptCheque([1n]);
    return { contract, creatorContract, receiverContract };
  }

  // ──────────────────────────────────────────────────────────────
  // 1. Deployment
  // ──────────────────────────────────────────────────────────────
  describe("1. Deployment", async function () {
    it("Should deploy the contract successfully", async function () {
      const contract = await deployContract();
      assert.ok(contract.address, "Contract address should exist");
    });

    it("Should set the intermediary address correctly", async function () {
      const contract = await deployContract();
      const storedIntermediary = await contract.read.intermediary();
      assert.equal(
        storedIntermediary.toLowerCase(),
        intermediaryWallet.account.address.toLowerCase()
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 2. Create Cheque
  // ──────────────────────────────────────────────────────────────
  describe("2. Create Cheque", async function () {
    it("Should allow creator to create a cheque", async function () {
      const { contract } = await deployAndCreateCheque();
      const counter = await contract.read.chequeCounter();
      assert.equal(counter, 1n);
    });

    it("Should set status to PendingApproval", async function () {
      const { contract } = await deployAndCreateCheque();
      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.PendingApproval);
    });

    it("Should store all cheque fields correctly", async function () {
      const { contract } = await deployAndCreateCheque();
      const cheque = await contract.read.getCheque([1n]);

      assert.equal(cheque.id, 1n);
      assert.equal(cheque.creator.toLowerCase(), creatorWallet.account.address.toLowerCase());
      assert.equal(cheque.firstReceiver.toLowerCase(), firstReceiverWallet.account.address.toLowerCase());
      assert.equal(cheque.currentOwner.toLowerCase(), creatorWallet.account.address.toLowerCase());
      assert.equal(cheque.amount, AMOUNT);
      assert.equal(cheque.dueDate, DUE_DATE);
      assert.equal(cheque.identityHash, IDENTITY_HASH);
      assert.equal(cheque.maskedReceiverName, MASKED_NAME);
    });

    it("Should emit ChequeCreated event", async function () {
      const contract = await deployContract();
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.emit(
        creatorContract.write.createCheque([
          firstReceiverWallet.account.address,
          AMOUNT,
          DUE_DATE,
          IDENTITY_HASH,
          MASKED_NAME,
        ]),
        creatorContract,
        "ChequeCreated"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 3. Invalid Create Cheque
  // ──────────────────────────────────────────────────────────────
  describe("3. Invalid Create Cheque", async function () {
    it("Should revert if firstReceiver is zero address", async function () {
      const contract = await deployContract();
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.revertWith(
        creatorContract.write.createCheque([
          ZERO_ADDRESS,
          AMOUNT,
          DUE_DATE,
          IDENTITY_HASH,
          MASKED_NAME,
        ]),
        "Invalid receiver address"
      );
    });

    it("Should revert if firstReceiver is creator", async function () {
      const contract = await deployContract();
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.revertWith(
        creatorContract.write.createCheque([
          creatorWallet.account.address,
          AMOUNT,
          DUE_DATE,
          IDENTITY_HASH,
          MASKED_NAME,
        ]),
        "Creator cannot be the first receiver"
      );
    });

    it("Should revert if amount is zero", async function () {
      const contract = await deployContract();
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.revertWith(
        creatorContract.write.createCheque([
          firstReceiverWallet.account.address,
          0n,
          DUE_DATE,
          IDENTITY_HASH,
          MASKED_NAME,
        ]),
        "Amount must be greater than zero"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 4. Accept Cheque
  // ──────────────────────────────────────────────────────────────
  describe("4. Accept Cheque", async function () {
    it("Should allow firstReceiver to accept", async function () {
      const { contract } = await deployAndCreateCheque();
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: firstReceiverWallet } }
      );
      await receiverContract.write.acceptCheque([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.Active);
    });

    it("Should set currentOwner to firstReceiver after acceptance", async function () {
      const { contract } = await deployAndCreateCheque();
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: firstReceiverWallet } }
      );
      await receiverContract.write.acceptCheque([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(
        cheque.currentOwner.toLowerCase(),
        firstReceiverWallet.account.address.toLowerCase()
      );
    });

    it("Should emit ChequeAccepted event", async function () {
      const { contract } = await deployAndCreateCheque();
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: firstReceiverWallet } }
      );

      await viem.assertions.emit(
        receiverContract.write.acceptCheque([1n]),
        receiverContract,
        "ChequeAccepted"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 5. Reject Cheque
  // ──────────────────────────────────────────────────────────────
  describe("5. Reject Cheque", async function () {
    it("Should allow firstReceiver to reject", async function () {
      const { contract } = await deployAndCreateCheque();
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: firstReceiverWallet } }
      );
      await receiverContract.write.rejectCheque([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.Rejected);
    });

    it("Should emit ChequeRejected event", async function () {
      const { contract } = await deployAndCreateCheque();
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: firstReceiverWallet } }
      );

      await viem.assertions.emit(
        receiverContract.write.rejectCheque([1n]),
        receiverContract,
        "ChequeRejected"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 6. Unauthorized Initial Approval
  // ──────────────────────────────────────────────────────────────
  describe("6. Unauthorized Initial Approval", async function () {
    it("Should revert if non-firstReceiver tries to accept", async function () {
      const { contract } = await deployAndCreateCheque();
      const unauthorizedContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );

      await viem.assertions.revertWith(
        unauthorizedContract.write.acceptCheque([1n]),
        "Only first receiver can accept"
      );
    });

    it("Should revert if non-firstReceiver tries to reject", async function () {
      const { contract } = await deployAndCreateCheque();
      const unauthorizedContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );

      await viem.assertions.revertWith(
        unauthorizedContract.write.rejectCheque([1n]),
        "Only first receiver can reject"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 7. Transfer Request
  // ──────────────────────────────────────────────────────────────
  describe("7. Transfer Request", async function () {
    it("Should allow currentOwner to request transfer", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.TransferPending);
    });

    it("Should set pendingReceiver correctly", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(
        cheque.pendingReceiver.toLowerCase(),
        newReceiverWallet.account.address.toLowerCase()
      );
    });

    it("Should emit TransferRequested event", async function () {
      const { receiverContract } = await deployCreateAndAccept();

      await viem.assertions.emit(
        receiverContract.write.requestTransfer([
          1n,
          newReceiverWallet.account.address,
        ]),
        receiverContract,
        "TransferRequested"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 8. Unauthorized Transfer Request
  // ──────────────────────────────────────────────────────────────
  describe("8. Unauthorized Transfer Request", async function () {
    it("Should revert if non-currentOwner requests transfer", async function () {
      const { contract } = await deployCreateAndAccept();
      // creatorWallet is no longer the owner after acceptance
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.revertWith(
        creatorContract.write.requestTransfer([
          1n,
          newReceiverWallet.account.address,
        ]),
        "Only current owner can transfer"
      );
    });

    it("Should revert if cheque is not Active", async function () {
      const { contract } = await deployAndCreateCheque();
      // Cheque is PendingApproval, not Active
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.revertWith(
        receiverContract.write.requestTransfer([
          1n,
          newReceiverWallet.account.address,
        ]),
        "Invalid cheque status"
      );
    });

    it("Should revert if transfer to zero address", async function () {
      const { receiverContract } = await deployCreateAndAccept();

      await viem.assertions.revertWith(
        receiverContract.write.requestTransfer([1n, ZERO_ADDRESS]),
        "Invalid receiver address"
      );
    });

    it("Should revert if transfer to self", async function () {
      const { receiverContract } = await deployCreateAndAccept();

      await viem.assertions.revertWith(
        receiverContract.write.requestTransfer([
          1n,
          firstReceiverWallet.account.address,
        ]),
        "Cannot transfer to yourself"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 9. Accept Transfer
  // ──────────────────────────────────────────────────────────────
  describe("9. Accept Transfer", async function () {
    it("Should allow pendingReceiver to accept transfer", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );
      await newReceiverContract.write.acceptTransfer([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.Active);
    });

    it("Should update currentOwner to pendingReceiver", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );
      await newReceiverContract.write.acceptTransfer([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(
        cheque.currentOwner.toLowerCase(),
        newReceiverWallet.account.address.toLowerCase()
      );
    });

    it("Should reset pendingReceiver after acceptance", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );
      await newReceiverContract.write.acceptTransfer([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.pendingReceiver.toLowerCase(), ZERO_ADDRESS);
    });

    it("Should emit TransferAccepted event", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );

      await viem.assertions.emit(
        newReceiverContract.write.acceptTransfer([1n]),
        newReceiverContract,
        "TransferAccepted"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 10. Reject Transfer
  // ──────────────────────────────────────────────────────────────
  describe("10. Reject Transfer", async function () {
    it("Should allow pendingReceiver to reject transfer", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );
      await newReceiverContract.write.rejectTransfer([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.Active);
    });

    it("Should keep currentOwner as previous owner after rejection", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );
      await newReceiverContract.write.rejectTransfer([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(
        cheque.currentOwner.toLowerCase(),
        firstReceiverWallet.account.address.toLowerCase()
      );
    });

    it("Should reset pendingReceiver after rejection", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );
      await newReceiverContract.write.rejectTransfer([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.pendingReceiver.toLowerCase(), ZERO_ADDRESS);
    });

    it("Should emit TransferRejected event", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );

      await viem.assertions.emit(
        newReceiverContract.write.rejectTransfer([1n]),
        newReceiverContract,
        "TransferRejected"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 11. Transfer Back To Creator
  // ──────────────────────────────────────────────────────────────
  describe("11. Transfer Back To Creator", async function () {
    it("Should cancel cheque if transferred back to original creator", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      // firstReceiver transfers back to creator
      await receiverContract.write.requestTransfer([
        1n,
        creatorWallet.account.address,
      ]);

      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );
      await creatorContract.write.acceptTransfer([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.Cancelled);
    });

    it("Should emit ChequeCancelled event", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestTransfer([
        1n,
        creatorWallet.account.address,
      ]);

      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.emit(
        creatorContract.write.acceptTransfer([1n]),
        creatorContract,
        "ChequeCancelled"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 12. Payment Request
  // ──────────────────────────────────────────────────────────────
  describe("12. Payment Request", async function () {
    it("Should allow currentOwner to request payment", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestPayment([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.PaymentRequested);
    });

    it("Should emit PaymentRequested event", async function () {
      const { receiverContract } = await deployCreateAndAccept();

      await viem.assertions.emit(
        receiverContract.write.requestPayment([1n]),
        receiverContract,
        "PaymentRequested"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 13. Mark As Paid
  // ──────────────────────────────────────────────────────────────
  describe("13. Mark As Paid", async function () {
    it("Should allow only intermediary to mark as paid", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestPayment([1n]);

      // Intermediary marks as paid
      const intermediaryContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: intermediaryWallet } }
      );
      await intermediaryContract.write.markAsPaid([1n]);

      const cheque = await contract.read.getCheque([1n]);
      assert.equal(cheque.status, Status.Paid);
    });

    it("Should emit ChequePaid event", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestPayment([1n]);

      const intermediaryContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: intermediaryWallet } }
      );

      await viem.assertions.emit(
        intermediaryContract.write.markAsPaid([1n]),
        intermediaryContract,
        "ChequePaid"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 14. Unauthorized Payment
  // ──────────────────────────────────────────────────────────────
  describe("14. Unauthorized Payment", async function () {
    it("Should revert if non-intermediary tries to mark as paid", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestPayment([1n]);

      // Creator tries to mark as paid (not intermediary)
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.revertWith(
        creatorContract.write.markAsPaid([1n]),
        "Only intermediary can perform this action"
      );
    });

    it("Should revert if status is not PaymentRequested", async function () {
      const { contract } = await deployCreateAndAccept();
      // Cheque is Active, not PaymentRequested
      const intermediaryContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: intermediaryWallet } }
      );

      await viem.assertions.revertWith(
        intermediaryContract.write.markAsPaid([1n]),
        "Invalid cheque status"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 15. Final State Protection
  // ──────────────────────────────────────────────────────────────
  describe("15. Final State Protection", async function () {
    it("Should not allow transfer on a Rejected cheque", async function () {
      const { contract } = await deployAndCreateCheque();
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: firstReceiverWallet } }
      );
      await receiverContract.write.rejectCheque([1n]);

      // Try to transfer the rejected cheque
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );

      await viem.assertions.revertWith(
        creatorContract.write.requestTransfer([
          1n,
          newReceiverWallet.account.address,
        ]),
        "Invalid cheque status"
      );
    });

    it("Should not allow transfer on a Paid cheque", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestPayment([1n]);
      const intermediaryContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: intermediaryWallet } }
      );
      await intermediaryContract.write.markAsPaid([1n]);

      // Try to transfer the paid cheque
      await viem.assertions.revertWith(
        receiverContract.write.requestTransfer([
          1n,
          newReceiverWallet.account.address,
        ]),
        "Invalid cheque status"
      );
    });

    it("Should not allow transfer on a Cancelled cheque", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      // Transfer back to creator to cancel
      await receiverContract.write.requestTransfer([
        1n,
        creatorWallet.account.address,
      ]);
      const creatorContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: creatorWallet } }
      );
      await creatorContract.write.acceptTransfer([1n]);

      // Try to transfer the cancelled cheque
      await viem.assertions.revertWith(
        creatorContract.write.requestTransfer([
          1n,
          newReceiverWallet.account.address,
        ]),
        "Invalid cheque status"
      );
    });

    it("Should not allow payment request on a Paid cheque", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();
      await receiverContract.write.requestPayment([1n]);
      const intermediaryContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: intermediaryWallet } }
      );
      await intermediaryContract.write.markAsPaid([1n]);

      // Try to request payment again
      await viem.assertions.revertWith(
        receiverContract.write.requestPayment([1n]),
        "Invalid cheque status"
      );
    });

    it("Should not allow accepting a Rejected cheque", async function () {
      const { contract } = await deployAndCreateCheque();
      const receiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: firstReceiverWallet } }
      );
      await receiverContract.write.rejectCheque([1n]);

      // Try to accept the rejected cheque
      await viem.assertions.revertWith(
        receiverContract.write.acceptCheque([1n]),
        "Invalid cheque status"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // 16. History
  // ──────────────────────────────────────────────────────────────
  describe("16. History", async function () {
    it("Should return history items via getChequeHistory", async function () {
      const { contract } = await deployAndCreateCheque();
      const history = await contract.read.getChequeHistory([1n]);

      assert.ok(history.length > 0, "History should not be empty");
      assert.equal(history[0].action, "CREATED");
      assert.equal(
        history[0].actor.toLowerCase(),
        creatorWallet.account.address.toLowerCase()
      );
    });

    it("Should track full happy path history: CREATED → ACCEPTED → TRANSFER_REQUESTED → TRANSFER_ACCEPTED → PAYMENT_REQUESTED → PAID", async function () {
      const { contract, receiverContract } = await deployCreateAndAccept();

      // Step 3: Transfer request (firstReceiver → newReceiver)
      await receiverContract.write.requestTransfer([
        1n,
        newReceiverWallet.account.address,
      ]);

      // Step 4: Accept transfer (newReceiver)
      const newReceiverContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: newReceiverWallet } }
      );
      await newReceiverContract.write.acceptTransfer([1n]);

      // Step 5: Request payment (newReceiver is now owner)
      await newReceiverContract.write.requestPayment([1n]);

      // Step 6: Mark as paid (intermediary)
      const intermediaryContract = await viem.getContractAt(
        "DigitalCheque",
        contract.address,
        { client: { wallet: intermediaryWallet } }
      );
      await intermediaryContract.write.markAsPaid([1n]);

      // Verify full history
      const history = await contract.read.getChequeHistory([1n]);
      assert.equal(history.length, 6, "Should have exactly 6 history entries");

      const expectedActions = [
        "CREATED",
        "ACCEPTED",
        "TRANSFER_REQUESTED",
        "TRANSFER_ACCEPTED",
        "PAYMENT_REQUESTED",
        "PAID",
      ];

      for (let i = 0; i < expectedActions.length; i++) {
        assert.equal(
          history[i].action,
          expectedActions[i],
          `History[${i}] should be ${expectedActions[i]}`
        );
      }

      // Verify actors
      assert.equal(history[0].actor.toLowerCase(), creatorWallet.account.address.toLowerCase());       // CREATED
      assert.equal(history[1].actor.toLowerCase(), firstReceiverWallet.account.address.toLowerCase()); // ACCEPTED
      assert.equal(history[2].actor.toLowerCase(), firstReceiverWallet.account.address.toLowerCase()); // TRANSFER_REQUESTED
      assert.equal(history[3].actor.toLowerCase(), newReceiverWallet.account.address.toLowerCase());   // TRANSFER_ACCEPTED
      assert.equal(history[4].actor.toLowerCase(), newReceiverWallet.account.address.toLowerCase());   // PAYMENT_REQUESTED
      assert.equal(history[5].actor.toLowerCase(), intermediaryWallet.account.address.toLowerCase());  // PAID
    });
  });
});
