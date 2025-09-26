import React from 'react';

interface CarBrandLogoProps extends React.SVGProps<SVGSVGElement> {
    make: string;
}

const GenericCarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M14.5 3a1 1 0 0 0-1-1H6.5a1 1 0 0 0-1 1v1.372c.365-.123.753-.198 1.154-.221h.028c.447.024.895.12 1.328.296.438.178.86.42 1.26.728.4-.308.823-.55 1.26-.728.434-.176.88-.272 1.329-.296h.027c.4.023.79.098 1.153.221V3ZM6.5 6a2.5 2.5 0 0 0-2.5 2.5V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5A2.5 2.5 0 0 0 13.5 6h-7Z" />
    </svg>
);

const CarBrandLogo: React.FC<CarBrandLogoProps> = ({ make, ...props }) => {
    switch (make) {
        case 'Maruti Suzuki':
            return (
                <svg viewBox="0 0 512 512" fill="currentColor" {...props}>
                    <path d="M256 128l-128 256h64l64-128 64 128h64L256 128z" />
                </svg>
            );
        case 'Hyundai':
            return (
                <svg viewBox="0 0 448 512" fill="currentColor" {...props}>
                    <path d="M342.3 209.6c-27.1-23.8-63.5-35.3-108.3-35.3s-81.2 11.5-108.3 35.3c-21.2 18.6-34.9 44.5-34.9 76.4 0 26.6 9.4 51.1 27.5 72.2 23.3 27.1 59.9 41.5 106.3 41.5s83-14.4 106.3-41.5c18.1-21.1 27.5-45.6 27.5-72.2.1-31.9-13.6-57.8-34.8-76.4zm-196.2 92c-9.2-12.8-13.8-27-13.8-42.5 0-21.1 8.8-39.6 25.5-54.6 20.8-18.3 49.3-27.8 82.5-27.8s61.7 9.5 82.5 27.8c16.7 15 25.5 33.5 25.5 54.6 0 15.5-4.6 29.7-13.8 42.5-16.1 22.4-44.4 34.5-79.9 34.5-35.4 0-63.7-12.1-79.8-34.5z" />
                </svg>
            );
        case 'Tata Motors':
            return (
                <svg viewBox="0 0 512 512" fill="currentColor" {...props}>
                    <path d="M256 128l-128 128h64v128h128V256h64L256 128z" />
                </svg>
            );
        case 'Mahindra':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.28 15.24h-1.44v-5.48h1.44v5.48zm2.56 0h-1.44v-5.48h1.44v5.48zm2.56 0h-1.44v-5.48h1.44v5.48zM12 10.3c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2z" />
                </svg>
            );
        case 'Toyota':
             return (
                <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-4h8v-2h-8v2zm0-4h8v-2h-8v2z" />
                </svg>
            );
        case 'Honda':
             return (
                <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM8 11h8v2H8v-2z" />
                </svg>
            );
        default:
            return <GenericCarIcon {...props} />;
    }
};

export default CarBrandLogo;