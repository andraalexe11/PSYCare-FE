import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPatient, loginUser } from "../services/api";

const PatientRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerPatient(formData);

      if (res.success) {
        const login = await loginUser({
          username: formData.username,
          password: formData.password,
        });

        localStorage.setItem("token", login.token);
        localStorage.setItem("userRole", login.role);
        navigate("/patient-dashboard");
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.log(err.message);
      alert("Registration failed");
    }
  };

  return (
    <div className="register-container">
      <h2>Create Patient Account</h2>

      <form onSubmit={handleSubmit} className="register-form">
        <input
          name="username"
          placeholder="Username"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <input
          name="firstName"
          placeholder="First Name"
          required
          onChange={handleChange}
        />
        <input
          name="lastName"
          placeholder="Last Name"
          required
          onChange={handleChange}
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          onChange={handleChange}
        />

        <button className="glass-btn">Register</button>
      </form>
    </div>
  );
};

export default PatientRegister;
