import { processContactRequest } from '../../server/contact-service.mjs';

export async function handler(event) {
  const result = await processContactRequest({
    method: event.httpMethod,
    headers: event.headers || {},
    body: event.body || '{}'
  });

  return {
    statusCode: result.status,
    headers: result.headers,
    body: JSON.stringify(result.payload)
  };
}
