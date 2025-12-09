import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { InterestSelection } from "@/components/auth/InterestSelection";
import { ProfileSetup } from "@/components/auth/ProfileSetup";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PostcardCreator } from "@/components/postcard/PostcardCreator";
import { Collection } from "@/components/collection/Collection";
import { Profile } from "@/components/profile/Profile";

function AppContent() {
  const { isAuthenticated, onboardingStep, user } = useAuth();

  // Show onboarding flow if not fully authenticated
  if (!isAuthenticated) {
    return (
      <>
        {onboardingStep === 'signup' && <SignUpForm />}
        {onboardingStep === 'interests' && (
          <div className="min-h-screen bg-background paper-texture">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative min-h-screen flex items-center justify-center p-6">
              <InterestSelection />
            </div>
          </div>
        )}
        {onboardingStep === 'profile' && (
          <div className="min-h-screen bg-background paper-texture">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative min-h-screen flex items-center justify-center p-6">
              <ProfileSetup />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<PostcardCreator />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Suspense>
  );
}

export default App;
