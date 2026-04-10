import React, { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const savedCitizen = sessionStorage.getItem("adminSelectedCitizen");
    if (savedCitizen) {
      try {
        setSelectedCitizen(JSON.parse(savedCitizen));
      } catch (error) {
        console.error("Failed to parse saved citizen from sessionStorage", error);
        sessionStorage.removeItem("adminSelectedCitizen");
      }
    }
  }, []);

  const setSelectedCitizenData = (citizen) => {
    if (citizen) {
      setSelectedCitizen(citizen);
      sessionStorage.setItem("adminSelectedCitizen", JSON.stringify(citizen));
    } else {
      clearSelectedCitizen();
    }
  };

  const clearSelectedCitizen = () => {
    setSelectedCitizen(null);
    sessionStorage.removeItem("adminSelectedCitizen");
  };

  return (
    <AdminContext.Provider
      value={{
        selectedCitizen,
        setSelectedCitizenData,
        clearSelectedCitizen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
