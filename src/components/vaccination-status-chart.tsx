"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function VaccinationStatusChart({
  counts,
}: {
  counts: { alDia: number; proxima: number; venceHoy: number; vencida: number };
}) {
  const data = [
    { name: "Al día", value: counts.alDia, color: "#1a8a5a" },
    { name: "Próxima", value: counts.proxima, color: "#b5750a" },
    { name: "Vence hoy", value: counts.venceHoy, color: "#c2410c" },
    { name: "Vencida", value: counts.vencida, color: "#c0271f" },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8ded5" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b5c54" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b5c54" }} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e8ded5",
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
