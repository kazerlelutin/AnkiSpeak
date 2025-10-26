export async function generateTTS(text: string, lang: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`TTS request failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Erreur TTS:', error);
    throw error;
  }
}

export async function saveTTSFile(text: string, lang: string, filePath: string): Promise<void> {
  const audioBuffer = await generateTTS(text, lang);
  await Bun.write(filePath, audioBuffer);
}
