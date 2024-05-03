import React from 'react';
import Plot from 'react-plotly.js';
import { completedTasksByAssignee } from './types';
import { useContext } from 'react';
import { DashboardContext } from './dashboardContext';
import { LINE_CHART_COLORS } from './constants';


interface props {
    selectedAssignees: string[];
};

const CompletedTasksLineChart = ({selectedAssignees}: props) => {
    const { completedTasksStats } = useContext(DashboardContext);
    if (!completedTasksStats?.byDateByAssignee) {
        return
    }
    // Get initial empty shape for assignees data.
    const data = selectedAssignees.reduce((acc: {[index: string]: any}, assignee: string) => {
        return {...acc, [assignee]: []};
    }, {x: []});

    // Populate data with a single x value (dates strings) and each assignee count.
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
                    selectedAssignees.map((assignee: string, index: number) => ({
                        x: data.x,
                        y: data[assignee],
                        name: assignee,
                        line: {
                            color: index < LINE_CHART_COLORS.length
                                ? LINE_CHART_COLORS[index] : undefined
                        }
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
                config={{responsive: true, displayModeBar: false}}
            />
        </div>
    );
}

export default CompletedTasksLineChart;
