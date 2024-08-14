const express =require("express")
const { createUser, sendOtpForVerifyEmail, verifyOtp, generatePdf, generateExcelFile, addCustomerToStripe, webHooks, webhooks } = require("../controller/user")

const router  = express.Router()


router.post("/create",createUser)
router.post("/send-email",sendOtpForVerifyEmail)
router.post("/verify-email",verifyOtp)
router.get("/generate-pdf",generatePdf)
router.get("/generate-excel",generateExcelFile)
router.post("/add-customer-stripe",addCustomerToStripe)
router.post("/webhook",webhooks)
module.exports= router