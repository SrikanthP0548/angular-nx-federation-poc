/**
 * XML-to-JSON mapping (doc sections 9.1 and 9.2, steps 4-5).
 *
 * This is where presentation logic that used to live in Pricing.xsl becomes
 * explicit, testable code: the net-price calculation below was an XSL
 * expression in the legacy page.
 */
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  trimValues: true,
});

class XmlMappingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'XmlMappingError';
    this.code = 'PRICING_MAPPING_FAILED';
  }
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value, field) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new XmlMappingError(`Field ${field} is not numeric: ${value}`);
  }
  return n;
}

/** Maps COM Bridge pricing XML onto the Angular-facing PricingResponse DTO. */
export function mapPricingXml(xml) {
  let parsed;
  try {
    parsed = parser.parse(xml);
  } catch (err) {
    throw new XmlMappingError(`COM Bridge returned malformed XML: ${err.message}`);
  }

  const root = parsed?.PricingResponse;
  if (!root?.Customer) {
    throw new XmlMappingError('COM Bridge response is missing PricingResponse/Customer');
  }

  const currency = root.Customer.Currency ?? 'USD';

  const items = asArray(root.Items?.Item).map((item) => {
    const listPrice = toNumber(item.ListPrice, 'ListPrice');
    const discountPercent = toNumber(item.DiscountPct, 'DiscountPct');
    // Previously an XSL calculation; now explicit and unit-testable.
    const netPrice = Math.round(listPrice * (1 - discountPercent / 100) * 100) / 100;
    return {
      productCode: String(item.ProductCode),
      description: String(item.Description),
      listPrice,
      discountPercent,
      netPrice,
    };
  });

  return {
    customerId: String(root.Customer.Id),
    customerName: String(root.Customer.Name),
    currency: String(currency),
    effectiveDate: String(root.EffectiveDate),
    items,
  };
}

export { XmlMappingError };
