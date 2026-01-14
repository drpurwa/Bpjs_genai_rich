import React, { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3 text-slate-500 uppercase text-xs font-bold tracking-wider">
        {icon}
        <span>{title}</span>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};