# SRT & TXT File Checker

A modern web application for comparing, editing, and converting between SRT subtitle files and plain text files.

## Features

### 📁 File Import
- **Import SRT files**: Click "Import SRT" button or drag & drop `.srt` files
- **Import TXT files**: Click "Import TXT" button or drag & drop `.txt` files
- **Drag & Drop Support**: Simply drag files onto either editor area

### ✏️ Side-by-Side Editing
- **Dual Editors**: Edit both SRT and TXT files simultaneously
- **Real-time Editing**: All changes are automatically saved to browser storage
- **Monospace Font**: Clear, readable text formatting

### 💾 Export Options
- **Export as SRT**: Save your SRT content as a `.srt` file
- **Export as TXT**: Save your text content as a `.txt` file
- **One-click Export**: Simple export with automatic file download

### 🔧 Advanced Features
- **Sync Scroll**: Synchronize scrolling between both editors
- **Extract Text from SRT**: Convert SRT subtitles to plain text (removes timestamps)
- **Convert TXT to SRT**: Transform plain text into SRT format with automatic timestamps
- **Auto-save**: Your work is automatically saved and restored between sessions

### ⌨️ Keyboard Shortcuts
- `Ctrl+S`: Export current file (based on active editor)
- `Ctrl+O`: Open file dialog (based on active editor)
- `Ctrl+E`: Extract text from SRT
- `Ctrl+R`: Convert TXT to SRT

## How to Use

1. **Open the Application**: Open `index.html` in your web browser
2. **Import Files**: 
   - Click the "Import SRT" or "Import TXT" buttons
   - Or drag and drop files onto the respective editor areas
3. **Edit Content**: Make changes directly in the text editors
4. **Use Tools**:
   - Enable "Sync Scroll" to scroll both editors together
   - Use "Extract Text from SRT" to get plain text from subtitles
   - Use "Convert TXT to SRT" to create subtitle format from text
5. **Export**: Click "Export SRT" or "Export TXT" to download your files

## File Formats

### SRT Format Example
```
1
00:00:01,000 --> 00:00:04,000
This is the first subtitle

2
00:00:05,000 --> 00:00:08,000
This is the second subtitle
```

### TXT Format
Plain text format - any text content you want to compare or convert.

## Technical Details

- **No Server Required**: Runs entirely in the browser
- **Local Storage**: Automatically saves your work locally
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Browser Support**: Works with Chrome, Firefox, Safari, Edge

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Privacy

- All processing happens locally in your browser
- No data is sent to any server
- Files and content remain on your device

---

**Tip**: The application will show keyboard shortcuts on first use. Your work is automatically saved and will be restored when you return to the page. 