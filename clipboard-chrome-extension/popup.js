const input = document.getElementById('clipboardInput');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');
const clearBtn = document.getElementById('clearBtn');

// Load history
chrome.storage.local.get('clipboardHistory', (data) => {
  const history = data.clipboardHistory || [];
  renderHistory(history);
});

// Copy and save
copyBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;

  await navigator.clipboard.writeText(text);

  chrome.storage.local.get('clipboardHistory', (data) => {
    const history = data.clipboardHistory || [];
    const newHistory = [text, ...history.filter(item => item !== text)].slice(0, 10);
    chrome.storage.local.set({ clipboardHistory: newHistory });
    renderHistory(newHistory);
  });

  input.value = '';
});

// Clear history
clearBtn.addEventListener('click', () => {
  chrome.storage.local.set({ clipboardHistory: [] });
  renderHistory([]);
});

// Render list
function renderHistory(items) {
  historyList.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.addEventListener('click', () => {
      navigator.clipboard.writeText(item);
    });
    historyList.appendChild(li);
  });
}
