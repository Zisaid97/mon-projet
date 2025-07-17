
import React from "react";

export const formatNumber = (n: number, digits = 2) =>
  isNaN(n) ? "—" : n.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const coloredNumber = (
  n: number,
  digits = 2,
  type: "success" | "danger" | "info" | "muted" | "warning" | "plain" = "plain",
  forceColor?: string
) => {
  if (isNaN(n)) return <span className="text-gray-600">—</span>;
  
  let color = "";
  if (forceColor) color = forceColor;
  else if (type === "success") color = "text-green-600 font-semibold";
  else if (type === "danger") color = "text-red-500 font-semibold";
  else if (type === "info") color = "text-gray-900 font-semibold";
  else if (type === "muted") color = "text-gray-600";
  else if (type === "warning") color = "text-gray-900 font-semibold";
  else color = "text-gray-900";
    
  return (
    <span className={color}>
      {formatNumber(n, digits)}
    </span>
  );
};
