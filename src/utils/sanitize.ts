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

function isValidHostname(hostname: string): boolean {
  return /^[a-z0-9.-]+$/i.test(hostname) && hostname.includes('.');
}

const allowedIframeHostnames = [
  ...defaultAllowedIframeHostnames,
  ...(import.meta.env.PUBLIC_MICROCMS_ALLOWED_IFRAME_HOSTNAMES
    ?.split(',')
    .map((hostname: string) => hostname.trim().toLowerCase())
    .filter((hostname: string) => isValidHostname(hostname)) ?? []),
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
      iframe: ['src', 'title', 'width', 'height', 'allowfullscreen'],
      code: ['class'],
      pre: ['class'],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
    },
    allowedSchemes: ['https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['https', 'data'],
    },
    allowedIframeHostnames,
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target !== '_blank') {
          return { tagName, attribs };
        }

        const relValues = new Set((attribs.rel ?? '').split(/\s+/).filter(Boolean));
        relValues.add('noopener');
        relValues.add('noreferrer');

        return {
          tagName,
          attribs: {
            ...attribs,
            rel: Array.from(relValues).join(' '),
          },
        };
      },
    },
    parser: {
      lowerCaseTags: true,
    },
  });
}
