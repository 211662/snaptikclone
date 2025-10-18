// Cloudflare Pages Function - Health Check
export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json' 
    }
  });
}
