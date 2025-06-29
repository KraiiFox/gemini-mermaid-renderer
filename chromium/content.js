(function() {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
        
        .mermaid-output-wrapper {
            margin: 10px 0;
            padding: 10px;
            background-color: transparent; 
            position: relative;
        }
        
        .mermaid-controls {
            text-align: right;
            margin-top: 10px;
            display: flex; 
            justify-content: flex-end; 
            gap: 10px; 
            flex-wrap: wrap; 
        }

        
        .mermaid-controls button {
            
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            border: none;
            background: none;
            padding: 8px 15px; 
            border-radius: 6px; 
            cursor: pointer;
            font-size: 0.9em; 
            font-weight: 500; 
            display: inline-flex; 
            align-items: center;
            justify-content: center;
            gap: 8px; 
            transition: background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, border-color 0.2s ease;

            
            color: #555; 
            background-color: #f9f9f9; 
            border: 1px solid #e0e0e0; 
        }

        
        .mermaid-controls button:hover {
            background-color: #f0f0f0; 
            border-color: #d0d0d0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
        }
        .mermaid-controls button:focus {
            outline: none; 
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5); 
            border-color: #4299e1; 
        }

        
        .mermaid-controls button svg {
            width: 16px; 
            height: 16px;
            fill: currentColor; 
            flex-shrink: 0; 
        }

        
        body.dark-theme .mermaid-output-wrapper {
            background-color: transparent;
        }
        body.dark-theme .mermaid-controls button {
            color: #bbb; 
            background-color: #333; 
            border-color: #444; 
        }
        body.dark-theme .mermaid-controls button:hover {
            background-color: #444;
            border-color: #555;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        body.dark-theme .mermaid-controls button:focus {
            box-shadow: 0 0 0 3px rgba(100, 150, 250, 0.5); 
            border-color: #6496fa;
        }

        
        .mermaid-rendered-diagram {
            padding: 15px;
            background-color: transparent;
            max-width: 100%;
            height: auto;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
        }
        .mermaid-rendered-diagram svg {
            display: block;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .original-mermaid-code {
            background-color: #f8f8f8;
            border: 1px solid #e0e0e0;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            white-space: pre-wrap;
            overflow-x: auto;
            color: #333;
            font-size: 0.9em;
        }
        body.dark-theme .original-mermaid-code {
            background-color: #282828;
            border-color: #444;
            color: #eee;
        }
    `;
    document.head.appendChild(style);

    const icons = {
        code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
        diagram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2 0V4.07c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z"/></svg>', // Simple circle for diagram
        download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>'
    };

    function initializeMermaid() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const mermaidTheme = isDarkTheme ? 'dark' : 'default';

        mermaid.initialize({
            startOnLoad: false,
            theme: mermaidTheme,
            flowchart: { useMaxWidth: true },
            securityLevel: 'loose',
            logLevel: 'silent',
            suppressErrorRendering: true,
            errorHandler: function(error) {
                console.log('Mermaid.js error (intercepted):', error);
            }
        });
        console.log(`Mermaid configuration applied with theme: ${mermaidTheme}`);
    }

    const mermaidDiagramTypes = [
        "graph", "sequenceDiagram", "classDiagram", "flowchart", "stateDiagram", "stateDiagram-v2",
        "erDiagram", "journey", "gantt", "pie", "quadrantChart", "requirementDiagram", "gitGraph",
        "C4Context", "C4Container", "C4Component", "C4Dynamic", "packet-beta", "C4Deployment",
        "mindmap", "timeline", "zenuml", "xychart-beta", "block-beta", "radar-beta", "sankey-beta",
    ];

    function isMermaidCode(textContent) {
        if (!textContent || typeof textContent !== 'string') return false;
        const firstLine = textContent.trim().split('\n')[0].trim();
        return mermaidDiagramTypes.some(type => firstLine.startsWith(type));
    }

    function isErrorSvg(svgString) {
        return svgString.includes('aria-roledescription="error"') ||
               svgString.includes('class="error-icon"') ||
               svgString.includes('class="error-text"') ||
               svgString.includes('Syntax error in text');
    }

    function downloadSvg(svgContent, filename) {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function renderMermaidBlocks(container) {
        const selector = 'code[data-test-id="code-content"], ms-code-block pre code';
        const codeBlocks = container.querySelectorAll(selector);

        for (const codeBlock of codeBlocks) {
            if (isMermaidCode(codeBlock.textContent) && !codeBlock.dataset.mermaidProcessed) {
                initializeMermaid();

                const mermaidCode = codeBlock.textContent.trim();
                const diagramId = 'mermaid-diagram-' + Math.random().toString(36).substr(2, 9);

                if (mermaidCode.length > 0) {
                    try {
                        const codeBlockParent = codeBlock.closest('code-block, ms-code-block');
                        if (!codeBlockParent) {
                            console.warn('Could not find a suitable parent (<code-block> or <ms-code-block>) for Mermaid code. Skipping.');
                            codeBlock.dataset.mermaidProcessed = 'true';
                            continue;
                        }

                        const { svg } = await mermaid.render(diagramId, mermaidCode);
                        const renderedSvgContent = svg;

                        if (isErrorSvg(renderedSvgContent)) {
                            throw new Error('Mermaid rendered an error SVG, likely due to syntax issues in the code.');
                        }

                        // --- SUCCESS PATH ---
                        const mermaidWrapper = document.createElement('div');
                        mermaidWrapper.className = 'mermaid-output-wrapper';

                        const originalCodeDisplay = document.createElement('pre');
                        originalCodeDisplay.className = 'original-mermaid-code';
                        originalCodeDisplay.textContent = mermaidCode;
                        originalCodeDisplay.style.display = 'none';
                        mermaidWrapper.appendChild(originalCodeDisplay);

                        const svgContainer = document.createElement('div');
                        svgContainer.id = diagramId;
                        svgContainer.className = 'mermaid-rendered-diagram';
                        svgContainer.innerHTML = renderedSvgContent;
                        mermaidWrapper.appendChild(svgContainer);

                        let panzoomInstance = null;
                        const svgElement = svgContainer.querySelector('svg');
                        if (svgElement) {
                            if (typeof panzoom !== 'undefined') {
                                panzoomInstance = panzoom(svgElement, {
                                    panEnabled: true,
                                    zoomEnabled: true,
                                    controlIconsEnabled: false,
                                    dblClickZoomEnabled: true,
                                    mouseWheelZoomEnabled: true,
                                });
                            } else {
                                console.warn("Panzoom library not found. Diagram will not be interactive.");
                            }
                        }

                        const controlsDiv = document.createElement('div');
                        controlsDiv.className = 'mermaid-controls';

                        const toggleButton = document.createElement('button');
                        const toggleButtonText = document.createElement('span');
                        const toggleButtonIcon = document.createElement('span');

                        toggleButton.appendChild(toggleButtonIcon);
                        toggleButton.appendChild(toggleButtonText);

                        const updateToggleButton = (isShowingDiagram) => {
                            toggleButtonText.textContent = isShowingDiagram ? 'Show Code' : 'Show Diagram';
                            toggleButtonIcon.innerHTML = isShowingDiagram ? icons.code : icons.diagram;
                        };

                        updateToggleButton(true);

                        toggleButton.addEventListener('click', () => {
                            const isShowingDiagram = svgContainer.style.display !== 'none';
                            svgContainer.style.display = isShowingDiagram ? 'none' : 'block';
                            originalCodeDisplay.style.display = isShowingDiagram ? 'block' : 'none';
                            updateToggleButton(!isShowingDiagram);

                            if (panzoomInstance) {
                                isShowingDiagram ? panzoomInstance.pause() : panzoomInstance.resume();
                            }
                        });
                        controlsDiv.appendChild(toggleButton);

                        const downloadSvgButton = document.createElement('button');
                        downloadSvgButton.innerHTML = icons.download + '<span>Download SVG</span>';
                        downloadSvgButton.addEventListener('click', () => {
                            const filename = `mermaid-diagram-${new Date().toISOString().slice(0, 10)}.svg`;
                            downloadSvg(renderedSvgContent, filename);
                        });
                        controlsDiv.appendChild(downloadSvgButton);

                        mermaidWrapper.appendChild(controlsDiv);
                        codeBlockParent.replaceWith(mermaidWrapper);
                        codeBlock.dataset.mermaidProcessed = 'true';
                        console.log('Mermaid diagram rendered successfully.');

                    } catch (error) {
                        // --- ERROR PATH ---
                        console.warn('Failed to render Mermaid diagram. Leaving original code block. Error:', error);
                        console.warn('Offending Mermaid code:', mermaidCode);
                        codeBlock.dataset.mermaidProcessed = 'true';
                        // Attempt to remove any incomplete mermaid rendering artifacts
                        const potentialErrorDiv = document.querySelector(`#d${diagramId}`);
                        if (potentialErrorDiv) {
                            potentialErrorDiv.remove();
                        }
                    }
                }
            }
        }
    }

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && (node.matches('code-block, ms-code-block, ms-chat-turn') || node.querySelector('code-block, ms-code-block'))) {
                        renderMermaidBlocks(node);
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        setTimeout(() => renderMermaidBlocks(document.body), 500);
        setTimeout(() => renderMermaidBlocks(document.body), 1500);
    });
})();