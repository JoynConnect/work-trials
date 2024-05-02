import React, { useState } from 'react';

import CompletedTasksLineChart from './CompletedTasksLineChart';
import AssigneeSelector from './AssigneeSelector';


const CompletedTasksLineChartContainer = () => {
    const [selectedAssignees, setSelectedAssignees] = useState([]);

    /**
     * Select a max of 3 assigness to display and a minimum of 1.
     */
    const onAssigneeClick = (assignee: string) => {
        const index = selectedAssignees.findIndex(a => a === assignee);
        const newValue = [...selectedAssignees];
        if (index < 0 && newValue.length < 3) {
            newValue.push(assignee);
        } else if (index > -1 && newValue.length > 1) {
            newValue.splice(index, 1);
        }
        setSelectedAssignees(newValue);
    }

    return (
        <div className="completed-tasks-line-chart-container flex gap-5 overflow-hidden">
            <CompletedTasksLineChart
                selectedAssignees={selectedAssignees}
            />
            <AssigneeSelector
                selectedAssignees={selectedAssignees}
                onAssigneeClick={onAssigneeClick}
            />
        </div>
    );
};

export default CompletedTasksLineChartContainer;
