import express from "express";
import { 
    initiatePayment, 
    paymentSuccess, 
    paymentFail, 
    paymentCancel 
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/payment/initiate/:recordId
 * @desc    Start the SSLCommerz payment session
 * @access  Private (Citizen only)
 */
router.get("/initiate/:recordId", protect, initiatePayment);

/**
 * @route   POST /api/payment/success
 * @desc    SSLCommerz callback on successful payment
 */
router.post("/success", paymentSuccess);

/**
 * @route   POST /api/payment/fail
 * @desc    SSLCommerz callback on failed payment
 */
router.post("/fail", paymentFail);

/**
 * @route   POST /api/payment/cancel
 * @desc    SSLCommerz callback on user cancellation
 */
router.post("/cancel", paymentCancel);

// Optional: IPN (Instant Payment Notification) for background verification
router.post("/ipn", (req, res) => {
    res.status(200).send("IPN Received");
});

export default router;