// DOM Elements
const srtUpload = document.getElementById('srt-upload');
const txtUpload = document.getElementById('txt-upload');
const srtEditor = document.getElementById('srt-editor');
const txtEditor = document.getElementById('txt-editor');
const srtInfo = document.getElementById('srt-info');
const txtInfo = document.getElementById('txt-info');

// Control buttons
const exportSrtBtn = document.getElementById('export-srt');
const exportTxtBtn = document.getElementById('export-txt');
const clearSrtBtn = document.getElementById('clear-srt');
const clearTxtBtn = document.getElementById('clear-txt');
const syncScrollBtn = document.getElementById('sync-scroll');
const extractTextBtn = document.getElementById('extract-text');
const convertToSrtBtn = document.getElementById('convert-to-srt');

// AI Comparison elements
const compareAiBtn = document.getElementById('compare-ai');
const aiStatus = document.getElementById('ai-status');
const aiResults = document.getElementById('ai-results');
const resultsContent = document.getElementById('results-content');
const clearResultsBtn = document.getElementById('clear-results');

// State variables
let syncScrollEnabled = false;
let srtFileName = '';
let txtFileName = '';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyCWp5NcEL9QKmqvmI-gZwmW9uB1SWp6qyU';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupDragAndDrop();
});

// Initialize all event listeners
function initializeEventListeners() {
    // File upload listeners
    srtUpload.addEventListener('change', (e) => handleFileUpload(e, 'srt'));
    txtUpload.addEventListener('change', (e) => handleFileUpload(e, 'txt'));
    
    // Export listeners
    exportSrtBtn.addEventListener('click', () => exportFile('srt'));
    exportTxtBtn.addEventListener('click', () => exportFile('txt'));
    
    // Clear listeners
    clearSrtBtn.addEventListener('click', () => clearEditor('srt'));
    clearTxtBtn.addEventListener('click', () => clearEditor('txt'));
    
    // Additional functionality listeners
    syncScrollBtn.addEventListener('click', toggleSyncScroll);
    extractTextBtn.addEventListener('click', extractTextFromSrt);
    convertToSrtBtn.addEventListener('click', convertTxtToSrt);
    
    // AI comparison listeners
    compareAiBtn.addEventListener('click', compareWithAI);
    clearResultsBtn.addEventListener('click', clearAIResults);
    
    // Scroll synchronization
    srtEditor.addEventListener('scroll', () => syncScroll('srt'));
    txtEditor.addEventListener('scroll', () => syncScroll('txt'));
    
    // Auto-save to localStorage
    srtEditor.addEventListener('input', () => saveToLocalStorage('srt', srtEditor.value));
    txtEditor.addEventListener('input', () => saveToLocalStorage('txt', txtEditor.value));
    
    // Load from localStorage on page load
    loadFromLocalStorage();
}

