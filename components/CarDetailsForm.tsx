import React, { useState } from 'react';
import type { CarDetails } from '../types';
import { carData } from '../data/carData';

interface CarDetailsFormProps {
  onSubmit: (details: CarDetails) => void;
  onOpenSettings: () => void;
}

const WrenchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l1.5 1.5a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0 0-1.06l-1.5-1.5Z" clipRule="evenodd" />
        <path d="M16.813 1.437a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06l2.47-2.47H13.5a.75.75 0 0 1 0-1.5h5.783l-2.47-2.47a.75.75 0 0 1 0-1.06Z" />
    </svg>
);

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.55-.443.99-1.002 1.122L5.85 7.15c-.954.22-1.523.996-1.523 1.942V9.45l.138.462c.15.504.536.882 1.075 1.018l2.12.53c.594.148 1.02.633 1.02 1.258v2.094l-.328.247c-.52.39-1.166.39-1.686 0l-1.49-1.118a1.875 1.875 0 0 0-2.642 2.642l1.118 1.49c.39.52.39 1.166 0 1.686l-.247.328v2.094c0 .625.426 1.11 1.02 1.258l2.12.53c.539.136.925.514 1.075 1.018l.138.462v.358c0 .946.569 1.722 1.523 1.942l2.199.178c.559.045.99.497 1.122 1.002l.178 2.199c.151.904.933 1.567 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.178-2.199c.132-.505.572-.957 1.122-1.002l2.199-.178c.954-.22 1.523-.996 1.523-1.942v-.358l.138-.462c.15-.504.536-.882 1.075-1.018l2.12-.53c.594-.148 1.02-.633 1.02-1.258V9.816l-.328-.247c-.52-.39-1.166-.39-1.686 0l-1.49 1.118a1.875 1.875 0 0 0-2.642-2.642l1.118-1.49c.39-.52.39-1.166 0-1.686l-.247-.328V3.816c0-.625-.426-1.11-1.02-1.258l-2.12-.53c-.539-.136-.925-.514-1.075-1.018L13.95 2.55v-.358c0-.946-.569-1.722-1.523-1.942L10.228.07c-.559-.045-.99-.497-1.122-1.002L8.928 1.267C8.777 2.171 7.995 2.834 7.078 2.834H5.234a1.875 1.875 0 0 0-1.875 1.875v1.844c0 .917.663 1.699 1.567 1.85l2.199.178c.505.04.957.48.99.99l.178 2.199c.151.904.933 1.567 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.178-2.199c.033-.51.485-.95.99-.99l2.199-.178c.904-.07 1.567-.852 1.567-1.85v-1.844a1.875 1.875 0 0 0-1.875-1.875h-1.844c-.917 0-1.699-.663-1.85-1.567l-.178-2.199c-.132-.505-.572-.957-1.122-1.002L8.928 3.07c-.954-.22-1.523-.996-1.523-1.942V.772A1.875 1.875 0 0 0 5.234 2.25H3.39c-.917 0-1.699.663-1.85 1.567L1.362 5.85c-.09.55-.443.99-1.002 1.122L.16 7.15c-.954.22-1.523.996-1.523 1.942V9.45l.138.462c.15.504.536.882 1.075 1.018l2.12.53c.594.148 1.02.633 1.02 1.258v2.094l-.328.247c-.52.39-1.166.39-1.686 0l-1.49-1.118a1.875 1.875 0 0 0-2.642 2.642l1.118 1.49c.39.52.39 1.166 0 1.686l-.247.328v2.094c0 .625.426 1.11 1.02 1.258l2.12.53c.539.136.925.514 1.075 1.018l.138.462v.358c0 .946.569 1.722 1.523 1.942l2.199.178c.559.045.99.497 1.122 1.002l.178 2.199c.151.904.933 1.567 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.178-2.199c.132-.505.572-.957 1.122-1.002l2.199-.178c.954-.22 1.523-.996 1.523-1.942v-.358l.138-.462c.15-.504.536-.882 1.075-1.018l2.12-.53c.594-.148 1.02-.633 1.02-1.258V9.816l-.328-.247c-.52-.39-1.166-.39-1.686 0l-1.49 1.118a1.875 1.875 0 0 0-2.642-2.642l1.118-1.49c.39-.52.39-1.166 0-1.686l-.247-.328V3.816c0-.625-.426-1.11-1.02-1.258l-2.12-.53c-.539-.136-.925-.514-1.075-1.018L13.95 2.55v-.358c0-.946-.569-1.722-1.523-1.942L10.228.07c-.559-.045-.99-.497-1.122-1.002L8.928 1.267C8.777 2.171 7.995 2.834 7.078 2.834H5.234a1.875 1.875 0 0 0-1.875 1.875v1.844c0 .917.663 1.699 1.567 1.85l2.199.178c.505.04.957.48.99.99l.178 2.199c.151.904.933 1.567 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.178-2.199c.033-.51.485-.95.99-.99l2.199-.178c.904-.07 1.567-.852 1.567-1.85v-1.844A1.875 1.875 0 0 0 18.766 6h-1.844c-.917 0-1.699-.663-1.85-1.567l-.178-2.199c-.132-.505-.572-.957-1.122-1.002L11.572.07c-.954-.22-1.523-.996-1.523-1.942V-2.23A1.875 1.875 0 0 0 7.922.25H6.078Z" clipRule="evenodd" />
    </svg>
);


const CarDetailsForm: React.FC<CarDetailsFormProps> = ({ onSubmit, onOpenSettings }) => {
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
    <div className="relative flex-grow flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 overflow-y-auto transition-colors duration-300">
        <button
          onClick={onOpenSettings}
          className="absolute top-4 left-4 p-3 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      

      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-8">
                <WrenchIcon className="w-16 h-16 text-amber-400 mx-auto mb-4"/>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Virtual Mechanic AI</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Start a new diagnosis session.</p>
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
                    className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-amber-500 transition-all duration-300 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
                >
                    Start New Diagnosis
                </button>
            </form>
        </div>
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
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required
            disabled={disabled}
            className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:bg-slate-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"
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
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                required
                disabled={disabled}
                className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition appearance-none disabled:bg-slate-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    </div>
);

export default CarDetailsForm;