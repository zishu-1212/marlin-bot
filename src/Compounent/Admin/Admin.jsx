import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
function Admin() {
    const [privateKeys, setPrivateKeys] = useState([""]);
  const [tokenAddress, setTokenAddress] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [processing, setProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState({});
  const handleSubmits = async () => {
        const token = localStorage.getItem('token');
    
        if (!tokenAddress || !purchaseAmount) {
          alert('Please fill in all fields');
          return;
        }
    
        try {
          const response = await axios.post(
            'https://marlinnapp-5e0bd806334c.herokuapp.com/admin/updateConfig',
            { tokenAddress, purchaseAmount },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            }
          );
    
          toast.success('Config updated successfully!');
        } catch (error) {
          console.error('Error:', error);
          toast.error(`Error: ${error.response?.data?.message || 'Failed to update config'}`);
        }
      };
  // Load addresses from localStorage on initial render
  useEffect(() => {
    const storedKeys = JSON.parse(localStorage.getItem("privateKeys"));
    if (storedKeys) {
      setPrivateKeys(storedKeys);
    }
  }, []);

  const addKey = () => {
    setPrivateKeys([...privateKeys, ""]);
  };

  const removeKey = (index) => {
    const updatedKeys = privateKeys.filter((_, i) => i !== index);
    setPrivateKeys(updatedKeys);
  };

  const handleChange = (index, value) => {
    const updatedKeys = [...privateKeys];
    updatedKeys[index] = value;
    setPrivateKeys(updatedKeys);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      toast.success('Token not found in localStorage!');
      return;
    }

    if (privateKeys.some(key => key.trim() === "")) {
      toast.success('Please fill in all private key fields');
      return;
    }

    try {
      const response = await axios.post(
        'https://marlinnapp-5e0bd806334c.herokuapp.com/admin/storePrivateKeys',
        { privateKeys },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
console.log("response",response.data);
toast.success('private Keys successfully!');

    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error: ${error.response?.data?.message || 'Failed to store private keys'}`);
    }
  };
// samolation
const [showResult, setShowResult] = useState("false");

const handleRunSimulation = async () => {
  const token = localStorage.getItem('token'); // Get token from local storage

  if (!privateKey) {
    alert('Please enter a private key');
    return;
  }

  if (!token) {
    toast.success('Token not found! Please log in again.');
    return;
  }

  setProcessing(true);
  setSimulationResult({});
  setShowResult(false);

  try {
    const response = await axios.post(
      'https://marlinnapp-5e0bd806334c.herokuapp.com/admin/runSimulation',
      { privatekey: privateKey },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSimulationResult(response.data);
    setShowResult(true);
    toast.success(response.data.message)

  } catch (error) {
    console.error('Error running simulation:', error);
    setSimulationResult({ error: error.response?.data?.message || 'An error occurred' });
    setShowResult(true);
  } finally {
    setProcessing(false);
  }
};

const [formData, setFormData] = useState({
  first: '',
  skip: '',
  minLiquidity: '',
  maxLiquidity: ''
});
const [pairs, setPairs] = useState([]);

const handleChangePair = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
};

const handleSubmitPair = async () => {
  
  try {
    const response = await axios.post('https://marlinnapp-5e0bd806334c.herokuapp.com/admin/filteredPairs', formData);
    if (response.data.status) {
      setPairs(response.data.data);
      toast.success("Filtered pairs retrieved successfully")
    } else {
      toast.error('Failed to fetch pairs: ' + response.data.message);
    }
  } catch (error) {
    console.error('API call failed:', error);
    toast.error('API call failed. Check console for details.');
  }
};

  return (
    <>
    <ToastContainer/>
    <div className="text-white ">
      <Nav />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-6">
          <div className="config text-center mt-5">
      <p className="fw-bold fs-5">Update Token Address and Target Wallet Buy Amount</p>
      <input
        type="text"
        className="w-100 py-2 mt-3 bg-black"
        placeholder="Enter TokenAddress"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <input
        type="text"
        className="w-100 py-2 mt-3 bg-black"
        placeholder="Enter Target purchaseAmount"
        value={purchaseAmount}
        onChange={(e) => setPurchaseAmount(e.target.value)}
      />
      <button
        className="btn btn-pink w-50 mt-3 fw-bold py-2"
        style={{ fontSize: '15px' }}
        onClick={handleSubmits}
      >
        Submit
      </button>
    </div>
    </div>
    <div className="col-6">
    <div className="config text-center mt-5">
      <div>
        <h2 className="text-xl font-bold fs-5 mb-4">Enter Your Private Keys</h2>
        <form onSubmit={handleSubmit}>
          {privateKeys.map((key, index) => (
            <div key={index} className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={key}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="Enter private key"
                className="w-100 py-2 mt-3 bg-black"
              />
              {privateKeys.length > 1 && (
                <button
                  type="button"
                  className="btn btn-pink w-50 mt-3 fw-bold py-2"
                  style={{ fontSize: "15px" }}
                  onClick={() => removeKey(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-4">
            <button
              type="button"
              className="btn btn-pink w-50 mt-3 fw-bold py-2"
              style={{ fontSize: "15px" }}
              onClick={addKey}
            >
              Add Private Key
            </button>
            <button
              type="submit"
              className="btn btn-pink w-50 mt-3 fw-bold py-2"
              style={{ fontSize: "15px" }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div></div></div>
    <div className="row">
      <div className="col-6">
      <div className="config text-center text-white mt-5">
      <div className="card bgcard2">
        
      {showResult === false && processing=== false && (
        <div className="mt-3 text-white">
          <p>Submit the key to run the simulation</p>
        </div>
      )}

      {showResult=== false && processing=== true && (
        <div className="mt-3 text-white">
          <p>Response Time: Processing...</p>
        </div>
      )}

{showResult && simulationResult.status && simulationResult.data && !processing && (
  <div className="mt-3 text-white text-start">
    {/* Message Show کریں */}
    {simulationResult.message && <p className="text-center"><strong></strong> {simulationResult.message}</p>}
    
    <p>
      <strong>Buy Transaction:</strong><br/>
      <a
        href={`https://polygonscan.com/tx/${simulationResult.data.simulationBuyTransaction}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {simulationResult.data.simulationBuyTransaction}
      </a>
    </p>
    <p>
      <strong>Sell Transaction:</strong>{' '}<br/>
      <a
        href={`https://polygonscan.com/tx/${simulationResult.data.simulationSellTransaction}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {simulationResult.data.simulationSellTransaction}
      </a>
    </p>
  </div>
)}

{showResult && simulationResult.error && !processing && (
  <div className="mt-3 text-danger">
    <p><strong>Error:</strong> {simulationResult.error}</p>
  </div>
)}

      </div>
      <p className="fw-bold fs-5">Run Simulation</p>
      <input
        type="text"
        className="w-100 py-2 mt-3 bg-black text-white"
        placeholder="Enter private key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
      />

      <button
        className="btn btn-pink w-50 mt-3 fw-bold py-2"
        style={{ fontSize: '15px' }}
        onClick={handleRunSimulation}
        disabled={processing}
      >
        {processing ? 'Running...' : 'Submit'}
      </button>

    </div>
      </div>
      <div className="col-6">
      <div className="config text-center mt-5">
      <div className="card bgcard2">
      <div className="result mt-5 text-white">
        <h3>Filtered Pairs:</h3>
        {pairs.length > 0 ? (
          pairs.map((pair, index) => (
            <div key={index} className="pair-card">
              <p className="text-yellow-500"><strong>{pair.token0.symbol}</strong> / <strong >{pair.token1.symbol}</strong></p>
              <p className=""> <strong>Reserve USD:</strong> ${Number(pair.reserveUSD).toFixed(2)}</p>
              <p className="text-start"><strong>Token Address:</strong> ${pair.id}</p>
            </div>
          ))
        ) : (
          <p>No pairs found.</p>
        )}
      </div>
      </div>
      <p className="fw-bold fs-5">Filter pair</p>
      <input
        type="text"
        className="w-100 py-2 mt-3 bg-black"
        placeholder="Enter First"
        name="first"
        value={formData.first}
        onChange={handleChangePair}
      />
      <input
        type="text"
        className="w-100 py-2 mt-3 bg-black"
        placeholder="Enter skip"
        name="skip"
        value={formData.skip}
        onChange={handleChangePair}
      />
      <input
        type="text"
        className="w-100 py-2 mt-3 bg-black"
        placeholder="Enter minLiquidity"
        name="minLiquidity"
        value={formData.minLiquidity}
        onChange={handleChangePair}
      />
      <input
        type="text"
        className="w-100 py-2 mt-3 bg-black"
        placeholder="Enter maxLiquidity"
        name="maxLiquidity"
        value={formData.maxLiquidity}
        onChange={handleChangePair}
      />
      <button
        className="btn btn-pink w-50 mt-3 fw-bold py-2"
        style={{ fontSize: '15px' }}
        onClick={handleSubmitPair}
      >
        Submit
      </button>
      
     
    </div>
      </div>
    </div>
           
           
          
        </div>
      </div>
   </>
  );
}

export default Admin;
