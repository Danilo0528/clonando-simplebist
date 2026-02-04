'use client';

import { FaCubes, FaChartBar, FaShieldAlt } from 'react-icons/fa';

const TabButton = ({ tabName, icon, label, activeTab, onClick }) => (
    <button 
        onClick={() => onClick(tabName)}
        className={`flex-1 flex items-center justify-center gap-2 p-1.5 rounded-md text-xs transition-all duration-200 border border-transparent ${
            activeTab === tabName 
                ? 'bg-surface-700 border-surface-600 text-white font-semibold' 
                : 'bg-surface-500/20 text-surface-300 hover:bg-surface-500/40'
        }`}>
        {icon}
        <span>{label}</span>
    </button>
);

const TabButtons = ({ activeTab, onTabClick }) => {
    return (
        <div className="flex justify-around items-center gap-2"> 
            <TabButton 
                tabName="equipment" 
                icon={<FaCubes size={14}/>} 
                label="Equipment" 
                activeTab={activeTab} 
                onClick={onTabClick} 
            />
            <TabButton 
                tabName="stats" 
                icon={<FaChartBar size={14}/>} 
                label="Stats" 
                activeTab={activeTab} 
                onClick={onTabClick} 
            />
            <TabButton 
                tabName="belt" 
                icon={<FaShieldAlt size={14}/>} 
                label="Belt" 
                activeTab={activeTab} 
                onClick={onTabClick} 
            />
        </div>
    );
};

export default TabButtons;
