const { fund, payment, user } = require("../../models");

const midtransClient = require("midtrans-client");
const convertRupiah = require("rupiah-format");

exports.addUserDonate = async (req, res) => {
  const { fundId } = req.params;
  const userData = await user.findOne({
    where: { id: req.users.id },
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  const data = {
    ...req.body,
    fullname: userData.fullname,
    email: userData.email,
    status: "pending",
    proofAttachment: "proof.png",
    idUser: userData.id,
    idFund: fundId,
  };

  try {
    const userDonate = await payment.create(data);

    // Create Snap API instance here ...
    const snap = new midtransClient.Snap({
      //set to true if you want to production environment (Accept real transaction)
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Create parameter for Snap API here ...
    let parameter = {
      transaction_details: {
        order_id: userDonate.id,
        gross_amount: userDonate.donateAmount,
      },
      creditCard: {
        secure: true,
      },
      customer_details: {
        full_name: data.fullname,
        email: data.email,
        phone: "",
      },
    };

    // Create trasaction token & redirect_url with snap variable here ...
    const paymentResult = await snap.createTransaction(parameter);

    res.status(200).send({
      status: "success",
      paymentResult,
      data: {
        userDonate,
      },
    });
  } catch (error) {
    // console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

// Create configurate midtrans client with CoreApi here ...
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;

console.log(MIDTRANS_SERVER_KEY);
console.log(MIDTRANS_CLIENT_KEY);

const core = new midtransClient.CoreApi();
core.apiConfig.set = {
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
};
/**
 *  Handle update transaction status after notification
 * from midtrans webhook
 * @param {string} status
 * @param {transactionId} transactionId
 */

// Create function for handle https notification / WebHooks of payment status here ...
exports.notification = async (req, res) => {
  try {
    const statusResponse = await core.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(statusResponse);

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        // TODO set transaction status on your database to 'challenge'
        // and response with 200 OK
        sendEmail("pending", orderId); //sendEmail with status pending and order id
        handleTransaction("pending", orderId);
        res.status(200);
      } else if (fraudStatus == "accept") {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        sendEmail("success", orderId); //sendEmail with status success and order id
        handleTransaction("success", orderId);
        res.status(200);
      }
    } else if (transactionStatus == "settlement") {
      // TODO set transaction status on your database to 'success'
      // and response with 200 OK
      sendEmail("success", orderId); //sendEmail with status success and order id
      handleTransaction("success", orderId);
      res.status(200);
    } else if (transactionStatus == "cancel" || transactionStatus == "deny" || transactionStatus == "expire") {
      // TODO set transaction status on your database to 'failure'
      // and response with 200 OK
      sendEmail("failed", orderId); //sendEmail with status failed and order id
      handleTransaction("failed", orderId);
      res.status(200);
    } else if (transactionStatus == "pending") {
      // TODO set transaction status on your database to 'pending' / waiting payment
      // and response with 200 OK
      sendEmail("pending", orderId); //sendEmail with status pending and order id
      handleTransaction("pending", orderId);
      res.status(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const handleTransaction = async (status, orderId) => {
  const response = await payment.update(
    {
      status,
    },
    {
      where: {
        id: orderId,
      },
    }
  );
  console.log(response);
};

const sendEmail = async (status, orderId) => {
  // Config service and email account
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SYSTEM_EMAIL,
      pass: process.env.SYSTEM_PASSWORD,
    },
  });

  // Get order data
  let data = await payment.findOne({
    where: {
      id: orderId,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt", "password"],
    },
    include: [
      {
        model: fund,
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        },
      },
    ],
  });

  data = JSON.parse(JSON.stringify(data));
  console.log(data);

  // Email options content
  const mailOptions = {
    from: process.env.SYSTEM_EMAIL,
    to: data.email,
    subject: "Payment status",
    text: "Your payment is <br />" + status,
    html: `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Document</title>
                <style>
                  h1 {
                    color: brown;
                  }
                </style>
              </head>
              <body>
                <h2>Product payment :</h2>
                <ul style="list-style-type:none;">
                  <li>Name : ${data.fund.title}</li>
                  <li>Total payment: ${convertRupiah.convert(data.donateAmount)}</li>
                  <li>Status : <b>${status}</b></li>
                </ul>  
              </body>
            </html>`,
  };

  // Send an email if there is a change in the transaction status
  if (data.status != status) {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) throw err;
      console.log("Email sent: " + info.response);

      return res.send({
        status: "Success",
        message: info.response,
      });
    });
  }
};

exports.getUserDonateByFund = async (req, res) => {
  const { fundId } = req.params;
  try {
    const data = await payment.findAll({
      where: { idFund: fundId },
      attributes: { exclude: ["updatedAt"] },
    });
    res.status(200).send({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.editUserDonateByFund = async (req, res) => {
  try {
    const { fundId, userId } = req.params;

    await payment.update(req.body, { where: { idFund: fundId, id: userId } });

    const data = await fund.findOne({
      where: { id: fundId },
      include: [
        {
          model: payment,
          as: "usersDonate",
          attributes: { exclude: ["idUser", "idFund", "createdAt", "updatedAt"] },
        },
      ],
      attributes: { exclude: ["idUser", "createdAt", "updatedAt"] },
    });
    res.status(200).send({
      status: "success",
      data,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};
