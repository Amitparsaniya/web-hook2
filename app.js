const express =require("express")
const crypto  = require("crypto")
require("dotenv").config()
require("./DB/index")
const app =express()
const os = require("os")
const userRouter = require("./router/user")
app.use(express.json({
    verify:(req,res,buf)=>{
        req.rawBody=buf
    }
}))
app.use("/api/user",userRouter)

// const cpuLength = os.cpus().length
// console.log(cpuLength);
// const MAX_CALL=16
// process.env.UV_THREADPOOL_SIZE=8
// const start= Date.now()
//     crypto.pbkdf2Sync("password","salt",100000,512,"sha512")
//     crypto.pbkdf2Sync("password","salt",100000,512,"sha512")

// console.log("hash: ",Date.now()-start);

app.listen(3000,()=>{
    console.log("server is up on the port 3000");
})