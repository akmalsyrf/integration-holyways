import React, { useState, useEffect } from "react";

import ListDonateUser from "./ListDonate/ListDonateUser";

import { API } from "../../config/api";

export default function DonationApproved(props) {
  //get fund
  const [usersDonate, setUsersDonate] = useState([]);
  const getUsersDonate = async () => {
    try {
      const response = await API.get(`/usersDonate/${props.params.id}`);
      setUsersDonate(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUsersDonate();
  }, []);

  return (
    <>
      <div className="py-3">
        {props.isApproved ? (
          <>
            <h2 className="mb-2 fw-bold">List Donation (200)</h2>
            {usersDonate.map((donate) => {
              const fundId = props.params.id;
              if (donate.status === "success") {
                const props = {
                  userName: donate.fullname,
                  amount: donate.donateAmount,
                  usersDonateId: donate.id,
                  fundId,
                  proofAttachment: donate.proofAttachment,
                };
                return (
                  <>
                    <ListDonateUser {...props} isApproved={props.isApproved} />
                  </>
                );
              }
            })}
          </>
        ) : (
          <>
            <h2 className="mb-2 fw-bold">Donation has not been approved (10)</h2>
            {usersDonate.map((donate) => {
              const fundId = props.params.id;
              if (donate.status === "pending") {
                const props = {
                  userName: donate.fullname,
                  amount: donate.donateAmount,
                  usersDonateId: donate.id,
                  fundId,
                  proofAttachment: donate.proofAttachment,
                };
                return (
                  <>
                    <ListDonateUser {...props} isApproved={props.isApproved} />
                  </>
                );
              }
            })}
          </>
        )}
      </div>
    </>
  );
}
