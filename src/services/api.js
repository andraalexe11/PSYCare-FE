// services/api.js
const API_URL = "http://localhost:8080";

export const registerPsychologist = async (registerData) => {
  try {
    console.log("Sending to backend:", registerData);

    const response = await fetch(`${API_URL}/auth/register/psychologist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed");
    }

    const result = await response.text();
    return { success: true, message: result };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "Cannot connect to server",
    };
  }
};

export const getUnassignedPatients = async (token) => {
  try {
    const response = await fetch(
      `${API_URL}/psychologists/me/patients/unassigned`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch unassigned patients:", error);
    return {
      success: false,
      message: error.message || "Cannot fetch unassigned patients",
    };
  }
};

export const getAssignedPatients = async (token) => {
  try {
    const response = await fetch(
      `${API_URL}/psychologists/me/patients/assigned`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch assigned patients:", error);
    return {
      success: false,
      message: error.message || "Cannot fetch assigned patients",
    };
  }
};

export const getSharedJournalEntries = async (token) => {
  try {
    const response = await fetch(`${API_URL}/journal/shared`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch journal entries:", error);
    return {
      success: false,
      message: error.message || "Cannot fetch journal entries",
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    console.log("Attempting login for:", credentials.username);

    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (response.status === 401) {
      return {
        success: false,
        message: "Invalid username or password",
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `Login failed with status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("Login response:", result);

    const fullToken = result.accessToken;
    const cleanToken = fullToken.replace("Bearer ", "");

    return {
      success: true,
      token: cleanToken,
      role: result.role,
      userData: result.userData,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.message || "Cannot connect to server",
    };
  }
};

export const assignPatient = async (patientId, token) => {
  try {
    console.log(`Assigning patient ${patientId}`);

    const response = await fetch(
      `${API_URL}/psychologists/me/patients/${patientId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Assignment failed: ${response.status}`);
    }

    const result = await response.text();
    return {
      success: true,
      message: result || "Patient assigned successfully",
    };
  } catch (error) {
    console.error("Assign patient error:", error);
    return {
      success: false,
      message: error.message || "Cannot assign patient",
    };
  }
};

export const getBookedSessions = async (token) => {
  try {
    const response = await fetch(`${API_URL}/psychologists/me/appointments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return {
      success: false,
      message: error.message || "Cannot fetch sessions",
    };
  }
};

export const bookSession = async (appointmentData, token) => {
  try {
    console.log("Booking session data:", appointmentData);

    const response = await fetch(`${API_URL}/psychologists/me/appointments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Booking failed: ${response.status}`);
    }

    const result = await response.text();
    return {
      success: true,
      message: result || "Session booked successfully",
    };
  } catch (error) {
    console.error("Book session error:", error);
    return {
      success: false,
      message: error.message || "Cannot book session",
    };
  }
};

export const formatAppointmentData = (
  dateStr,
  timeStr,
  durationMinutes,
  patientId
) => {
  const startDateTimeStr = `${dateStr}T${timeStr}:00`;

  const startTime = startDateTimeStr;

  const startDate = new Date(startDateTimeStr);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const endTime = endDate.toISOString().slice(0, 19).replace("T", " ");

  return {
    startTime: startTime.replace("T", " "),
    endTime: endTime,
    patientId: patientId,
  };
};

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const registerPatient = async (data) => {
  const res = await fetch(`${API_URL}/auth/register/patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  return {
    success: res.ok,
    message: text,
  };
};

export const getMyJournals = async (token) => {
  const res = await fetch(`${API_URL}/journal`, {
    headers: authHeader(token),
  });
  return res.json();
};

export const createJournal = async (data, token) => {
  const res = await fetch(`${API_URL}/journal`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });

  const text = await res.text();

  return {
    success: res.ok,
    message: text,
  };
};

export const updateJournal = async (id, data, token) => {
  const res = await fetch(`${API_URL}/journal/${id}`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });

  const text = await res.text();

  return {
    success: res.ok,
    message: text,
  };
};

export const deleteJournal = async (id, token) => {
  const res = await fetch(`${API_URL}/journal/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });

  const text = await res.text();

  return {
    success: res.ok,
    message: text || "Journal deleted",
  };
};

export const shareJournal = async (id, psychologistId, token) => {
  const res = await fetch(`${API_URL}/journal/${id}/share`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ psychologistId }),
  });

  const text = await res.text();

  return {
    success: res.ok,
    message: text || "Journal shared",
  };
};

export const submitMood = async (data, token) => {
  const res = await fetch(`${API_URL}/mood`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });

  const text = await res.text();

  return {
    success: res.ok,
    message: text || "Mood submitted",
  };
};
