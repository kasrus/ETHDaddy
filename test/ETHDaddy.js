const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('ETHDaddy', () => {
  let ethDaddy;
  let deployer, owner1;

  const NAME = 'ETH Daddy';
  const SYMBOL = 'ETHD';

  beforeEach(async() => {
    //setup accounts
    [deployer, owner1] = await ethers.getSigners();

    //Deploy contract
    const ETHDaddy = await ethers.getContractFactory('ETHDaddy');
    ethDaddy = await ETHDaddy.deploy('ETH Daddy', 'ETHD');

    //List a domain
    // deployer is the person that deploy the smart contract. We're talking to the smart contract on behalf of the signer
    const transaction = await ethDaddy.connect(deployer).list('jack.eth', tokens(10));
    await transaction.wait();
  }) 
  
  //--------------------------------------------------
  // DEPLOYMENT
  //--------------------------------------------------
  describe('Deployment', () => {
    describe('Success', () => {
      it('has a name', async () => {    
        const result = await ethDaddy.name();
        expect(result).to.equal(NAME);
      })
    
      it('has a symbol', async() => {
        const result = await ethDaddy.symbol();
        expect(result).to.equal(SYMBOL);
      })
  
      it('sets the owner', async() => {
        const result = await ethDaddy.owner();
        expect(result).to.equal(deployer.address);
      })
  
      it('returns the max supply', async() => {
        const result = await ethDaddy.maxSupply();
        expect(result).to.equal(1);
      })
  
      it('returns the total supply', async() => {
        const result = await ethDaddy.totalSupply();
        expect(result).to.equal(0);
      })
    })

    describe('Failure', () => {
      it('rejects anyone other than the deployer', async() => {
        await expect(ethDaddy.connect(owner1).list('jack.eth', tokens(10))).to.be.reverted;
      })
    })
  })

  //--------------------------------------------------
  // DOMAIN
  //--------------------------------------------------
  describe('Domain', () => {
    it('returns domain attributes', async() => {
      let domain = await ethDaddy.getDomain(1);
      expect(domain.name).to.equal('jack.eth');
      expect(domain.cost).to.equal(tokens(10));
      expect(domain.isOwned).to.be.equal(false);
    })
  })

  //--------------------------------------------------
  // MINTING
  //--------------------------------------------------
  describe('Minting', () => {
    const ID = 1;
    const AMOUNT = tokens(10);

    beforeEach(async() => {
      const transaction = await ethDaddy.connect(owner1).mint(ID, { value: AMOUNT });
      await transaction.wait();
    })

    describe('Success', () => {
      it('updates the owner', async() => {
        const owner = await ethDaddy.ownerOf(ID);
        expect(owner).to.equal(owner1.address)
      })
      
      it('updates the domain status', async() => {
        const domain = await ethDaddy.getDomain(ID);
        expect(domain.isOwned).to.equal(true);
      })
  
      it('updates the contract balance', async() => {
        const result = await ethDaddy.getBalance();
        expect(result).to.equal(AMOUNT);
      })
  
      it('updates the total supply', async() => {
        const result = await ethDaddy.totalSupply();
        expect(result).to.equal(1);    
      })
    })

    describe('Failure', () => {
      it('rejects invalid ids', async() => {
        await expect(ethDaddy.connect(owner1).mint(0, { value: AMOUNT })).to.be.reverted;
        await expect(ethDaddy.connect(owner1).mint(2, { value: AMOUNT })).to.be.reverted;
      })

      it('rejects when domain is already purchased', async() => {
        await expect(ethDaddy.connect(owner1).mint(ID, { value: AMOUNT })).to.be.reverted;
      })

      it('rejects insufficient ethers', async() => {
        const transaction = await ethDaddy.connect(deployer).list('kas.eth', tokens(10));
        await transaction.wait();
        await expect(ethDaddy.connect(owner1).mint(2, { value: tokens(5) })).to.be.reverted;  
      })
    })
  })

  //--------------------------------------------------
  // WITHDRAW
  //--------------------------------------------------
  describe('Withdrawing', () => {
    const ID = 1;
    const AMOUNT = tokens(10);
    let balanceBefore;

    beforeEach(async() => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);
    
      let transaction = await ethDaddy.connect(owner1).mint(ID, {value: AMOUNT});
      await transaction.wait();

      transaction = await ethDaddy.connect(deployer).withdraw();
      await transaction.wait();
    })

    describe('Success', () => {
      it('updates the contract owner\'s balance', async() => {
        const balanceAfter = await ethers.provider.getBalance(deployer.address);
        expect(balanceAfter).to.be.greaterThan(balanceBefore);
      })
    
      it('updates the contract balance', async() => {
        const result = await ethDaddy.getBalance();
        expect(result).to.equal(0);
      })
    })
  })
})
