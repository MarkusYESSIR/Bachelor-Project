import React, { useEffect, useState } from "react";
function SensorCard({ label, value, unit, alertMessage }) {

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // Listen for window resize to update mobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const styles = {
    card: { 
      padding: isMobile ? '10px 15px' : '20px 15px',
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
      flex: '1',
      minHeight: isMobile ? '80px' : '120px',
    },
    // This container allows the number and alert to sit side-by-side
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',   // Change from 'row' or 'baseline' to 'column' for mobile
      alignItems: 'center',      // Centers the value and alert message
      gap: isMobile ? '2px' : '5px', // Tighter gap on mobile
      textAlign: 'center'        // Ensures the text itself is centered
    },
    valueText: { 
      fontSize: isMobile ? '24px' : '32px', // Smaller font for the reading
      fontWeight: 'bold',
      margin: isMobile ? '2px 0' : '10px 0', // Significantly less margin on mobile
      color: '#333',
      textAlign: 'center' 
    },
    labelText: { 
      fontSize: '16px', 
      color: '#666', 
      textTransform: 'uppercase', 
      letterSpacing: '1px', 
      textAlign: 'center'
    },
    alertText: { 
      fontSize: isMobile ? '12px' : '16px', // Smaller label for the alert message
      color: '#e74c3c', 
      fontWeight: 'bold', 
      animation: 'pulse 2s infinite', 
      textAlign: 'center' 
    },
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