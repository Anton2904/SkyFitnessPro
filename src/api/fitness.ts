import { api } from "./client";
import type {
  Course,
  CourseProgress,
  UserProfile,
  Workout,
  WorkoutProgress,
} from "../types";

const textRequestConfig = {
  headers: {
    "Content-Type": "text/plain",
  },
};

export async function getCourses(): Promise<Course[]> {
  return (await api.get<Course[]>("/courses")).data;
}

export async function getCourse(id: string): Promise<Course> {
  return (await api.get<Course>(`/courses/${id}`)).data;
}

export async function register(
  email: string,
  password: string,
): Promise<void> {
  await api.post(
    "/auth/register",
    JSON.stringify({ email, password }),
    textRequestConfig,
  );
}

export async function login(
  email: string,
  password: string,
): Promise<string> {
  const response = await api.post<{ token: string }>(
    "/auth/login",
    JSON.stringify({ email, password }),
    textRequestConfig,
  );

  return response.data.token;
}

interface GetMeResponse {
  user: UserProfile;
}

export async function getMe(): Promise<UserProfile> {
  const response = await api.get<GetMeResponse>("/users/me");

  return response.data.user;
}

export async function addCourse(courseId: string): Promise<void> {
  await api.post(
    "/users/me/courses",
    JSON.stringify({ courseId }),
    textRequestConfig,
  );
}

export async function removeCourse(courseId: string): Promise<void> {
  await api.delete(`/users/me/courses/${courseId}`);
}

export async function resetCourse(courseId: string): Promise<void> {
  await api.patch(`/courses/${courseId}/reset`);
}

export async function getCourseWorkouts(
  courseId: string,
): Promise<Workout[]> {
  return (
    await api.get<Workout[]>(`/courses/${courseId}/workouts`)
  ).data;
}

export async function getWorkout(
  workoutId: string,
): Promise<Workout> {
  return (
    await api.get<Workout>(`/workouts/${workoutId}`)
  ).data;
}

export async function getCourseProgress(
  courseId: string,
): Promise<CourseProgress> {
  return (
    await api.get<CourseProgress>(
      `/users/me/progress?courseId=${courseId}`,
    )
  ).data;
}

export async function getWorkoutProgress(
  courseId: string,
  workoutId: string,
): Promise<WorkoutProgress> {
  return (
    await api.get<WorkoutProgress>(
      `/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
    )
  ).data;
}

export async function saveWorkoutProgress(
  courseId: string,
  workoutId: string,
  progressData: number[],
): Promise<void> {
  await api.patch(
    `/courses/${courseId}/workouts/${workoutId}`,
    JSON.stringify({ progressData }),
    textRequestConfig,
  );
}