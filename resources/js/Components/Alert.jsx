import React from 'react';

const Alert = ({ message, type }) => {
    const alertClasses = {
        success: 'bg-green-100 border border-green-400 text-green-700',
        error: 'bg-red-100 border border-red-400 text-red-700',
        info: 'bg-blue-100 border border-blue-400 text-blue-700',
        warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
    };

    return (
        <div className={`p-2 rounded-lg ${alertClasses[type]} flex items-center`} role="alert">
            {type === 'success' && <svg className="w-5 h-5 mr-2 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4 -4m2 10H3" /></svg>}
            {type === 'error' && <svg className="w-5 h-5 mr-2 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.41-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8z" /></svg>}
            {type === 'info' && <svg className="w-5 h-5 mr-2 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0 4h-.01M21 12c0 4.41-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8z" /></svg>}
            {type === 'warning' && <svg className="w-5 h-5 mr-2 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.41-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8z" /></svg>}
            <span>{message}</span>
        </div>
    );
};

export default Alert;