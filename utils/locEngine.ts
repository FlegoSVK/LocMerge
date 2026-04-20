import JSZip from 'jszip';
import { FileMap, FileMapEntry, SupportedEncoding } from '../types';

// Windows-1250 (Central European) Lookup Table for characters > 127
const CP1250_MAP: Record<string, number> = {
  '€': 0x80, '‚': 0x82, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
  '‰': 0x89, 'Š': 0x8A, '‹': 0x8B, 'Ś': 0x8C, 'Ť': 0x8D, 'Ž': 0x8E, 'Ź': 0x8F,
  '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
  '™': 0x99, 'š': 0x9A, '›': 0x9B, 'ś': 0x9C, 'ť': 0x9D, 'ž': 0x9E, 'ź': 0x9F,
  'ˇ': 0xA1, '˘': 0xA2, 'Ł': 0xA3, '¤': 0xA4, 'Ą': 0xA5, '¦': 0xA6, '§': 0xA7,
  '¨': 0xA8, '©': 0xA9, 'Ş': 0xAA, '«': 0xAB, '¬': 0xAC, '­': 0xAD, '®': 0xAE, 'Ż': 0xAF,
  '°': 0xB0, '±': 0xB1, '˛': 0xB2, 'ł': 0xB3, '´': 0xB4, 'µ': 0xB5, '¶': 0xB6, '·': 0xB7,
  '¸': 0xB8, 'ą': 0xB9, 'ş': 0xBA, '»': 0xBB, 'Ľ': 0xBC, '˝': 0xBD, 'ľ': 0xBE, 'ż': 0xBF,
  'Ŕ': 0xC0, 'Á': 0xC1, 'Â': 0xC2, 'Ă': 0xC3, 'Ä': 0xC4, 'Ĺ': 0xC5, 'Ć': 0xC6, 'Ç': 0xC7,
  'Č': 0xC8, 'É': 0xC9, 'Ę': 0xCA, 'Ë': 0xCB, 'Ě': 0xCC, 'Í': 0xCD, 'Î': 0xCE, 'Ď': 0xCF,
  'Đ': 0xD0, 'Ń': 0xD1, 'Ň': 0xD2, 'Ó': 0xD3, 'Ô': 0xD4, 'Ő': 0xD5, 'Ö': 0xD6, '×': 0xD7,
  'Ř': 0xD8, 'Ů': 0xD9, 'Ú': 0xDA, 'Ű': 0xDB, 'Ü': 0xDC, 'Ý': 0xDD, 'Ţ': 0xDE, 'ß': 0xDF,
  'ŕ': 0xE0, 'á': 0xE1, 'â': 0xE2, 'ă': 0xE3, 'ä': 0xE4, 'ĺ': 0xE5, 'ć': 0xE6, 'ç': 0xE7,
  'č': 0xE8, 'é': 0xE9, 'ę': 0xEA, 'ë': 0xEB, 'ě': 0xEC, 'í': 0xED, 'î': 0xEE, 'ď': 0xEF,
  'đ': 0xF0, 'ń': 0xF1, 'ň': 0xF2, 'ó': 0xF3, 'ô': 0xF4, 'ő': 0xF5, 'ö': 0xF6, '÷': 0xF7,
  'ř': 0xF8, 'ů': 0xF9, 'ú': 0xFA, 'ű': 0xFB, 'ü': 0xFC, 'ý': 0xFD, 'ţ': 0xFE, '˙': 0xFF
};

/**
 * Reads a file and returns its content as text using specified encoding.
 */
export const readFileContent = (file: File, encoding: SupportedEncoding = 'UTF-8'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    reader.onerror = (e) => reject(e);
    
    // Convert to FileReader compatible encoding strings
    let domEncoding = 'UTF-8';
    if (encoding === 'windows-1250') domEncoding = 'windows-1250';
    else if (encoding === 'UTF-16LE') domEncoding = 'UTF-16LE';
    // JSON is read as UTF-8
    else if (encoding === 'JSON') domEncoding = 'UTF-8';

    reader.readAsText(file, domEncoding);
  });
};

/**
 * Encodes a string into Uint8Array based on the selected encoding.
 */
