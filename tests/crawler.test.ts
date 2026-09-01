import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { AppCrawler } from '../src/crawler.js';

test('AppCrawler discovers routes, links, and buttons from mock HTTP server', async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>Home Page</title></head>
          <body>
            <h1>Welcome to App</h1>
            <a href="/pricing">Pricing</a>
            <a href="/login">Login</a>
            <button id="cta-btn">Get Started</button>
            <button disabled>Disabled Action</button>
            <form action="/subscribe"><input type="email" /></form>
          </body>
        </html>
      `);
    } else if (req.url === '/pricing') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>Pricing</title></head>
          <body>
            <h1>Plans</h1>
            <a href="/">Back Home</a>
            <button class="buy-btn">Subscribe Now</button>
          </body>
        </html>
      `);
    } else if (req.url === '/login') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>Sign In</title></head>
          <body>
            <form action="/api/login"><button type="submit">Sign In</button></form>
          </body>
        </html>
      `);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    }
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}`;

  const crawler = new AppCrawler(baseUrl);
  const routes = await crawler.crawl();

  server.close();

  assert.strictEqual(routes.length, 3, 'Should discover exactly 3 routes (/, /pricing, /login)');
  
  const homeRoute = routes.find((r) => r.path === '/');
  assert.ok(homeRoute, 'Home route should exist');
  assert.strictEqual(homeRoute.title, 'Home Page');
  assert.strictEqual(homeRoute.statusCode, 200);
  assert.strictEqual(homeRoute.buttons.length, 2);
  assert.strictEqual(homeRoute.buttons[0].text, 'Get Started');
  assert.strictEqual(homeRoute.buttons[0].isDead, false);
  assert.strictEqual(homeRoute.buttons[1].isDead, true, 'Disabled button should be marked isDead');
  assert.strictEqual(homeRoute.forms.length, 1);
});
