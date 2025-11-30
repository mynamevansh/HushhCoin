const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZKMockProof", function () {
    let zkMockProof;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const ZKMockProof = await ethers.getContractFactory("ZKMockProof");
        zkMockProof = await ZKMockProof.deploy();
        await zkMockProof.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await zkMockProof.owner()).to.equal(owner.address);
        });

        it("Should start with zero proofs", async function () {
            expect(await zkMockProof.totalProofs()).to.equal(0);
        });
    });

    describe("Proof Generation", function () {
        it("Should generate proof for valid score", async function () {
            const score = 750;
            const tx = await zkMockProof.connect(user1).generateProof(score);
            const receipt = await tx.wait();

            expect(await zkMockProof.totalProofs()).to.equal(1);
        });

        it("Should return correct proof ID and statement", async function () {
            const score = 850;
            const result = await zkMockProof.connect(user1).generateProof.staticCall(score);

            expect(result[0]).to.equal(1); // proofId
            expect(result[1]).to.include("Very Good"); // statement
        });

        it("Should emit ProofGenerated event", async function () {
            const score = 750;

            await expect(zkMockProof.connect(user1).generateProof(score))
                .to.emit(zkMockProof, "ProofGenerated");
        });

        it("Should revert if score exceeds 1000", async function () {
            await expect(
                zkMockProof.connect(user1).generateProof(1001)
            ).to.be.revertedWith("ZKMockProof: score must be <= 1000");
        });

        it("Should allow score of exactly 1000", async function () {
            await zkMockProof.connect(user1).generateProof(1000);
            expect(await zkMockProof.totalProofs()).to.equal(1);
        });

        it("Should increment proof IDs sequentially", async function () {
            const result1 = await zkMockProof.connect(user1).generateProof.staticCall(700);
            await zkMockProof.connect(user1).generateProof(700);

            const result2 = await zkMockProof.connect(user1).generateProof.staticCall(800);
            await zkMockProof.connect(user1).generateProof(800);

            expect(result1[0]).to.equal(1);
            expect(result2[0]).to.equal(2);
        });
    });

    describe("Statement Generation", function () {
        it("Should generate 'Excellent' statement for score >= 900", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(950);
            expect(result[1]).to.include("Excellent");
            expect(result[1]).to.include("900+");
        });

        it("Should generate 'Very Good' statement for score 800-899", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(850);
            expect(result[1]).to.include("Very Good");
            expect(result[1]).to.include("800-899");
        });

        it("Should generate 'Good' statement for score 700-799", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(750);
            expect(result[1]).to.include("Good");
            expect(result[1]).to.include("700-799");
        });

        it("Should generate 'Above Average' statement for score 600-699", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(650);
            expect(result[1]).to.include("Above Average");
            expect(result[1]).to.include("600-699");
        });

        it("Should generate 'Average' statement for score 500-599", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(550);
            expect(result[1]).to.include("Average");
            expect(result[1]).to.include("500-599");
        });

        it("Should generate 'Below Average' statement for score 400-499", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(450);
            expect(result[1]).to.include("Below Average");
            expect(result[1]).to.include("400-499");
        });

        it("Should generate 'Low' statement for score 300-399", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(350);
            expect(result[1]).to.include("Low");
            expect(result[1]).to.include("300-399");
        });

        it("Should generate 'Very Low' statement for score 200-299", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(250);
            expect(result[1]).to.include("Very Low");
            expect(result[1]).to.include("200-299");
        });

        it("Should generate 'Minimal' statement for score 100-199", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(150);
            expect(result[1]).to.include("Minimal");
            expect(result[1]).to.include("100-199");
        });

        it("Should generate 'Unrated' statement for score 0-99", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(50);
            expect(result[1]).to.include("Unrated");
            expect(result[1]).to.include("0-99");
        });
    });

    describe("Proof Verification", function () {
        beforeEach(async function () {
            await zkMockProof.connect(user1).generateProof(750);
        });

        it("Should verify existing proof", async function () {
            const result = await zkMockProof.verifyProof(1);
            expect(result).to.equal(true);
        });

        it("Should emit ProofVerified event", async function () {
            await expect(zkMockProof.connect(user2).verifyProof(1))
                .to.emit(zkMockProof, "ProofVerified");
        });

        it("Should revert when verifying non-existent proof", async function () {
            await expect(
                zkMockProof.verifyProof(999)
            ).to.be.revertedWith("ZKMockProof: proof does not exist");
        });

        it("Should allow anyone to verify a proof", async function () {
            const result = await zkMockProof.connect(user2).verifyProof(1);
            expect(result).to.equal(true);
        });
    });

    describe("Proof Retrieval", function () {
        beforeEach(async function () {
            await zkMockProof.connect(user1).generateProof(850);
        });

        it("Should return correct proof details", async function () {
            const proof = await zkMockProof.getProof(1);

            expect(proof[0]).to.equal(user1.address); // prover
            expect(proof[1]).to.include("Very Good"); // statement
            expect(proof[3]).to.equal(true); // verified
        });

        it("Should revert when getting non-existent proof", async function () {
            await expect(
                zkMockProof.getProof(999)
            ).to.be.revertedWith("ZKMockProof: proof does not exist");
        });
    });

    describe("User Proofs", function () {
        it("Should track user's proofs correctly", async function () {
            await zkMockProof.connect(user1).generateProof(700);
            await zkMockProof.connect(user1).generateProof(800);
            await zkMockProof.connect(user1).generateProof(900);

            const userProofs = await zkMockProof.getUserProofs(user1.address);
            expect(userProofs.length).to.equal(3);
            expect(userProofs[0]).to.equal(1);
            expect(userProofs[1]).to.equal(2);
            expect(userProofs[2]).to.equal(3);
        });

        it("Should return empty array for user with no proofs", async function () {
            const userProofs = await zkMockProof.getUserProofs(user2.address);
            expect(userProofs.length).to.equal(0);
        });

        it("Should maintain separate proof lists for different users", async function () {
            await zkMockProof.connect(user1).generateProof(700);
            await zkMockProof.connect(user2).generateProof(800);
            await zkMockProof.connect(user1).generateProof(900);

            const user1Proofs = await zkMockProof.getUserProofs(user1.address);
            const user2Proofs = await zkMockProof.getUserProofs(user2.address);

            expect(user1Proofs.length).to.equal(2);
            expect(user2Proofs.length).to.equal(1);
        });
    });

    describe("Batch Proof Generation", function () {
        it("Should generate multiple proofs in one transaction", async function () {
            const scores = [700, 800, 900];
            const result = await zkMockProof.connect(user1).batchGenerateProofs.staticCall(scores);

            expect(result.length).to.equal(3);
            expect(result[0]).to.equal(1);
            expect(result[1]).to.equal(2);
            expect(result[2]).to.equal(3);
        });

        it("Should emit events for each proof in batch", async function () {
            const scores = [700, 800];

            await expect(zkMockProof.connect(user1).batchGenerateProofs(scores))
                .to.emit(zkMockProof, "ProofGenerated");
        });

        it("Should revert if any score in batch exceeds 1000", async function () {
            const scores = [700, 1001, 800];

            await expect(
                zkMockProof.connect(user1).batchGenerateProofs(scores)
            ).to.be.revertedWith("ZKMockProof: score must be <= 1000");
        });

        it("Should add all batch proofs to user's proof list", async function () {
            const scores = [700, 800, 900];
            await zkMockProof.connect(user1).batchGenerateProofs(scores);

            const userProofs = await zkMockProof.getUserProofs(user1.address);
            expect(userProofs.length).to.equal(3);
        });

        it("Should handle empty batch", async function () {
            const scores = [];
            const result = await zkMockProof.connect(user1).batchGenerateProofs.staticCall(scores);

            expect(result.length).to.equal(0);
        });
    });

    describe("Edge Cases", function () {
        it("Should handle score of 0", async function () {
            const result = await zkMockProof.connect(user1).generateProof.staticCall(0);
            expect(result[1]).to.include("Unrated");
        });

        it("Should handle boundary scores correctly", async function () {
            // Test boundary at 900
            const result900 = await zkMockProof.connect(user1).generateProof.staticCall(900);
            expect(result900[1]).to.include("Excellent");

            // Test boundary at 899
            const result899 = await zkMockProof.connect(user1).generateProof.staticCall(899);
            expect(result899[1]).to.include("Very Good");
        });

        it("Should handle multiple users generating proofs simultaneously", async function () {
            await zkMockProof.connect(user1).generateProof(700);
            await zkMockProof.connect(user2).generateProof(800);

            expect(await zkMockProof.totalProofs()).to.equal(2);

            const user1Proofs = await zkMockProof.getUserProofs(user1.address);
            const user2Proofs = await zkMockProof.getUserProofs(user2.address);

            expect(user1Proofs.length).to.equal(1);
            expect(user2Proofs.length).to.equal(1);
        });
    });
});
