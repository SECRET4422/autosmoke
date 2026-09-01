import http from 'node:http';
import { RouteNode, DOMElement } from './types.js';

export class AppCrawler {
  private baseUrl: string;
  private visitedRoutes = new Set<string>();
  private maxRoutes: number;

  constructor(baseUrl: string, maxRoutes: number = 25) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.maxRoutes = maxRoutes;
  }

  public async crawl(): Promise<RouteNode[]> {
    this.visitedRoutes.clear();
    const queue: string[] = ['/'];
    const results: RouteNode[] = [];

    while (queue.length > 0 && results.length < this.maxRoutes) {
      const currentPath = queue.shift()!;
      if (this.visitedRoutes.has(currentPath)) continue;
      this.visitedRoutes.add(currentPath);

      const node = await this.inspectRoute(currentPath);
      results.push(node);

      // Enqueue discovered internal links
      for (const link of node.links) {
        if (!this.visitedRoutes.has(link) && !queue.includes(link)) {
          queue.push(link);
        }
      }
    }

    return results;
  }

  public async inspectRoute(routePath: string): Promise<RouteNode> {
    const startTime = Date.now();
    const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
    const targetUrl = `${this.baseUrl}${normalizedPath}`;

    return new Promise((resolve) => {
      const req = http.get(targetUrl, { timeout: 3000 }, (res) => {
        let rawBody = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          rawBody += chunk;
        });

        res.on('end', () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode || 0;
          const title = this.extractTitle(rawBody);
          const links = this.extractInternalLinks(rawBody);
          const buttons = this.extractButtons(rawBody);
          const forms = this.extractForms(rawBody);
          const images = this.extractImages(rawBody);
          const { hasRuntimeError, errorMessage } = this.checkRuntimeErrors(statusCode, rawBody);

          resolve({
            path: normalizedPath,
            url: targetUrl,
            statusCode,
            title,
            links,
            buttons,
            forms,
            images,
            hasRuntimeError,
            errorMessage,
            crawlTimeMs: duration,
          });
        });
      });

      req.on('error', (err) => {
        resolve({
          path: normalizedPath,
          url: targetUrl,
          statusCode: 0,
          title: 'Connection Refused',
          links: [],
          buttons: [],
          forms: [],
          images: [],
          hasRuntimeError: true,
          errorMessage: `Network error: ${err.message}`,
          crawlTimeMs: Date.now() - startTime,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          path: normalizedPath,
          url: targetUrl,
          statusCode: 408,
          title: 'Request Timeout',
          links: [],
          buttons: [],
          forms: [],
          images: [],
          hasRuntimeError: true,
          errorMessage: 'Route response timed out (>3000ms)',
          crawlTimeMs: Date.now() - startTime,
        });
      });
    });
  }

  public extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1].trim() : 'Untitled Page';
  }

  public extractInternalLinks(html: string): string[] {
    const links: string[] = [];
    const hrefRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>/gi;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
      const rawHref = match[1].trim();
      if (
        rawHref.startsWith('/') &&
        !rawHref.startsWith('//') &&
        !rawHref.startsWith('/api') &&
        !rawHref.includes('.') // ignore static files like /logo.png
      ) {
        // Strip query params and hashes for route discovery
        const cleanPath = rawHref.split('?')[0].split('#')[0] || '/';
        if (!links.includes(cleanPath)) {
          links.push(cleanPath);
        }
      }
    }

    return links;
  }

  public extractButtons(html: string): DOMElement[] {
    const buttons: DOMElement[] = [];
    const btnRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
    let match;

    while ((match = btnRegex.exec(html)) !== null) {
      const attrs = match[1];
      const content = match[2].replace(/<[^>]*>/g, '').trim();

      const idMatch = attrs.match(/\bid=["']([^"']*)["']/i);
      const classMatch = attrs.match(/\bclass(?:Name)?=["']([^"']*)["']/i);
      const isDead = attrs.includes('disabled') || content.length === 0;

      buttons.push({
        tag: 'button',
        id: idMatch ? idMatch[1] : undefined,
        className: classMatch ? classMatch[1] : undefined,
        text: content.slice(0, 40) || 'Empty Button',
        isDead,
      });
    }

    return buttons;
  }

  public extractForms(html: string): DOMElement[] {
    const forms: DOMElement[] = [];
    const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
    let match;

    while ((match = formRegex.exec(html)) !== null) {
      const attrs = match[1];
      const idMatch = attrs.match(/\bid=["']([^"']*)["']/i);
      const actionMatch = attrs.match(/\baction=["']([^"']*)["']/i);

      forms.push({
        tag: 'form',
        id: idMatch ? idMatch[1] : undefined,
        action: actionMatch ? actionMatch[1] : 'self',
      });
    }

    return forms;
  }

  public extractImages(html: string): string[] {
    const images: string[] = [];
    const imgRegex = /<img\s+(?:[^>]*?\s+)?src=["']([^"']*)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1].trim();
      if (src && !images.includes(src)) {
        images.push(src);
      }
    }

    return images;
  }

  public checkRuntimeErrors(statusCode: number, html: string): { hasRuntimeError: boolean; errorMessage?: string } {
    if (statusCode >= 500) {
      return { hasRuntimeError: true, errorMessage: `HTTP ${statusCode} Server Error` };
    }
    if (statusCode === 404) {
      return { hasRuntimeError: true, errorMessage: `HTTP 404 Not Found` };
    }

    // Check for standard React / Vite / Next.js crash indicators
    const lower = html.toLowerCase();
    if (lower.includes('unhandled runtime error') || lower.includes('server error in \'/\'') || lower.includes('react error boundary')) {
      return { hasRuntimeError: true, errorMessage: 'Client-side Runtime Crash / React Error Overlay detected' };
    }
    if (lower.includes('uncaught typeerror') || lower.includes('uncaught referenceerror')) {
      return { hasRuntimeError: true, errorMessage: 'Uncaught JavaScript runtime exception' };
    }

    return { hasRuntimeError: false };
  }
}
