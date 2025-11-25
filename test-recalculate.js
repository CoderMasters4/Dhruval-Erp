// Test script to recalculate totals for a specific visit
const visitId = '68b955693acd0dd0a7a30937';

async function testRecalculate() {
  try {
    const response = await fetch(`http://localhost:5000/api/v1/customer-visits/${visitId}/recalculate-totals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Recalculation successful!');
      console.log('Updated visit data:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Recalculation failed:', error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testRecalculate();
