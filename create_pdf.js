const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('syllabus.pdf'));

doc.fontSize(25).text('Alien Technology Syllabus 101', 100, 100);
doc.moveDown();
doc.fontSize(15).text('Topic 1: Warp Drives and their implementation using Dilithium crystals.');
doc.moveDown();
doc.fontSize(15).text('Topic 2: Telepathy protocol over WebSocket.');
doc.moveDown();
doc.fontSize(15).text('Topic 3: Translating intergalactic languages using LLM models.');

doc.end();
