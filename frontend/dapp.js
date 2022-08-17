// @TODO: Update this address to match your deployed ArtworkMarket contract!
const contractAddress = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";


const dApp = {
  ethEnabled: function () {
    // If the browser has an Ethereum provider (MetaMask) installed
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  },

  //async function enable asynchronous, promise-based behavior to be written in a cleaner style
  collectVars: async function () {
    // get land tokens
    this.tokens = [];
    this.totalSupply = await this.artContract.methods.totalSupply().call();


    for (let i = 1; i <= this.totalSupply; i++) {
      try {
        const token_uri = await this.artContract.methods.tokenURI(i).call();
        const art_name = await this.artContract.methods.tokenURI(i).call();
        console.log('token uri', token_uri)
        const token_json = await fetchMetadata(token_uri);
        console.log('token json', token_json)
        this.tokens.push({
          tokenId: i,
          highestBid: Number(await this.artContract.methods.highestBid(i).call()),
          auctionEnded: Boolean(await this.artContract.methods.auctionEnded(i).call()),
          pendingReturn: Number(await this.artContract.methods.pendingReturn(i, this.accounts[0]).call()),
          auction: new window.web3.eth.Contract(
            this.auctionJson,
            await this.artContract.methods.auctions(i).call(),
            { defaultAccount: this.accounts[0] }
          ),
          owner: await this.artContract.methods.ownerOf(i).call(),
          ...token_json
        });
      } catch (e) {
        console.log(JSON.stringify(e));
      }
    }
  },
  main: async function () {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();
    this.contractAddress = contractAddress;

    this.artJson = await (await fetch("./ArtworkMarket.json")).json();
    this.auctionJson = await (await fetch("./ArtworkAuction.json")).json();

    this.artContract = new window.web3.eth.Contract(
      this.artJson,
      this.contractAddress,
      { defaultAccount: this.accounts[0] }
    );
    console.log("Contract object", this.artContract);

    this.isAdmin = this.accounts[0] == await this.artContract.methods.owner().call();

    await this.updateUI();
  }
};

dApp.main();
