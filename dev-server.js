const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 9000;

// Enable CORS
app.use(cors());

// Apply the history middleware to support HTML5 History API
app.use(history({
  verbose: true,
  disableDotRule: true
}));

// Serve static files from the Quasar build
app.use(express.static(path.join(__dirname, 'dist/spa')));

app.listen(port, () => {
  console.log(`Development server running at http://localhost:${port}`);
  console.log(`Open your browser at http://localhost:${port}`);
});