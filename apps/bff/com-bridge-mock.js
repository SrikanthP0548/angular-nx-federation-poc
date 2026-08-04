/**
 * Stand-in for the existing COM Bridge (doc section 9.1).
 *
 * The real bridge returns XML that today is rendered by XSL. This mock
 * returns the same shape of XML so the BFF's mapping layer — the part that
 * genuinely has to exist in production — is exercised for real.
 */

const CUSTOMERS = {
  1001: {
    name: 'Northwind Trading Ltd',
    currency: 'USD',
    rows: [
      { code: 'FX-SPOT', desc: 'FX Spot Execution', list: 1250.0, discount: 10 },
      { code: 'FX-FWD', desc: 'FX Forward Contract', list: 2100.5, discount: 5 },
      { code: 'IRS-10Y', desc: 'Interest Rate Swap 10Y', list: 8750.0, discount: 12.5 },
      { code: 'CDS-5Y', desc: 'Credit Default Swap 5Y', list: 6400.0, discount: 0 },
    ],
  },
  1002: {
    name: 'Contoso Capital Partners',
    currency: 'EUR',
    rows: [
      { code: 'EQ-CASH', desc: 'Equity Cash Execution', list: 940.0, discount: 15 },
      { code: 'EQ-OPT', desc: 'Equity Options Clearing', list: 3300.75, discount: 7.5 },
    ],
  },
};

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`);
}

/**
 * Simulates a COM Bridge call. Returns legacy-style XML or throws the way
 * the bridge signals a business/technical failure.
 */
export async function callComBridge(operation, params) {
  if (operation !== 'GetCustomerPricing') {
    const err = new Error(`Unknown COM Bridge operation: ${operation}`);
    err.bridgeCode = 'UNKNOWN_OPERATION';
    throw err;
  }

  // Deterministic fault-injection hooks so resilience paths (doc section 14.1)
  // can be exercised without editing code.
  if (params.customerId === '9998') {
    const err = new Error('COM Bridge timed out');
    err.bridgeCode = 'BRIDGE_TIMEOUT';
    throw err;
  }
  if (params.customerId === '9999') {
    return '<PricingResponse><this-is-not-well-formed>';
  }

  const customer = CUSTOMERS[params.customerId];
  if (!customer) {
    const err = new Error(`No pricing profile for customer ${params.customerId}`);
    err.bridgeCode = 'CUSTOMER_NOT_FOUND';
    throw err;
  }

  const items = customer.rows
    .map(
      (r) =>
        `    <Item>
      <ProductCode>${escapeXml(r.code)}</ProductCode>
      <Description>${escapeXml(r.desc)}</Description>
      <ListPrice>${r.list.toFixed(2)}</ListPrice>
      <DiscountPct>${r.discount.toFixed(2)}</DiscountPct>
    </Item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<PricingResponse>
  <Customer>
    <Id>${escapeXml(params.customerId)}</Id>
    <Name>${escapeXml(customer.name)}</Name>
    <Currency>${escapeXml(customer.currency)}</Currency>
  </Customer>
  <EffectiveDate>2026-08-01</EffectiveDate>
  <Items>
${items}
  </Items>
</PricingResponse>`;
}
