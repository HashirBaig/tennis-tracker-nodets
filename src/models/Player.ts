import { Schema, model } from "mongoose";

export interface IPlayer {
  playerName: string;
  createdDate: Date;
}

const playerSchema = new Schema<IPlayer>(
  {
    playerName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON: {
      // Expose Mongo's _id as `id`, matching the shape of your user object.
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Player = model<IPlayer>("Player", playerSchema);
