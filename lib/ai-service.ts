"use server";

import { GoogleGenAI } from "@google/genai";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import axios from "axios";
import sharp from "sharp";

// Initialize Google Generative AI client
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "" });

// Import service account
import serviceAccount from "../file.json";

const visionClient = new ImageAnnotatorClient({
  credentials: serviceAccount,
});

// Simple disease-medication mapping
const diseaseMedicationMap: Record<string, string[]> = {
  "secondary amenorrhea": ["Progesterone", "Medroxyprogesterone", "Norethindrone", "Phenergan"],
  "fever": ["Paracetamol", "Ibuprofen"],
};

// Function to validate and correct medication names using RxNorm API
async function validateMedication(medicationName: string, disease: string): Promise<string> {
  try {
    // Check if medication name is empty or too short
    if (!medicationName || medicationName.length < 3) {
      return medicationName;
    }
    
    // First try the direct mapping if available
    const lowerDisease = disease.toLowerCase();
    const likelyMedications = diseaseMedicationMap[lowerDisease] || [];
    
    // If we have a mapping and the medication name is close to one of our known medications
    for (const med of likelyMedications) {
      if (medicationName.toLowerCase().includes(med.toLowerCase().slice(0, 4))) {
        console.log(`Mapped ${medicationName} to ${med} based on disease ${disease}`);
        return med;
      }
    }
    
    try {
      // Try RxNorm API with proper error handling
      const response = await axios.get(
        `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(medicationName)}`,
        { timeout: 3000 } // Add timeout to prevent long wait times
      );
      
      if (response.data?.idGroup?.rxnormId?.length > 0) {
        const rxNormId = response.data.idGroup.rxnormId[0];
        try {
          const drugDetails = await axios.get(
            `https://rxnav.nlm.nih.gov/REST/rxcui/${rxNormId}/property.json`,
            { timeout: 3000 }
          );
          const correctedName = drugDetails.data?.propertyList?.property?.[0]?.value || medicationName;
          console.log(`RxNorm corrected ${medicationName} to ${correctedName}`);
          return correctedName;
        } catch (innerError) {
          console.log(`Failed to get drug details: ${innerError}`);
          return medicationName;
        }
      }
    } catch (apiError) {
      console.log(`RxNorm API error for ${medicationName}: ${apiError}`);
      // Silently continue to fallbacks
    }
    
    // Common medication name corrections
    const medCorrections: Record<string, string> = {
      "diane": "Diane-35",
      "diane35": "Diane-35",
      "diane 35": "Diane-35",
      "wh. penicillin": "Penicillin V",
      "penichet": "Penicillin",
      "progesterone": "Progesterone",
      "medroxyprogesterone": "Medroxyprogesterone",
      "norethindrone": "Norethindrone",
      "phenergan": "Phenergan"
    };
    
    // Check for simple corrections
    for (const [key, value] of Object.entries(medCorrections)) {
      if (medicationName.toLowerCase().includes(key.toLowerCase())) {
        console.log(`Simple correction: ${medicationName} → ${value}`);
        return value;
      }
    }

    // Return original if no corrections applied
    return medicationName;
  } catch (error) {
    console.error("Error in validateMedication:", error);
    return medicationName; // Return the original name if anything fails
  }
}

export async function analyzePatternAcrossRecords(data: any) {
  // Implement your function
  return {
    // Return analysis results
  };
}

export async function summarizeRecord(record: any) {
  // Implement your function
  return {
    // Return summary
  };
}

