export async function onRequestGet() {
  return new Response('Test function works!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}