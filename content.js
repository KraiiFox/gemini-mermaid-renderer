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
        }
        .mermaid-controls button {
            margin-left: 8px;
            padding: 6px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            background-color: #f0f0f0;
            color: #333;
            cursor: pointer;
            font-size: 0.85em;
            transition: background-color 0.2s, border-color 0.2s;
        }
        .mermaid-controls button:hover {
            background-color: #e8e8e8;
            border-color: #ccc;
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
    `;
    document.head.appendChild(style);

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
                console.error('Mermaid.js error (intercepted):', error);
            }
        });
        console.log(`Mermaid configuration applied with theme: ${mermaidTheme}`);
    }

    const mermaidDiagramTypes = [
        "graph TD",
        "sequenceDiagram",
        "classDiagram",
        "flowchart",
        "stateDiagram",
        "stateDiagram-v2",
        "erDiagram",
        "journey",
        "gantt",
        "pie",
        "quadrantChart",
        "requirementDiagram",
        "gitGraph",
        "C4Context",
        "C4Container",
        "C4Component",
        "C4Dynamic",
        "packet-beta",
        "C4Deployment",
        "mindmap",
        "timeline",
        "zenuml",
        "xychart-beta",
        "block-beta",
        "radar-beta",
        "sankey-beta",
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
                            panzoomInstance = panzoom(svgElement, {
                                panEnabled: true,
                                zoomEnabled: true,
                                controlIconsEnabled: false,
                                dblClickZoomEnabled: true,
                                mouseWheelZoomEnabled: true,
                            });
                        }

                        const controlsDiv = document.createElement('div');
                        controlsDiv.className = 'mermaid-controls';

                        const toggleButton = document.createElement('button');
                        toggleButton.textContent = 'Show Code';
                        toggleButton.addEventListener('click', () => {
                            const isShowingDiagram = svgContainer.style.display !== 'none';
                            svgContainer.style.display = isShowingDiagram ? 'none' : 'block';
                            originalCodeDisplay.style.display = isShowingDiagram ? 'block' : 'none';
                            toggleButton.textContent = isShowingDiagram ? 'Show Diagram' : 'Show Code';
                            if (panzoomInstance) {
                                isShowingDiagram ? panzoomInstance.pause() : panzoomInstance.resume();
                            }
                        });
                        controlsDiv.appendChild(toggleButton);

                        const downloadSvgButton = document.createElement('button');
                        downloadSvgButton.textContent = 'Download SVG';
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
                        console.error('Failed to render Mermaid diagram. Leaving original code block. Error:', error);
                        console.error('Offending Mermaid code:', mermaidCode);
                        codeBlock.dataset.mermaidProcessed = 'true';
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