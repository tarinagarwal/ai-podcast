import express from "express";
import multer from "multer";
import { Podcast } from "../models/Podcast.js";
import { generatePodcastScript, generateAudio } from "../utils/groqService.js";
import { generateAvatarVideo } from "../utils/heygenService.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get all podcasts
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const podcasts = await Podcast.findAll(parseInt(limit), parseInt(offset));
    res.json({
      success: true,
      data: podcasts,
    });
  } catch (error) {
    console.error("Get podcasts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch podcasts",
    });
  }
});

// Get single podcast
router.get("/:id", async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: "Podcast not found",
      });
    }

    res.json({
      success: true,
      data: podcast,
    });
  } catch (error) {
    console.error("Get podcast error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch podcast",
    });
  }
});

// Create new podcast
router.post("/", upload.single("knowledgeFile"), async (req, res) => {
  try {
    const { title, description, length, knowledgeText } = req.body;

    if (!title || !length || (!knowledgeText && !req.file)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, length, and knowledge base",
      });
    }

    // Get knowledge base content
    let knowledgeBase = knowledgeText || "";
    if (req.file) {
      knowledgeBase = req.file.buffer.toString("utf-8");
    }

    // Create podcast record
    const podcast = await Podcast.create({
      title,
      description,
      knowledge_base: knowledgeBase,
      length,
    });

    // Start async processing
    processPodcast(podcast.id);

    res.status(201).json({
      success: true,
      data: podcast,
      message: "Podcast creation started. Processing in background.",
    });
  } catch (error) {
    console.error("Create podcast error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create podcast",
    });
  }
});

// Delete podcast
router.delete("/:id", async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: "Podcast not found",
      });
    }

    await Podcast.delete(req.params.id);

    res.json({
      success: true,
      message: "Podcast deleted successfully",
    });
  } catch (error) {
    console.error("Delete podcast error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete podcast",
    });
  }
});

// Background processing function
async function processPodcast(podcastId) {
  try {
    await Podcast.updateStatus(podcastId, "processing");

    const podcast = await Podcast.findById(podcastId);
    if (!podcast) throw new Error("Podcast not found");

    console.log(`🎙️ Processing podcast ${podcastId}: ${podcast.title}`);

    // Step 1: Generate script
    console.log("📝 Generating script...");
    const script = await generatePodcastScript(
      podcast.knowledge_base,
      podcast.length
    );
    await Podcast.update(podcastId, { script });

    // Step 2: Generate video with audio
    console.log("🎥 Generating video...");
    const videoPath = await generateAvatarVideo(script, podcastId);

    await Podcast.update(podcastId, {
      video_path: videoPath,
      audio_path: videoPath, // HeyGen provides both video and audio
    });

    // Update status to completed
    await Podcast.updateStatus(podcastId, "completed");

    console.log(`✅ Podcast ${podcastId} completed successfully`);
  } catch (error) {
    console.error(`❌ Error processing podcast ${podcastId}:`, error);
    await Podcast.updateStatus(podcastId, "error", error.message);
  }
}

export default router;
