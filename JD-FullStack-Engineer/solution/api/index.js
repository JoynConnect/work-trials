import process from 'process';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { getDateTimeAsDateStr } from './utils.js';
import { StatusDistribution, CompletedTasksByDate } from './db.js';
import { setupSwagger } from './swaggerDocs.js';

const api = express();
api.use(cors());
api.use(express.json());

/**
 * @openapi
 * /status-distribution:
 *  get:
 *      description: Get high priority tasks status distribution and overall status distribution data
 *      responses:
 *          200:
 *              description: Fetch successfully
 */
api.get('/status-distribution', (req, res) => {
    StatusDistribution.findAll()
        .then(rows => {
            const data = rows.reduce((acc, row) => {
                const { scope, resolved, unresolved } = row;
                if (scope === 'high_priority') {
                    return { ...acc, highPriority: { resolved, unresolved } };
                } else {
                    return { ...acc, [scope]: { resolved, unresolved }};
                }
            }, {});
            res.json(data);
        });
});

/**
 * @openapi
 * /completed-tasks:
 *  get:
 *      description: Completed tasks count by date by assignee.
 *      responses:
 *          200:
 *              description: Fetch successfully
 */
api.get('/completed-tasks', (req, res) => {
    CompletedTasksByDate.findAll(
        {
            order: [['date', 'ASC']]
        }
    ).then(rows => {
        const totalByAssignee = {};
        const byDateByAssigneeObj = {};

        rows.forEach(row => {
            const { date, assignee, count } = row;
            // Get total count
            if (totalByAssignee.hasOwnProperty(assignee)) {
                totalByAssignee[assignee] += count;
            } else {
                totalByAssignee[assignee] = count;
            }

            // Get by date by assignee completed count.
            const dateStr = getDateTimeAsDateStr(date);
            if (byDateByAssigneeObj.hasOwnProperty(dateStr)) {
                byDateByAssigneeObj[dateStr][assignee] = (
                    byDateByAssigneeObj[dateStr][assignee] || 0) + count;
            } else {
                byDateByAssigneeObj[dateStr] = {[assignee]: count, date: dateStr};
            }
        });

        const byDateByAssignee = Object.values(byDateByAssigneeObj);
        byDateByAssignee.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // Sorted Assignee by completed task count in descending order.
        const sortedAssigneesByCount = Object.keys(totalByAssignee);
        sortedAssigneesByCount.sort((a, b) => totalByAssignee[b] - totalByAssignee[a]);

        res.json({totalByAssignee, byDateByAssignee, sortedAssigneesByCount});
    });
});


setupSwagger(api);
const httpServer = http.createServer(api);
httpServer.listen(8080);

