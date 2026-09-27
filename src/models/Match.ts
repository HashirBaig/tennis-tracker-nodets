import { Schema, model, Types } from "mongoose";

export interface IMatch {
  playerOne: Types.ObjectId;
  playerTwo: Types.ObjectId;
  numberOfSets: number;
  numberOfGames: number;
  gamesWonByPlayerOne: number;
  gamesWonByPlayerTwo: number;
  createdDate: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    playerOne: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    playerTwo: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    numberOfSets: { type: Number, required: true },
    numberOfGames: { type: Number, required: true },
    gamesWonByPlayerOne: { type: Number, required: true, default: 0 },
    gamesWonByPlayerTwo: { type: Number, required: true, default: 0 },
    createdDate: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Match = model<IMatch>("Match", matchSchema);
