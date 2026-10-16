import AsyncStorage from "@react-native-async-storage/async-storage";

export type WorkoutData = {
  totalWorkouts: number;
  completedDates: string[];
};

const WORKOUT_KEY = "workoutProgress";

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

export const getWorkoutData =
  async (): Promise<WorkoutData> => {
    try {
      const data = await AsyncStorage.getItem(WORKOUT_KEY);

      if (!data) {
        return {
          totalWorkouts: 0,
          completedDates: [],
        };
      }

      return JSON.parse(data);
    } catch (error) {
      console.log("Workout data error:", error);

      return {
        totalWorkouts: 0,
        completedDates: [],
      };
    }
  };

export const completeWorkout =
  async (): Promise<WorkoutData> => {
    const data = await getWorkoutData();

    const today = getDateKey(new Date());

    // Same day ko duplicate workout count nahi karenge
    if (!data.completedDates.includes(today)) {
      data.completedDates.push(today);
      data.totalWorkouts += 1;
    }

    await AsyncStorage.setItem(
      WORKOUT_KEY,
      JSON.stringify(data)
    );

    return data;
  };

export const isWorkoutCompletedToday =
  async (): Promise<boolean> => {
    const data = await getWorkoutData();

    const today = getDateKey(new Date());

    return data.completedDates.includes(today);
  };

export const getWorkoutStreak =
  async (): Promise<number> => {
    const data = await getWorkoutData();

    if (!data.completedDates.length) {
      return 0;
    }

    const completed = new Set(
      data.completedDates
    );

    const today = new Date();

    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);

      checkDate.setDate(
        today.getDate() - i
      );

      const key = getDateKey(checkDate);

      if (completed.has(key)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

export const getWeeklyWorkoutCounts =
  async (): Promise<number[]> => {
    const data = await getWorkoutData();

    const counts = [
      0, 0, 0, 0, 0, 0, 0,
    ];

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);

      date.setDate(
        today.getDate() - (6 - i)
      );

      const key = getDateKey(date);

      if (data.completedDates.includes(key)) {
        counts[i] = 1;
      }
    }

    return counts;
  };