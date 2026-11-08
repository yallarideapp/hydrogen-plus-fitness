// Transcribed from Hydrogen Plus Fitness & Spa’s published women’s timetable.
// Source: https://www.instagram.com/hydrogenplusfitness/p/DfZrJukouow/
// Week: 7–12 November 2026. All times are local to Irbid (Asia/Amman).
// Categories are browsing filters. No duration or capacity was published.

export type ClassCategory = 'cardio' | 'strength' | 'balance';
export type ScheduleDay = { en: string; ar: string; date: string };
export type ScheduledClass = {
  day: string;
  time: string;
  period: 'AM' | 'PM';
  name: string;
  ar: string;
  coach: string;
  category: ClassCategory;
};

export const scheduleDays: ScheduleDay[] = [
  {
    "en": "Saturday",
    "ar": "السبت",
    "date": "2026-11-07"
  },
  {
    "en": "Sunday",
    "ar": "الأحد",
    "date": "2026-11-08"
  },
  {
    "en": "Monday",
    "ar": "الاثنين",
    "date": "2026-11-09"
  },
  {
    "en": "Tuesday",
    "ar": "الثلاثاء",
    "date": "2026-11-10"
  },
  {
    "en": "Wednesday",
    "ar": "الأربعاء",
    "date": "2026-11-11"
  },
  {
    "en": "Thursday",
    "ar": "الخميس",
    "date": "2026-11-12"
  }
];

