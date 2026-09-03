import {
  containerUrlForLegacyPath,
  DEFAULT_LEGACY_ENTRY_URL,
  isValidLegacyEntryUrl,
  legacyEntryUrlFromSearch,
  legacyUrlFromLocation,
} from './legacy-entry-url';

const ORIGIN = 'http://localhost:8800';

describe('isValidLegacyEntryUrl', () => {
  it('accepts a plain root-relative path', () => {
    expect(isValidLegacyEntryUrl('/default.asp', ORIGIN)).toBe(true);
  });

  it('accepts a root-relative path with a query string and hash', () => {
    expect(isValidLegacyEntryUrl('/aspx/page.aspx?id=1#section', ORIGIN)).toBe(
      true,
    );
  });

  it('rejects a value with no leading slash', () => {
    expect(isValidLegacyEntryUrl('default.asp', ORIGIN)).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidLegacyEntryUrl('', ORIGIN)).toBe(false);
  });

  it('rejects a protocol-relative URL disguised as root-relative', () => {
    expect(isValidLegacyEntryUrl('//evil.example.com/phish', ORIGIN)).toBe(
      false,
    );
  });

  it('rejects an absolute URL to a foreign origin', () => {
    expect(isValidLegacyEntryUrl('http://evil.example.com/phish', ORIGIN)).toBe(
      false,
    );
  });

  it('rejects an absolute URL even when it targets the same origin', () => {
    expect(
      isValidLegacyEntryUrl('http://localhost:8800/default.asp', ORIGIN),
    ).toBe(false);
  });

  it('rejects a backslash-authority trick that resolves to a foreign origin', () => {
    expect(isValidLegacyEntryUrl('/\\evil.example.com', ORIGIN)).toBe(false);
  });

  it('rejects a dot-segment path-normalization trick', () => {
    expect(isValidLegacyEntryUrl('/a/../../evil', ORIGIN)).toBe(false);
  });

  it('rejects a percent-encoded dot-segment trick', () => {
    expect(isValidLegacyEntryUrl('/%2e%2e/evil', ORIGIN)).toBe(false);
  });

  it('rejects the container itself to prevent recursive iframe nesting', () => {
    expect(isValidLegacyEntryUrl('/AngularShell/', ORIGIN)).toBe(false);
    expect(isValidLegacyEntryUrl('/angularshell/index.html', ORIGIN)).toBe(
      false,
    );
  });
});

describe('legacyEntryUrlFromSearch', () => {
  it('uses /default.asp when no path parameter exists', () => {
    expect(legacyEntryUrlFromSearch('?theme=dark')).toBe(
      DEFAULT_LEGACY_ENTRY_URL,
    );
  });

  it('decodes one path parameter including its nested query and fragment', () => {
    expect(
      legacyEntryUrlFromSearch('?path=%2Flegacy-page.aspx%3Fid%3D1%23details'),
    ).toBe('/legacy-page.aspx?id=1#details');
  });

  it('returns an invalid value for ambiguous duplicate path parameters', () => {
    expect(
      legacyEntryUrlFromSearch('?path=%2Ffirst.asp&path=%2Fsecond.asp'),
    ).toBe('');
  });
});

describe('legacyUrlFromLocation', () => {
  it('keeps the iframe pathname, query, and fragment together', () => {
    expect(
      legacyUrlFromLocation({
        pathname: '/legacy-page.aspx',
        search: '?id=1',
        hash: '#details',
      }),
    ).toBe('/legacy-page.aspx?id=1#details');
  });
});

describe('containerUrlForLegacyPath', () => {
  it('sets an encoded path while preserving unrelated query parameters and the container fragment', () => {
    expect(
      containerUrlForLegacyPath(
        `${ORIGIN}/AngularShell/?theme=dark#container`,
        '/legacy-page.aspx?id=1#details',
      ),
    ).toBe(
      '/AngularShell/?theme=dark&path=%2Flegacy-page.aspx%3Fid%3D1%23details#container',
    );
  });

  it('removes only the path parameter for the default legacy page', () => {
    expect(
      containerUrlForLegacyPath(
        `${ORIGIN}/AngularShell/?path=%2Flegacy-page.asp&theme=dark`,
        DEFAULT_LEGACY_ENTRY_URL,
      ),
    ).toBe('/AngularShell/?theme=dark');
  });
});
