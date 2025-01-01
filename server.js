const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Load the trained model (assuming you have a Python script to handle the model)
const MODEL_SCRIPT_PATH = path.join(__dirname, 'process_frame.py');

app.post('/process-frame', (req, res) => {
    const { frame } = req.body;

    // Save the base64 image to a file
    const imgPath = path.join(__dirname, 'temp_image.png');
    base64Img.img(frame, '', imgPath, (err, filepath) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save image' });
        }

        // Call the Python script to process the image
        exec(`python ${MODEL_SCRIPT_PATH} ${filepath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ error: 'Failed to process image' });
            }

            // Parse the output from the Python script
            const label = stdout.trim();
            res.json({ label });
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});