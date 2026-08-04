/**
 * Mock BFF (doc section 9).
 *
 * Stands in for the .NET BFF described in the plan. It exposes typed JSON
 * endpoints designed for the migrated Angular page, calls the (mocked) COM
 * Bridge, maps XML to JSON, and normalizes every failure onto the stable
 * frontend error contract from section 9.3.
 */
import express from 'express';
import { randomUUID } from 'node:crypto';
import { callComBridge } from './com-bridge-mock.js';
import { mapPricingXml, XmlMappingError } from './pricing-mapper.js';

const PORT = Number(process.env.BFF_PORT ?? 7040);
const app = express();

// Correlation ID for every request (doc section 15.4): generated here or
// reused from the browser, echoed back so a page failure can be traced
// across ASPX host, shell, remote, BFF and legacy services.
app.use((req, res, next) => {
  req.traceId = req.header('x-correlation-id') || randomUUID();
  res.setHeader('x-correlation-id', req.traceId);
  next();
});

// The POC serves shell and remote from separate dev ports. Production uses
// same-origin /ui and /api paths (doc section 11.2), where this is unnecessary.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,x-correlation-id');
  res.setHeader('Access-Control-Expose-Headers', 'x-correlation-id');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function errorResponse(traceId, code, message, retryable, validationErrors = []) {
  return { traceId, code, message, retryable, validationErrors };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', traceId: req.traceId });
});

app.get('/api/pricing/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const started = Date.now();

  if (!/^\d{1,10}$/.test(customerId)) {
    return res
      .status(400)
      .json(
        errorResponse(req.traceId, 'PRICING_INVALID_REQUEST', 'Customer id must be numeric.', false, [
          { field: 'customerId', message: 'Must be numeric.' },
        ])
      );
  }

  try {
    const xml = await callComBridge('GetCustomerPricing', { customerId });
    console.info(`[bff] bff.combridge.duration traceId=${req.traceId} ms=${Date.now() - started}`);
    const payload = mapPricingXml(xml);
    return res.json(payload);
  } catch (err) {
    if (err instanceof XmlMappingError) {
      console.error(`[bff] bff.xml.mapping.failed traceId=${req.traceId}`, err.message);
      return res
        .status(502)
        .json(
          errorResponse(req.traceId, 'PRICING_NOT_AVAILABLE', 'Pricing data is currently unavailable.', true)
        );
    }
    if (err.bridgeCode === 'CUSTOMER_NOT_FOUND') {
      return res
        .status(404)
        .json(errorResponse(req.traceId, 'PRICING_CUSTOMER_NOT_FOUND', 'No pricing profile exists for this customer.', false));
    }
    if (err.bridgeCode === 'BRIDGE_TIMEOUT') {
      console.error(`[bff] combridge timeout traceId=${req.traceId}`);
      return res
        .status(504)
        .json(errorResponse(req.traceId, 'PRICING_NOT_AVAILABLE', 'Pricing data is currently unavailable.', true));
    }
    console.error(`[bff] unhandled traceId=${req.traceId}`, err);
    return res
      .status(500)
      .json(errorResponse(req.traceId, 'INTERNAL_ERROR', 'An unexpected error occurred.', true));
  }
});

app.listen(PORT, () => {
  console.info(`[bff] listening on http://localhost:${PORT}`);
});
