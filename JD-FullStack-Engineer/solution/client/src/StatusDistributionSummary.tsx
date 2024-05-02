import React, { useContext } from 'react';
import { DashboardContext } from './dashboardContext';
import { statusDistribution } from './types';


const StatusDistributionSummary = () => {
    const { statusDistribution: distributions } = useContext(DashboardContext);

    const getFormattedValue = (distribution: statusDistribution) => {
        const total = distribution.resolved + distribution.unresolved;
        const percent = distribution.resolved / total;
        return `${Math.round(percent*100)}%`;
    };

    return (
        <div className="status-distribution-summary border border-solid border-slate-200 shadow-md p-6 mt-6 mb-6">
            {distributions.highPriority &&
                <div className="high-priority-status text-lg m-1">
                    {getFormattedValue(distributions.highPriority)} of high priority tasks were completed.
                </div>
            }
            {distributions.all &&
                <div className="all-priority-status text-lg m-1">
                    {getFormattedValue(distributions.all)} of all priority tasks were completed.
                </div>
            }
        </div>
    );
}

export default StatusDistributionSummary;
