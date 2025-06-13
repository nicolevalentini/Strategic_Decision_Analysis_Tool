// Unit tests for analyzeChoices using Jest
const { analyzeChoices } = require('./script');

describe('analyzeChoices', () => {
  it('calculates expected value correctly for a simple case', () => {
    const choices = [
      {
        name: 'Option 1',
        outcomes: [
          { impact: 10, probability: 0.5, importance: 5, description: 'Good' },
          { impact: -5, probability: 0.5, importance: 2, description: 'Bad' }
        ]
      }
    ];
    const results = analyzeChoices(choices);
    // Expected value: (10*0.5*5) + (-5*0.5*2) = 25 - 5 = 20
    expect(results[0].expectedValue).toBe(20);
  });

  it('calculates risk (std dev) and sensitivity', () => {
    const choices = [
      {
        name: 'Option 2',
        outcomes: [
          { impact: 8, probability: 1, importance: 1, description: 'Only' }
        ]
      }
    ];
    const results = analyzeChoices(choices);
    // Only one outcome, so risk (std dev) should be 0
    expect(results[0].risk).toBe(0);
    // Sensitivity: plus = 1.25*8*1*1 = 10, minus = 0.75*8*1*1 = 6, sensitivity = 4
    expect(results[0].sensitivity).toBe(4);
  });

  it('handles multiple options and outcomes', () => {
    const choices = [
      {
        name: 'Option A',
        outcomes: [
          { impact: 5, probability: 0.6, importance: 2, description: 'A1' },
          { impact: 2, probability: 0.4, importance: 3, description: 'A2' }
        ]
      },
      {
        name: 'Option B',
        outcomes: [
          { impact: 7, probability: 0.5, importance: 1, description: 'B1' },
          { impact: -3, probability: 0.5, importance: 2, description: 'B2' }
        ]
      }
    ];
    const results = analyzeChoices(choices);
    expect(results.length).toBe(2);
    // Check that expected values are numbers
    expect(typeof results[0].expectedValue).toBe('number');
    expect(typeof results[1].expectedValue).toBe('number');
  });
}); 