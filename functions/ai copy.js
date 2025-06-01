export async function POST(context) {
  const { request, env } = context;
  
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I encountered an error.";

    return new Response(JSON.stringify({ reply }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    return new Response(JSON.stringify({ 
      reply: "Sorry, I encountered a network error." 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
