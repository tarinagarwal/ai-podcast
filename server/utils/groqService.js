import Groq from "groq-sdk";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

let groq = null;

const getGroqClient = () => {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

export const generatePodcastScript = async (knowledgeBase, length) => {
  const lengthMap = {
    Short: "5-8 minutes (aim for 8-12 dialogue exchanges)",
    Medium: "15-20 minutes (aim for 20-30 dialogue exchanges)",
    Long: "30-40 minutes (aim for 40-60 dialogue exchanges)",
  };

  const duration = lengthMap[length] || "15-20 minutes";

  const prompt = `You are an expert podcast script writer. Create an engaging, natural conversation between two hosts (Alex and Jordan) based on the following knowledge base. The podcast should be ${duration} long when spoken.

CRITICAL REQUIREMENTS:
- Write ONLY dialogue lines in the format "Alex: [dialogue]" and "Jordan: [dialogue]"
- Alternate between speakers naturally - don't have one person dominate
- Each speaker should have roughly equal speaking time
- Make it conversational with questions, responses, and back-and-forth discussion
- Include natural speech patterns and conversational flow
- NO stage directions, NO descriptions, NO narrative text
- ONLY speaker dialogue lines

Knowledge Base:
${knowledgeBase}

Format Example:
Alex: Welcome everyone to today's podcast! I'm Alex, and I'm here with Jordan to discuss [topic].
Jordan: Thanks Alex! I'm really excited to dive into this topic because [reason].
Alex: Absolutely! So Jordan, what's your take on [specific aspect]?
Jordan: That's a great question. I think [response and elaboration].
Alex: Interesting point! That reminds me of [related concept]. What do you think about that?
Jordan: [Response and new question back to Alex]

Remember: ONLY dialogue lines with speaker names. No other text.

Podcast Script:`;

  try {
    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 4000,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq script generation error:", error);
    throw new Error("Failed to generate podcast script");
  }
};

export const generateAudio = async (script, podcastId) => {
  try {
    // Extract dialogue for each speaker
    const alexLines = extractSpeakerLines(script, "Alex");
    const jordanLines = extractSpeakerLines(script, "Jordan");

    // Generate audio for each speaker
    const alexAudioPath = await generateSpeakerAudio(
      alexLines,
      "alex",
      podcastId
    );
    const jordanAudioPath = await generateSpeakerAudio(
      jordanLines,
      "jordan",
      podcastId
    );

    // For this implementation, we'll return the first speaker's audio
    // In a production app, you'd want to merge/sequence the audio files
    return alexAudioPath;
  } catch (error) {
    console.error("Audio generation error:", error);
    throw new Error("Failed to generate audio");
  }
};

const extractSpeakerLines = (script, speakerName) => {
  const lines = script.split("\n");
  const speakerLines = [];

  for (const line of lines) {
    if (line.trim().startsWith(`${speakerName}:`)) {
      const dialogue = line.replace(`${speakerName}:`, "").trim();
      if (dialogue) {
        speakerLines.push(dialogue);
      }
    }
  }

  return speakerLines.join(" ");
};

const generateSpeakerAudio = async (text, speaker, podcastId) => {
  try {
    // Note: Groq doesn't currently support TTS, so this is a placeholder
    // In a real implementation, you'd use a TTS service like ElevenLabs, OpenAI TTS, etc.

    // For demo purposes, create a placeholder audio file path
    const fileName = `${speaker}_${podcastId}_${uuidv4()}.mp3`;
    const audioDir = path.join(process.cwd(), "public/uploads/audio");
    const audioPath = path.join(audioDir, fileName);

    await fs.ensureDir(audioDir);

    // Create a placeholder file (in production, this would be actual audio)
    await fs.writeFile(audioPath, "placeholder audio content");

    console.log(`Generated placeholder audio for ${speaker}: ${fileName}`);
    return `/uploads/audio/${fileName}`;
  } catch (error) {
    console.error(`Audio generation error for ${speaker}:`, error);
    throw error;
  }
};
