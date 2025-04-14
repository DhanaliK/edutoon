const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Generate endpoint
app.post('/generate', async (req, res) => {
    const { topic, level, action } = req.body;
    
    if (!topic || !level || !action) {
        return res.status(400).json({ 
            error: "Missing required fields",
            details: "Please provide topic, level, and action" 
        });
    }

    try {
        // Sanitize inputs
        const sanitize = (str) => str.replace(/[^a-zA-Z0-9 \-_]/g, '');
        const sanitizedTopic = sanitize(topic);
        const sanitizedLevel = sanitize(level);
        const sanitizedAction = sanitize(action);
        
        const pythonProcess = exec(
            `python ${path.join(__dirname, 'invoke_groq.py')} "${sanitizedTopic}" "${sanitizedLevel}" "${sanitizedAction}"`,
            { env: process.env },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`Execution error: ${error.message}`);
                    return res.status(500).json({ 
                        error: "Story generation failed",
                        details: error.message 
                    });
                }
                
                if (stderr) {
                    console.error(`Process stderr: ${stderr}`);
                }
                
                try {
                    const output = stdout.toString().trim();
                    
                    // Check for API errors
                    if (output.includes('"error"')) {
                        const errorData = JSON.parse(output);
                        return res.status(400).json({
                            error: "AI Service Error",
                            details: errorData.error
                        });
                    }
                    
                    // Successful response
                    res.json({ 
                        explanation: output,
                        model: "meta-llama/llama-4-scout-17b-16e-instruct"
                    });
                    
                } catch (parseError) {
                    console.error(`Output parse error: ${parseError}`);
                    res.status(500).json({ 
                        error: "Response format error",
                        details: parseError.message 
                    });
                }
            }
        );
        
    } catch (err) {
        console.error('Endpoint error:', err);
        res.status(500).json({ 
            error: "Internal server error",
            details: err.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Using model: meta-llama/llama-4-scout-17b-16e-instruct`);
});