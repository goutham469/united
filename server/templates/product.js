export function product_template(url) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Your Product</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f9f9f9;
            padding: 20px;
        }

        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            margin: auto;
        }

        h1 {
            color: #222;
        }

        p {
            font-size: 16px;
            color: #555;
            margin: 10px 0;
        }

        .download-link {
            display: inline-block;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            margin-top: 15px;
            transition: background 0.3s;
        }

        .download-link:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Thank You! 🎉</h1>
        <p>We appreciate your purchase!</p>

        <p>Your product is ready for download:</p>
        <a class="download-link" href="${url}" target="_blank">📥 Download Now</a>
    </div>
</body>
</html>`;
}
