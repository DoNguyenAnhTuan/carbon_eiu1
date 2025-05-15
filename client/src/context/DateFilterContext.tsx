import React, { createContext, useContext, useState } from "react";

interface DateFilterContextType {
  date: Date;
  setDate: (date: Date) => void;
  monthYear: Date;
  setMonthYear: (date: Date) => void;
  year: Date;
  setYear: (date: Date) => void;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const DateFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [date, setDate] = useState<Date>(new Date("2025-05-05"));
  const [monthYear, setMonthYear] = useState<Date>(new Date("2025-05-05"));
  const [year, setYear] = useState<Date>(new Date("2025-01-01"));

  return (
    <DateFilterContext.Provider value={{ date, setDate, monthYear, setMonthYear, year, setYear }}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) throw new Error("useDateFilter must be used within a DateFilterProvider");
  return context;
}; 