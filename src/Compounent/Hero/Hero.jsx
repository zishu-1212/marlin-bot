import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  ResponsiveContainer
} from "recharts";
import { ToastContainer, toast } from 'react-toastify';

import axios from "axios";
import Nav from "../Nav/Nav";
import Web3 from "web3";
function Hero() {
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState("Submit the key");
  const [loader, setLoader] = useState(false);

  const web3 = new Web3("https://polygon-rpc.com"); // Public Polygon RPC

  // Fetch balance with Web3
  const fetchBalance = async (userAddress) => {
    try {
      const balanceInWei = await web3.eth.getBalance(userAddress);
      const balanceInMatic = web3.utils.fromWei(balanceInWei, "ether");
      setBalance(parseFloat(balanceInMatic).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error fetching balance");
    }
  };

  const handleRunBot = async () => {
    if (!privateKey || !address) {
      setMessage("Please enter both private key and address");
      return;
    }

    setLoader(true);
    setMessage("Processing to find the opportunity...");
    setBalance(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://marlinnapp-5e0bd806334c.herokuapp.com/api/runBot",
        {
          amount: 1,
          privatekey: privateKey,
          gasGiven: "300",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { data } = response.data;
      setMessage(
        <>
          <p className="mt-3 text-white">{response.message}</p>
          <div className="mt-3 text-white">
            <p>
              Frontrun TxHash:{" "}
              <a
                href={`https://polygonscan.com/tx/${data.frontrunTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.frontrunTxHash}
              </a>
            </p>
            <p>
              Target TxHash:{" "}
              <a
                href={`https://polygonscan.com/tx/${data.targetTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.targetTxHash}
              </a>
            </p>
            <p>
              Take Profit TxHash:{" "}
              <a
                href={`https://polygonscan.com/tx/${data.TakeProfitTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.TakeProfitTxHash}
              </a>
            </p>
          </div>
        </>
      );
toast.success(response.message);
      fetchBalance(address);
    } catch (error) {
      console.error("Error running bot:", error);
      setMessage("Error running bot. Please try again.");
    }

    setLoader(false);
  };
  // Fetch POL Price Data
  const [polPriceData, setPolPriceData] = useState([]);
  const [blockHeightData, setBlockHeightData] = useState([]);
  const [pendingTxData, setPendingTxData] = useState([]);


  
    // Fetch POL Price
    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     axios.get("https://marlinnapp-5e0bd806334c.herokuapp.com/api/getData?type=polprice")
    //       .then(response => {
    //         console.log("POL Price Response:", response.data);
    //         if (response.data.status) {
    //           const formattedData = response.data.data.map(entry => ({
    //             time: new Date(entry.time).toLocaleTimeString(),
    //             price: entry.price
    //           }));
    //           setPolPriceData(formattedData.slice(0, 15)); // Only first 15 data points
    //         }
    //       })
    //       .catch(error => console.error("Error fetching POL price data:", error));
    //   }, 1000); // Fetch every 1 second
  
    //   return () => clearInterval(interval); // Cleanup interval on component unmount
    // }, []);
  
    // Fetch Block Height Data every second
    useEffect(() => {
      const interval = setInterval(() => {
        axios.get("https://marlinnapp-5e0bd806334c.herokuapp.com/api/getData?type=blockheight")
          .then(response => {
            console.log("Block Height Response:", response.data);
            if (response.data.status) {
              const formattedData = response.data.data.map(entry => ({
                time: new Date(entry.time).toLocaleTimeString(),
                blockHeight: entry.blockHeight
              }));
    
              // Sorting data in ascending order and reversing to show latest at the bottom
              const sortedData = formattedData.sort((a, b) => new Date(a.time) - new Date(b.time)).reverse();
    
              setBlockHeightData(sortedData.slice(0, 15)); // Keep latest 15 entries
            }
          })
          .catch(error => console.error("Error fetching block height data:", error));
      }, 1000);
    
      return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
      const interval = setInterval(() => {
        axios.get("https://marlinnapp-5e0bd806334c.herokuapp.com/api/getData?type=pendingtx")
          .then(response => {
            console.log("Pending Transactions Response:", response.data);
            if (response.data.status) {
              const formattedData = response.data.data.map(entry => ({
                time: new Date(entry.time).toLocaleTimeString(),
                pendingTx: entry.pendingTxCount
              }));
    
              // Sorting data in ascending order and reversing to show latest at the bottom
              const sortedData = formattedData.sort((a, b) => new Date(a.time) - new Date(b.time)).reverse();
    
              setPendingTxData(sortedData.slice(0, 15)); // Keep latest 15 entries
            }
          })
          .catch(error => console.error("Error fetching pending transactions data:", error));
      }, 1000);
    
      return () => clearInterval(interval);
    }, []);
    

    const [time, setTime] = useState(new Date());


  return (
    <div>
      <Nav />
      <div className="container-fluid mt-5">
        <div className="row">
        <div className="col-12 col-lg-4">
      {/* <div className="mt-2">
        <div className="box d-block d-md-flex align-items-center text-white p-3">
          <div>
            <h2 className="mb-2" style={{ fontSize: "13px" }}>POL Price (USD)</h2>
            <LineChart width={400} height={250} data={polPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[ 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="rgb(232 198 110)" />
            </LineChart>
          </div>
        </div>
      </div> */}

<div className="mt-2">
  <div className="box d-block align-items-center text-white p-3">
    <div>
      <h2 className="mb-2" style={{ fontSize: "13px" }}>Block Height</h2>
      <ResponsiveContainer width="100%"  height={220}>
        <BarChart data={blockHeightData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" style={{ fontSize: "13px" }}/>
          <YAxis domain={['auto']} style={{ fontSize: "13px" }}/>
          <Tooltip />
          <Bar dataKey="blockHeight" fill="rgb(232 198 110)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

<div className="mt-2">
  <div className="box d-block  align-items-center text-white py-3 px-2">
    <div>
      <h2 className="mb-2" style={{ fontSize: "13px" }}>Pending Transactions</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={pendingTxData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" style={{ fontSize: "13px" }}/>
          <YAxis domain={['auto']} style={{ fontSize: "13px" }}/>
          <Tooltip />
          <Line type="monotone" dataKey="pendingTx" stroke="rgb(232 198 110)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
    </div>
          <div className="col-12 col-lg-8">
            <div className=" m">
              <div className="card bgcard">
                <p
                  className="mt-3 m-0 text-white fw-bold ms-2 "
                  style={{ fontSize: "15px" }}
                >
                  POLYGON
                </p>

<div className="d-flex align-items-center"><p className=" m-0 text-white fw-bold ms-2">Address :</p>
<p className="m-0 text-white ms-2">{address}</p></div>
                <div className="d-flex align-items-cente"> <p className=" m-0 text-white fw-bold ms-2">Chains :</p>
                <p className="m-0 text-white ms-2">POLYGON</p></div>
               <div className="d-fle align-items-center"></div>
                <p className=" m-0 text-white fw-bold ms-2">Balance :</p>
                <p className="m-0 text-white ms-2">
                  {balance !== null && (
                    <p className="mt-3 text-white">Balance: {balance}</p>
                  )}
                </p>
              </div>
            </div>
           
              <input
                type="text"
                className="w-100 py-2 mt-3 bg-black"
                placeholder="Enter Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <input
                type="text"
                className="w-100 py-2 mt-3 bg-black"
                placeholder="Enter Private Key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <div className="w-100 d-flex justify-content-center">
                <button
                  className="btn btn-pink w-50 mt-3 fw-bold py-2"
                  style={{ fontSize: "15px" }}
                  onClick={handleRunBot}
                >
                  {loader ? <>Processing</> : <>Start Bot</>}
                </button>
              </div>
              <div className=" mt-5">
              <div className="card bgcard22">
                {message && <p className="mt-3 text-white">{message}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
// Frontrun TxHash: 0xf7a3b3e69e323d9eced3d57714e0e0ee67f1319fdd249203075c556f3f5f62d8

// Target TxHash: 0x04e1efba650a28efee5f9ba0fa636568061e0b2e1ddc1343d5a0fe7525c800cf

// Take Profit TxHash: 0xfc520f9ef990c581ef4fc7d9a3817225f6e815f53fba2dcf5346519407c0b3a6
