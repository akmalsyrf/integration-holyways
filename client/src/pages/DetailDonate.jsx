import React from "react";
import { useParams } from "react-router-dom";

import DonationInfo from "../components/DetailDonate-ViewFund/DonationInfo";

import DonationApproved from "../components/DetailDonate-ViewFund/DonationApproved";

export default function DetailDonate() {
  //params
  const params = useParams();
  return (
    <>
      <div className="container-fluid bg-light">
        <div className="container">
          <DonationInfo params={params} />
          <DonationApproved params={params} isApproved={true} />
        </div>
      </div>
    </>
  );
}