export const encodeText = (text: string, encoding: SupportedEncoding): Uint8Array => {
  if (encoding === 'UTF-8' || encoding === 'JSON') {
    return new TextEncoder().encode(text);
  }
  
  if (encoding === 'windows-1250') {
    const len = text.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);
      
      if (code < 128) {
        bytes[i] = code;
      } else {
        const mapped = CP1250_MAP[char];
        if (mapped) {
          bytes[i] = mapped;
        } else {
          bytes[i] = 0x3F; // '?'
          console.warn(`Character ${char} (${code}) cannot be mapped to Windows-1250`);
        }
      }
    }
    return bytes;
  }

  if (encoding === 'UTF-16LE') {
    // UTF-16LE with BOM (FF FE)
    // 2 bytes for BOM + 2 bytes per character
    const buffer = new ArrayBuffer(2 + text.length * 2);
    const view = new DataView(buffer);
    
    // Set BOM (FF FE)
    view.setUint8(0, 0xFF);
    view.setUint8(1, 0xFE);
    
    for (let i = 0; i < text.length; i++) {
      // Get 16-bit code unit (handles BMP and surrogate pairs correctly as JS strings are UTF-16)
      const code = text.charCodeAt(i);
      // Offset by 2 bytes for BOM, write as Little Endian
      view.setUint16(2 + i * 2, code, true);
    }
    
    return new Uint8Array(buffer);
  }

  throw new Error(`Unsupported encoding: ${encoding}`);
};

/**
 * Splits text into lines, handling various line endings.
 */
export const splitToLines = (text: string): string[] => {
  return text.split(/\r\n|\r|\n/);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Merges multiple files into a single master string (or JSON) and generates a map.
 */
export const mergeFiles = async (
  files: File[], 
  encoding: SupportedEncoding,
  onProgress: (current: number, total: number, filename: string) => void
): Promise<{ masterBlob: Blob; fileMap: FileMap }> => {
  
  // Handling JSON output structure (Key-Value pair file)
  if (encoding === 'JSON') {
    const masterJson: Record<string, string> = {};
    const fileMap: FileMap = [];
    const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      onProgress(i + 1, sortedFiles.length, file.name);

      // Even if output is JSON, we read input files as UTF-8 by default unless specified otherwise
      // Here we assume input files are text files being merged into a JSON structure
      const rawContent = await readFileContent(file, 'UTF-8');
      const cleanContent = rawContent.replace(/^\uFEFF/, '');
      
      // We normalize lines for line counting, though JSON stores the string as is
      const lines = splitToLines(cleanContent);

      fileMap.push({
        filename: file.name,
        lineCount: lines.length
      });

      masterJson[file.name] = cleanContent;
    }

    const jsonString = JSON.stringify(masterJson, null, 2);
    const masterBlob = new Blob([jsonString], { type: 'application/json' });
    
    return { masterBlob, fileMap };
  }

  // Handling Text-based output (Concatenated lines)
  const masterLines: string[] = [];
  const fileMap: FileMap = [];
  const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    onProgress(i + 1, sortedFiles.length, file.name);

    // Read with selected encoding (assuming input matches output requirement)
    // If output is Windows-1250, we assume inputs are too, or we rely on the reader to handle simple bytes
    // For robust conversion, we usually read as UTF-8 if inputs are UTF-8, but here we mirror the param.
    // If user selected windows-1250, readFileContent tries to read as windows-1250.
    const rawContent = await readFileContent(file, encoding === 'windows-1250' ? 'windows-1250' : 'UTF-8');
    
    // Remove BOM if present (handles UTF-8 and UTF-16 BOMs)
    const cleanContent = rawContent.replace(/^\uFEFF/, '');
    
    const lines = splitToLines(cleanContent);
    
    fileMap.push({
      filename: file.name,
      lineCount: lines.length
    });

    masterLines.push(...lines);
  }

  // Determine newline char. Windows/UTF-16LE usually prefers CRLF
  const newline = (encoding === 'windows-1250' || encoding === 'UTF-16LE') ? '\r\n' : '\n';
  const masterContent = masterLines.join(newline);

  // Encode back to binary
  const masterBytes = encodeText(masterContent, encoding);

  // Set MIME type
  let mimeType = 'text/plain';
  if (encoding === 'UTF-8') mimeType += ';charset=utf-8';
  else if (encoding === 'windows-1250') mimeType += ';charset=windows-1250';
  else if (encoding === 'UTF-16LE') mimeType += ';charset=utf-16le';

  const masterBlob = new Blob([masterBytes], { type: mimeType });

  return { masterBlob, fileMap };
};

