type RouteHandler = (params: Record<string, string>) => HTMLElement;

interface Route {
  pattern: RegExp;
  keys: string[];
  handler: RouteHandler;
}

const routes: Route[] = [];

export function addRoute(path: string, handler: RouteHandler): void {
  const keys: string[] = [];
  const pattern = new RegExp(
    '^' +
      path.replace(/:([^/]+)/g, (_: string, key: string) => {
        keys.push(key);
        return '([^/]+)';
      }) +
      '(?:\\?.*)?$'
  );
  routes.push({ pattern, keys, handler });
}

function getHash(): string {
  return window.location.hash.slice(1) || '/home';
}

function resolve(hash: string): HTMLElement {
  for (const route of routes) {
    const m = hash.match(route.pattern);
    if (m) {
      const params: Record<string, string> = {};
      route.keys.forEach((k, i) => { params[k] = m[i + 1] ?? ''; });
      return route.handler(params);
    }
  }
  const el = document.createElement('div');
  el.textContent = '404 — ページが見つかりません';
  return el;
}

export function startRouter(root: HTMLElement): void {
  const render = () => {
    root.innerHTML = '';
    root.appendChild(resolve(getHash()));
  };
  window.addEventListener('hashchange', render);
  render();
}

export function navigate(path: string): void {
  window.location.hash = path;
}
