const express = require('express');
const path = require('path');

const app = express();

// Serve static HTML files from the finance directory
app.use(express.static(path.join(__dirname, '../client/finance')));

// Serve JavaScript files for each page
app.get('/scripts/income.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'income.js'));
});

app.get('/scripts/expense.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'expense.js'));
});

app.get('/scripts/asset.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'asset.js'));
});

app.get('/scripts/liability.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'liability.js'));
});

app.get('/scripts/summary.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'summary.js'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
