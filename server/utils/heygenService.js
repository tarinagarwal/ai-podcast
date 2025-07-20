import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const HEYGEN_API_BASE_V1 = "https://api.heygen.com/v1";
const HEYGEN_API_BASE_V2 = "https://api.heygen.com/v2";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export const generateAvatarVideo = async (script, podcastId) => {
  try {
    console.log(
      "🔍 Debug - HEYGEN_API_KEY value:",
      HEYGEN_API_KEY ? "Present" : "Missing"
    );
    console.log(
      "🔍 Debug - HEYGEN_API_KEY length:",
      HEYGEN_API_KEY ? HEYGEN_API_KEY.length : 0
    );
    console.log(
      "🔍 Debug - All env vars:",
      Object.keys(process.env).filter((key) => key.includes("HEYGEN"))
    );

    if (!HEYGEN_API_KEY) {
      throw new Error("HeyGen API key not configured");
    }

    console.log("🎥 Starting HeyGen multi-speaker avatar video generation...");

    // Parse script into speaker segments
    const videoInputs = createVideoInputsFromScript(script);
    console.log(
      `📝 Created ${videoInputs.length} video segments for conversation`
    );

    const videoId = await createHeyGenVideo(videoInputs);
    const videoPath = await pollAndDownloadVideo(videoId, podcastId);
    return videoPath;
  } catch (error) {
    console.error("HeyGen video generation error:", error);
    throw new Error(`Failed to generate avatar video: ${error.message}`);
  }
};

const createVideoInputsFromScript = (script) => {
  const lines = script.split("\n");
  const videoInputs = [];

  // Avatar and voice configurations
  const speakers = {
    Alex: {
      avatar_id: "Juan_sitting_sofa_side", // Current avatar (you can change this)
      voice_id: "1519fd8fe5d440a2b58770a6762511de", // Current voice
    },
    Jordan: {
      avatar_id: "Bojan_lying_lounge_side", // Different avatar for second speaker
      voice_id: "88c37edcb8e74b2388dfb288b786dba2", // Different voice (placeholder - you can change)
    },
  };

  let currentSpeaker = null;
  let currentDialogue = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and non-dialogue lines
    if (!trimmedLine || !trimmedLine.includes(":")) {
      continue;
    }

    // Check if this is a speaker line
    const speakerMatch = trimmedLine.match(/^(Alex|Jordan):\s*(.+)$/i);
    if (speakerMatch) {
      const speaker = speakerMatch[1];
      const dialogue = speakerMatch[2].trim();

      // If we have a different speaker or this is the first line
      if (currentSpeaker !== speaker) {
        // Save previous speaker's dialogue if exists
        if (currentSpeaker && currentDialogue.length > 0) {
          const combinedDialogue = currentDialogue.join(" ").trim();
          if (combinedDialogue && speakers[currentSpeaker]) {
            videoInputs.push(
              createVideoInput(
                currentSpeaker,
                combinedDialogue,
                speakers[currentSpeaker]
              )
            );
          }
        }

        // Start new speaker segment
        currentSpeaker = speaker;
        currentDialogue = [dialogue];
      } else {
        // Same speaker, add to current dialogue
        currentDialogue.push(dialogue);
      }
    }
  }

  // Don't forget the last speaker's dialogue
  if (currentSpeaker && currentDialogue.length > 0) {
    const combinedDialogue = currentDialogue.join(" ").trim();
    if (combinedDialogue && speakers[currentSpeaker]) {
      videoInputs.push(
        createVideoInput(
          currentSpeaker,
          combinedDialogue,
          speakers[currentSpeaker]
        )
      );
    }
  }

  console.log(`📊 Parsed script into ${videoInputs.length} speaker segments`);
  return videoInputs;
};

const createVideoInput = (speaker, dialogue, speakerConfig) => {
  // Clean up dialogue
  const cleanDialogue = dialogue
    .replace(/\[.*?\]/g, "") // Remove stage directions
    .replace(/\*.*?\*/g, "") // Remove actions
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Limit dialogue length for HeyGen (max ~2000 chars per segment)
  const maxLength = 1800;
  const finalDialogue =
    cleanDialogue.length > maxLength
      ? cleanDialogue.substring(0, maxLength) + "..."
      : cleanDialogue;

  console.log(
    `🎭 ${speaker}: "${finalDialogue.substring(0, 50)}..." (${
      finalDialogue.length
    } chars)`
  );

  return {
    character: {
      type: "avatar",
      avatar_id: speakerConfig.avatar_id,
      avatar_style: "normal",
    },
    voice: {
      type: "text",
      input_text: finalDialogue,
      voice_id: speakerConfig.voice_id,
    },
  };
};

