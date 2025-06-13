document.addEventListener('DOMContentLoaded', function() {
  // Global variables
  let choiceCount = 0;
  let analysisData = null;
  let charts = {};

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');

  /**
   * Sets the theme (light or dark) for the application.
   * @param {string} theme - The theme to set ('light' or 'dark').
   */
  function setTheme(theme) {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.body.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  themeToggle.addEventListener('click', function() {
    const currentTheme = document.body.hasAttribute('data-theme') ? 'dark' : 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Tab management
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');

      if (analysisData && tabId !== 'setup') {
        updateTabContent(tabId);
      }
    });
  });

  // DOM Elements
  const choicesList = document.getElementById('choicesList');
  const addChoiceBtn = document.getElementById('addChoiceBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');

  // Debounce utility function

  /**
   * Debounces a function, ensuring it only runs after a delay since the last call.
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The delay in milliseconds.
   * @returns {Function} The debounced function.
   */
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Add this function to update analysis preview or enable analyze button (optional)

  /**
   * Handler for input changes (debounced). Used for live feedback or enabling buttons.
   */
  function onInputChanged() {
    // Optionally, you could update a live preview or enable/disable the analyze button here
    // For now, this is a placeholder for future live feedback
  }
  const debouncedInputHandler = debounce(onInputChanged, 300);

  // Create outcome row

  /**
   * Creates a new outcome row DOM element for a choice.
   * @param {number} choiceIdx - The index of the choice.
   * @param {number} outIdx - The index of the outcome.
   * @param {string} [description=''] - The outcome description.
   * @param {string|number} [impact=''] - The impact value.
   * @param {string|number} [probability=''] - The probability value.
   * @param {string|number} [importance=''] - The importance value.
   * @returns {HTMLDivElement} The outcome row element.
   */
  function createOutcomeRow(choiceIdx, outIdx, description = '', impact = '', probability = '', importance = '') {
    const row = document.createElement('div');
    row.className = 'outcome-grid fade-in';
    
    row.innerHTML = `
      <input type="text" placeholder="What might happen?" value="${description}">
      <input type="number" placeholder="-10 to 10" value="${impact}" min="-10" max="10" title="How big is the impact? (-10=very bad, 10=very good)">
      <input type="number" placeholder="0-1" value="${probability}" min="0" max="1" step="0.1" title="How likely is this? (0=never, 1=certain)">
      <input type="number" placeholder="1-10" value="${importance}" min="1" max="10" title="How important is this outcome? (1=not important, 10=critical)">
      <button onclick="removeOutcome(this)" title="Remove this outcome" style="background: none; border: none; color: var(--warning); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: all 0.2s ease;">×</button>
    `;
    
    // Attach debounced input listeners
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', debouncedInputHandler);
    });
    return row;
  }

  // Create choice card

  /**
   * Creates a new choice card DOM element.
   * @param {number|null} [index=null] - The index for the choice card.
   * @returns {HTMLDivElement} The choice card element.
   */
  function createChoiceCard(index = null) {
    const choiceIdx = index !== null ? index : choiceCount++;
    const card = document.createElement('div');
    card.className = 'choice-card fade-in';
    card.dataset.choiceIndex = choiceIdx;
    
    card.innerHTML = `
      <button class="remove-choice" onclick="removeChoice(this)" title="Remove this option">×</button>
      <div class="form-group">
        <label>Option Name</label>
        <input type="text" placeholder="e.g. Social Media Campaign" class="choice-name">
      </div>
      <div class="instruction-box">
        <strong>For each outcome, enter 3 numbers:</strong><br>
        • <strong>Impact (-10 to +10):</strong> How big is the effect? Use positive for good outcomes (1-10), negative for bad outcomes (-10 to -1)<br>
        • <strong>Probability (0-1):</strong> How likely is this? (0=never happens, 1=always happens)<br>
        • <strong>Importance (1-10):</strong> How much do you care about this outcome? (1=not important, 10=critical)<br>
        <span class="example-text"><strong>e.g.</strong> "Lose lawsuit" might be Impact: -8, Probability: 0.3, Importance: 9</span>
      </div>
      <div class="outcomes-list"></div>
      <button class="btn btn-outline" type="button" onclick="addOutcome(this)" style="margin-top: 1rem;">➕ Add Outcome</button>
    `;

    const outcomesList = card.querySelector('.outcomes-list');
    // Add two empty outcome rows by default
    for (let i = 0; i < 2; i++) {
      outcomesList.appendChild(createOutcomeRow(choiceIdx, i));
    }
    // Attach debounced input listener to option name
    card.querySelector('.choice-name').addEventListener('input', debouncedInputHandler);
    return card;
  }

  /**
   * Adds a new choice card to the choices list.
   * @param {number|null} [index=null] - The index for the new choice card.
   */
  function addChoice(index = null) {
    choicesList.appendChild(createChoiceCard(index));
    choiceCount = document.querySelectorAll('.choice-card').length;
  }

  // Make functions global so they can be called from onclick handlers
  window.removeChoice = function(btn) {
    btn.closest('.choice-card').remove();
    choiceCount = document.querySelectorAll('.choice-card').length;
  };

  window.addOutcome = function(btn) {
    const card = btn.closest('.choice-card');
    const index = Array.from(choicesList.children).indexOf(card);
    const outcomesList = card.querySelector('.outcomes-list');
    outcomesList.appendChild(createOutcomeRow(index, outcomesList.children.length));
  };

  window.removeOutcome = function(btn) {
    btn.closest('.outcome-grid').remove();
  };

  window.closeResults = function() {
    document.getElementById('resultsModal').classList.remove('visible');
  };

  // Add initial choice cards
  addChoice();
  addChoice();

  addChoiceBtn.addEventListener('click', function() {
    addChoice();
  });

  /**
   * Gathers and parses all user input from the DOM into a structured array.
   * @returns {Array} Array of choice objects with outcomes.
   */
  function getAnalysisInput() {
    const cards = document.querySelectorAll('.choice-card');
    const choices = [];
    for (let card of cards) {
      const name = card.querySelector('.choice-name').value || 'Untitled Option';
      const outcomes = [];
      const rows = card.querySelectorAll('.outcome-grid');
      for (let row of rows) {
        const [desc, impact, prob, imp] = Array.from(row.querySelectorAll('input')).map(i => i.value);
        if (!desc || !impact || !prob || !imp) continue;
        outcomes.push({
          description: desc,
          impact: parseFloat(impact),
          probability: parseFloat(prob),
          importance: parseFloat(imp)
        });
      }
      if (outcomes.length) choices.push({ name, outcomes });
    }
    return choices;
  }

  /**
   * Analyzes the choices and calculates expected value, risk, and sensitivity for each.
   * @param {Array} choices - Array of choice objects with outcomes.
   * @returns {Array} Array of result objects for each choice.
   */
  function analyzeChoices(choices) {
    const results = choices.map(choice => {
      let expectedValue = 0;
      let variance = 0;
      let mean = 0;
      let sumWeights = 0;
      let outcomeValues = [];
      for (let o of choice.outcomes) {
        const val = o.impact * o.probability * o.importance;
        outcomeValues.push(val);
        expectedValue += val;
        sumWeights += 1;
      }
      mean = expectedValue / (sumWeights || 1);
      for (let v of outcomeValues) {
        variance += Math.pow(v - mean, 2);
      }
      variance = variance / (outcomeValues.length || 1);

      let plus = 0, minus = 0;
      for (let o of choice.outcomes) {
        plus += 1.25 * o.impact * o.probability * o.importance;
        minus += 0.75 * o.impact * o.probability * o.importance;
      }
      let sensitivity = Math.abs(plus - minus);

      return {
        name: choice.name,
        expectedValue: expectedValue,
        risk: Math.sqrt(variance),
        sensitivity: sensitivity,
        plus, minus,
        current: expectedValue
      };
    });
    return results;
  }

  /**
   * Displays the analysis results in the modal, including charts and tables.
   * @param {Array} results - Array of result objects for each choice.
   */
  function showResults(results) {
    document.getElementById('resultsModal').classList.add('visible');
    let best = results.reduce((a, b) => (a.expectedValue > b.expectedValue ? a : b), results[0]);
    document.getElementById('resultSummary').textContent =
      `Best option: ${best.name} (Expected Value: ${best.expectedValue.toFixed(2)})`;

    // Chart: Expected Value
    if (charts.resultChart) charts.resultChart.destroy();
    const ctx = document.getElementById('resultChart').getContext('2d');
    charts.resultChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: results.map(r => r.name),
        datasets: [{
          label: 'Expected Value',
          data: results.map(r => r.expectedValue),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
          y: { 
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Chart: Risk vs Return
    if (charts.riskChart) charts.riskChart.destroy();
    const ctx2 = document.getElementById('riskChart').getContext('2d');
    charts.riskChart = new Chart(ctx2, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Options',
          data: results.map(r => ({ x: r.risk, y: r.expectedValue, label: r.name })),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const d = context.raw;
                return `${d.label}: Risk: ${d.x.toFixed(2)}, Value: ${d.y.toFixed(2)}`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: { 
            title: { display: true, text: 'Risk (Std Dev)' }, 
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          y: { 
            title: { display: true, text: 'Expected Value' }, 
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          }
        }
      }
    });

    // Sensitivity Table
    const tbody = document.getElementById('sensitivityTable').querySelector('tbody');
    tbody.innerHTML = '';
    for (let res of results) {
      let sens = res.sensitivity > res.current * 0.4 ? 'High' : res.sensitivity > res.current * 0.2 ? 'Medium' : 'Low';
      let badgeClass = sens === 'High' ? 'badge-error' : sens === 'Medium' ? 'badge-warning' : 'badge-success';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding: 1rem; border-bottom: 1px solid var(--border); font-weight: 500;">${res.name}</td>
        <td style="padding: 1rem; border-bottom: 1px solid var(--border);">${res.current.toFixed(2)}</td>
        <td style="padding: 1rem; border-bottom: 1px solid var(--border);">${res.plus.toFixed(2)}</td>
        <td style="padding: 1rem; border-bottom: 1px solid var(--border);">${res.minus.toFixed(2)}</td>
        <td style="padding: 1rem; border-bottom: 1px solid var(--border);"><span class="badge ${badgeClass}">${sens}</span></td>
      `;
      tbody.appendChild(row);
    }

    // Insights
    const insights = [];
    const sorted = [...results].sort((a, b) => b.expectedValue - a.expectedValue);
    insights.push(`<div class="insight-card"><strong>Best expected value:</strong> ${sorted[0].name}</div>`);
    const lowestRisk = results.reduce((a, b) => (a.risk < b.risk ? a : b), results[0]);
    insights.push(`<div class="insight-card"><strong>Lowest risk:</strong> ${lowestRisk.name}</div>`);
    const mostSensitive = results.reduce((a, b) => (a.sensitivity > b.sensitivity ? a : b), results[0]);
    insights.push(`<div class="insight-card"><strong>Most sensitive to assumptions:</strong> ${mostSensitive.name}</div>`);
    document.getElementById('insightsList').innerHTML = insights.join('');
  }

  // Improved robust input validation function

  /**
   * Validates all user input for completeness and correctness.
   * @param {Array} choices - Array of choice objects with outcomes.
   * @returns {string|null} Error message if invalid, or null if valid.
   */
  function validateInputs(choices) {
    if (choices.length < 2) {
      return "Please add at least two options before analyzing.";
    }
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      if (!choice.name || choice.name.trim() === "") {
        return `Option ${i + 1}: Name is required.`;
      }
      if (choice.name.length > 50) {
        return `Option ${i + 1}: Name is too long (max 50 characters).`;
      }
      if (!choice.outcomes.length) {
        return `Option ${i + 1}: Must have at least one outcome.`;
      }
      for (let j = 0; j < choice.outcomes.length; j++) {
        const outcome = choice.outcomes[j];
        if (!outcome.description || outcome.description.trim() === "") {
          return `Option ${i + 1}, Outcome ${j + 1}: Description is required.`;
        }
        if (outcome.description.length > 100) {
          return `Option ${i + 1}, Outcome ${j + 1}: Description is too long (max 100 characters).`;
        }
        if (typeof outcome.impact !== "number" || isNaN(outcome.impact) || outcome.impact < -10 || outcome.impact > 10) {
          return `Option ${i + 1}, Outcome ${j + 1}: Impact must be a number between -10 and 10.`;
        }
        if (typeof outcome.probability !== "number" || isNaN(outcome.probability) || outcome.probability < 0 || outcome.probability > 1) {
          return `Option ${i + 1}, Outcome ${j + 1}: Probability must be a number between 0 and 1.`;
        }
        if (typeof outcome.importance !== "number" || isNaN(outcome.importance) || outcome.importance < 1 || outcome.importance > 10) {
          return `Option ${i + 1}, Outcome ${j + 1}: Importance must be a number between 1 and 10.`;
        }
      }
    }
    return null; // No errors
  }

  // Update analyzeBtn click handler to use improved validation
  analyzeBtn.addEventListener('click', function() {
    const choices = getAnalysisInput();

    const error = validateInputs(choices);
    if (error) {
      alert(error);
      return;
    }

    // If all checks pass, proceed with analysis
    analysisData = analyzeChoices(choices);
    showResults(analysisData);
    updateTabContent('expected-value');
    updateTabContent('risk');
    updateTabContent('sensitivity');
  });

  /**
   * Updates the content of the analysis tabs based on the selected tab.
   * @param {string} tabId - The ID of the tab to update.
   */
  function updateTabContent(tabId) {
    if (!analysisData) return;
    if (tabId === 'expected-value') {
      document.getElementById('expectedValueResults').innerHTML =
        analysisData.map(r =>
          `<div class="results-card"><div><strong>${r.name}</strong></div><div style="color: var(--primary); font-weight: 700; font-size: 1.25rem;">${r.expectedValue.toFixed(2)}</div></div>`
        ).join('');
    } else if (tabId === 'risk') {
      document.getElementById('riskResults').innerHTML =
        analysisData.map(r => {
          const riskLevel = r.risk > 8 ? 'High' : r.risk > 4 ? 'Medium' : 'Low';
          const badgeClass = riskLevel === 'High' ? 'badge-error' : riskLevel === 'Medium' ? 'badge-warning' : 'badge-success';
          return `<div class="results-card"><div><strong>${r.name}</strong></div><div><span class="badge ${badgeClass}">Risk: ${riskLevel} (${r.risk.toFixed(2)})</span></div></div>`;
        }).join('');
    } else if (tabId === 'sensitivity') {
      document.getElementById('sensitivityResults').innerHTML =
        analysisData.map(r => {
          const sensLevel = r.sensitivity > r.current * 0.4 ? 'High' : r.sensitivity > r.current * 0.2 ? 'Medium' : 'Low';
          const badgeClass = sensLevel === 'High' ? 'badge-error' : sensLevel === 'Medium' ? 'badge-warning' : 'badge-success';
          return `<div class="results-card"><div><strong>${r.name}</strong></div><div><span class="badge ${badgeClass}">${sensLevel} Sensitivity (${r.sensitivity.toFixed(2)})</span></div></div>`;
        }).join('');
    }
  }

  document.getElementById('copyBtn').addEventListener('click', function() {
    let txt = 'Decision Analysis Results:\n';
    analysisData.forEach(r => {
      txt += `Option: ${r.name}\n  Expected Value: ${r.expectedValue.toFixed(2)}\n  Risk: ${r.risk.toFixed(2)}\n  Sensitivity: ${r.sensitivity.toFixed(2)}\n\n`;
    });
    navigator.clipboard.writeText(txt);
    alert('Results copied to clipboard!');
  });

  document.getElementById('downloadBtn').addEventListener('click', function() {
    let txt = 'Decision Analysis Results\n\n';
    analysisData.forEach(r => {
      txt += `Option: ${r.name}\n  Expected Value: ${r.expectedValue.toFixed(2)}\n  Risk: ${r.risk.toFixed(2)}\n  Sensitivity: ${r.sensitivity.toFixed(2)}\n\n`;
    });
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'decision-analysis.txt';
    a.click();
  });

}); // End of DOMContentLoaded 