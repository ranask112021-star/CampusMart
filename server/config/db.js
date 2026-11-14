import mongoose from "mongoose";

let connectionPromise;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    if (!process.env.MONGO_URI) {
      return Promise.reject(new Error("MONGO_URI is required to connect to MongoDB."));
    }

    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB connected");
        return mongoose;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
