const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const { DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET, DARAJA_SHORTCODE, DARAJA_PASSKEY, CALLBACK_URL } = process.env;

// Get access token
async function getAccessToken() {
  const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString("base64");
  const res = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.data.access_token;
}

// STK Push
app.post("/api/stkpush", async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const password = Buffer.from(DARAJA_SHORTCODE + DARAJA_PASSKEY + timestamp).toString("base64");

    const stkReq = {
      BusinessShortCode: DARAJA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: DARAJA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: "ElectroMart",
      TransactionDesc: "Payment for gadgets",
    };

    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkReq,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ success: true, data: stkRes.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: "M-Pesa STK push failed" });
  }
});

app.listen(process.env.PORT || 5000, () => console.log("Server running on port", process.env.PORT || 5000));
