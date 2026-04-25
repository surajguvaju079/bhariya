import mongoose, { Document } from "mongoose";
export type LoadStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ILoad extends Document {
  origin: string;
  destination: string;
  weight: number;
  vehicleTypeRequired: string;
  price: number;
  status: LoadStatus;
  driverId?: string;
}

const loadSchema = new mongoose.Schema<ILoad>(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    weight: { type: Number, required: true },
    vehicleTypeRequired: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    driverId: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Load = mongoose.model<ILoad>("Load", loadSchema);
