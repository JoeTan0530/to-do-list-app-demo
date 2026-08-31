import React, { useEffect, useId } from "react";

// ============================================================
// Types
// ============================================================
interface DashboardCardItem {
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  label: string;
  value: string | number;
}

interface DashboardCardProps {
  dashboardID: string;
  cardConfig: DashboardCardItem[];
}

const DashboardCard: React.FC<DashboardCardProps> = (props) => {
  const { dashboardID, cardConfig } = props;

  const uniqueID = useId();
  const dashboardCardID = dashboardID || `defaultDashboardID${uniqueID}`;

  return (
    <div key={dashboardCardID} className="dashboard-card-container">
      {cardConfig && cardConfig.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardConfig.map((item, index) => (
            <div
              key={`${dashboardCardID}-${index}`}
              className="bg-white rounded-xl border border-gray-300 w-full p-5 hover:shadow-lg"
            >
              {item.icon && (
                <div className="w-max mb-5">
                  <div
                    className={`rounded-md px-2 py-1 ${
                      item.iconBg && item.iconBg !== "" ? item.iconBg : "bg-blue-200"
                    } ${
                      item.iconColor && item.iconColor !== "" ? item.iconColor : "text-blue-400"
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>
              )}
              <div className="text-2xl font-bold mb-1">{item.value}</div>
              <div className="text-lg font-normal text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex content-center item-center py-12">
          <div className="text-xl font-bold">No dashboard card config set.</div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;