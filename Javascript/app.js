const express = require('express');
const morgan = require('morgan');
const lodash = require('lodash');

const app = express();
const PORT = 5000;
const NAME = 'JavaScript';

app.use(morgan('combined'));
app.use(express.static('static'));
app.use(express.json()); // allow JSON body input

function getVersion() {
  return process.env.APP_VERSION || '1.0.0';
}

function getIndexHtml() {
  const version = getVersion();
  return INDEX_HTML_TEMPLATE.replace(/\{\{VERSION\}\}/g, version);
}

const INDEX_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JavaScript · Version</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(150deg, #0d1f0d 0%, #132613 35%, #1a3d1a 100%);
      color: #e8f5e8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow-x: hidden;
    }
    .card {
      background: rgba(51,153,51,0.1);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(51,153,51,0.35);
      border-radius: 24px;
      padding: 2.5rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 50px rgba(51,153,51,0.2);
    }
    .logo-wrap {
      width: 140px;
      height: 140px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: glow 2.5s ease-in-out infinite;
      filter: drop-shadow(0 0 28px rgba(51,153,51,0.6));
    }
    .logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    @keyframes glow {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 28px rgba(51,153,51,0.6)); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 40px rgba(247,223,30,0.4)); }
    }
    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; color: #339933; }
    .sub { color: #9bc99b; font-size: 0.95rem; margin-bottom: 1.5rem; }
    .version-line {
      font-size: 2.75rem;
      font-weight: 700;
      color: #339933;
      margin: 0;
      animation: glow 2.5s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-wrap" aria-hidden="true"><img src="/logo.png" alt="JavaScript"></div>
    <h1>JavaScript</h1>
    <p class="sub">Application version</p>
    <p class="version-line">{{VERSION}}</p>
  </div>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8').send(getIndexHtml());
});

app.get('/version', (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8').send(`${NAME} Application version - ${getVersion()}`);
});

app.get('/plusone/:number', (req, res) => {
  const number = parseInt(req.params.number, 10);
  if (Number.isNaN(number)) {
    return res.status(400).send('invalid number');
  }
  const result = number + 1;
  res.set('Content-Type', 'text/plain; charset=utf-8').send(`${NAME} - ${result} - ${NAME}`);
});


/**
 * Vulnerable route (intentionally)
 * defaultsDeep(target, sources)
 * sources is fully controlled by external input (req.body)
 * and NO Object.freeze remediation is applied.
 */
app.post('/merge', (req, res) => {
  const baseConfig = {
    app: {
      name: NAME,
      version: getVersion()
    }
  };

  const externalInput = req.body; // attacker-controlled input

  // defaultsDeep called with external input as the 2nd argument (sources)
  const merged = defaultsDeep(baseConfig, externalInput);

  res.json({
    mergedConfig: merged
  });
});

app.post("/fear", (req, res) => {
  let data = {};
  let input = req.body.content;
  lodash.defaultsDeep(data, input);
  res.json({message: `default response message for an expected payload! - content is ${input}`});
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
