const express = require("express");
const app = express();
 
const expressFormidable = require("express-formidable");
app.use(expressFormidable());
 
const cors = require("cors");
app.use(cors());
 
const fileSystem = require("fs");
const http = require("http").createServer(app);

const OpenAI =require( "openai");

const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const dotenv = require("dotenv").config();

// Initialize OpenAI API client with the provided API key
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

http.listen(8080, function () {
	app.post("/generateSentence", async function (request, result) {
		const response = await openai.responses.create({
			model: "gpt-4o",
			input: "Generate a sentence in Spanish. I only want a sentence, no explanation.",
		});
		
		  console.log(response.output_text);
		  result.send(response.output_text);
	})
    app.post("/sendVoiceNote", async function (request, result) {
        const base64 = request.fields.base64
		let transcribedText = request.fields.transcribedText;
        const buffer = Buffer.from(base64, "base64");
        const voiceNote = "audios.webm";
        await fileSystem.writeFileSync(voiceNote, buffer);
 
		// Prepare form data for the transcription request
		const form = new FormData();
		form.append("file", fileSystem.createReadStream(voiceNote));
		form.append("model", "whisper-1");
		form.append("response_format", "text");
		form.append("language", "es");
		  // Post the audio file to OpenAI for transcription
		  const transcriptionResponse = await axios.post(
			"https://api.openai.com/v1/audio/transcriptions",
			form,
			{
			  headers: {
				...form.getHeaders(),
				Authorization: `Bearer ${secretKey}`,
			  },
			}
		  );
	  
		  // Extract transcribed text from the response
		  transcribedText = transcriptionResponse.data;
		  console.log(transcribedText);
        result.send(transcribedText);
    })
})