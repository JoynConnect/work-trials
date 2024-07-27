import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartDataPoint } from '../types';

export interface ChartProps {
  data: ChartDataPoint[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  return (
    <BarChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
}

export default Chart;
