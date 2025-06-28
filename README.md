Use at your own risk, this shit is entirely AI generated. 🦊

## What it is:
A simple extension for chrome/firefox that takes mermaid codeblocks and renders it using mermaid.js
### Supported sites:
- https://gemini.google.com
- https://aistudio.google.com

### Features:
- Download generated diagram as SVG.
- Toggle between code and diagram view.
- Panning and zooming
- Handles syntax errors by defaulting to code view.

## Screenshots:
![image](https://github.com/user-attachments/assets/8726f403-a42f-4687-ac4a-5eb7138ad77c)

![image](https://github.com/user-attachments/assets/7e02b397-4940-4d31-be31-5c6adf014b1b)

![image](https://github.com/user-attachments/assets/d6bac690-81bc-44b5-9e12-b2efb5e33be5)

## Known issue:
- Sometimes the AI will generate brackets `()` in the text for the nodes which will cause mermaid to throw syntax errors, not much I can do about that.
- idk 

## Installation:
Clone / Download the repo and nagivate to your respective browser. Then:

### Firefox:
1. Navigate to about:debugging
2. Click on "This Firefox"
3. Click on "Load Temporary Add-on"
4. Select manifest.json from the folder.
5. Done

### Chrome(ium):
1. Nagivate to chrome://extensions
2. Enable developer mode
3. Load unpacked
4. Select the folder
5. Done


## Attributions
This extension uses the following open-source libraries:
- [mermaid.js](https://github.com/mermaid-js/mermaid)
- [panzoom](https://github.com/timmywil/panzoom)

