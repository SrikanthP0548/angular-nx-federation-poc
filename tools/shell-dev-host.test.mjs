import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const shellDevHost = fs.readFileSync('apps/shell/src/index.html', 'utf8');

function renderDevHost(search = '') {
  return new JSDOM(shellDevHost, {
    url: `http://localhost:4200/${search}`,
    runScripts: 'dangerously',
  }).window.document;
}

test('standalone shell selects pricing search by default', () => {
  const document = renderDevHost();
  const host = document.getElementById('angular-page-host');

  assert.equal(host.dataset.angularFeature, 'pricing-search');
  assert.equal(host.firstElementChild.tagName, 'CA-PRICING-SEARCH');
  assert.equal(
    document.querySelector('[aria-current="page"]').textContent.trim(),
    'Pricing',
  );
  assert.equal(document.title, 'Pricing · Federation Shell');
});

for (const page of [
  {
    feature: 'feature-two',
    elementName: 'CA-FEATURE-TWO',
    label: 'Feature Two',
  },
  {
    feature: 'feature-three',
    elementName: 'CA-FEATURE-THREE',
    label: 'Feature Three',
  },
]) {
  test(`standalone shell selects ${page.feature} from its URL`, () => {
    const document = renderDevHost(`?feature=${page.feature}`);
    const host = document.getElementById('angular-page-host');

    assert.equal(host.dataset.angularFeature, page.feature);
    assert.equal(host.firstElementChild.tagName, page.elementName);
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent.trim(),
      page.label,
    );
    assert.equal(document.title, `${page.label} · Federation Shell`);
  });
}

test('standalone shell safely falls back to pricing for an unknown feature', () => {
  const document = renderDevHost('?feature=unknown');
  const host = document.getElementById('angular-page-host');

  assert.equal(host.dataset.angularFeature, 'pricing-search');
  assert.equal(host.firstElementChild.tagName, 'CA-PRICING-SEARCH');
  assert.equal(
    document.querySelector('[aria-current="page"]').textContent.trim(),
    'Pricing',
  );
});

test('standalone navigation exposes exactly the three requested feature pages', () => {
  const document = renderDevHost();
  const destinations = [
    ...document.querySelectorAll('[data-feature-link]'),
  ].map((link) => link.getAttribute('href'));

  assert.deepEqual(destinations, [
    '?feature=pricing-search',
    '?feature=feature-two',
    '?feature=feature-three',
  ]);
});
