const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Path to the Player Data folder
const playerDataPath = path.join(__dirname, 'Player Data');

// Serve static files (e.g., Excel files)
app.use('/Player Data', express.static(playerDataPath));

// Endpoint to get the list of players
app.get('/players', (req, res) => {
    fs.readdir(playerDataPath, (err, files) => {
        if (err) {
            console.error('Error reading Player Data folder:', err);
            return res.status(500).send('Error reading Player Data folder');
        }

        // Filter Excel files and remove the ".xlsx" extension
        const players = files
            .filter(file => file.endsWith('.xlsx'))
            .map(file => file.replace('.xlsx', ''));

        res.json(players);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});