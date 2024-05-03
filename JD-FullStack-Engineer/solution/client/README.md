# Task 3: Build a Simple React Dashboard

## Main Components
This is a single page application that display 2 main components.

### StatusDistributionSummary
A card-like component to display ticket status (Resolved/Unresolved) distribution as a percent value.

### CompletedTasksLineChartContainer
A container component to display a basic linechart graph and a selector of assignees emails displayed on the chart.
- `CompletedTasksLineChart`: This component wrapts a react-plotly component.
- `AssigneeSelector`: This component shows an assignee list that's used to select 1-3 items for the linechart.

## Data
The data shown in this UI is fetched from two endpoints (Task 2).
- `/completed-tasks`: To fetch a by-date-by-assigne completed task count.
  Used in `CompletedTasksLineChartContainer` component.
- `/status-distribution`: To fetch status distribution (Resolved/Unresolved) data scoped by priority.
  Used in `StatusDistributionSummary`

The API calls are isolated in siglelton class `JoynAPI` and its used from two hooks:
- `src/hooks/useCompletedTasksStatsHook`
- `src/hooks/useStatusDistributionHook`

The API data is stored within a reducer-context design to make it easily available to all the page components,
avoid future issue passing props to nested components, and making easier rearrenging the UI to improve the design.
**Note**: the presentational state of the data is stored within the component states when needed.

### TODO:
- Add linting tool for development.
- Optimize component rendering and probably the bundle size.
