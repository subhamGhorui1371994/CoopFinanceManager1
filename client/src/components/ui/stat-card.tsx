import { Card, CardContent } from "./card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  change,
  changeType = "neutral",
  subtitle,
}: StatCardProps) {
  const changeColorClass = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  }[changeType];

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 font-mono">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`${iconColor} text-xl h-6 w-6`} />
          </div>
        </div>
        {(change || subtitle) && (
          <div className="mt-4 flex items-center">
            {change && (
              <>
                <span className={`text-sm font-medium ${changeColorClass}`}>
                  {change}
                </span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </>
            )}
            {subtitle && !change && (
              <span className="text-gray-500 text-sm">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
