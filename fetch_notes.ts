import fetch from 'node-fetch';

async function fetchNotes() {
  try {
    const response = await fetch('http://localhost:3000/api/notes');
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

fetchNotes();
