const { User } = require("../model/user");
const bcrypt = require("bcrypt")
const { failure, success, transport, generateMailTransporter, pdfCreate, generateExcelSheet } = require("../utils/helper");
const template = require("../views/template");
const xlsx =require("xlsx")
const fs = require("fs")
const util = require("util")
const unLinkFile = util.promisify(fs.unlink)
const key = process.env.SK_KEY
const stripe = require("stripe")(key)
let createCharge
let pdfData
let addStripeCustomer
let customerSource
exports.createUser = async(req,res)=>{
    try {
        const {name,email,password,city} = req.body
        console.log(req.body);
        const userExist = await User.findOne({email})
        console.log(userExist);
        if(userExist){
            return failure(res,"user already exist",401)
        }
        const hashPassword =await bcrypt.hash(password,10)
        studentData=await User.create({
            name:name,
            email:email,
            password:hashPassword,
            city:city
        })

        return success(res,"user created successfully",201)
    } catch (error) {
        console.log(error);
    }
}


exports.sendOtpForVerifyEmail = async(req,res)=>{
    try {
        const {email} =req.body
        const userExist = await User.findOne({email})

        console.log(userExist);
        console.log(userExist.email);


        if(!userExist){
            return failure(res,"user not exist",404)
        }

        if(userExist.isVerified==1){
            return failure(res,"")
        }

        let otp=''
        const otpLength =6

        for(let i=0;i<otpLength;i++){
            otp += Math.floor(Math.random()*10)
        }

         userExist.otp = otp
        await userExist.save()
        const transport = generateMailTransporter()
        transport.sendMail({
            from:"parsaniya&company",
            to:userExist.email,
            subject:"verify otp",
            html:`<h1>${otp}</h1>`
        })

        return success(res,"email is send to your email address",200)

    } catch (error) {
        console.log(error);
    }
}


exports.verifyOtp = async(req,res)=>{
    try {
        const {email,otp}= req.body

        const userExist = await User.findOne({email})

        if(!userExist){
            return failure(res,"user not exist",404)
        }

        if(userExist.isVerified==1){
            return failure(res,"user already verified",401)
        }

        if(otp != userExist.otp){
            return failure(res,"please enter valid otp",401)
        }

        userExist.isVerified =1
        userExist.otp=""
        await userExist.save()

        return success(res,"user verify successfully",200)
    } catch (error) {
        console.log(error);
    }
}

exports.generatePdf = async(req,res)=>{
    try {
        const printData = {
            itemOneQty:4,
            itemOnePrice:`${20}`,
            itemOneTotal:`${80}`,
            amount:8000
        }
        const templateData = template(printData)
        const options ={
            pageSize:'A4'
        }
        const data = pdfCreate(templateData,options)
        return success(res,"pdf generated successfully",200,data)
    } catch (error) {
        console.log(error);
    }
}

exports.generateExcelFile = async(req,res)=>{
    try {
        const userDetail =await User.find()
        const filePath  = generateExcelSheet(userDetail)
        const fileStream = fs.createReadStream(filePath)
        res.set('content-path',`attachment;filename=${'user_detail.xlsx'}`) 
        res.set('content-type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        fileStream.on("end",()=>{
            console.log("file generated");
            unLinkFile(filePath)
        })
         pdfData=fileStream.pipe(res)
         console.log(/pdfData/,pdfData);
        // return success(res,"sheet generated",200,fileStream)
        // return success(res,"user list fetched successfully",200,userDetail)
    } catch (error) {
        console.log(error);
    }
}


