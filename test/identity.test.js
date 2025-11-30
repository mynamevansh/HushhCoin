const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HushhIdentity", function () {
    let hushhIdentity;
    let owner;
    let user1;
    let user2;
    let user3;

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();

        const HushhIdentity = await ethers.getContractFactory("HushhIdentity");
        hushhIdentity = await HushhIdentity.deploy();
        await hushhIdentity.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await hushhIdentity.name()).to.equal("HushhIdentity");
            expect(await hushhIdentity.symbol()).to.equal("HUSHH-ID");
        });

        it("Should set the right owner", async function () {
            expect(await hushhIdentity.owner()).to.equal(owner.address);
        });

        it("Should start with zero identities", async function () {
            expect(await hushhIdentity.totalIdentities()).to.equal(0);
        });
    });

    describe("Identity Creation", function () {
        it("Should allow user to create identity", async function () {
            await hushhIdentity.connect(user1).createIdentity();

            expect(await hushhIdentity.hasIdentity(user1.address)).to.equal(true);
            expect(await hushhIdentity.balanceOf(user1.address)).to.equal(1);
        });

        it("Should assign sequential token IDs", async function () {
            await hushhIdentity.connect(user1).createIdentity();
            await hushhIdentity.connect(user2).createIdentity();

            expect(await hushhIdentity.getTokenId(user1.address)).to.equal(1);
            expect(await hushhIdentity.getTokenId(user2.address)).to.equal(2);
        });

        it("Should initialize brand score to 0", async function () {
            await hushhIdentity.connect(user1).createIdentity();

            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(0);
        });

        it("Should emit IdentityCreated event", async function () {
            await expect(hushhIdentity.connect(user1).createIdentity())
                .to.emit(hushhIdentity, "IdentityCreated")
                .withArgs(user1.address, 1, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });

        it("Should increment total identities", async function () {
            await hushhIdentity.connect(user1).createIdentity();
            expect(await hushhIdentity.totalIdentities()).to.equal(1);

            await hushhIdentity.connect(user2).createIdentity();
            expect(await hushhIdentity.totalIdentities()).to.equal(2);
        });

        it("Should revert if user tries to create identity twice", async function () {
            await hushhIdentity.connect(user1).createIdentity();

            await expect(
                hushhIdentity.connect(user1).createIdentity()
            ).to.be.revertedWith("HushhIdentity: identity already exists");
        });

        it("Should allow multiple users to create identities", async function () {
            await hushhIdentity.connect(user1).createIdentity();
            await hushhIdentity.connect(user2).createIdentity();
            await hushhIdentity.connect(user3).createIdentity();

            expect(await hushhIdentity.totalIdentities()).to.equal(3);
            expect(await hushhIdentity.hasIdentity(user1.address)).to.equal(true);
            expect(await hushhIdentity.hasIdentity(user2.address)).to.equal(true);
            expect(await hushhIdentity.hasIdentity(user3.address)).to.equal(true);
        });
    });

    describe("Brand Value Score", function () {
        beforeEach(async function () {
            await hushhIdentity.connect(user1).createIdentity();
            await hushhIdentity.connect(user2).createIdentity();
        });

        it("Should allow owner to set brand value score", async function () {
            await hushhIdentity.setBrandValueScore(user1.address, 750);

            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(750);
        });

        it("Should emit BrandScoreUpdated event", async function () {
            await expect(hushhIdentity.setBrandValueScore(user1.address, 800))
                .to.emit(hushhIdentity, "BrandScoreUpdated")
                .withArgs(user1.address, 0, 800, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });

        it("Should allow updating score multiple times", async function () {
            await hushhIdentity.setBrandValueScore(user1.address, 500);
            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(500);

            await hushhIdentity.setBrandValueScore(user1.address, 750);
            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(750);
        });

        it("Should revert if non-owner tries to set score", async function () {
            await expect(
                hushhIdentity.connect(user2).setBrandValueScore(user1.address, 500)
            ).to.be.reverted;
        });

        it("Should revert if setting score for wallet without identity", async function () {
            await expect(
                hushhIdentity.setBrandValueScore(user3.address, 500)
            ).to.be.revertedWith("HushhIdentity: wallet has no identity");
        });

        it("Should revert if score exceeds 1000", async function () {
            await expect(
                hushhIdentity.setBrandValueScore(user1.address, 1001)
            ).to.be.revertedWith("HushhIdentity: score must be <= 1000");
        });

        it("Should allow score of exactly 1000", async function () {
            await hushhIdentity.setBrandValueScore(user1.address, 1000);
            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(1000);
        });
    });

    describe("SoulBound Properties", function () {
        beforeEach(async function () {
            await hushhIdentity.connect(user1).createIdentity();
        });

        it("Should prevent token transfers", async function () {
            const tokenId = await hushhIdentity.getTokenId(user1.address);

            await expect(
                hushhIdentity.connect(user1).transferFrom(user1.address, user2.address, tokenId)
            ).to.be.revertedWith("HushhIdentity: SoulBound tokens cannot be transferred");
        });

        it("Should prevent safeTransferFrom", async function () {
            const tokenId = await hushhIdentity.getTokenId(user1.address);

            await expect(
                hushhIdentity.connect(user1)['safeTransferFrom(address,address,uint256)'](
                    user1.address,
                    user2.address,
                    tokenId
                )
            ).to.be.revertedWith("HushhIdentity: SoulBound tokens cannot be transferred");
        });

        it("Should prevent approve", async function () {
            const tokenId = await hushhIdentity.getTokenId(user1.address);

            await expect(
                hushhIdentity.connect(user1).approve(user2.address, tokenId)
            ).to.be.revertedWith("HushhIdentity: SoulBound tokens cannot be approved");
        });

        it("Should prevent setApprovalForAll", async function () {
            await expect(
                hushhIdentity.connect(user1).setApprovalForAll(user2.address, true)
            ).to.be.revertedWith("HushhIdentity: SoulBound tokens cannot be approved");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await hushhIdentity.connect(user1).createIdentity();
            await hushhIdentity.setBrandValueScore(user1.address, 850);
        });

        it("Should return correct token ID for wallet", async function () {
            expect(await hushhIdentity.getTokenId(user1.address)).to.equal(1);
        });

        it("Should return correct brand value score", async function () {
            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(850);
        });

        it("Should check identity existence correctly", async function () {
            expect(await hushhIdentity.checkIdentity(user1.address)).to.equal(true);
            expect(await hushhIdentity.checkIdentity(user2.address)).to.equal(false);
        });

        it("Should revert when querying token ID for non-existent identity", async function () {
            await expect(
                hushhIdentity.getTokenId(user2.address)
            ).to.be.revertedWith("HushhIdentity: wallet has no identity");
        });

        it("Should revert when querying score for non-existent identity", async function () {
            await expect(
                hushhIdentity.getBrandValueScore(user2.address)
            ).to.be.revertedWith("HushhIdentity: wallet has no identity");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle maximum score correctly", async function () {
            await hushhIdentity.connect(user1).createIdentity();
            await hushhIdentity.setBrandValueScore(user1.address, 1000);

            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(1000);
        });

        it("Should handle minimum score correctly", async function () {
            await hushhIdentity.connect(user1).createIdentity();
            await hushhIdentity.setBrandValueScore(user1.address, 0);

            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(0);
        });

        it("Should maintain separate scores for different users", async function () {
            await hushhIdentity.connect(user1).createIdentity();
            await hushhIdentity.connect(user2).createIdentity();

            await hushhIdentity.setBrandValueScore(user1.address, 700);
            await hushhIdentity.setBrandValueScore(user2.address, 900);

            expect(await hushhIdentity.getBrandValueScore(user1.address)).to.equal(700);
            expect(await hushhIdentity.getBrandValueScore(user2.address)).to.equal(900);
        });
    });
});
