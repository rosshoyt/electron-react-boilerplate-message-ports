/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

const fs = require('fs');
const { dialog } = require('electron');

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export function getBufferFromFile(fullPath: string): string {
  const fileData = fs.readFileSync(
    path.normalize(fullPath),
    // 'utf8',
    (err: any, data: any) => {
      if (err) throw err;
      console.log('read file at', fullPath);
      return data;
    }
  );
  if (fileData !== undefined) {
    return fileData;
  }
  return 'error';
}

export async function openFolderSelector(): Promise<string[]> {
  console.log('Opening folder dialog');
  let filePaths: string[] = [];
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
    });
    filePaths = result.filePaths;
  } catch (error) {
    console.log(error);
  }
  console.log('Returning paths', filePaths);
  return filePaths;
}
