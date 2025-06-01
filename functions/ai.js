export async function onRequest(context) {
  const { request, env } = context;
  
  console.log('Function called with method:', request.method);
  console.log('Request URL:', request.url);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      headers: corsHeaders
    });
  }

  // For debugging - allow GET requests to test if function is working
  if (request.method === 'GET') {
    console.log('Handling GET request for testing');
    return new Response('AI function is working! Send a POST request with chat data.', {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Handle POST requests
  if (request.method === 'POST') {
    console.log('Handling POST request');
    
    try {
      const requestBody = await request.json();
      console.log('Request body received:', requestBody);
      
      const { messages, uploadedFileContent } = requestBody;
      
      const systemMessage = {
        role: 'system',
        content: "Explain things like you're talking to a software professional with 2 years of experience."
      };

      const enhancedSystemMessage = uploadedFileContent
        ? {
            ...systemMessage,
            content: `${systemMessage.content}\n\nYou also have access to this uploaded file content:\n\n${uploadedFileContent}`
          }
        : systemMessage;

      const body = {
        model: "gpt-3.5-turbo",
        messages: [enhancedSystemMessage, ...messages]
      };

      if (!env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY environment variable is not set');
        return new Response(JSON.stringify({ 
          reply: "Server configuration error: API key not found." 
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

      console.log('Making request to OpenAI...');
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error: ${response.status} - ${errorText}`);
        return new Response(JSON.stringify({ 
          reply: `OpenAI API error: ${response.status}` 
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I encountered an error.";

      console.log('Sending successful response');
      return new Response(JSON.stringify({ reply }), {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Error processing chat message:', error);
      
      return new Response(JSON.stringify({ 
        reply: "Sorry, I encountered a network error: " + error.message 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // Method not allowed
  console.log('Method not allowed:', request.method);
  return new Response(`Method ${request.method} not allowed`, { 
    status: 405,
    headers: corsHeaders
  });
}