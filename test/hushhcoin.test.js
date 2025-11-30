const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HushhCoin", function () {
    let hushhCoin;
    let owner;
    let reserveAuthority;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, reserveAuthority, user1, user2] = await ethers.getSigners();

        const HushhCoin = await ethers.getContractFactory("HushhCoin");
        hushhCoin = await HushhCoin.deploy();
        await hushhCoin.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await hushhCoin.name()).to.equal("HushhCoin");
            expect(await hushhCoin.symbol()).to.equal("HUSHH");
        });

        it("Should set the right owner", async function () {
            expect(await hushhCoin.owner()).to.equal(owner.address);
        });

        it("Should set owner as initial reserve authority", async function () {
            expect(await hushhCoin.reserveAuthority()).to.equal(owner.address);
        });

        it("Should have 18 decimals", async function () {
            expect(await hushhCoin.decimals()).to.equal(18);
        });

        it("Should start with zero total supply", async function () {
            expect(await hushhCoin.totalSupply()).to.equal(0);
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            const mintAmount = 100;
            await hushhCoin.mint(user1.address, mintAmount);

            const expectedBalance = ethers.parseEther(mintAmount.toString());
            expect(await hushhCoin.balanceOf(user1.address)).to.equal(expectedBalance);
        });

        it("Should allow reserve authority to mint tokens", async function () {
            await hushhCoin.setReserveAuthority(reserveAuthority.address);

            const mintAmount = 50;
            await hushhCoin.connect(reserveAuthority).mint(user1.address, mintAmount);

            const expectedBalance = ethers.parseEther(mintAmount.toString());
            expect(await hushhCoin.balanceOf(user1.address)).to.equal(expectedBalance);
        });

        it("Should multiply mint amount by 1e18", async function () {
            const mintAmount = 100;
            await hushhCoin.mint(user1.address, mintAmount);

            expect(await hushhCoin.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
            expect(await hushhCoin.balanceOfHuman(user1.address)).to.equal(100);
        });

        it("Should emit TokensMinted event", async function () {
            const mintAmount = 100;
            const expectedAmount = ethers.parseEther(mintAmount.toString());

            await expect(hushhCoin.mint(user1.address, mintAmount))
                .to.emit(hushhCoin, "TokensMinted")
                .withArgs(user1.address, expectedAmount, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });

        it("Should revert if non-authorized user tries to mint", async function () {
            await expect(
                hushhCoin.connect(user1).mint(user2.address, 100)
            ).to.be.revertedWith("HushhCoin: caller is not authorized");
        });

        it("Should revert if minting to zero address", async function () {
            await expect(
                hushhCoin.mint(ethers.ZeroAddress, 100)
            ).to.be.revertedWith("HushhCoin: mint to zero address");
        });

        it("Should revert if minting zero amount", async function () {
            await expect(
                hushhCoin.mint(user1.address, 0)
            ).to.be.revertedWith("HushhCoin: amount must be greater than 0");
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            await hushhCoin.mint(user1.address, 100);
        });

        it("Should allow users to burn their own tokens", async function () {
            const burnAmount = ethers.parseEther("50");
            await hushhCoin.connect(user1).burn(burnAmount);

            expect(await hushhCoin.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
        });

        it("Should emit TokensBurned event", async function () {
            const burnAmount = ethers.parseEther("50");

            await expect(hushhCoin.connect(user1).burn(burnAmount))
                .to.emit(hushhCoin, "TokensBurned");
        });

        it("Should revert if burning more than balance", async function () {
            const burnAmount = ethers.parseEther("200");

            await expect(
                hushhCoin.connect(user1).burn(burnAmount)
            ).to.be.revertedWith("HushhCoin: insufficient balance");
        });

        it("Should revert if burning zero amount", async function () {
            await expect(
                hushhCoin.connect(user1).burn(0)
            ).to.be.revertedWith("HushhCoin: amount must be greater than 0");
        });

        it("Should allow burning from another address with allowance", async function () {
            const burnAmount = ethers.parseEther("30");

            await hushhCoin.connect(user1).approve(user2.address, burnAmount);
            await hushhCoin.connect(user2).burnFrom(user1.address, burnAmount);

            expect(await hushhCoin.balanceOf(user1.address)).to.equal(ethers.parseEther("70"));
        });
    });

    describe("Reserve Authority", function () {
        it("Should allow owner to update reserve authority", async function () {
            await hushhCoin.setReserveAuthority(reserveAuthority.address);
            expect(await hushhCoin.reserveAuthority()).to.equal(reserveAuthority.address);
        });

        it("Should emit ReserveAuthorityUpdated event", async function () {
            await expect(hushhCoin.setReserveAuthority(reserveAuthority.address))
                .to.emit(hushhCoin, "ReserveAuthorityUpdated")
                .withArgs(owner.address, reserveAuthority.address);
        });

        it("Should revert if non-owner tries to update reserve authority", async function () {
            await expect(
                hushhCoin.connect(user1).setReserveAuthority(reserveAuthority.address)
            ).to.be.reverted;
        });

        it("Should revert if setting reserve authority to zero address", async function () {
            await expect(
                hushhCoin.setReserveAuthority(ethers.ZeroAddress)
            ).to.be.revertedWith("HushhCoin: new authority is zero address");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await hushhCoin.mint(user1.address, 100);
            await hushhCoin.mint(user2.address, 50);
        });

        it("Should return correct total supply in human format", async function () {
            expect(await hushhCoin.totalSupplyHuman()).to.equal(150);
        });

        it("Should return correct balance in human format", async function () {
            expect(await hushhCoin.balanceOfHuman(user1.address)).to.equal(100);
            expect(await hushhCoin.balanceOfHuman(user2.address)).to.equal(50);
        });
    });

    describe("Transfers", function () {
        beforeEach(async function () {
            await hushhCoin.mint(user1.address, 100);
        });

        it("Should allow token transfers", async function () {
            const transferAmount = ethers.parseEther("30");
            await hushhCoin.connect(user1).transfer(user2.address, transferAmount);

            expect(await hushhCoin.balanceOf(user1.address)).to.equal(ethers.parseEther("70"));
            expect(await hushhCoin.balanceOf(user2.address)).to.equal(ethers.parseEther("30"));
        });

        it("Should allow approved transfers", async function () {
            const transferAmount = ethers.parseEther("30");

            await hushhCoin.connect(user1).approve(user2.address, transferAmount);
            await hushhCoin.connect(user2).transferFrom(user1.address, user2.address, transferAmount);

            expect(await hushhCoin.balanceOf(user2.address)).to.equal(transferAmount);
        });
    });
});
