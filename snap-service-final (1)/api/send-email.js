import { processContactRequest } from '../server/contact-service.mjs';

export default async function handler(req, res) {
  const result = await processContactRequest({
    method: req.method,
    headers: req.headers || {},
    body: req.body || {}
  });

  Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(result.status).send(result.payload);
}