const createHeyGenVideo = async (videoInputs) => {
  try {
    console.log("📝 Sending multi-speaker script to HeyGen API...");

    const requestBody = {
      test: false,
      caption: false,
      dimension: {
        width: 1280,
        height: 720,
      },
      video_inputs: videoInputs,
    };

    console.log(
      `🚀 Making request to HeyGen API with ${videoInputs.length} video segments...`
    );

    const response = await axios.post(
      `${HEYGEN_API_BASE_V2}/video/generate`,
      requestBody,
      {
        headers: {
          "X-API-Key": HEYGEN_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout for initial request
      }
    );

    console.log("📊 HeyGen API Response:", response.data);

    if (response.data && response.data.data && response.data.data.video_id) {
      console.log(
        `✅ HeyGen multi-speaker video creation initiated: ${response.data.data.video_id}`
      );
      return response.data.data.video_id;
    } else {
      console.error("❌ Invalid HeyGen response:", response.data);
      throw new Error("Invalid response from HeyGen API");
    }
  } catch (error) {
    console.error(
      "❌ HeyGen API error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      throw new Error("Invalid HeyGen API key");
    } else if (error.response?.status === 429) {
      throw new Error("HeyGen API rate limit exceeded");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("HeyGen API request timeout");
    }

    throw new Error(
      `HeyGen API error: ${error.response?.data?.message || error.message}`
    );
  }
};

const pollAndDownloadVideo = async (videoId, podcastId) => {
  try {
    console.log("⏳ Polling HeyGen for multi-speaker video completion...");

    let attempts = 0;
    const maxAttempts = 2000; // 20 minutes max wait time (10 second intervals)

    while (attempts < maxAttempts) {
      try {
        console.log(
          `📊 Checking video status (attempt ${attempts + 1}/${maxAttempts})...`
        );

        const statusResponse = await axios.get(
          `${HEYGEN_API_BASE_V1}/video_status.get?video_id=${videoId}`,
          {
            headers: {
              "X-API-Key": HEYGEN_API_KEY,
              accept: "application/json",
            },
            timeout: 15000, // 15 second timeout for status checks
          }
        );

        const responseData = statusResponse.data;
        console.log("📊 Status response:", responseData);

        if (!responseData.data) {
          throw new Error("Invalid status response format");
        }

        const status = responseData.data.status;
        const progress = responseData.data.progress || 0;

        console.log(`📊 Video status: ${status}, Progress: ${progress}%`);

        if (status === "completed") {
          const videoUrl = responseData.data.video_url;
          if (videoUrl) {
            console.log(
              "✅ Multi-speaker video generation completed, downloading..."
            );
            return await downloadVideo(videoUrl, podcastId);
          } else {
            throw new Error("Video completed but no URL provided");
          }
        } else if (status === "failed" || status === "error") {
          const errorMsg = responseData.data.error || "Unknown error";
          throw new Error(`HeyGen video generation failed: ${errorMsg}`);
        } else if (status === "processing" || status === "pending") {
          // Continue polling
          console.log(
            `⏳ Multi-speaker video still processing (${progress}%)...`
          );
        } else {
          console.log(`🔄 Unknown status: ${status}, continuing to poll...`);
        }

        // Wait 10 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 10000));
        attempts++;
      } catch (pollError) {
        console.error(
          `❌ Polling attempt ${attempts + 1} failed:`,
          pollError.message
        );

        // If it's a network error, continue trying
        if (
          pollError.code === "ECONNABORTED" ||
          pollError.code === "ENOTFOUND"
        ) {
          console.log("🔄 Network error, retrying...");
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 15000)); // Wait longer on network errors
          continue;
        }

        // For other errors, increment attempts but continue
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    // If we've exhausted all attempts, try one final status check
    try {
      console.log("🔍 Final status check before timeout...");
      const finalResponse = await axios.get(
        `${HEYGEN_API_BASE_V1}/video_status.get?video_id=${videoId}`,
        {
          headers: {
            "X-API-Key": HEYGEN_API_KEY,
            accept: "application/json",
          },
          timeout: 15000,
        }
      );

      if (
        finalResponse.data?.data?.status === "completed" &&
        finalResponse.data?.data?.video_url
      ) {
        console.log("✅ Video was actually completed, downloading...");
        return await downloadVideo(
          finalResponse.data.data.video_url,
          podcastId
        );
      }
    } catch (finalError) {
      console.error("❌ Final status check failed:", finalError.message);
    }

    throw new Error(
      `Video generation timeout after ${maxAttempts} attempts (${
        (maxAttempts * 10) / 60
      } minutes). The video might still be processing on HeyGen's servers.`
    );
  } catch (error) {
    console.error("❌ Video polling/download error:", error);
    throw error;
  }
};

const downloadVideo = async (videoUrl, podcastId) => {
  try {
    console.log("⬇️ Downloading multi-speaker video from HeyGen...");
    console.log("🔗 Video URL:", videoUrl);

    const fileName = `podcast_${podcastId}_${uuidv4()}.mp4`;
    const videoDir = path.join(process.cwd(), "public/uploads/video");
    const videoPath = path.join(videoDir, fileName);

    await fs.ensureDir(videoDir);

    // Download the actual video file with extended timeout
    const response = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
      timeout: 600000, // 10 minute timeout for download
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const writer = fs.createWriteStream(videoPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(
          `✅ Multi-speaker video downloaded successfully: ${fileName}`
        );
        resolve(`/uploads/video/${fileName}`);
      });

      writer.on("error", (error) => {
        console.error("❌ Video download write error:", error);
        reject(error);
      });

      response.data.on("error", (error) => {
        console.error("❌ Video download stream error:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("❌ Video download error:", error);
    throw new Error(`Failed to download video: ${error.message}`);
  }
};