export const schedule: ScheduledClass[] = [
  {
    "day": "Saturday",
    "time": "10:00",
    "period": "AM",
    "name": "Cycling",
    "ar": "الدراجة",
    "coach": "MARWA",
    "category": "cardio"
  },
  {
    "day": "Saturday",
    "time": "11:00",
    "period": "AM",
    "name": "Core",
    "ar": "تمارين الجذع",
    "coach": "KATIE",
    "category": "strength"
  },
  {
    "day": "Saturday",
    "time": "5:00",
    "period": "PM",
    "name": "Cycling",
    "ar": "الدراجة",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Saturday",
    "time": "6:00",
    "period": "PM",
    "name": "Back & Plank",
    "ar": "الظهر والبلانك",
    "coach": "LESYA",
    "category": "strength"
  },
  {
    "day": "Saturday",
    "time": "7:00",
    "period": "PM",
    "name": "Belly Dance",
    "ar": "الرقص الشرقي",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Saturday",
    "time": "8:00",
    "period": "PM",
    "name": "Core",
    "ar": "تمارين الجذع",
    "coach": "SARA",
    "category": "strength"
  },
  {
    "day": "Sunday",
    "time": "10:00",
    "period": "AM",
    "name": "Power Glutes",
    "ar": "تقوية عضلات الأرداف",
    "coach": "LESYA",
    "category": "strength"
  },
  {
    "day": "Sunday",
    "time": "11:00",
    "period": "AM",
    "name": "Tabata",
    "ar": "تاباتا",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Sunday",
    "time": "5:00",
    "period": "PM",
    "name": "Legs",
    "ar": "تمارين الساقين",
    "coach": "KATIE",
    "category": "strength"
  },
  {
    "day": "Sunday",
    "time": "6:00",
    "period": "PM",
    "name": "Step",
    "ar": "ستيب",
    "coach": "SARA",
    "category": "cardio"
  },
  {
    "day": "Sunday",
    "time": "7:00",
    "period": "PM",
    "name": "Belly Dance",
    "ar": "الرقص الشرقي",
    "coach": "ABEER",
    "category": "cardio"
  },
  {
    "day": "Sunday",
    "time": "8:00",
    "period": "PM",
    "name": "Legs",
    "ar": "تمارين الساقين",
    "coach": "KATIE",
    "category": "strength"
  },
  {
    "day": "Monday",
    "time": "10:00",
    "period": "AM",
    "name": "Belly Dance",
    "ar": "الرقص الشرقي",
    "coach": "ABEER",
    "category": "cardio"
  },
  {
    "day": "Monday",
    "time": "11:00",
    "period": "AM",
    "name": "Legs",
    "ar": "تمارين الساقين",
    "coach": "KATIE",
    "category": "strength"
  },
  {
    "day": "Monday",
    "time": "5:00",
    "period": "PM",
    "name": "Abs",
    "ar": "تمارين البطن",
    "coach": "SARA",
    "category": "strength"
  },
  {
    "day": "Monday",
    "time": "6:00",
    "period": "PM",
    "name": "Yoga",
    "ar": "يوغا",
    "coach": "SVITLANA",
    "category": "balance"
  },
  {
    "day": "Monday",
    "time": "7:00",
    "period": "PM",
    "name": "Zumba",
    "ar": "زومبا",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Monday",
    "time": "8:00",
    "period": "PM",
    "name": "Upper Body",
    "ar": "الجزء العلوي من الجسم",
    "coach": "LESYA",
    "category": "strength"
  },
  {
    "day": "Tuesday",
    "time": "10:00",
    "period": "AM",
    "name": "Step Advanced",
    "ar": "ستيب متقدم",
    "coach": "MARWA",
    "category": "cardio"
  },
  {
    "day": "Tuesday",
    "time": "11:00",
    "period": "AM",
    "name": "Hips & Abs",
    "ar": "الوركان والبطن",
    "coach": "SARA",
    "category": "strength"
  },
  {
    "day": "Tuesday",
    "time": "5:00",
    "period": "PM",
    "name": "Step",
    "ar": "ستيب",
    "coach": "KATIE",
    "category": "cardio"
  },
  {
    "day": "Tuesday",
    "time": "6:00",
    "period": "PM",
    "name": "Tabata",
    "ar": "تاباتا",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Tuesday",
    "time": "7:00",
    "period": "PM",
    "name": "Inner Thigh",
    "ar": "عضلات الفخذ الداخلية",
    "coach": "LESYA",
    "category": "strength"
  },
  {
    "day": "Tuesday",
    "time": "8:00",
    "period": "PM",
    "name": "Cycling",
    "ar": "الدراجة",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Wednesday",
    "time": "10:00",
    "period": "AM",
    "name": "Zumba",
    "ar": "زومبا",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Wednesday",
    "time": "11:00",
    "period": "AM",
    "name": "SHD & TR ABS",
    "ar": "SHD & TR ABS",
    "coach": "LESYA",
    "category": "strength"
  },
  {
    "day": "Wednesday",
    "time": "5:00",
    "period": "PM",
    "name": "Tabata",
    "ar": "تاباتا",
    "coach": "SARA",
    "category": "cardio"
  },
  {
    "day": "Wednesday",
    "time": "6:00",
    "period": "PM",
    "name": "Core",
    "ar": "تمارين الجذع",
    "coach": "KATIE",
    "category": "strength"
  },
  {
    "day": "Wednesday",
    "time": "7:00",
    "period": "PM",
    "name": "Belly Dance",
    "ar": "الرقص الشرقي",
    "coach": "ABEER",
    "category": "cardio"
  },
  {
    "day": "Wednesday",
    "time": "8:00",
    "period": "PM",
    "name": "Aerobic",
    "ar": "أيروبيك",
    "coach": "SARA",
    "category": "cardio"
  },
  {
    "day": "Thursday",
    "time": "10:00",
    "period": "AM",
    "name": "Yoga",
    "ar": "يوغا",
    "coach": "SVITLANA",
    "category": "balance"
  },
  {
    "day": "Thursday",
    "time": "11:00",
    "period": "AM",
    "name": "Cycling",
    "ar": "الدراجة",
    "coach": "FARAH",
    "category": "cardio"
  },
  {
    "day": "Thursday",
    "time": "5:00",
    "period": "PM",
    "name": "Full Body",
    "ar": "تمارين الجسم بالكامل",
    "coach": "KATIE",
    "category": "strength"
  },
  {
    "day": "Thursday",
    "time": "6:00",
    "period": "PM",
    "name": "Hips & Abs",
    "ar": "الوركان والبطن",
    "coach": "SARA",
    "category": "strength"
  },
  {
    "day": "Thursday",
    "time": "7:00",
    "period": "PM",
    "name": "Abs",
    "ar": "تمارين البطن",
    "coach": "KATIE",
    "category": "strength"
  }
];
