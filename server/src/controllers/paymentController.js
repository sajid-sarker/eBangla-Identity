import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SSLCommerzPayment = require('sslcommerz-lts');

import TaxRecord from "../models/TaxRecord.js";

// Initiate Payment
export const initiatePayment = async (req, res) => {
  const { recordId } = req.params;

  try {
    const record = await TaxRecord.findById(recordId).populate("user");
    if (!record) return res.status(404).json({ message: "Record not found" });

    const tran_id = `TXN-${Date.now()}`; 

    const data = {
      total_amount: record.taxAmount,
      currency: "BDT",
      tran_id: tran_id,
      success_url: process.env.SUCCESS_URL,
      fail_url: process.env.FAIL_URL,
      cancel_url: process.env.CANCEL_URL,
      ipn_url: "http://localhost:5000/api/payment/ipn",
      shipping_method: "NO",
      product_name: `Tax ${record.fiscalYear}`,
      product_category: "Govt Fee",
      product_profile: "non-physical-goods",
      cus_name: record.user?.name || "Citizen",
      cus_email: record.user?.email || "test@test.com",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: record.user?.phone || "01700000000",
    };

    const sslcz = new SSLCommerzPayment(
      process.env.STORE_ID, 
      process.env.STORE_PASS, 
      false 
    );
    
    const apiResponse = await sslcz.init(data);
    
    if (apiResponse?.GatewayPageURL) {
      record.transactionId = tran_id;
      await record.save();
      
      console.log("✅ SSLCommerz Session Created. ID:", tran_id);
      return res.status(200).json({ url: apiResponse.GatewayPageURL });
    } else {
      console.error("❌ SSLCommerz Init Failed:", apiResponse);
      return res.status(400).json({ 
        message: apiResponse?.failedreason || "Payment initiation failed" 
      });
    }

  } catch (error) {
    console.error("Detailed Payment Init Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

 
export const paymentSuccess = async (req, res) => {
  const { tran_id } = req.body; 
  
  console.log("--- Payment Success Callback Received ---");

  try {
    // Find and update status to "Paid"
    const result = await TaxRecord.findOneAndUpdate(
      { transactionId: tran_id },
      { 
        status: "Paid", 
        paidAt: new Date() 
      },
      { returnDocument: "after" }
    );

    if (result) {
      console.log("✅ Database Updated: Status is now PAID");
      const yearQuery = result.fiscalYear ? `?year=${encodeURIComponent(result.fiscalYear)}&status=success` : "?status=success";
      return res.redirect(`${process.env.FRONTEND_URL}/tax-records${yearQuery}`);
    } else {
      console.error("⚠️ Record not found for tran_id:", tran_id);
      return res.redirect(`${process.env.FRONTEND_URL}/tax-records`);
    }

  } catch (err) {
    console.error("❌ Database Update Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/tax-records`);
  }
};

 
export const paymentFail = async (req, res) => {
  const { tran_id } = req.body;
  console.log("❌ Payment Failed for:", tran_id);
  
  try {
    // We keep it as Pending so they can try again
    await TaxRecord.findOneAndUpdate(
        { transactionId: tran_id },
        { status: "Pending" } 
    );
    res.redirect(`${process.env.FRONTEND_URL}/tax-records`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/tax-records`);
  }
};

 
export const paymentCancel = async (req, res) => {
  console.log("ℹ️ Payment Cancelled by User");
  res.redirect(`${process.env.FRONTEND_URL}/tax-records`);
};