import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

const TAGS = [
  'D1', 'D2', 'DOP', 'D', 'M1', 'M2', 'M', 'Next', 'N', 'SNIP', 'Y1', 'Y2', 'Y',
  'ispitaniya', 'material', 'object', 'projectirovshik1', 'projectirovshik2', 'projectirovshik',
  'project', 'rabota', 'shema', 'stroiteli11', 'stroiteli12', 'stroiteli21', 'stroiteli22',
  'stroiteli32', 'stroiteli3', 'stroiteli', 'zakazchik1', 'zakazchik2', 'zakazchik', '№'
];

export async function generateDocx(templateUrl: string, data: Record<string, string>, filename: string) {
  try {
    const response = await fetch(templateUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const zip = new PizZip(arrayBuffer);
    let xml = zip.file("word/document.xml").asText();

    // Sort tags by length descending to prevent partial matches (e.g. stroiteli vs stroiteli11)
    const sortedTags = [...TAGS].sort((a, b) => b.length - a.length);

    sortedTags.forEach(t => {
      // Create a regex that matches `{{tag}}` where there can be any amount of XML formatting tags between characters
      const chars = `{{${t}}}`.split('');
      const regexStr = chars.map(c => c === '{' || c === '}' ? `\\${c}` : c).join('(?:<[^>]+>)*');
      const regex = new RegExp(regexStr, 'g');

      const value = data[t] || '';
      const escapedValue = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

      const xmlValue = escapedValue.replace(/\n/g, '<w:br/>');

      xml = xml.replace(regex, () => xmlValue);
    });

    zip.file("word/document.xml", xml);

    const out = zip.generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(out, filename);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    alert("Ошибка генерации DOCX. Проверьте консоль.");
  }
}
