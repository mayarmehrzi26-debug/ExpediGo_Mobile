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
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 w-[361px] p-0 max-md:w-full max-md:max-w-[361px] max-sm:w-full max-sm:px-[15px] max-sm:py-0">
        <Head className="text-[19px] font-normal text-[#27251F] w-[327px] max-sm:w-full max-sm:text-center">
          Ma Caisse
        </Head>

        <CashCard
          availableCash="0,000"
          unavailableCash="115,000"
          totalCash="115,000"
        />

        <BottomBar />
      </div>
    </main>
  );
};

export default CashRoww;
