import React from 'react';
import Plot from 'react-plotly.js';
import { completedTasksByAssignee } from './types';
import { useContext } from 'react';
import { DashboardContext } from './dashboardContext';

interface props {
    selectedAssignees: string[];
};

const CompletedTasksLineChart = ({selectedAssignees}: props) => {
    const { completedTasksStats } = useContext(DashboardContext);
    if (!completedTasksStats?.byDateByAssignee) {
        return
    }
    const data = selectedAssignees.reduce((acc: {[index: string]: any}, assignee: string) => {
        return {...acc, [assignee]: []};
    }, {x: []});

    completedTasksStats.byDateByAssignee.forEach((byDate: completedTasksByAssignee) => {
        data.x.push(byDate.date);
        selectedAssignees.forEach((assignee: string) => {
            data[assignee].push(byDate[assignee] || 0);
        });
    });

    return (
        <div className="completed-tasks-line-chart basis-1/2 grow">
            <Plot
                className="w-full"
                data={
                    selectedAssignees.map((assignee: string) => ({
                        x: data.x,
                        y: data[assignee],
                        name: assignee,
                    }))
                }
                layout={{
                    height: 300,
                    margin: {t: 0, r: 0},
                    showlegend: false,
                    xaxis: {
                        showgrid: false,
                        tickangle: -60,
                        tickvals: data.x,
                    },
                    yaxis: {
                        showline: false,
                        showgrid: false,
                        showticklabels: false,
                        zeroline: false,
                    }
                }}
                config={{responsive: true,displayModeBar: false}}
            />
        </div>
    );
}

export default CompletedTasksLineChart;
