import { Navigate, Route, Routes } from "react-router-dom";

import { MainPage } from "./pages/MainPage/MainPage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { CoursePage } from "./pages/CoursePage/CoursePage";
import { ProfilePage } from "./pages/ProfilePage/ProfilePage";
import { WorkoutPage } from "./pages/WorkoutPage/WorkoutPage";


export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/course/:courseId" element={<CoursePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/workout/:courseId/:workoutId" element={<WorkoutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}