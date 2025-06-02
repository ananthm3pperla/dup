
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Camera, 
  Trophy, 
  Users, 
  Star, 
  Upload, 
  Award,
  MapPin,
  Calendar,
  Target
} from "lucide-react";
import { Button, Card, Avatar, LoadingState } from "@/components/ui";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { gamesAPI, teamAPI } from "@/lib/api";
import { isDemoMode } from "@/lib/demo";

interface GameStats {
  totalPoints: number;
  teamRank: number;
  photosUploaded: number;
  streakDays: number;
}

interface TeamLeaderboard {
  rank: number;
  teamName: string;
  points: number;
  members: number;
  avatar: string;
}

export default function Games() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<TeamLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        // Demo data
        setStats({
          totalPoints: 1250,
          teamRank: 3,
          photosUploaded: 12,
          streakDays: 5
        });
        
        setLeaderboard([
          { rank: 1, teamName: "Innovation Squad", points: 2850, members: 8, avatar: "https://ui-avatars.com/api/?name=Innovation+Squad&background=random" },
          { rank: 2, teamName: "Design Dynamos", points: 2340, members: 6, avatar: "https://ui-avatars.com/api/?name=Design+Dynamos&background=random" },
          { rank: 3, teamName: "Engineering Elite", points: 1890, members: 12, avatar: "https://ui-avatars.com/api/?name=Engineering+Elite&background=random" },
          { rank: 4, teamName: "Marketing Mavericks", points: 1650, members: 5, avatar: "https://ui-avatars.com/api/?name=Marketing+Mavericks&background=random" },
          { rank: 5, teamName: "Product Pioneers", points: 1420, members: 7, avatar: "https://ui-avatars.com/api/?name=Product+Pioneers&background=random" }
        ]);
      } else {
        // Real API calls would go here
        const [statsResponse, leaderboardResponse] = await Promise.all([
          gamesAPI.getPlayerStats(),
          gamesAPI.getLeaderboard()
        ]);
        
        setStats(statsResponse.data);
        setLeaderboard(leaderboardResponse.data);
      }
    } catch (error) {
      console.error("Error loading game data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    setUploadDialogOpen(true);
  };

  if (loading) {
    return <LoadingState message="Loading Hi-Bridge Games..." />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Beta Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Star className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Hi-Bridge Games</h1>
          <Badge variant="secondary" className="bg-white/20 text-white">
            BETA
          </Badge>
        </div>
        <p className="text-purple-100">
          Earn bonus points by sharing your office moments and competing with teams!
        </p>
      </motion.div>

      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Points</p>
              <p className="text-2xl font-bold text-primary">{stats?.totalPoints?.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Award className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Team Rank</p>
              <p className="text-2xl font-bold text-success">#{stats?.teamRank}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Camera className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted">Photos Shared</p>
              <p className="text-2xl font-bold text-blue-500">{stats?.photosUploaded}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Target className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted">Current Streak</p>
              <p className="text-2xl font-bold text-orange-500">{stats?.streakDays} days</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Upload Section */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Share Your Office Moment</h3>
                <p className="text-sm text-muted">
                  Upload a photo from the office to earn bonus points!
                </p>
              </div>
              <Button 
                onClick={handlePhotoUpload}
                leftIcon={<Upload className="h-4 w-4" />}
                className="w-full"
              >
                Upload Photo
              </Button>
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="p-4 mt-4">
            <h4 className="font-medium mb-3">Earning Tips</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Daily check-in: +50 points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Photo upload: +100 points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Weekly streak: +200 points</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Team Leaderboard */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Team Leaderboard</h3>
            </div>
            
            <div className="space-y-3">
              {leaderboard.map((team, index) => (
                <motion.div
                  key={team.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    team.rank <= 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    team.rank === 1 ? 'bg-yellow-500 text-white' :
                    team.rank === 2 ? 'bg-gray-400 text-white' :
                    team.rank === 3 ? 'bg-orange-600 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {team.rank}
                  </div>
                  
                  <Avatar 
                    src={team.avatar} 
                    alt={team.teamName}
                    size="sm"
                  />
                  
                  <div className="flex-1">
                    <p className="font-medium">{team.teamName}</p>
                    <p className="text-sm text-muted">
                      {team.members} members
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {team.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Sponsors Section (Placeholder) */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Local Business Sponsors</h3>
          </div>
          <p className="text-muted">
            Partner with local businesses for exclusive rewards and experiences.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border border-dashed border-gray-300 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2"></div>
                <p className="text-xs text-muted text-center">Coming Soon</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
