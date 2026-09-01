import http from 'node:http';
import { DiscoveredServer } from './types.js';

const COMMON_PORTS = [5173, 3000, 8080, 8000, 4173, 3001, 5000, 4200, 8888, 1234];

export class LocalhostDetector {
  public static async scan(customPort?: number): Promise<DiscoveredServer | null> {
    if (customPort) {
      const server = await this.probePort(customPort);
      if (server) return server;
    }

    for (const port of COMMON_PORTS) {
      const server = await this.probePort(port);
      if (server) return server;
    }

    return null;
  }

  private static probePort(port: number): Promise<DiscoveredServer | null> {
    return new Promise((resolve) => {
      const req = http.get(
        `http://localhost:${port}/`,
        { timeout: 800 },
        (res) => {
          let rawData = '';
          res.on('data', (chunk) => {
            rawData += chunk;
            if (rawData.length > 8192) res.destroy(); // read enough for headers/html
          });

          res.on('end', () => {
            const framework = this.detectFramework(res.headers, rawData);
            resolve({
              port,
              url: `http://localhost:${port}`,
              framework,
            });
          });
        }
      );

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  private static detectFramework(headers: http.IncomingHttpHeaders, html: string): string {
    const serverHeader = String(headers['server'] || '').toLowerCase();
    const poweredBy = String(headers['x-powered-by'] || '').toLowerCase();

    if (serverHeader.includes('vite') || html.includes('/@vite/client') || html.includes('vite')) return 'Vite / React';
    if (poweredBy.includes('next') || html.includes('__NEXT_DATA__') || html.includes('/_next/')) return 'Next.js';
    if (html.includes('astro')) return 'Astro';
    if (html.includes('data-reactroot') || html.includes('react')) return 'React SPA';
    if (html.includes('data-v-') || html.includes('vue')) return 'Vue.js';
    if (html.includes('svelte')) return 'Svelte';
    if (serverHeader.includes('express') || poweredBy.includes('express')) return 'Express / Node.js';
    if (serverHeader.includes('uvicorn') || serverHeader.includes('fastapi')) return 'FastAPI / Python';
    if (serverHeader.includes('django')) return 'Django';

    return 'Web App (HTTP)';
  }
}
