

// functions/ai.js
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain'
        }
      });
    }

    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    try {
      const { messages, uploadedFileContent } = await request.json();
      
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

      // Check if API key exists
      if (!env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY environment variable is not set');
        return new Response(JSON.stringify({ 
          reply: "Server configuration error: API key not found." 
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

      console.log('Making request to OpenAI API...');
      console.log('Request body:', JSON.stringify(body, null, 2));
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      
      console.log('OpenAI response status:', response.status);

      if (!response.ok) {
        console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('OpenAI response data:', data);
      const reply = data.choices?.[0]?.message?.content || "Sorry, I encountered an error.";

      console.log('Successfully got response from OpenAI');

      return new Response(JSON.stringify({ reply }), {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Error processing chat message:', error);
      
      return new Response(JSON.stringify({ 
        reply: "Sorry, I encountered a network error." 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};