import { Router, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Match, IMatch } from "../models/Match";
import { Player } from "../models/Player";

const router = Router();

// POST ("/")
// @desc Create a match
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      playerOne,
      playerTwo,
      numberOfSets,
      numberOfGames,
      gamesWonByPlayerOne,
      gamesWonByPlayerTwo,
    } = req.body as {
      playerOne: string;
      playerTwo: string;
      numberOfSets: number;
      numberOfGames: number;
      gamesWonByPlayerOne: number;
      gamesWonByPlayerTwo: number;
    };

    // Basic presence validation
    if (
      !playerOne ||
      !playerTwo ||
      numberOfSets === undefined ||
      numberOfGames === undefined ||
      gamesWonByPlayerOne === undefined ||
      gamesWonByPlayerTwo === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (playerOne.trim() === playerTwo.trim()) {
      return res.status(400).json({
        message: "playerOne and playerTwo must be different players.",
      });
    }

    const playerNames = [playerOne.trim(), playerTwo.trim()];

    // 1. Find which of these players already exist
    const existingPlayers = await Player.find({
      playerName: { $in: playerNames },
    });

    const existingNames = new Set(existingPlayers.map((p) => p.playerName));
    const missingNames = playerNames.filter((name) => !existingNames.has(name));

    // 2. Bulk insert only the ones that don't exist yet
    let insertedPlayers: (typeof existingPlayers)[number][] = [];
    if (missingNames.length > 0) {
      insertedPlayers = await Player.insertMany(
        missingNames.map((playerName) => ({ playerName })),
        { ordered: false }, // don't stop on individual duplicate/validation errors
      );
    }

    // 3. Build a name -> id lookup from both existing + newly inserted
    const allPlayers = [...existingPlayers, ...insertedPlayers];
    const nameToId = new Map(allPlayers.map((p) => [p.playerName, p._id]));

    const playerOneId = nameToId.get(playerOne.trim());
    const playerTwoId = nameToId.get(playerTwo.trim());

    if (!playerOneId || !playerTwoId) {
      // Shouldn't happen, but guards against a failed insert silently dropping a player
      return res
        .status(500)
        .json({ message: "Failed to resolve one or both players." });
    }

    const match = await Match.create({
      playerOne: playerOneId,
      playerTwo: playerTwoId,
      numberOfSets,
      numberOfGames,
      gamesWonByPlayerOne,
      gamesWonByPlayerTwo,
    });

    const populated = await match.populate([
      { path: "playerOne" },
      { path: "playerTwo" },
    ]);

    return res
      .status(201)
      .json({ message: "successfuly", data: populated.toJSON() });
  } catch (error) {
    console.error("createMatch error:", error);
    return res.status(500).json({ message: "Failed to create match." });
  }
});

// GET ("/")
// @desc Get paginated match list
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 2);
    const skip = (page - 1) * limit;

    const [matches, totalCount] = await Promise.all([
      Match.find()
        .sort({ createdDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate("playerOne")
        .populate("playerTwo"),
      Match.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      message: "successful",
      data: matches.map((m) => m.toJSON()),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("getMatches error:", error);
    return res.status(500).json({ message: "Failed to fetch matches." });
  }
});

export default router;
