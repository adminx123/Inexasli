/*


document.querySelector('.chat-toggle').addEventListener('click', () => {
    document.querySelector('.chatbot').style.display = 'block';
  });
  
  document.querySelector('.chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      let userMessage = e.target.value;
      document.querySelector('.chat-body').innerHTML += `<p>You: ${userMessage}</p>`; // Show user’s message
  
      const apiKey = 'xxxxxxxxxxxx'; // YOUR KEY HERE - keep this local
  
      fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }]
        })
      })
      .then(response => response.json())
      .then(data => {
        let reply = data.candidates[0].content.parts[0].text;
        document.querySelector('.chat-body').innerHTML += `<p>Coach: ${reply}</p>`;
      })
      .catch(error => {
        document.querySelector('.chat-body').innerHTML += `<p>Coach: Oops, something went wrong!</p>`;
      });
  
      e.target.value = ''; // Clear input
    }
  });

  */