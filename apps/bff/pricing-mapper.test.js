/**
 * Unit tests for XML mapping and edge cases (doc section 9.2, step 8).
 * The mapping layer is the highest-risk part of the BFF: it carries the
 * business logic that used to live in XSL.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapPricingXml, XmlMappingError } from './pricing-mapper.js';
import { callComBridge } from './com-bridge-mock.js';

test('maps a full COM Bridge response onto the Angular DTO', async () => {
  const result = mapPricingXml(await callComBridge('GetCustomerPricing', { customerId: '1001' }));

  assert.equal(result.customerId, '1001');
  assert.equal(result.customerName, 'Northwind Trading Ltd');
  assert.equal(result.currency, 'USD');
  assert.equal(result.items.length, 4);
});

test('computes net price from list price and discount (previously an XSL expression)', async () => {
  const result = mapPricingXml(await callComBridge('GetCustomerPricing', { customerId: '1001' }));

  const swap = result.items.find((i) => i.productCode === 'IRS-10Y');
  assert.equal(swap.listPrice, 8750);
  assert.equal(swap.discountPercent, 12.5);
  assert.equal(swap.netPrice, 7656.25);
});

test('a zero discount leaves the list price unchanged', async () => {
  const result = mapPricingXml(await callComBridge('GetCustomerPricing', { customerId: '1001' }));

  const cds = result.items.find((i) => i.productCode === 'CDS-5Y');
  assert.equal(cds.netPrice, cds.listPrice);
});

test('a single <Item> is still mapped as a list', () => {
  const xml = `<?xml version="1.0"?>
    <PricingResponse>
      <Customer><Id>7</Id><Name>Solo</Name><Currency>GBP</Currency></Customer>
      <EffectiveDate>2026-08-01</EffectiveDate>
      <Items><Item>
        <ProductCode>A</ProductCode><Description>Only row</Description>
        <ListPrice>100.00</ListPrice><DiscountPct>25.00</DiscountPct>
      </Item></Items>
    </PricingResponse>`;

  const result = mapPricingXml(xml);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].netPrice, 75);
});

test('an empty <Items> element maps to an empty list rather than throwing', () => {
  const xml = `<?xml version="1.0"?>
    <PricingResponse>
      <Customer><Id>8</Id><Name>Empty</Name><Currency>USD</Currency></Customer>
      <EffectiveDate>2026-08-01</EffectiveDate>
      <Items></Items>
    </PricingResponse>`;

  assert.deepEqual(mapPricingXml(xml).items, []);
});

test('malformed XML from the bridge raises a mapping error', async () => {
  const xml = await callComBridge('GetCustomerPricing', { customerId: '9999' });
  assert.throws(() => mapPricingXml(xml), XmlMappingError);
});

test('a non-numeric price raises a mapping error instead of producing NaN', () => {
  const xml = `<?xml version="1.0"?>
    <PricingResponse>
      <Customer><Id>9</Id><Name>Bad</Name><Currency>USD</Currency></Customer>
      <EffectiveDate>2026-08-01</EffectiveDate>
      <Items><Item>
        <ProductCode>A</ProductCode><Description>Bad row</Description>
        <ListPrice>not-a-number</ListPrice><DiscountPct>10</DiscountPct>
      </Item></Items>
    </PricingResponse>`;

  assert.throws(() => mapPricingXml(xml), XmlMappingError);
});