exports.addCustomerToStripe= async (req,res)=>{
    try {
        const {email,totalamount} = req.body
        const userDetail =await User.findOne({email})

        if(!userDetail){
            return failure(res,"user not exist",404)
        }
        if(!userDetail.chargeId){
             addStripeCustomer = await stripe.customers.create({
              email:userDetail.email,
              address: {
                line1: '',
                postal_code: '',
                city: '',
                state: '',
                country: 'india',
               },
              name:userDetail.name
          })

          const charge_id = addStripeCustomer.id
          userDetail.chargeId= charge_id
          await userDetail.save()
        }
        
        // console.log(userDetail);

        // const createCardToken = await stripe.tokens.create({
        //     card:{
        //         number:"411111111111",
        //         exp_month:12,
        //         exp_year:2025,
        //         cvc:111
        //     }
        // })
        // console.log(/createCardToken/,createCardToken);
        // const card = await stripe.customers.createSource(userDetail.chargeId,{
        //     source:createCardToken.id
        // })

        // console.log(/card/,card);

        // const setupIntent = await stripe.setupIntents.create({
        //     payment_method_types: ['card'],
        //   });

        // console.log(/stup/,setupIntent);



        customerSource = await stripe.customers.createSource(userDetail.chargeId,
          {
            source: 'tok_visa',
          });

        // console.log(/customerSource/,customerSource);
        
         createCharge = await stripe.paymentIntents.create({
            amount:parseFloat((totalamount*100).toFixed(2)),
            currency:"inr",
            customer:userDetail.chargeId,
            // payment_method_types: ['card'],
            automatic_payment_methods: {
                enabled: true,
                allow_redirects:"never"
              },
            capture_method: "manual" ,
            confirm:true,
        })
        // charge = yield stripe.charges.c(charge_id, {
        //     amount: parseFloat((total_amount * 100).toFixed(2)),
        //   });
        console.log(/chargeId/,createCharge['client_secret']);
        console.log(/createCharge/,createCharge);


        // const elements = stripe.elements()
        // const cardElement  = elements.create('card') 

        // const { error, paymentMethod } = await stripe.createPaymentMethod({
        //     type: 'card',
        //     card: cardElement, // The cardElement created by Stripe Elements
        // });

        // const confirmedPaymentIntent = await stripe.paymentIntents.confirm(createCharge.id, {
        //     payment_method: paymentMethod.id,
        // });
        
        // const paymentIntents = await stripe.paymentIntents.confirm(createCharge.id)
        // console.log(/paymentIntents/,paymentIntents);

        // const { error, paymentIntent } = await stripe.confirmCardPayment("pk_test_51ORrT6SDQyc5ysQG4XZydsMt6Ti3LqyCxXdLe4xeZ6mORw6UA7fryPpcPrFY81ASdIvHNfwduyOkawaAh3cdrJbs00ZmRIWvFI");

        // if (error) {
        //   // Handle error
        //   console.error('Error confirming payment:', error);
        //   alert('Payment failed: ' + error.message);
        // } else if (paymentIntent.status === 'succeeded') {
        //   // Payment succeeded
        //   console.log('Payment succeeded!');
        //   alert('Payment succeeded!');
        // } else if (paymentIntent.status === 'requires_action') {
        //   // Additional authentication required
        //   console.log('Additional authentication required.');
        // }
      
    

        // const charge = await stripe.paymentIntents.capture(paymentIntents.id)
        // ,{
        //     amount: parseFloat((totalamount*100).toFixed(2))
        // })

    //    const charge = await stripe.charges.capture(createCharge.id, {
    //         amount: parseFloat((totalamount * 100).toFixed(2)),
    //       });
    

        // console.log(/charge/,charge);

        return success(res,"charge created successfully",200,createCharge)


    } catch (error) {
        console.log(error);
    }
}
exports.webhooks = (req,res)=>{
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = "whsec_ZLoKmjw2j7mGfMnTWNOmF9dD4El56Yc1"
        let event 
        event = stripe.webhooks.constructEvent(req.rawBody, sig,endpointSecret);
        console.log(/event/,event);
        switch (event.type) {
            case 'customer.source.created':
                console.log(/addStripeCustomer/);
                console.log(addStripeCustomer);
            //   const paymentIntent = event.data.object;
              // Then define and call a method to handle the successful payment intent.
              // handlePaymentIntentSucceeded(paymentIntent);
              break;
            case 'payment_intent.created':
                console.log(/charge created/);
                console.log(createCharge);
            //   const paymentMethod = event.data.object;
              // Then define and call a method to handle the successful attachment of a PaymentMethod.
              // handlePaymentMethodAttached(paymentMethod);
              break;
            // ... handle other event types
            case 'issuing_card.created':
                console.log(/card created/);
                console.log(customerSource);
             break
            default:
              console.log(`Unhandled event type ${event.type}`);
          }
        
          // Return a response to acknowledge receipt of the event
          res.json({received: createCharge?createCharge:addStripeCustomer});
    }catch (error) {
        console.log(error);
    }
}


