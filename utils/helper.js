const nodemailer =require("nodemailer")
const wkhtmltopdf = require("wkhtmltopdf")
const xlsx = require("xlsx")
const path = require("path")
const fs = require("fs")

const success=(res,msg ="",statusCode=200,data) =>{
    let result ={}
    if(msg){
        result.message = msg
        result.statusCode = statusCode
    }
    if(data){
        result.data = data
    }

    return res.status(statusCode).json(result)

}


const failure = (res,msg="",statusCode=400)=>{
    console.log(/ojeofefj/);
    let result ={}

    result.message=msg
    result.statusCode = statusCode
    console.log(/result/,result);
    return res.status(statusCode).json(result)
}

const generateMailTransporter=()=>
 transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "ae3a3ef02b1767",
      pass: "3bed5b613c640b"
    }
  });


  const pdfCreate  = (template,options)=>{
    const pdfStream  = wkhtmltopdf(template,options)
    pdfStream.pipe(fs.createWriteStream("sample.pdf"))
    pdfStream.on("end",()=>{
        console.log("pdf generated");
    })
    pdfStream.end()
    pdfStream.on("error",(error)=>{
        console.log(/e/,error);
    })
  }


  const generateExcelSheet = (userData)=>{
    const workbook =xlsx.utils.book_new()
    // const userDetail = userData.map((val)=>{
    //     console.log(/val/,val.user_id);
    //     return {
    //         "Id":val._id||"-",
    //         "user Id": val.user_id||"-",
    //         "email":val.email||"-",
    //         "name":val.name||"-",
    //         "given Name":val.given_name ||"-",
    //         "family Name":val.family_name ||"-",
    //         "nick Name":val.nickname||"-",
    //         "last Ip":val.last_ip ||"-",
    //         "logins Count": val.logins_count||"-",
    //         "created At":val.created_at||"-",
    //         "updated At":val.updated_at||"-",
    //         "last Login":val.last_login|| "-",
    //         "email Verified":val.email_verified ||"-",
    //         "Is verified":val.isVerified||"-"
    //     }
    // })

    // const userDetail =[]
    // userData.forEach((val)=>{
    //     console.log(/val........./,val);
    //     console.log('user_id', val.user_id); // Log only the user_id property
    //     userDetail.push({
    //                 id:val._id||"-",
    //                 userId: val.user_id||"-",
    //                 "email":val.email||"-",
    //                 "name":val.name||"-",
    //                 "given Name":val.given_name ||"-",
    //                 "family Name":val.family_name ||"-",
    //                 "nick Name":val.nickname||"-",
    //                 "last Ip":val.last_ip ||"-",
    //                 "logins Count": val.logins_count||"-",
    //                 createdAt:val.created_at||"-",
    //                 "updated At":val.updated_at||"-",
    //                 "last Login":val.last_login|| "-",
    //                 "email Verified":val.email_verified ||"-",
    //                 "Is verified":val.isVerified||"-"
    //     })
    // })
    const userDetail = [];
userData.forEach((val) => {

    const doc = val._doc
    userDetail.push({
        id: doc.id || "-",
        userId: doc.user_id || "-", // Access user_id directly
        email: doc.email || "-",
        name: doc.name || "-",
        "given Name": doc.given_name || "-",
        "family Name": doc.family_name || "-",
        "nick Name": doc.nickname || "-",
        "last Ip": doc.last_ip || "-",
        "logins Count": doc.logins_count || "-",
        createdAt: doc.created_at || "-",
        "updated At": doc.updated_at || "-",
        "last Login": doc.last_login || "-",
        "email Verified": doc.email_verified || "-",
        "Is verified": doc.isVerified || "-"
    });
});
    const  rideDetailArray= xlsx.utils.json_to_sheet(userDetail)
    const rideDetail = xlsx.utils.sheet_to_json(rideDetailArray,{header:1})
    const sheet=xlsx.utils.aoa_to_sheet(rideDetail)
    xlsx.utils.book_append_sheet(workbook,sheet,'sheet-1')
    const filePath = path.join(__dirname,"..","uploads","user_detail.xlsx")
    xlsx.writeFile(workbook,filePath)
    console.log(filePath);
    return filePath
  }

module.exports ={
    success,
    failure,
    generateMailTransporter,
    pdfCreate,
    generateExcelSheet
}