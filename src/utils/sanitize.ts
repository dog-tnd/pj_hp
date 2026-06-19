import sanitizeHtml from 'sanitize-html';

const defaultAllowedIframeHostnames = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'player.vimeo.com',
  'speakerdeck.com',
  'www.slideshare.net',
  'codepen.io',
];

const allowedIframeHostnames = [
  ...defaultAllowedIframeHostnames,
  ...(import.meta.env.PUBLIC_MICROCMS_ALLOWED_IFRAME_HOSTNAMES
    ?.split(',')
    .map((hostname: string) => hostname.trim())
    .filter(Boolean) ?? []),
];

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  'img',
  'h1',
  'h2',
  'iframe',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
      iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
      code: ['class'],
      pre: ['class'],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    allowedIframeHostnames,
    parser: {
      lowerCaseTags: true,
    },
  });
}
