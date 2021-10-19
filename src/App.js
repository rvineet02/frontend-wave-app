import './App.css';
import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';


function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState(0);
  const [loadingState, setLoadingState] = useState(false);

  const contractAddress = "0xF9C1D356D8815b5EBa8fa3A4a41857eB3da0d492";
  const contractABI = abi.abi;

  const checkWalletConnection =  async () => {
    // check if we access to ethereum obj 
    try{
      const { ethereum } = window;
      if (!ethereum) {
      console.log("Make Sure MetaMask wallet is connected");
      return;
      } else {
      console.log("We have ethereum obj", ethereum);
    }
    // check if we're authorized to access user's wallet
      const accounts = await ethereum.request({method: 'eth_accounts'});

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
      } else {
        console.log("No Authorized Account Found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect( () => {
    checkWalletConnection();
  }, []) 

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask"); 
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });


      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }


  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);


        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrived total wave count...", count.toNumber());
        setTotalWaves(count.toNumber());

      // executing actual wave from smart contract 
      const waveTxn = await wavePortalContract.wave();
      console.log("mining...", waveTxn.hash);
      setLoadingState(true);
      console.log("Loading State", loadingState);
      // if(loadingState == true) {
      //   console.log("Loading State is TRUE")
      // }

      await waveTxn.wait();
      console.log("Mined --", waveTxn.hash);
      count = await wavePortalContract.getTotalWaves();
      console.log("Got total wave count...", count.toNumber());
      setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesnt exist");
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>
        <div className="bio">
          Connect your Ethereum Wallet and Wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at me
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div>
          Total Number of Waves: {totalWaves}
        </div>

      </div>
    </div>

  );
}

export default App;