export async function recognizeHandwriting(imageBase64: string): Promise<{
  text: string;
  provider?: string;
  title?: string;
}> {
  try {
    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    // Convert to buffer
    const buffer = Buffer.from(cleanBase64, "base64");

    // Determine MIME type
    const mimeTypeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

    // Preprocess the image
    const enhancedBuffer = await sharp(buffer)
      .normalize()
      .sharpen()
      .grayscale()
      .toBuffer();
    console.log("Image preprocessing completed.");

    // Step 1: Use Google Cloud Vision API for OCR
    const [result] = await visionClient.documentTextDetection(enhancedBuffer);
    const ocrText = result.fullTextAnnotation?.text || "";
    console.log("OCR Text:", ocrText);
    if (!ocrText) {
      return {
        text: "No text recognized in the image."
      };
    }

    // Step 2: Use Gemini to interpret the OCR text
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [
        {
          text: `You are a medical transcription expert specializing in handwritten prescriptions. The following text was extracted from a doctor's handwritten medical note or prescription using OCR:

"${ocrText}"

Interpret this text and extract the following:
- Disease or symptoms mentioned (e.g., secondary amenorrhea, fever).
- Medication names, dosages, and instructions (e.g., Penicillin 1+1+1, Phenergan 25 mg I/D).
- Any additional notes or instructions.
- Healthcare provider/doctor name and hospital/clinic if mentioned.

If the text is unclear or ambiguous:
1. Use the mentioned disease or symptoms to infer likely medications. For secondary amenorrhea, consider Progesterone, Medroxyprogesterone, Norethindrone, or Phenergan.
2. If a medication name is unclear, suggest the most likely medication based on common prescriptions.
3. If unsure, provide a confidence level (e.g., 'Likely Penicillin, 80% confidence').

Output the interpretation in this exact structured format WITHOUT indentation or bullet points:
- Disease/Symptoms: Secondary amenorrhea
- Medications: Diane-35 daily, Penicillin 1+1+1
- Additional Notes: Patient is a 19-year-old female
- Healthcare Provider: Dr. Smith, City Hospital`,
        },
      ],
    });

    const text = response.text || "";
    console.log("Gemini Response:", text);

    // Parse the structured output with improved regex
    const diseaseMatch = text.match(/Disease\/Symptoms: (.*?)(?=\n|$)/);
    
    // Force exact format for medications - direct extraction between markers
    let medicationsRaw = "None";
    let startIdx = text.indexOf("- Medications:");
    if (startIdx !== -1) {
      startIdx += "- Medications:".length;
      const endIdx = text.indexOf("- Additional Notes:", startIdx);
      if (endIdx !== -1) {
        medicationsRaw = text.substring(startIdx, endIdx).trim();
        console.log("Directly extracted medications:", medicationsRaw);
        
        // Process any formatting present in the raw medications text
        if (medicationsRaw.includes("*")) {
          // Handle bullet points
          const medItems: string[] = [];
          const lines = medicationsRaw.split("\n");
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("*")) {
              const extracted = trimmedLine.substring(1).trim();
              if (extracted) {
                medItems.push(extracted);
              }
            }
          }
          if (medItems.length > 0) {
            medicationsRaw = medItems.join(", ");
          }
        }
        
        // If still empty after processing, use fallback
        if (!medicationsRaw || medicationsRaw === "None") {
          if (text.includes("Diane") || text.includes("Penicillin")) {
            const meds: string[] = [];
            if (text.includes("Diane")) meds.push("Diane-35");
            if (text.includes("Penicillin")) meds.push("Penicillin");
            medicationsRaw = meds.join(", ");
          }
        }
      }
    }
    
    const additionalNotesMatch = text.match(/Additional Notes: (.*?)(?=\n|$)/);
    const providerMatch = text.match(/Healthcare Provider: (.*?)(?=\n|$)/);

    let disease = diseaseMatch ? diseaseMatch[1].trim() : "Unknown";
    let additionalNotes = additionalNotesMatch ? additionalNotesMatch[1].trim() : "None";
    let provider = providerMatch ? providerMatch[1].trim() : "";
    
    // Generate a title based on the disease and date
    const currentDate = new Date().toLocaleDateString();
    let title = "";
    if (disease && disease !== "Unknown") {
      title = `${disease} - ${currentDate}`;
    } else if (medicationsRaw && medicationsRaw !== "None") {
      title = `Prescription - ${currentDate}`;
    } else {
      title = `Medical Note - ${currentDate}`;
    }

    // Step 3: Validate and correct medication names
    let correctedMedications = medicationsRaw;
    if (medicationsRaw !== "None") {
      const medicationEntries = medicationsRaw.split(", ").filter((entry) => entry.trim());
      const correctedEntries = await Promise.all(
        medicationEntries.map(async (entry: string) => {
          const match = entry.match(/^([^\d]+)(.*)?$/);
          if (!match) return entry;
          let [, name, dosage] = match;
          // Clean up dosage to handle extra annotations
          dosage = dosage
            ? dosage
                .replace(/\(.*?\)/g, "") // Remove parenthetical annotations
                .replace(/\b(Likely|possibly)\b/gi, "") // Remove "Likely" or "possibly"
                .trim()
            : "";
          const correctedName = await validateMedication(name.trim(), disease);
          return `${correctedName}${dosage ? ` ${dosage}` : ""}`;
        })
      );
      correctedMedications = correctedEntries.join(", ");
    }

    // Reconstruct the output
    const output = `Disease/Symptoms: ${disease}\nMedications: ${correctedMedications}\nAdditional Notes: ${additionalNotes}`;
    console.log("Final Output:", output);

    return {
      text: output,
      provider,
      title
    };
  } catch (error: any) {
    console.error("Error recognizing handwriting:", error);
    if (error.status === 429) {
      return {
        text: "Quota exceeded for Gemini API. Please enable billing or try again later."
      };
    }
    if (error.message?.includes("API key")) {
      return {
        text: "Invalid or missing API key. Please contact the administrator."
      };
    }
    return {
      text: "Failed to recognize handwriting. Please ensure the image is clear and try again."
    };
  }
}
