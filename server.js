// server.js
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/Users.js";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ===================== Wasabi S3 Test =================
const s3 = new S3Client({
  region: process.env.WASABI_REGION,
  endpoint: process.env.WASABI_ENDPOINT,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY,
    secretAccessKey: process.env.WASABI_SECRET_KEY,
  },
});

app.get("/test-wasabi", async (req, res) => {
    try {
        const data = await s3.send(new ListBucketsCommand({}));
        res.json({
            message: "Wasabi Connected Successfully 🚀",
            buckets: data.Buckets
        });
    } catch (err) {
        res.status(500).json({
            message: "Wasabi Connection Failed ❌",
            error: err.message
        });
    }
});

/* ================= CRUD API ================= */

// CREATE
app.post("/users", async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// READ ALL
app.get("/users", async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
});

// READ ONE
app.get("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

// UPDATE
app.put("/users/:id", async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(user);
});

// DELETE
app.delete("/users/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
});

app.listen(port, () => {
    console.log("Server running on " + port);
});