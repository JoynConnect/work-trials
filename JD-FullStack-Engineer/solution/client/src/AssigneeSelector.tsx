import React, { useContext, useState } from 'react';
import { DashboardContext } from './dashboardContext';

interface props {
    onAssigneeClick: (assignee: string) => void;
    selectedAssignees: string[];
};

const MAX_LENGTH = 100;

/**
 * Display a selectable assignee list.
 */
const AssigneeSelector = ({onAssigneeClick, selectedAssignees}: props) => {
    const { completedTasksStats } = useContext(DashboardContext);

    let topAssignees = [];
    if (completedTasksStats) {
        topAssignees = completedTasksStats.sortedAssigneesByCount.length > MAX_LENGTH
            ? completedTasksStats.sortedAssigneesByCount.slice(0, MAX_LENGTH)
            : [...completedTasksStats.sortedAssigneesByCount];
    }

    return (
        <div className="assignee-selector flex flex-col">
            <h2 className="text-center text-lg"> Select Assignees </h2>
            <div className="assignee-selector-items overflow-y-auto">
                {
                    topAssignees.map((assignee: string) => {
                        const activeClass = selectedAssignees.includes(assignee) ? 'bg-sky-500 text-white' : '';
                        const cssClass = 'assignee hover:border-sky-500 border-transparent border-l-2 cursor-pointer p-1';
                        return (
                            <div
                                className={`${cssClass} ${activeClass}`}
                                key={assignee}
                                onClick={() => onAssigneeClick(assignee)}
                            >
                                {assignee}
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default AssigneeSelector;
