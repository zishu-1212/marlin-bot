import React, { useEffect, useState } from 'react';
import logo from "../../assets/logo.png";

function Nav() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="" style={{ borderBottom: "1px solid rgb(232 198 110)" }}>
      <div className='container-fluid py-2'>
        <div className="d-block d-md-flex  justify-content-between text-white align-items-center">
          <div className='fw-bold d-md-block d-flex  justify-content-between '>
            <img src={logo} alt="Logo" width={100} className='m-auto' />
          </div>
          <div className='fw-bold' style={{ fontSize: "15px" }}>
            Welcome to Marlinn Bot
          </div> 
          <div className='fw-bold' style={{ fontSize: "13px" }}>
            <span style={{ fontSize: "18px" }}>
              {time.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>  
            <span className='ms-2' style={{ fontSize: "16px" }}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span> 
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nav;
