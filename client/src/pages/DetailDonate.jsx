import React from "react";
import { useParams } from "react-router-dom";

import DonationInfo from "../components/DetailDonate-ViewFund/DonationInfo";

import DonationApproved from "../components/DetailDonate-ViewFund/DonationApproved";

export default function DetailDonate() {
  const title = "Detail donate";
  document.title = title + " - Hollyways";
  //params
  const params = useParams();
  return (
    <>
      <div className="container-fluid bg-light">
        <div className="container">
          <DonationInfo params={params} isViewFund={false} />
          <DonationApproved params={params} isApproved={true} />
        </div>
      </div>
    </>
  );
}
