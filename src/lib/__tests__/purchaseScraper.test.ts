import { parsePriceString, localHtmlParser } from '../purchaseScraper';

describe('Purchase Scraper & Price Parser Tests', () => {
  test('Parses Turkish standard price strings', () => {
    expect(parsePriceString('₺1.250,50')).toBe(1250.5);
    expect(parsePriceString('12.500 TL')).toBe(12500);
    expect(parsePriceString('999,90 TL')).toBe(999.9);
  });

  test('Parses abbreviation thousands notation (k / bin)', () => {
    expect(parsePriceString('15k')).toBe(15000);
    expect(parsePriceString('2.5k')).toBe(2500);
    expect(parsePriceString('40 bin')).toBe(40000);
  });

  test('Extracts meta data from HTML content gracefully', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Apple iPhone 16 Pro 256GB Titanyum Fiyatı</title>
          <meta property="og:title" content="Apple iPhone 16 Pro 256GB" />
          <meta property="product:price:amount" content="75.999" />
          <meta property="og:image" content="https://example.com/iphone.jpg" />
        </head>
        <body>
          <h1>Apple iPhone 16 Pro</h1>
          <span class="price">75.999 TL</span>
        </body>
      </html>
    `;

    const product = localHtmlParser(sampleHtml, 'https://trendyol.com/apple-iphone-16-pro');
    expect(product.title).toContain('iPhone 16 Pro');
    expect(product.price).toBe(75999);
    expect(product.storeName).toBe('Trendyol');
  });
});
