function SensorCard({ label, value, unit, alertMessage }) {
  const styles = {
    card: { 
      padding: '20px 40px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff',
      minWidth: '200px',
      flex: '1'
    },
    // This container allows the number and alert to sit side-by-side
    contentContainer: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '15px' 
    },
    valueText: { fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#333' },
    labelText: { fontSize: '16px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' },
    alertText: { fontSize: '14px', color: '#e74c3c', fontWeight: 'bold', animation: 'pulse 2s infinite' }
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

export default SensorCard;