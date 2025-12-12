import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import Clip from "../models/Clip.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { deleteFromGridFs, upload, uploadToGridFS } from "../utils/storage.js";
import type { RequiredUserRequest } from "../types/types.js";
import { GridFSBucket, ObjectId } from "mongodb";
import { spawn } from "child_process";

const clipsRouter = express.Router();

let gfsBucket;
const conn = mongoose.connection;

conn.once("open", () => {
  if (conn.db) {
    gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "videos",
    });
  }
});

clipsRouter.post(
  "/upload",
  requireAuth,
  upload.single("video"),
  async (req: Request, res: Response) => {
    const { user } = req as RequiredUserRequest;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }
      console.log(1);
      const { title, description, tags, isPublic } = req.body;

      const id = await uploadToGridFS(conn.db, req.file);
      const clip = new Clip({
        userId: user._id,
        filename: req.file.fieldname,
        originalName: req.file.originalname,
        fileId: id,
        title: title,
        description: description,
        tags: tags ? JSON.parse(tags) : [],
        isPublic: isPublic !== "false",
        size: req.file.size,
      });
      console.log("value assigned");
      await clip.save();
      console.log("saved");
      return res.status(201).json({
        message: "clip uploaded successfully",
        clip: clip.toObject(),
      });
    } catch (err) {
      console.error("Upload error:", err);
      return res
        .status(500)
        .json({
          message: err instanceof Error ? err.message : "Unknown error",
        });
    }
  }
);

clipsRouter.get("/", optionalAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const query = {
      $or: [
        { isPublic: true },
        { userId: req.user?._id ?? new mongoose.Types.ObjectId() },
      ],
    };
    const clips = await Clip.find(query)
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Clip.countDocuments(query);

    res.json({
      clips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});
clipsRouter.get('/user/:userId', optionalAuth, async (req:Request, res:Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query = {
      userId: req.params.userId  ??'' ,
      $or: [
        { isPublic: true },
        { userId: req.user?._id ?? '' }
      ]
    };

    const clips = await Clip.find(query)
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Clip.countDocuments(query);

    res.json({
      clips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Get clips for current user
clipsRouter.get('/my-clips', requireAuth, async (req:Request, res:Response) => {
    const { user } = req as RequiredUserRequest;
    
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const clips = await Clip.find({ userId: user._id  })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Clip.countDocuments({ userId:user._id  });

    res.json({
      clips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

clipsRouter.get("/:id", optionalAuth, async (req: Request, res: Response) => {
  try {
    const clip = await Clip.findById(req.params.id).populate(
      "userId",
      "username"
    );
    if (!clip) {
      return res.status(404).json({ message: "Clip not Found" });
    }
    if (
      !clip.isPublic &&
      clip.userId._id.toString() !== req.user?._id?.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    clip.views += 1;
    await clip.save();

    res.json({ clip });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

clipsRouter.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as RequiredUserRequest;
  if (!user) {
    res.status(401).json({ message: "unAuthenticated" });
  }
  try {
    console.log(1)
    const clip = await Clip.findById(req.params.id);
    console.log(clip)
    if (!clip) {
      return res.status(404).json({
        message: "Clip not found",
      });
    }
    console.log(2)
    if (clip.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "you cna only edit your own Clips" });
    }
    console.log(3)
    const { title, description, tags, isPublic } = req.body || {};
    
    
    clip.title = title || clip.title;
    
    clip.description = description || clip.description;
    console.log(description)
    clip.tags = tags || clip.tags;
    console.log(tags)
    clip.isPublic = isPublic !== undefined ? isPublic : clip.isPublic;
    console.log(4)
    await clip.save();
    console.log(5)
    res.json({
      message: "clip updated Successfully",
      clip: clip.toObject(),
    });
    console.log(6)
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

clipsRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as RequiredUserRequest;
  if (!user) {
    res.status(401).json({ message: "unAuthenticated" });
  }
  try {
    const clip = await Clip.findById(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    if (clip.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can Delete only  your own clips" });
    }

    // Delete from GridFs
    if (clip.fileId) {
      await deleteFromGridFs(conn.db, clip.fileId.toString());
    }
    await Clip.deleteOne({ _id: clip._id });
    res.json({
      message: "Clip deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

clipsRouter.get("/stream/:id", async (req: Request, res: Response) => {
  try {
    const clip = await Clip.findById(req.params.id);
    if (!clip) return res.status(404).json({ message: "Clip not found" });
    if(!conn.db){
        res.json({message: 'db not found db error'})
        return 
    }
    const bucket = new GridFSBucket(conn.db, { bucketName: "videos" });
    const fileStream = bucket.openDownloadStream(new ObjectId(clip.fileId));

    // FFmpeg re-encode pipeline
    const ffmpeg = spawn("ffmpeg", [
      "-i", "pipe:0",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-c:a", "aac",

      // Allow mp4 streaming over a pipe!!
      "-movflags", "frag_keyframe+empty_moov",

      "-f", "mp4",
      "pipe:1"
    ]);

    res.setHeader("Content-Type", "video/mp4");
    res.status(200);

    fileStream.pipe(ffmpeg.stdin);

    ffmpeg.stdout.pipe(res);

    ffmpeg.stderr.on("data", (d) =>
      console.log("FFmpeg:", d.toString())
    );

    ffmpeg.on("error", (err) => {
      console.error("FFmpeg error:", err);
      res.end();
    });

  } catch (err) {
    res.status(500).json({ message: err });
  }
});
export default clipsRouter;
