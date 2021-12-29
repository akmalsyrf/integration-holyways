import React, { useContext, useState, useEffect } from "react";
import ProfilePic from "../assets/img/ava.png";
import { UserContext } from "../context/UserContext";

import Donations from "../data/donationData";
import { Rupiah } from "../data/rupiahFormat";

import { API } from "../config/api";

export default function Profile() {
  const [state] = useContext(UserContext);

  const [funds, setFunds] = useState([]);
  const getFunds = async () => {
    try {
      const response = await API.get("/funds");
      setFunds(response.data.data.funds);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getFunds();
  }, []);
  return (
    <>
      <div className="container-fluid vh-100 py-5 d-flex bg-light justify-content-center">
        {/* user info */}
        <div className="col-6">
          <h3 className="mb-4 fw-bold">My Profile</h3>
          <div className="d-flex justify-content-start">
            <div className="col-4">
              <img src={ProfilePic} alt="profile" width="180px" className="rounded" />
            </div>
            <div className="col-8">
              <div className="info">
                <h5 className="text-danger fw-bold">Full Name</h5>
                <p className="text-secondary">{state.user.fullname}</p>
              </div>
              <div className="info">
                <h5 className="text-danger fw-bold">Email</h5>
                <p className="text-secondary">{state.user.email}</p>
              </div>
              <div className="info">
                <h5 className="text-danger fw-bold">Phone</h5>
                <p className="text-secondary">0812-3456-7890</p>
              </div>
            </div>
          </div>
        </div>
        {/* history */}
        <div className="col-4">
          <h3 className="me-5 fw-bold mb-4">History Donation</h3>
          {funds.map((fund) => {
            for (let i = 0; i < fund.usersDonate.length; i++) {
              if (state.user.id === Number(fund.usersDonate[i].idUser)) {
                const total = Rupiah(fund.usersDonate[i].donateAmount);
                return (
                  <div className="px-3 py-4 mb-2" style={{ backgroundColor: "white", width: "580px" }} key={fund.id}>
                    <h5>{fund.title}</h5>
                    <p>Saturday, 12 April 2021</p>
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold text-danger">Total : {total}</p>
                      <button className="btn btn-light text-success fw-bold px-5">Finished</button>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })}
        </div>
      </div>
    </>
  );
}
