import React, { createContext, useState, useContext } from 'react';

const ConsultationContext = createContext();

export const ConsultationProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <ConsultationContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
        </ConsultationContext.Provider>
    );
};

export const useConsultation = () => {
    const context = useContext(ConsultationContext);
    if (!context) {
        throw new Error('useConsultation must be used within a ConsultationProvider');
    }
    return context;
};
