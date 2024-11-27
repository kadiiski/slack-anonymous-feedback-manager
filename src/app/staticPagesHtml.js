const pageHomeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Server Running</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #4CAF50; }
        p { color: #555; }
      </style>
    </head>
    <body>
      <h1>🚀 Server is Running!</h1>
      <p>Your application is up and running.</p>
      <p>Use the API endpoints as intended.</p>
    </body>
    </html>
  `;

const pageNotFoundHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 Not Found</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #FF5722; }
        p { color: #555; }
        a { color: #FF5722; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>😕 404 - Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <p><a href="/">Go back to the homepage</a></p>
    </body>
    </html>
  `

module.exports = { pageNotFoundHtml, pageHomeHtml };
