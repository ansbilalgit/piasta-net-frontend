// update-openapi.js
// Usage: node update-openapi.js
// Downloads the latest OpenAPI spec as defined in openapi/swagger-link.txt

const fs = require('fs');
const https = require('https');
const path = require('path');

const swaggerLinkPath = path.resolve(__dirname, 'openapi', 'swagger-link.txt');
const localSpecPath = path.resolve(__dirname, 'openapi', 'swagger.json');

function getSwaggerUrl() {
  const lines = fs.readFileSync(swaggerLinkPath, 'utf-8').split('\n');
  for (const line of lines) {
    if (line.startsWith('http')) return line.trim();
  }
  throw new Error('Swagger URL not found in openapi/swagger-link.txt');
}

function downloadSwagger(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      cb(new Error(`Failed to get '${url}' (${response.statusCode})`));
      return;
    }
    response.pipe(file);
    file.on('finish', () => file.close(cb));
  }).on('error', (err) => {
    fs.unlink(dest, () => cb(err));
  });
}

const url = getSwaggerUrl();
fs.mkdirSync(path.dirname(localSpecPath), { recursive: true });
downloadSwagger(url, localSpecPath, (err) => {
  if (err) {
    console.error('Failed to update OpenAPI spec:', err.message);
    process.exit(1);
  } else {
    console.log('OpenAPI spec updated at', localSpecPath);
  }
});
