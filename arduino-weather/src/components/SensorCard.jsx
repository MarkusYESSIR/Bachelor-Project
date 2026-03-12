function SensorCard({ label, value, unit }) {
  const styles = {
    card: { 
      padding: '20px 40px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff',
      minWidth: '200px',
      flex: '1'
    },
    valueText: { fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#333' },
    labelText: { fontSize: '16px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }
  };

  const displayValue = value !== null && value !== undefined ? `${value}${unit}` : '--';

  return (
    <div style={styles.card}>
      <div style={styles.labelText}>{label}</div>
      <div style={styles.valueText}>{displayValue}</div>
    </div>
  );
}

// This line allows other files to import this function!
export default SensorCard;