const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const Web3 = require('web3');
const config = require('./config.json');

const walletPrivateKey = process.env.walletPrivateKey;
const web3 = new Web3('https://ropsten.infura.io/v3/81cce3c9f44f4651b70795069f9cc519');

web3.eth.accounts.wallet.add(walletPrivateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

const cEthAddress = config.cEthAddress;
const cEthAbi = config.cEthAbi;
const cEthContract = new web3.eth.Contract(cEthAbi, cEthAddress);

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.route('/protocol-balance/eth/').get((req, res) => {
  cEthContract.methods.balanceOfUnderlying(myWalletAddress).call()
    .then((result) => {
      const balanceOfUnderlying = web3.utils.fromWei(result);
      return res.send(balanceOfUnderlying);
    }).catch((error) => {
      console.error('[protocol-balance] error:', error);
      return res.sendStatus(400);
    });
});

app.route('/wallet-balance/eth/').get((req, res) => {
  web3.eth.getBalance(myWalletAddress).then((result) => {
    const ethBalance = web3.utils.fromWei(result);
    return res.send(ethBalance);
  }).catch((error) => {
    console.error('[wallet-balance] error:', error);
    return res.sendStatus(400);
  });
});

app.route('/wallet-balance/ceth/').get((req, res) => {
  cEthContract.methods.balanceOf(myWalletAddress).call().then((result) => {
      const cTokenBalance = result / 1e8;
      return res.send(cTokenBalance.toString());
    }).catch((error) => {
      console.error('[wallet-ctoken-balance] error:', error);
      return res.sendStatus(400);
    });
});

app.route('/supply/eth/:amount').get((req, res) => {
  if (isNaN(req.params.amount)) {
    return res.sendStatus(400);
  }

  cEthContract.methods.mint().send({
    from: myWalletAddress,
    gasLimit: web3.utils.toHex(500000),
    gasPrice: web3.utils.toHex(20000000000),
    value: web3.utils.toHex(web3.utils.toWei(req.params.amount, 'ether'))
  }).then((result) => {
    return res.sendStatus(200);
  }).catch((error) => {
    console.error('[supply] error:', error);
    return res.sendStatus(400);
  });
});

app.route('/redeem/eth/:cTokenAmount').get((req, res) => {
  if (isNaN(req.params.cTokenAmount)) {
    return res.sendStatus(400);
  }

  cEthContract.methods.redeem(req.params.cTokenAmount * 1e8).send({
    from: myWalletAddress,
    gasLimit: web3.utils.toHex(500000),
    gasPrice: web3.utils.toHex(20000000000)
  }).then((result) => {
    return res.sendStatus(200);
  }).catch((error) => {
    console.error('[redeem] error:', error);
    return res.sendStatus(400);
  });
});

app.route('/rates/:cTokenAmount').get(async (req,res)=>{
    const cTokenDecimals = 8; // all cTokens have 8 decimal places
    const underlying = new web3.eth.Contract(cEthAbi, cEthAddress);
    const cToken = new web3.eth.Contract(cEthAbi, cEthAddress);
    const underlyingDecimals = 18;
    const exchangeRateCurrent = await cToken.methods.exchangeRateCurrent().call();
    const mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
    const oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
    const tokens = req.params.cTokenAmount

    var rate = tokens.toString()+' cETH can be redeemed for '+ tokens*oneCTokenInUnderlying.toString()+ ' ETH';
    return res.send(rate);

});
app.route('/gas_est').get((req,res)=>{
    // const wallet_ebal_cost = web3.eth.getBalance.estimateGas(myWalletAddress);
    const cToken = new web3.eth.Contract(cEthAbi, cEthAddress);
    const wallet_cbal_cost = cEthContract.methods.balanceOf(myWalletAddress).estimateGas;
    const rate_gas = cToken.methods.exchangeRateCurrent.estimateGas;
    const redeem_gas = cEthContract.methods.redeem.estimateGas;
    const gas_price = 200.0 / Math.pow(10, 9);
    const net_gas = (wallet_cbal_cost+rate_gas+redeem_gas)*gas_price;
    console.log(net_gas);
    return res.send(net_gas.toString());
});

app.listen(port, () => console.log(`API server running on port ${port}`));