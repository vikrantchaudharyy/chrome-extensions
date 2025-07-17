const input = document.getElementById('input');
const output = document.getElementById('output');

document.getElementById('toNewlines').addEventListener('click', () => {
  output.value = input.value.replace(/\\n/g, '\n');
});

document.getElementById('toEscaped').addEventListener('click', () => {
  output.value = input.value.replace(/\n/g, '\\n');
});
