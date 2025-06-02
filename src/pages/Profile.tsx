import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Employee } from "../types";
import { isDemoMode, DEMO_TEAM_MEMBERS } from "@/lib/demo";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { TabType } from "@/lib/types";
import { LoadingState, ErrorState, Button, EmptyState } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api";
import { ChevronLeft, UserPlus, FileEdit } from "lucide-react";
import { motion } from "framer-motion";

// Pre-load all tab components
const TAB_COMPONENTS = {
  experience: React.lazy(
    () =>
      import(
        "@/components/profile/tabs/Experience" /* webpackPrefetch: true */
      ),
  ),
  education: React.lazy(
    () =>
      import(
        "@/components/profile/tabs/EducationTab" /* webpackPrefetch: true */
      ),
  ),
  team: React.lazy(
    () => import("@/components/profile/tabs/Team" /* webpackPrefetch: true */),
  ),
  activity: React.lazy(
    () =>
      import("@/components/profile/tabs/Activity" /* webpackPrefetch: true */),
  ),
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>("experience");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  const handleSave = useCallback(
    async (index: number, data: any) => {
      if (!user || !profile) return;

      // Skip API calls in demo mode
      if (isDemoMode()) {
        window.location.reload();
        return;
      }

      try {
        if (currentTab === "experience") {
          // Save work history via API
          const result = await userAPI.updateProfile({
            work_history: [{
              id: data.id,
              company: data.company,
              role: data.role,
              start_date: data.startDate,
              end_date: data.endDate || null,
              description: data.highlights?.join("\n") || "",
            }]
          });

          if (!result.success) throw new Error(result.error);
        } else if (currentTab === "education") {
          // Save education via API
          const result = await userAPI.updateProfile({
            education: [{
              id: data.id,
              institution: data.school,
              degree: data.degree,
              field_of_study: data.field,
              start_year: data.startYear,
              end_year: data.endYear || null,
              honors: data.honors || [],
            }]
          });

          if (!result.success) throw new Error(result.error);
        }

        // Refresh the profile data
        window.location.reload();
      } catch (err) {
        console.error("Error saving data:", err);
      }
    },
    [user, profile, currentTab],
  );

  const handleAdd = useCallback(async () => {
    if (!user) return;

    // Skip API calls in demo mode
    if (isDemoMode()) {
      window.location.reload();
      return;
    }

    try {
      if (currentTab === "experience") {
        // Add new work history via API
        const result = await userAPI.updateProfile({
          work_history: [{
            company: "New Company",
            role: "New Role",
            start_date: new Date().toISOString().split("T")[0],
            description: "",
          }]
        });

        if (!result.success) throw new Error(result.error);
      } else if (currentTab === "education") {
        // Add new education via API
        const result = await userAPI.updateProfile({
          education: [{
            institution: "New Institution",
            degree: "New Degree",
            field_of_study: "New Field",
            start_year: new Date().getFullYear() - 4,
            end_year: new Date().getFullYear(),
          }]
        });

        if (!result.success) throw new Error(result.error);
      }

      // Refresh the profile data
      window.location.reload();
    } catch (err) {
      console.error("Error adding data:", err);
    }
  }, [user, currentTab]);

  const handleDelete = useCallback(
    async (index: number) => {
      if (!user || !profile) return;

      // Skip API calls in demo mode
      if (isDemoMode()) {
        window.location.reload();
        return;
      }

      try {
        if (
          currentTab === "experience" &&
          profile.member_work_history?.[index]
        ) {
          // Delete work history via API
          const workItem = profile.member_work_history[index];
          const result = await userAPI.updateProfile({
            delete_work_history: workItem.id
          });

          if (!result.success) throw new Error(result.error);
        } else if (
          currentTab === "education" &&
          profile.member_education?.[index]
        ) {
          // Delete education via API
          const eduItem = profile.member_education[index];
          const result = await userAPI.updateProfile({
            delete_education: eduItem.id
          });

          if (!result.success) throw new Error(result.error);
        }

        // Refresh the profile data
        window.location.reload();
      } catch (err) {
        console.error("Error deleting data:", err);
      }
    },
    [user, profile, currentTab],
  );

  const handleCompleteProfile = () => {
    navigate("/onboarding");
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadProfile = async () => {
      try {
        if (!id) {
          navigate("/dashboard", { replace: true });
          return;
        }

        // Check if this is the current user's profile
        setIsCurrentUser(user?.id === id);

        // Check if we're in demo mode
        if (isDemoMode()) {
          // Find the demo team member
          const demoMember = DEMO_TEAM_MEMBERS.find((m) => m.member_id === id);
          if (demoMember) {
            setProfile(demoMember);
          } else {
            // Create a default profile for demo mode
            const defaultProfile: Employee = {
              id: id,
              member_id: id,
              member_name: DEMO_USER.full_name,
              member_email: DEMO_USER.email,
              member_role: "Founder/CEO",
              member_department: "C-Suite",
              member_avatar: DEMO_USER.avatar_url,
              member_location: "Dallas, TX",
              member_phone: "(916)-547-7734",
              member_workLocation: "Hybrid",
              member_attendance: {
                total: 150,
                streak: 15,
                lastVisit: new Date().toISOString(),
                bio: "Engineering leader with a passion for building scalable systems and mentoring teams. Focused on cloud-native architectures and DevOps practices.",
              },
              member_education: [],
              member_work_history: [],
            };
            setProfile(defaultProfile);
          }
          setLoading(false);
          return;
        }

        // For non-demo mode, fetch from API
        // First get the user's basic info
        const response = await fetch(`/api/users/${id}`);
        const userData = response.ok ? await response.json() : null;
        const userError = !response.ok ? new Error("User not found") : null;

        if (userError) {
          throw userError;
        } else if (!userData) {
          // No user found, create a default profile
          if (user?.id === id) {
            // This is the current user, so we can use their info
            const defaultProfile: Employee = {
              id: id,
              member_id: id,
              member_name:
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                "New User",
              member_email: user.email || "",
              member_role: "Team Member",
              member_department: "Not specified",
              member_avatar:
                user.user_metadata?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || "New User")}&background=random`,
              member_location: "Not specified",
              member_phone: "Not specified",
              member_workLocation: "Not specified",
              member_attendance: {
                total: 0,
                streak: 0,
                lastVisit: new Date().toISOString(),
              },
              member_education: [],
              member_work_history: [],
            };
            setProfile(defaultProfile);
            setIsProfileComplete(false);
          } else {
            setError("User not found");
          }
        } else {
          // Check if profile is complete based on user data
          const isComplete = Boolean(userData.full_name && userData.email);
          setIsProfileComplete(isComplete);

          // Create a profile object from the data
          const userProfile: Employee = {
            id: userData.id,
            member_id: userData.id,
            member_name: userData.full_name || userData.email.split("@")[0],
            member_email: userData.email,
            member_role: userData.role || "Team Member",
            member_department: userData.department || "Not specified",
            member_avatar:
              userData.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || "User")}&background=random`,
            member_location: userData.location || "Not specified",
            member_phone: userData.phone || "Not specified",
            member_workLocation: userData.work_location || "Not specified",
            member_attendance: {
              total: 0,
              streak: 0,
              lastVisit: new Date().toISOString(),
            },
            member_education: [],
            member_work_history: [],
          };

          setProfile(userProfile);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, navigate, user]);

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-muted hover:text-default transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          <ErrorState message={error} onRetry={() => navigate("/dashboard")} />
        </div>
      </div>
    );
  }

  if (!profile) {
    // Create a default profile with placeholder data
    const defaultProfile: Employee = {
      id: id || "unknown",
      member_id: id || "unknown",
      member_name: "New User",
      member_email: "user@example.com",
      member_role: "Team Member",
      member_department: "Not specified",
      member_avatar: `https://ui-avatars.com/api/?name=New+User&background=random`,
      member_location: "Not specified",
      member_phone: "Not specified",
      member_workLocation: "Not specified",
      member_attendance: {
        total: 0,
        streak: 0,
        lastVisit: new Date().toISOString(),
      },
      member_education: [],
      member_work_history: [],
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-muted hover:text-default transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          <ProfileHeader
            name={defaultProfile.member_name}
            role={defaultProfile.member_role}
            department={defaultProfile.member_department}
            avatar={defaultProfile.member_avatar}
            email={defaultProfile.member_email}
            location={defaultProfile.member_location}
            phone={defaultProfile.member_phone}
            employeeId={defaultProfile.member_id}
          />

          <div className="bg-card rounded-lg p-6 shadow-md text-center">
            <h2 className="text-xl font-semibold text-default mb-4">
              Profile Not Found
            </h2>
            <p className="text-muted mb-6">
              This user profile doesn't exist or you don't have permission to
              view it.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const TabComponent = TAB_COMPONENTS[currentTab];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-muted hover:text-default transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        {/* Profile Header */}
        <ProfileHeader
          name={profile.member_name}
          role={profile.member_role}
          department={profile.member_department}
          avatar={profile.member_avatar}
          email={profile.member_email}
          location={profile.member_location}
          phone={profile.member_phone}
          employeeId={profile.member_id}
          isCurrentUser={isCurrentUser}
        />

        {/* Profile Completion Banner */}
        {isCurrentUser && !isProfileComplete && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-4">
            <div className="bg-primary/20 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-default">
                Complete Your Profile
              </h3>
              <p className="text-sm text-muted mt-1">
                Your profile is incomplete. Add your work history and education
                to help your team members get to know you better.
              </p>
              <div className="mt-3">
                <Button
                  size="sm"
                  leftIcon={<FileEdit className="h-4 w-4" />}
                  onClick={handleCompleteProfile}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tabs */}
        <ProfileTabs currentTab={currentTab} onTabChange={setCurrentTab} />

        {/* Tab Content */}
        <div className="space-y-6">
          <Suspense
            fallback={<LoadingState message="Loading tab content..." />}
          >
            <TabComponent
              profile={profile}
              canEdit={isCurrentUser}
              onSave={handleSave}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
