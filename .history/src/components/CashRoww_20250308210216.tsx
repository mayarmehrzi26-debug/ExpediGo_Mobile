import React from "react";

// CashRow Component
interface CashRowProps {
  label: string;
  value: string;
  isPurple?: boolean;
}

const CashRow: React.FC<CashRowProps> = ({
  label,
  value,
  isPurple = false,
}) => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="text-sm font-normal text-[#27251F]">{label}</div>
      <div
        className={`text-sm font-normal ${isPurple ? "text-purple-600" : "text-[#27251F]"}`}
      >
        {value}
      </div>
    </div>
  );
};

// CashCard Component
interface CashCardProps {
  availableCash: string;
  unavailableCash: string;
  totalCash: string;
}

const CashCard: React.FC<CashCardProps> = ({
  availableCash,
  unavailableCash,
  totalCash,
}) => {
  return (
    <article className="w-[361px] h-[145px] shadow-[0px_1px_4px_rgba(0,0,0,0.16)] relative bg-white rounded-[3px] max-md:w-full max-sm:w-full">
      <div className="flex flex-col gap-3.5 p-[17px] max-md:p-[15px] max-sm:p-3">
        <CashRow
          label="Cash Disponible"
          value={`${availableCash} dt`}
          isPurple
        />
        <CashRow label="Cash non Disponible" value={`${unavailableCash} dt`} />
        <CashRow label="Total" value={`${totalCash} dt`} />
      </div>
    </article>
  );
};

// BottomBar Component
const BottomBar: React.FC = () => {
  return (
    <div
      role="presentation"
      className="w-[60px] h-[5px] bg-[#A7A9B7] mt-3 rounded-[10px]"
    />
  );
};

// Main Page Component
const CashRoww = () => {
  return (
    <div
    role="presentation"
    className="w-[60px] h-[5px] bg-[#A7A9B7] mt-3 rounded-[10px]"
  /> 
  );
};

export default CashRoww;
