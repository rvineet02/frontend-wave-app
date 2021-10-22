import './App.css';
import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';
import Spinner from './component/Spinner';
// import Modal from './component/Modal';

function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState(0);
  const [loadingState, setLoadingState] = useState(false);
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = "0x8EfE0B65C62C208Fc2E43F3B598525142cE53f3b";
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
        getAllWaves();
      } else {
        console.log("No Authorized Account Found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect( () => {
    checkWalletConnection();
    const numberOfWaves = async () => {
      try{
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrived total wave count...", count.toNumber());
          setTotalWaves(count.toNumber());
        } else {
          console.log("eth obj not found");
        }
      } catch (error) {
        console.log(error);
      }
    }

    numberOfWaves();
  },) 

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
        setLoadingState(true);
        const waveTxn = await wavePortalContract.wave("This is a message"); // update for message
        console.log("mining...", waveTxn.hash);

        await waveTxn.wait();
        setLoadingState(false);
        console.log("Mined --", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Got total wave count...", count.toNumber());
        setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesnt exist");
      }
    } catch (error) {
        setLoadingState(false);
        console.log("Error: ", error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // call method from contract 
        const waves = await wavePortalContract.getAllWaves();

        // santizing data from waves struct in contract 
        let wavesFinal = [];
        waves.forEach(wave => {
          wavesFinal.push({
            address: wave.waver, 
            timestamp: new Date(wave.timestamp*1000),
            message: wave.message
          });
        });
        setAllWaves(wavesFinal);
      } else{
        console.log("Eth Obj doesnt exist");
      }      
    } catch (error) {
      console.log(error);
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

        {!loadingState && (
            <button className="button-51" onClick={wave}>
              Wave at me
            </button>
        )}
        
        {!currentAccount &&  (
          <button className="button-51" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>

        {loadingState && ( <Spinner />)}
        
        {!loadingState && (
          <div className="totalCount">
          Total Number of Waves: {totalWaves}
          </div>
        )}

        {allWaves.map( (curr, index) => {
          return (
            <div key={index} style= {{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div> Address: {curr.address} </div>
              <div> Time: {curr.timestamp.toString()} </div>
              <div> Message: {curr.message} </div>
            </div>
          )

        })}

    </div>

  );
}

export default App;
