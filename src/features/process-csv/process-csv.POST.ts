import { serve, type BunRequest } from "bun";
// @ts-ignore
import gTTS from 'gtts'
import crypto from 'crypto'
import { parseCsvLine } from "./process-csv.utils";
import { LANG_SELECTOR_OPTIONS } from "@features/lang-selector/lang-selector.const";
import path from "path";
import AdmZip from 'adm-zip'
import { mkdir } from 'fs/promises'
import { server } from "@/index";

export async function processCsv(req: BunRequest) {

  const { csv, lang, cloze, classic } = await req.json();

  if (!csv) {
    return new Response(JSON.stringify({ error: 'CSV is required' }), { status: 400 });
  }
  if (csv.length === 0) {
    return new Response(JSON.stringify({ error: 'CSV is empty' }), { status: 400 });
  }
  if (!lang) {
    return new Response(JSON.stringify({ error: 'Language is required' }), { status: 400 });
  }

  if (!LANG_SELECTOR_OPTIONS.find(option => option.value === lang)) {
    return new Response(JSON.stringify({ error: 'Invalid language' }), { status: 400 });
  }

  if (!cloze && !classic) {
    return new Response(JSON.stringify({ error: 'At least one checkbox must be checked' }), { status: 400 });
  }

  const rows = csv.split('\n').filter((row: string) => row.trim() !== '');
  const headers = parseCsvLine(rows[0]);

  const hasHeaders = headers.length === 3 && headers[2]?.toLowerCase() === 'tags';

  try {
    await mkdir(path.resolve('data', 'medias'), { recursive: true });
    await mkdir(path.resolve('data', 'csv'), { recursive: true });
  } catch (error) {
    console.log('Dossiers déjà existants ou erreur de création:', error);
  }

  const csvFile = []
  const zip = new AdmZip();

  const totalRows = rows.slice(hasHeaders ? 1 : 0).length;
  let processedRows = 0;

  for (const row of rows.slice(hasHeaders ? 1 : 0)) {
    processedRows++;

    const [src = '', tgt = '', tags = ''] = parseCsvLine(row);

    const source = src?.replace(/^["']|["']$/g, '').trim();
    const target = tgt?.replace(/^["']|["']$/g, '').trim();
    const tagsArray = tags?.replace(/^["']|["']$/g, '').trim()?.split(',')?.map((tag: string) => tag.trim());

    if (!source || !target) {
      continue;
    }


    const sanitizedText = target.replace(/[!@#$%^&*()_=\/\\\+\\"<>;]/g, ' ')
      .replace(/\.$/, '')
      .replace(/{{c\d+::/g, '')
      .replace(/}}/g, '')

    const tts = new gTTS(sanitizedText.replace(/~/g, ' '), lang.split('-')[0])

    const cryptoSuffixe = crypto.randomBytes(16).toString('hex')
    const mediaName = `${new Date().getTime()}${cryptoSuffixe}.mp3`

    const pathToMedia = path.resolve('data', 'medias', mediaName)

    try {
      await tts.save(pathToMedia)

      await new Promise(resolve => setTimeout(resolve, 200))

      const file = Bun.file(pathToMedia)
      const exists = await file.exists()

      if (exists) {
        const mediaBuffer = await file.bytes()
        zip.addFile(`medias/${mediaName}`, Buffer.from(mediaBuffer))
        await file.delete()
      } else {
        console.error(`Fichier audio non trouvé: ${pathToMedia}`)
        throw new Error('Fichier audio non généré')
      }

      if (classic) {
        const recto = `${target}<hr /><br>[sound:${mediaName}]<br>`
        csvFile.push(`"${recto}";"<br>${source}<br>";"${tagsArray?.join(', ') || ''}"`);
      }

      if (cloze) {
        const words = target.split(/\s+/).filter(word => word.length > 0);
        for (const word of words) {
          const clozeText = target.replace(word, `{{c1::${word}}}`);
          const recto = `${clozeText}<hr /><br>[sound:${mediaName}]<br>`
          csvFile.push(`"${recto}";"<br>${source}<br>";"${tagsArray?.join(', ') || ''}"`);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la génération TTS:', error);
      if (classic) {
        const recto = `${target}<hr /><br>`
        csvFile.push(`"${recto}";"<br>${source}<br>";"${tagsArray?.join(', ') || ''}"`);
      }

      if (cloze) {
        const words = target.split(/\s+/).filter(word => word.length > 0);
        for (const word of words) {
          const clozeText = target.replace(word, `{{c1::${word}}}`);
          const recto = `${clozeText}<hr /><br>`
          csvFile.push(`"${recto}";"<br>${source}<br>";"${tagsArray?.join(', ') || ''}"`);
        }
      }
    }

    if (processedRows % 10 === 0 || processedRows === totalRows) {
      const progressPercent = Math.round((processedRows / totalRows) * 100);

      if (progressPercent > 10) {
        server.publish('download-progress', JSON.stringify({
          type: 'download-progress',
          room: 'download-progress',
          data: {
            progress: progressPercent,
          }
        }));
      }
    }
  }

  // Vérifier qu'on a du contenu à ajouter au ZIP
  console.log(`Nombre de cartes générées: ${csvFile.length}`);
  console.log(`Nombre d'entrées dans le ZIP: ${zip.getEntries().length}`);

  if (csvFile.length === 0) {
    return new Response(JSON.stringify({
      error: 'Aucune carte générée. Vérifiez votre CSV.'
    }), { status: 400 });
  }

  const csvContent = csvFile.join('\n');
  console.log(`Contenu CSV (premiers 200 caractères): ${csvContent.substring(0, 200)}...`);

  zip.addFile('cards.csv', Buffer.from(csvContent, 'utf8'));

  // Ajouter un fichier README pour expliquer le contenu
  const readmeContent = `# Anki Cards Generated by AnkiSpeak

Language: ${lang}
Cards generated: ${csvFile.length}
Date: ${new Date().toISOString()}

## Files in this ZIP:
- cards.csv: Import this file into Anki
- medias/: Audio files for the cards

## Import Instructions:
1. Open Anki
2. File > Import
3. Select cards.csv
4. Choose your deck
5. Import

Generated by AnkiSpeak - https://github.com/kazerlelutin/AnkiSpeak
`;

  zip.addFile('README.txt', Buffer.from(readmeContent, 'utf8'));

  const finalFilename = `${lang}-${new Date().getTime()}-${crypto.randomBytes(16).toString('hex')}.zip`;
  const finalPath = path.join('data', 'csv', finalFilename);

  console.log(`Création du ZIP: ${finalPath}`);
  console.log(`Entrées finales dans le ZIP: ${zip.getEntries().length}`);

  await zip.writeZip(finalPath);

  // Vérifier que le fichier ZIP a été créé
  const zipFile = Bun.file(finalPath);
  const zipExists = await zipFile.exists();
  const zipSize = zipExists ? (await zipFile.arrayBuffer()).byteLength : 0;

  console.log(`ZIP créé: ${zipExists}, Taille: ${zipSize} bytes`);

  if (!zipExists || zipSize === 0) {
    return new Response(JSON.stringify({
      error: 'Erreur lors de la création du fichier ZIP'
    }), { status: 500 });
  }

  return new Response(JSON.stringify({
    success: true,
    filename: finalFilename,
    path: finalPath,
    cardsCount: csvFile.length
  }), { status: 200 });
}