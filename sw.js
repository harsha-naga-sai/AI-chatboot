
async function generate() {
  const key = document.getElementById("apiKey").value.trim();
  const prompt = document.getElementById("prompt").value.trim();

  const status = document.getElementById("status");
  const answer = document.getElementById("answer");
  const button = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");

  if (!key) {
    status.textContent = "Please enter your API key.";
    return;
  }

  if (!prompt) {
    status.textContent = "Please enter a question or topic.";
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  button.disabled = true;
  button.textContent = "Generating...";
  status.textContent = "Connecting to Gemini AI...";
  answer.style.display = "none";
  copyBtn.style.display = "none";

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: instructions[currentMode] }]
          },
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }),
        signal: controller.signal
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status + ": " +
        (data.error?.message || "Gemini request failed.")
      );
    }

    const result = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("");

    if (!result) {
      throw new Error("Gemini returned no text. Please try again.");
    }

    lastAnswer = result;
    answer.textContent = result;
    answer.style.display = "block";
    copyBtn.style.display = "inline-block";

    status.textContent = "AI response generated successfully!";

  } catch (error) {

    if (error.name === "AbortError") {
      status.textContent =
        "Request timed out. Check your internet and try again.";
    } else {
      status.textContent = "AI Error: " + error.message;
    }

  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.textContent = "✨ Generate with AI";
  }
}
