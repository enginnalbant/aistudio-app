import fetch from 'node-fetch';

async function createNote() {
  try {
    const response = await fetch('http://localhost:3000/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Note', content: 'This is a test note', target_date: '2026-03-04' })
    });
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      console.error(text);
    } else {
      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

createNote();
