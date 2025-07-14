
import { useState } from 'react';

const ContributionHeatmap = () => {
  // Generate mock contribution data for the past year
  const generateContributions = () => {
    const contributions = [];
    const today = new Date();
    
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const activity = Math.floor(Math.random() * 5); // 0-4 activity levels
      contributions.push({
        date: date.toISOString().split('T')[0],
        count: activity,
        level: activity
      });
    }
    
    return contributions;
  };

  const contributions = generateContributions();

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-muted';
      case 1: return 'bg-green-200 dark:bg-green-900';
      case 2: return 'bg-green-300 dark:bg-green-700';
      case 3: return 'bg-green-400 dark:bg-green-600';
      case 4: return 'bg-green-500 dark:bg-green-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Contribution Activity</h4>
      <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1 text-xs">
        {contributions.map((day, index) => (
          <div
            key={index}
            className={`contribution-box ${getColorClass(day.level)} rounded-sm hover:ring-1 hover:ring-ring transition-all cursor-pointer`}
            title={`${day.count} contributions on ${day.date}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="contribution-box bg-muted rounded-sm" />
          <div className="contribution-box bg-green-200 dark:bg-green-900 rounded-sm" />
          <div className="contribution-box bg-green-300 dark:bg-green-700 rounded-sm" />
          <div className="contribution-box bg-green-400 dark:bg-green-600 rounded-sm" />
          <div className="contribution-box bg-green-500 dark:bg-green-500 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
