
const web3 = new Web3('http://localhost:8545'); 
const daiToken = new web3.eth.Contract(ERC20TransferABI, DAIADDRESS);
const ERC20TransferABI = [
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_num",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_code",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_exdate",
          "type": "string"
        }
      ],
      "name": "createCard",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  
  const DAIADDRESS = "0xDFad300dA070C1d7a1a3d3dEE477A9461D1DbFD2";
  const daiToken = new web3.eth.Contract(ERC20TransferABI, DAIADDRESS);
  const senderAddress = "0xf3a02D1026C42ed4e6BF12B2531f2EC32DA89E89"
  const senderAddress2 = "0x827f10d11C006b525a64370EE980d001Fb086Bd2"
  
  var name, number, seccode, exdate;
  daiToken.methods.createCard(name, number, seccode, exdate).send({from: senderAddress2}, function(err, res) {
    if (err) {
      console.log("An error occured", err);
      return
  }
  console.log("Hash of the transaction: " + res)
  })