// File upload handler
function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        
        if (type === 'srt') {
            srtEditor.value = content;
            srtFileName = file.name;
            srtInfo.textContent = `Loaded: ${file.name} (${formatFileSize(file.size)})`;
        } else {
            txtEditor.value = content;
            txtFileName = file.name;
            txtInfo.textContent = `Loaded: ${file.name} (${formatFileSize(file.size)})`;
        }
        
        saveToLocalStorage(type, content);
    };
    reader.readAsText(file);
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    [srtEditor, txtEditor].forEach(editor => {
        editor.addEventListener('dragover', handleDragOver);
        editor.addEventListener('dragleave', handleDragLeave);
        editor.addEventListener('drop', handleDrop);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    const isText = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isSrt = file.name.endsWith('.srt');
    
    if (!isText && !isSrt) {
        alert('Please drop only TXT or SRT files.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        
        if (e.target.id === 'srt-editor' || isSrt) {
            srtEditor.value = content;
            srtFileName = file.name;
            srtInfo.textContent = `Loaded: ${file.name} (${formatFileSize(file.size)})`;
            saveToLocalStorage('srt', content);
        } else {
            txtEditor.value = content;
            txtFileName = file.name;
            txtInfo.textContent = `Loaded: ${file.name} (${formatFileSize(file.size)})`;
            saveToLocalStorage('txt', content);
        }
    };
    reader.readAsText(file);
}

// Export file functionality
function exportFile(type) {
    const content = type === 'srt' ? srtEditor.value : txtEditor.value;
    if (!content.trim()) {
        alert(`No ${type.toUpperCase()} content to export.`);
        return;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exported_file.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear editor functionality
function clearEditor(type) {
    if (confirm(`Are you sure you want to clear the ${type.toUpperCase()} editor?`)) {
        if (type === 'srt') {
            srtEditor.value = '';
            srtFileName = '';
            srtInfo.textContent = 'No file loaded';
        } else {
            txtEditor.value = '';
            txtFileName = '';
            txtInfo.textContent = 'No file loaded';
        }
        localStorage.removeItem(`srt-checker-${type}`);
    }
}

// Toggle scroll synchronization
function toggleSyncScroll() {
    syncScrollEnabled = !syncScrollEnabled;
    syncScrollBtn.classList.toggle('sync-active', syncScrollEnabled);
    syncScrollBtn.textContent = syncScrollEnabled ? '🔄 Sync ON' : '🔄 Sync Scroll';
}

// Synchronize scroll between editors
function syncScroll(source) {
    if (!syncScrollEnabled) return;
    
    const sourceEditor = source === 'srt' ? srtEditor : txtEditor;
    const targetEditor = source === 'srt' ? txtEditor : srtEditor;
    
    const scrollRatio = sourceEditor.scrollTop / (sourceEditor.scrollHeight - sourceEditor.clientHeight);
    targetEditor.scrollTop = scrollRatio * (targetEditor.scrollHeight - targetEditor.clientHeight);
}

// Extract text from SRT format
function extractTextFromSrt() {
    const srtContent = srtEditor.value.trim();
    if (!srtContent) {
        alert('No SRT content to extract text from.');
        return;
    }
    
    const extractedText = parseSrtToText(srtContent);
    txtEditor.value = extractedText;
    txtInfo.textContent = 'Text extracted from SRT';
    saveToLocalStorage('txt', extractedText);
}

// Convert TXT to SRT format
function convertTxtToSrt() {
    const txtContent = txtEditor.value.trim();
    if (!txtContent) {
        alert('No TXT content to convert to SRT.');
        return;
    }
    
    const srtContent = convertTextToSrt(txtContent);
    srtEditor.value = srtContent;
    srtInfo.textContent = 'Converted from TXT';
    saveToLocalStorage('srt', srtContent);
}

// Parse SRT content to extract text
function parseSrtToText(srtContent) {
    const lines = srtContent.split('\n');
    const textLines = [];
    let isTextLine = false;
    
    for (let line of lines) {
        line = line.trim();
        
        // Skip empty lines
        if (!line) {
            isTextLine = false;
            continue;
        }
        
        // Skip subtitle numbers
        if (/^\d+$/.test(line)) {
            continue;
        }
        
        // Skip timecode lines
        if (/\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/.test(line)) {
            isTextLine = true;
            continue;
        }
        
        // This is subtitle text
        if (isTextLine || (!(/^\d+$/.test(line)) && !(/\d{2}:\d{2}:\d{2},\d{3}/.test(line)))) {
            textLines.push(line);
        }
    }
    
    return textLines.join('\n');
}

// Convert text to SRT format
function convertTextToSrt(textContent) {
    const lines = textContent.split('\n').filter(line => line.trim());
    let srtContent = '';
    let subtitleIndex = 1;
    let currentTime = 0; // in milliseconds
    const defaultDuration = 3000; // 3 seconds per subtitle
    const gap = 500; // 0.5 second gap between subtitles
    
    for (let line of lines) {
        if (!line.trim()) continue;
        
        const startTime = formatTime(currentTime);
        const endTime = formatTime(currentTime + defaultDuration);
        
        srtContent += `${subtitleIndex}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${line.trim()}\n\n`;
        
        subtitleIndex++;
        currentTime += defaultDuration + gap;
    }
    
    return srtContent.trim();
}

// Format time in SRT format (HH:MM:SS,mmm)
function formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Save content to localStorage
function saveToLocalStorage(type, content) {
    try {
        localStorage.setItem(`srt-checker-${type}`, content);
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

// Load content from localStorage
function loadFromLocalStorage() {
    try {
        const srtContent = localStorage.getItem('srt-checker-srt');
        const txtContent = localStorage.getItem('srt-checker-txt');
        
        if (srtContent) {
            srtEditor.value = srtContent;
            srtInfo.textContent = 'Restored from previous session';
        }
        
        if (txtContent) {
            txtEditor.value = txtContent;
            txtInfo.textContent = 'Restored from previous session';
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save/export
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (document.activeElement === srtEditor) {
            exportFile('srt');
        } else if (document.activeElement === txtEditor) {
            exportFile('txt');
        }
    }
    
    // Ctrl+O to open file dialog
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        if (document.activeElement === srtEditor) {
            srtUpload.click();
        } else if (document.activeElement === txtEditor) {
            txtUpload.click();
        }
    }
    
    // Ctrl+E to extract text from SRT
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        extractTextFromSrt();
    }
    
    // Ctrl+R to convert TXT to SRT
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        convertTxtToSrt();
    }
});

// Show keyboard shortcuts on first visit
if (!localStorage.getItem('srt-checker-shortcuts-shown')) {
    setTimeout(() => {
        alert('Keyboard Shortcuts:\n' +
              'Ctrl+S: Export current file\n' +
              'Ctrl+O: Open file dialog\n' +
              'Ctrl+E: Extract text from SRT\n' +
              'Ctrl+R: Convert TXT to SRT');
        localStorage.setItem('srt-checker-shortcuts-shown', 'true');
    }, 1000);
}

// AI Comparison Functions
async function compareWithAI() {
    const srtContent = srtEditor.value.trim();
    const txtContent = txtEditor.value.trim();
    
    // Validate content
    if (!srtContent || !txtContent) {
        updateAIStatus('Please load both SRT and TXT files before comparing.', 'error');
        return;
    }
    
    try {
        // Update UI to loading state
        compareAiBtn.disabled = true;
        compareAiBtn.textContent = '🤖 ANALYZING...';
        updateAIStatus('Analyzing content with AI...', 'loading');
        
        // Extract text from SRT for comparison
        const extractedSrtText = parseSrtToText(srtContent);
        
        // Call Gemini API
        const comparisonResult = await callGeminiAPI(txtContent, extractedSrtText, srtContent);
        
        // Display results
        displayAIResults(comparisonResult);
        updateAIStatus('Analysis complete!', 'success');
        
    } catch (error) {
        console.error('AI Comparison Error:', error);
        let errorMessage = 'Error during analysis. ';
        
        if (error.message.includes('404')) {
            errorMessage += 'API endpoint not found. Please check if the Gemini API is accessible.';
        } else if (error.message.includes('403')) {
            errorMessage += 'Access denied. Please check your API key.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Network error. Please check your internet connection.';
        } else {
            errorMessage += error.message;
        }
        
        updateAIStatus(errorMessage, 'error');
    } finally {
        // Reset button state
        compareAiBtn.disabled = false;
        compareAiBtn.textContent = '🤖 COMPARE WITH AI';
    }
}

async function callGeminiAPI(originalText, srtText, fullSrtContent) {
    const prompt = `Compare the ORIGINAL TEXT with the SUBTITLE TEXT and provide a side-by-side comparison showing differences.

ORIGINAL TEXT (Reference):
${originalText}

SUBTITLE TEXT (From SRT):
${srtText}

Please provide a side-by-side comparison in this exact format:

**SIDE-BY-SIDE COMPARISON:**

| ORIGINAL | SUBTITLE | ISSUE TYPE |
|----------|----------|------------|
| [original phrase] | [subtitle phrase] | [Grammar/Punctuation/Spelling/Missing/Extra] |

**SPECIFIC DIFFERENCES FOUND:**

For each difference, show:
- **Line/Phrase**: "[original text]" vs "[subtitle text]"
- **Issue**: [What's wrong - grammar, punctuation, spelling, etc.]
- **Fix**: "[suggested correction]"

**SUMMARY:**
- Total differences found: [number]
- Most common issues: [list top 2-3 issue types]
- Accuracy rate: [percentage]

Focus ONLY on actual differences between the texts. Ignore timing codes. Be precise and concise.`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    console.log('Making API request to:', GEMINI_API_URL);
    console.log('Request body:', requestBody);
    
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
        const errorText = await response.text();
        console.log('API Error response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response format');
    }

    return data.candidates[0].content.parts[0].text;
}

function displayAIResults(analysisText) {
    // Format the analysis text for better display
    const formattedText = formatAnalysisText(analysisText);
    resultsContent.innerHTML = formattedText;
    aiResults.style.display = 'block';
    
    // Scroll to results
    aiResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatAnalysisText(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text
        // Headers
        .replace(/\*\*(.*?)\*\*/g, '<h5>$1</h5>')
        .replace(/#{1,6}\s*(.*?)$/gm, '<h5>$1</h5>')
        // Bold text
        .replace(/\*([^*]+)\*/g, '<span class="issue-type">$1</span>')
        // Lists
        .replace(/^\d+\.\s*(.*?)$/gm, '<li>$1</li>')
        .replace(/^[-*]\s*(.*?)$/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    formatted = '<p>' + formatted + '</p>';
    
    // Clean up empty paragraphs
    formatted = formatted.replace(/<p><\/p>/g, '');
    
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    formatted = formatted.replace(/<\/ul><ul>/g, '');
    
    return formatted;
}

function clearAIResults() {
    aiResults.style.display = 'none';
    resultsContent.innerHTML = '';
    updateAIStatus('Ready to compare', '');
}

function updateAIStatus(message, type = '') {
    aiStatus.textContent = message;
    aiStatus.className = 'ai-status' + (type ? ` ${type}` : '');
} 