/**
 * Splits a master file back into individual files.
 */
export const splitFiles = async (
  masterFile: File,
  fileMap: FileMap,
  inputEncoding: SupportedEncoding,
  outputEncoding: SupportedEncoding,
  onProgress: (current: number, total: number, filename: string) => void
): Promise<any> => {
  
  let parsedJsonData: Record<string, string> | null = null;
  let allLines: string[] = [];
  let currentLineIndex = 0;
  
  // 1. READ INPUT
  if (inputEncoding === 'JSON') {
    // Read Master as JSON object
    const rawJson = await readFileContent(masterFile, 'UTF-8');
    try {
      parsedJsonData = JSON.parse(rawJson);
    } catch (e) {
      throw new Error("Nepodarilo sa spracovať Master súbor ako JSON. Skontrolujte formát.");
    }
  } else {
    // Read Master as Text lines
    const masterTextRaw = await readFileContent(masterFile, inputEncoding);
    const cleanMaster = masterTextRaw.replace(/^\uFEFF/, '');
    allLines = splitToLines(cleanMaster);
    
    const totalExpectedLines = fileMap.reduce((acc, entry) => acc + entry.lineCount, 0);
    // Allow small deviation
    if (Math.abs(allLines.length - totalExpectedLines) > 1) {
      console.warn(`Mismatch: Actual ${allLines.length} vs Expected ${totalExpectedLines}`);
    }
  }

  // 2. PREPARE OUTPUT CONTAINER
  // Handle JSON Output mode (Single file output)
  if (outputEncoding === 'JSON') {
    const outputMap: Record<string, string> = {};
    const newline = '\n'; 
    
    for (let i = 0; i < fileMap.length; i++) {
      const entry = fileMap[i];
      onProgress(i + 1, fileMap.length, entry.filename);

      let fileContentString = "";

      if (parsedJsonData) {
        // Input was JSON: get directly by key
        fileContentString = parsedJsonData[entry.filename] || "";
      } else {
        // Input was Text: slice lines
        const fileLines = allLines.slice(currentLineIndex, currentLineIndex + entry.lineCount);
        fileContentString = fileLines.join(newline);
        currentLineIndex += entry.lineCount;
      }

      outputMap[entry.filename] = fileContentString;
    }
    
    return new Blob([JSON.stringify(outputMap, null, 2)], { type: 'application/json' });
  }

  // Standard ZIP Output mode
  const zip = new JSZip();
  // Newline for output depends on Output Encoding preferences
  const newline = (outputEncoding === 'windows-1250' || outputEncoding === 'UTF-16LE') ? '\r\n' : '\n';

  for (let i = 0; i < fileMap.length; i++) {
    const entry = fileMap[i];
    onProgress(i + 1, fileMap.length, entry.filename);

    let fileString = "";

    if (parsedJsonData) {
       // Input was JSON
       // Note: Encoding conversion happens at the `encodeText` step below
       fileString = parsedJsonData[entry.filename] || "";
       
       // If the JSON content lacks specific newlines but the target encoding expects them,
       // we might need normalization, but usually we respect the source string.
       // However, if output is windows, we might want to ensure CRLF if the string only has LF.
       if (outputEncoding === 'windows-1250' || outputEncoding === 'UTF-16LE') {
         fileString = fileString.replace(/\r?\n/g, '\r\n');
       }
    } else {
       // Input was Text
       const fileLines = allLines.slice(currentLineIndex, currentLineIndex + entry.lineCount);
       fileString = fileLines.join(newline);
       currentLineIndex += entry.lineCount;
    }
    
    // Encode using Output Encoding (e.g. Windows-1250 for Game)
    const fileBytes = encodeText(fileString, outputEncoding);
    
    zip.file(entry.filename, fileBytes);
  }

  return zip;
};