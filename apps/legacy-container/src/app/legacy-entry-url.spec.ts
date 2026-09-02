import { isValidLegacyEntryUrl } from './legacy-entry-url';

const ORIGIN = 'http://localhost:8800';

describe('isValidLegacyEntryUrl', () => {
  it('accepts a plain root-relative path', () => {
    expect(isValidLegacyEntryUrl('/default.asp', ORIGIN)).toBe(true);
  });

  it('accepts a root-relative path with a query string and hash', () => {
    expect(isValidLegacyEntryUrl('/aspx/page.aspx?id=1#section', ORIGIN)).toBe(true);
  });

  it('rejects a value with no leading slash', () => {
    expect(isValidLegacyEntryUrl('default.asp', ORIGIN)).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidLegacyEntryUrl('', ORIGIN)).toBe(false);
  });

  it('rejects a protocol-relative URL disguised as root-relative', () => {
    expect(isValidLegacyEntryUrl('//evil.example.com/phish', ORIGIN)).toBe(false);
  });

  it('rejects an absolute URL to a foreign origin', () => {
    expect(isValidLegacyEntryUrl('http://evil.example.com/phish', ORIGIN)).toBe(false);
  });

  it('rejects an absolute URL even when it targets the same origin', () => {
    expect(isValidLegacyEntryUrl('http://localhost:8800/default.asp', ORIGIN)).toBe(false);
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
});
