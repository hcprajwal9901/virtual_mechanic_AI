import React, { useState } from 'react';
import type { CarDetails } from '../types';
import { carData } from '../data/carData';

interface CarDetailsFormProps {
  onSubmit: (details: CarDetails) => void;
}

const WrenchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l1.5 1.5a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0 0-1.06l-1.5-1.5Z" clipRule="evenodd" />
        <path d="M16.813 1.437a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06l2.47-2.47H13.5a.75.75 0 0 1 0-1.5h5.783l-2.47-2.47a.75.75 0 0 1 0-1.06Z" />
    </svg>
);


const CarDetailsForm: React.FC<CarDetailsFormProps> = ({ onSubmit }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [odometer, setOdometer] = useState('');
  const [fuelType, setFuelType] = useState('');
  
  const makes = Object.keys(carData);
  const models = make ? Object.keys(carData[make]) : [];
  const years = make && model ? Object.keys(carData[make][model]) : [];
  const fuelTypes = make && model && year ? carData[make][model][parseInt(year, 10)] : [];

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMake(e.target.value);
    setModel('');
    setYear('');
    setFuelType('');
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
    setYear('');
    setFuelType('');
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
    setFuelType('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (make && model && year && odometer && fuelType) {
      onSubmit({ make, model, year, odometer, fuelType });
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
            <WrenchIcon className="w-16 h-16 text-amber-400 mx-auto mb-4"/>
            <h1 className="text-3xl font-bold text-slate-100">Virtual Mechanic AI</h1>
            <p className="text-slate-400 mt-2">Enter your car's details to get started.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <SelectField label="Car Make" value={make} onChange={handleMakeChange}>
            <option value="" disabled>Select Make</option>
            {makes.map((m) => <option key={m} value={m}>{m}</option>)}
          </SelectField>

          <SelectField label="Car Model" value={model} onChange={handleModelChange} disabled={!make}>
            <option value="" disabled>Select Model</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </SelectField>
          
          <SelectField label="Model Year" value={year} onChange={handleYearChange} disabled={!model}>
            <option value="" disabled>Select Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </SelectField>
          
          <SelectField label="Fuel Type" value={fuelType} onChange={(e) => setFuelType(e.target.value)} disabled={!year}>
            <option value="" disabled>Select Fuel Type</option>
            {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
          </SelectField>

          <InputField label="Odometer Reading (KM)" value={odometer} onChange={(e) => setOdometer(e.target.value)} type="number" placeholder="e.g., 55000" disabled={!fuelType} />
          
          <button 
            type="submit"
            disabled={!make || !model || !year || !odometer || !fuelType}
            className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Start Diagnosis
          </button>
        </form>
      </div>
    </div>
  );
};

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', placeholder, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required
            disabled={disabled}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:bg-slate-700/50 disabled:cursor-not-allowed"
        />
    </div>
);

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, children, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                required
                disabled={disabled}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition appearance-none disabled:bg-slate-700/50 disabled:cursor-not-allowed"
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    </div>
);

export default CarDetailsForm;
