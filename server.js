const express = require('express');
const fs = require('fs');

const Tesseract = require('tesseract.js');

const app = express();
const PORT = 3080;

app.use(express.json({ limit: '50mb' }));

// get-text API
app.post('/test', (req, res) => {
    res.json(req.body);
  });
  

  
app.post('/get-text', async (req, res) => {
    try {
      const buffer = fs.readFileSync('1ee.jpg'); // Read directly from file
      const result = await Tesseract.recognize(buffer, 'eng');
      const extractedText = result.data.text;

      fs.writeFileSync('1.txt', extractedText, 'utf8');
    //   res.json({ text: result.data.text });
    res.json({
        success: true,
        result: { text: extractedText }
      });
    } catch (error) {
      console.error("Error during OCR processing:", error);
      res.status(500).json({
        success: false,
        error: { message: 'OCR processing failed.' }
      });
    //   res.status(500).json({ error: 'OCR processing failed.', details: error.message });
    }
  });
// get-bboxes API

app.post('/get-bboxes', async (req, res) => {
  try {
    const { type } = req.body; // Now only type is received from the body
    const validTypes = ['word', 'line', 'paragraph', 'block', 'page'];

    if (!type) return res.status(400).json({
        success: false,
        error: { message: 'Invalid bbox_type.' }
      });
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid bounding box type.' }
      });
      
    }

    // Read the image directly from a file
    const buffer = fs.readFileSync('1.jpg'); // Update this path
    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: (m) => console.log(m)
    });

    let bboxes = [];
    if (type === 'word') {
      bboxes = result.data.words.map(word => word.bbox);
    } else if (type === 'line') {
      bboxes = result.data.lines.map(line => line.bbox);
    } else if (type === 'paragraph') {
      bboxes = result.data.paragraphs.map(paragraph => paragraph.bbox);
    } else if (type === 'block') {
      bboxes = result.data.blocks.map(block => block.bbox);
    } else if (type === 'page') {
      // For pages, return the overall bounding box if needed
      bboxes = [{ x: 0, y: 0, width: result.data.width, height: result.data.height }];
    }

    res.json({
        success: true,
        result: { bboxes: bboxes }
      });
  } catch (error) {
    console.error("Error during bounding box extraction:", error);
    res.status(500).json({
        success: false,
        error: { message: 'Bounding box extraction failed.' }
      });
    // res.status(500).json({ error: 'Bounding box extraction failed.', details: error.message });
  }
});

  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
