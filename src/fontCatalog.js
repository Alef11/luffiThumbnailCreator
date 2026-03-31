const FORMAT_MAP = {
  ttf: 'truetype',
  otf: 'opentype',
  woff: 'woff',
  woff2: 'woff2',
};

const fontModules = import.meta.glob('./assets/fonts/*.{ttf,otf,woff,woff2}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const fonts = [];

for (const [path, url] of Object.entries(fontModules)) {
  const filename = path.split('/').pop();
  const ext = filename.split('.').pop().toLowerCase();
  const name = filename.replace(/\.[^.]+$/, '');
  const format = FORMAT_MAP[ext] || 'truetype';

  fonts.push({ name, url, format });

  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: '${name}';
      src: url('${url}') format('${format}');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

export const fontNames = fonts.map((f) => f.name);
export const defaultFont = fontNames[0] || 'Arial';
export default fonts;
