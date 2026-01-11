
function BreakReminderModal({ countdown }) {
   const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    color: 'white',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    pointerEvents: 'none'
  };

  const contentStyle = {
    textAlign: 'center',
    padding: '40px',
    background: 'radial-gradient(circle,rgba(87, 192, 201, 1) 0%, rgba(255, 255, 255, 1) 100%)',
    borderRadius: '20px',
    maxWidth: '500px',
    border: 'none',
    pointerEvents: 'auto' 
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>🌿</h1>
        <h2 style={{ fontSize: '2em', marginBottom: '15px' }}>
          Breathing Break Time!
        </h2>
        
        <p style={{ fontSize: '1.5em', marginBottom: '10px' }}>
          Take a deep breath and relax your mind... 
        </p>
        
       <div style={{
            fontSize: '4em',
            margin: '30px 0',
            position: 'relative',
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
            }}>
            
            <p style={{
                position: 'absolute',
                bottom: '0px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.9)',
                animation: countdown > 5 ? 'breatheIn 4s infinite' : 'breatheOut 3s infinite'

            }}>
                {countdown > 5 ? 'INHALE' : 'EXHALE'}
            </p>
            </div>

            <style>
            {`
            @keyframes breatheIn {
                0%, 100% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.5); opacity: 1; }
            }
            
            @keyframes breatheOut {
                0%, 100% { transform: scale(1.5); opacity: 1; }
                50% { transform: scale(1); opacity: 0.7; }
            }
            `}
            </style>
        
        <p style={{ fontSize: '1.1em', opacity: 0.8 }}>
          You can continue in {countdown} seconds...
        </p>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

export default BreakReminderModal;