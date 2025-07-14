
import GamificationDashboard from '@/components/GamificationDashboard';

const Gamification = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress, earn badges, and see how you compare with other developers in the community.
        </p>
      </div>
      
      <GamificationDashboard />
    </div>
  );
};

export default Gamification;
