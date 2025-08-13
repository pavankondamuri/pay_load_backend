import express from "express";
import dotenv from "dotenv";
import connect from "./mongodb/mongodb.js";
import userRouter from "./routes/userroutres.js";
import cors from "cors";
import companyRouter from "./routes/company.routes.js";
import vendorRouter from "./routes/vendor.routes.js";
import loadTypeRouter from "./routes/loadType.routes.js";
import paymentRouter from "./routes/payment.routes.js";

dotenv.config();
const app=express();
app.use(express.json());
app.use(cors(
    
));
const PORT=process.env.PORT || 3000;

app.get("/",(req,res)=>{
    res.send("Hello World");
});

//user routes
app.use("/api/user",userRouter);

//company routes
app.use("/api/company",companyRouter);

//vendor routes
app.use("/api/vendor",vendorRouter);

//load type routes
app.use("/api/loadtype",loadTypeRouter);

//payment routes
app.use("/api/payments", paymentRouter);

connect();
app.listen(PORT,()=>{
    console.log(`Server is going to start on port http://localhost:${PORT}`);
});
