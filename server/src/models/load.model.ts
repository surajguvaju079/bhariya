import mongoose, { Document } from "mongoose";

export type LoadStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface ILoad extends Document {
  origin: string;
  originCoords: IGeoPoint;
  destination: string;
  destinationCoords: IGeoPoint;
  weight: number;
  vehicleTypeRequired: string;
  price: number;
  status: LoadStatus;
  driverId?: string;
}

const geoPointSchema = new mongoose.Schema<IGeoPoint>(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false },
);

const loadSchema = new mongoose.Schema<ILoad>(
  {
    origin: { type: String, required: true },
    originCoords: { type: geoPointSchema, required: true },
    destination: { type: String, required: true },
    destinationCoords: { type: geoPointSchema, required: true },
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
  { timestamps: true },
);

loadSchema.index({ originCoords: "2dsphere" });

export const Load = mongoose.model<ILoad>("Load", loadSchema);
