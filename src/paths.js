/** Project Pages uses /coaching_hp/, while the dev server stays at /. */
export const basePath = import.meta.env.BASE_URL;
export function localUrl(url) {
  if (!url?.startsWith('/') || url.startsWith('//')) return url;
  return `${basePath.replace(/\/$/, '')}${url}`;
}
export function localCss(css = '') {
  return css.replace(/url\((["']?)\/assets\//g, (_, quote) => `url(${quote}${localUrl('/assets/')}`);
}
export function pageRoute(pathname) {
  let path = decodeURIComponent(pathname);
  const base = decodeURIComponent(basePath).replace(/\/$/, '');
  if (base && (path === base || path.startsWith(`${base}/`))) path = path.slice(base.length);
  return (path || '/').replace(/\/?$/, '/');
}
