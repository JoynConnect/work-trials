import React from 'react';
import CompletedTasksLineChartContainer from './CompletedTasksLineChartContainer';
import StatusDistributionSummary from './StatusDistributionSummary';
import useCompletedTasksStatsHook from './hooks/useCompletedTasksStatsHook';
import useStatusDistributionHook from './hooks/useStatusDistributionHook';


const StatusDistributionPage = () => {
    useCompletedTasksStatsHook();
    useStatusDistributionHook();
    return (
        <div className="page flex flex-col h-screen p-6">
            <h1 className="text-center text-xl"> Status Distribution </h1>
            <StatusDistributionSummary />
            <CompletedTasksLineChartContainer />
        </div>

    )
}

export default StatusDistributionPage;
