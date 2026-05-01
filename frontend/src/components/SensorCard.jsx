function SensorCard({ label, value, unit, alertMessage }) {
  const styles = {
    card: { 
      padding: '20px 15 px', // Changed from '20px 40px' to be narrower
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff',
      Width: '100%', // Ensure the card takes full width of its container
      maxWidth: '800px',
      boxSizing: 'border-box', // Essential to keep padding inside the width
      display: 'flex',          
      flexDirection: 'column',   
      alignItems: 'center',      // This centers the label and value horizontally
      justifyContent: 'center',  // This centers them vertically if the card is tall
      flex: '1'
    },
    // This container allows the number and alert to sit side-by-side
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',   // Change from 'row' or 'baseline' to 'column' for mobile
      alignItems: 'center',      // Centers the value and alert message
      gap: '5px',                // Reduces gap between number and alert
      textAlign: 'center'        // Ensures the text itself is centered
    },
    valueText: { fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#333', textAlign: 'center' },
    labelText: { fontSize: '16px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' },
    alertText: { fontSize: '14px', color: '#e74c3c', fontWeight: 'bold', animation: 'pulse 2s infinite', textAlign: 'center' }
  };

  const displayValue = value !== null && value !== undefined && value !== "--" ? `${value}${unit}` : '--';

  return (
    <div style={styles.card}>
      <div style={styles.labelText}>{label}</div>
      <div style={styles.contentContainer}>
        <div style={styles.valueText}>{displayValue}</div>
        
        {/* The Alert Logic */}
        {alertMessage && (
          <span style={styles.alertText}>{alertMessage}</span>
        )}
      </div>
    </div>
  );
}
// This line allows other files to import this function!
export default SensorCard;