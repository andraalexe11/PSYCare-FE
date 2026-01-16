import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="question-box">
        <h2>Select your role to get started</h2>

        <div className="role-buttons">
          <button
            className="glass-btn role-btn psychologist-btn"
            onClick={() => navigate("/register/psychologist")}
          >
            <div className="text">
              <h3>Psychologist</h3>
              <p>I provide mental health support</p>
            </div>
          </button>

          <button
            className="glass-btn role-btn patient-btn"
            onClick={() => navigate("/register/patient")}
          >
            <div className="text">
              <h3>Patient</h3>
              <p>I'm seeking support</p>
            </div>
          </button>
        </div>
      </div>

      <div className="login-prompt">
        <p>Already have an account?</p>
        <button
          className="glass-btn login-link-btn"
          onClick={() => navigate("/login")}
        >
          Log in here
        </button>
      </div>
    </div>
  );
};

export default HomePage;
