# Strategic Decision Analysis Tool 

![app-icon-512](https://github.com/user-attachments/assets/4e7db8a9-2e01-4752-8cf8-11f34b47ab94)

## What is this app?

**Strategic Decision Analysis Tool** is a modern, user-friendly web app that helps you make better, more confident decisions by comparing your options using three powerful methods: **Expected Value**, **Risk Assessment**, and **Sensitivity Analysis**.

Whether you're a business leader, student, consultant, or anyone facing a tough choice, this tool guides you through structuring your options, estimating possible outcomes, and understanding the trade-offs—so you can choose with clarity, not just gut feeling.

---

## Key Features

- **Easy Option Setup:** Add as many options as you want, each with their own possible outcomes.
- **Outcome Analysis:** For each outcome, specify its impact (good or bad), probability, and importance to you.
- **Expected Value Calculation:** See which option is likely to give the best results on average.
- **Risk Assessment:** Understand which options are "safe bets" and which are high-risk/high-reward.
- **Sensitivity Analysis:** Discover which assumptions matter most—see how much your decision would change if your estimates are off.
- **Beautiful, Accessible UI:** Works great on desktop and mobile, with color contrast, ARIA labels, and touch-friendly controls.
- **Export & Share:** Download your results as PDF or Excel, copy to clipboard, or save as a text report.
- **Feedback:** Users can rate their experience and leave feedback directly in the app.

---

## Who is it for?
- **Business professionals** making strategic, financial, or project decisions
- **Consultants and coaches** helping clients weigh options
- **Students and educators** learning about decision science
- **Nonprofits and advocacy groups** evaluating strategies
- **Human rights and social impact professionals** making tough choices about advocacy, resource allocation, or partnerships
- **Anyone** facing a complex or high-stakes choice

---

## Human Rights & Social Impact Example Scenarios

This tool is especially useful for human rights researchers, advocates, and organizations. Example decisions you can analyze:
- Should we launch a legal challenge or focus on advocacy campaigns?
- How do we allocate limited resources between direct aid and policy work?
- Which partnership offers the best balance of impact and risk for our cause?
- Should we prioritize urgent response or long-term capacity building?

---

## How does it work?
1. **List your options** (e.g., "Launch new product" vs. "Expand to new market" or "Advocacy campaign" vs. "Legal challenge").
2. **Add possible outcomes** for each option, with their impact, probability, and importance.
3. **Analyze:** Instantly see which option has the best expected value, the most/least risk, and which assumptions are most critical.
4. **Export or share** your results, or leave feedback to help improve the tool.

---

## Analysis Algorithm Documentation

This tool analyzes your decision options using three methods: Expected Value, Risk Assessment, and Sensitivity Analysis. Below are the formulas and logic used for each calculation.

### 1. Expected Value
For each option:
- Expected Value = sum of (Impact × Probability × Importance) for all outcomes

Formula:
```
Expected Value = Σ (Impact × Probability × Importance)
```
Where:
- Impact: The effect of the outcome (range: -10 to 10)
- Probability: Likelihood of the outcome (range: 0 to 1)
- Importance: How much you care about the outcome (range: 1 to 10)

### 2. Risk (Standard Deviation)
For each option:
1. Calculate each outcome's value: `Impact × Probability × Importance`
2. Compute the mean of these values
3. Risk = Standard deviation of these values

Formula:
```
Risk = sqrt( Σ (value - mean)^2 / N )
```
Where:
- value: Each outcome's calculated value
- mean: Average of all outcome values
- N: Number of outcomes

### 3. Sensitivity Analysis
For each option:
- Plus scenario: Increase each outcome's value by 25%
- Minus scenario: Decrease each outcome's value by 25%
- Sensitivity = Absolute difference between the sum of plus and minus scenarios

Formula:
```
Sensitivity = |Σ (1.25 × Impact × Probability × Importance) - Σ (0.75 × Impact × Probability × Importance)|
```

---

### Example Calculation
Suppose an option has two outcomes:
- Outcome 1: Impact = 10, Probability = 0.5, Importance = 5
- Outcome 2: Impact = -5, Probability = 0.5, Importance = 2

Expected Value:
- (10 × 0.5 × 5) + (-5 × 0.5 × 2) = 25 - 5 = 20

Risk:
- Values: 25, -5
- Mean: (25 + -5) / 2 = 10
- Variance: ((25-10)^2 + (-5-10)^2) / 2 = (225 + 225) / 2 = 225
- Risk (Std Dev): sqrt(225) = 15

Sensitivity:
- Plus: (1.25 × 10 × 0.5 × 5) + (1.25 × -5 × 0.5 × 2) = 31.25 - 6.25 = 25
- Minus: (0.75 × 10 × 0.5 × 5) + (0.75 × -5 × 0.5 × 2) = 18.75 - 3.75 = 15
- Sensitivity: |25 - 15| = 10

---

For more details, see the code in `script.js` (function: `analyzeChoices`). 

