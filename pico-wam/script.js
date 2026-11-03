const copyButton = document.getElementById('copy-citation');
const status = document.getElementById('copy-status');
copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  const text = document.getElementById('bibtex').textContent;
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'BibTeX copied.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('bibtex'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C or Command+C, or download the .bib file.';
  }
});
