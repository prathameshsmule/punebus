// utils/seedAdmin.js
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

const run = async () => {
  try {
    // connect (will use process.env.MONGO_URI if not passed)
    await connectDB();

    const email = process.env.SEED_ADMIN_EMAIL || "admin@punebus.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "admin1234";
    const name = process.env.SEED_ADMIN_NAME || "PuneBus Admin";
    const phone = process.env.SEED_ADMIN_PHONE || "0000000000";

    const hashed = await bcrypt.hash(password, 10);

    // upsert admin - update if exists otherwise insert
    const result = await User.findOneAndUpdate(
      { email: email, role: "admin" },
      {
        $set: {
          name,
          phone,
          email,
          role: "admin",
          password: hashed,
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Admin upserted:", { id: result._id.toString(), email: result.email });
    console.log("Credentials ->", { email, password });
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
};

run();
