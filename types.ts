export interface FileMapEntry {
  filename: string;
  lineCount: number;
}

export type FileMap = FileMapEntry[];

export enum ProcessStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export type SupportedEncoding = 'UTF-8' | 'windows-1250' | 'UTF-16LE' | 'JSON';