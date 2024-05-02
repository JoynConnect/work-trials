export interface action {
    type: string;
    value?: any;
};

export interface statusDistribution {
    unresolved: number;
    resolved: number;
};

export interface statusDistributionByScope {
    all: statusDistribution;
    highPriority: statusDistribution;
};

export interface totalCompletedTaskByAssignee {
    [index: string]: number;
};

export interface completedTasksByAssignee {
    date: string;
    [index: string]: string | number;
};

export interface completedTasksStats {
    totalByAssignee: totalCompletedTaskByAssignee;
    byDateByAssignee: completedTasksByAssignee[];
    sortedAssigneesByCount: string[];
};
