export const generateDealsEmailTemplate = (deals) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Latest Deals</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .deal-item {
                    margin-bottom: 30px;
                    padding: 15px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                }
                .deal-image {
                    width: 100%;
                    max-width: 300px;
                    height: auto;
                    display: block;
                    margin: 0 auto 15px;
                    border-radius: 4px;
                }
                .deal-title {
                    color: #333;
                    font-size: 18px;
                    margin: 10px 0;
                }
                .deal-price {
                    color: #e53e3e;
                    font-size: 16px;
                    font-weight: bold;
                }
                .deal-link {
                    display: inline-block;
                    background: #3182ce;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 10px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Check Out Our Latest Deals! 🎉</h1>
                    <p>Don't miss out on these amazing offers</p>
                </div>
                
                ${deals.map(deal => `
                    <div class="deal-item">
                        <img src="${deal.image}" alt="${deal.name}" class="deal-image">
                        <h2 class="deal-title">${deal.name}</h2>
                        <p class="deal-price">Price: $${deal.price}</p>
                        <p>${deal.description}</p>
                        <a href="${deal.link}" class="deal-link">View Deal</a>
                    </div>
                `).join('')}
                
                <div class="footer">
                    <p>Thank you for subscribing to our deals newsletter!</p>
                    <p>If you wish to unsubscribe, please click <a href="{unsubscribe_link}">here</a></p>
                </div>
            </div>
        </body>
        </html>
    `;
}; 