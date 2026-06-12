export const categories = [
  {
    id: "1",
    name: "Baja Sur",
    image:
      "https://img.freepik.com/premium-photo/group-young-sporty-people-practicing-yoga-lesson-with-instructor-yoga-teacher-with-students_1260208-2210.jpg?w=1480",
  },
  {
    id: "2",
    name: "Monterrey",
    image:
      "https://img.freepik.com/premium-photo/teamwork-makes-yoga-class-schedule-work-shot-group-young-men-women-chatting_926199-4401616.jpg?w=360",
  },
  {
    id: "3",
    name: "Mexico City",
    image:
      "https://img.freepik.com/premium-photo/group-young-sporty-people-practicing-yoga-lesson-with-instructor-yoga-teacher-with-students_1260208-2210.jpg?w=1480",
  },
];

// Challenge destacado del mes (opcional). Si `active` es false, la card no se muestra.
export const monthlyChallenge = {
  id: "challenge-2026-06",
  active: true,
  badge: "Challenge del mes",
  icon: "target", // nombre de icono de Feather
  title: "21 días de meditación",
  progressLabel: "Día 5 de 21",
  url: "https://mindco.app/challenge",
};

export const classes = [
  {
    id: "class-1",
    title: "Meditación Mindfulness ",
    description: "Meditación guiada para cerrar el día con calma.",
    category: "Mindfulness",
    instructor: "Ana Lore",
    date: "25 Dic",
    time: "20:30",
    modality: "Zoom",
    materials: "Tapete y manta",
    durationMinutes: 50,
    startDateTime: "2025-12-25T20:30:00-06:00",
    zoomLink: "https://zoom.us/j/987654321",
    isFeatured: true,
    image:
      "https://img.freepik.com/free-photo/young-attractive-woman-corpse-pose-studio-floor-background_1163-4610.jpg?t=st=1766626681~exp=1766630281~hmac=33fb44261966ad7fb097e8400ace34f073d3ea3d09f34421aba8ab8f8172a646&w=740",
  },
  {
    id: "class-2",
    title: "Respiración Consciente",
    description: "Sesión enfocada en respiración y presencia.",
    category: "Respiración",
    instructor: "Carlos Ruiz",
    date: "25 Dic",
    time: "21:00",
    modality: "Presencial",
    materials: "Cojín de meditación",
    durationMinutes: 40,
    startDateTime: "2025-12-25T21:00-06:00",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200",
  },
  {
    id: "class-3",
    title: "Yoga Matutino",
    description: "Yoga suave para activar cuerpo y mente.",
    category: "Yoga",
    instructor: "Pedro López",
    date: "25 Nov",
    time: "08:00",
    modality: "Presencial",
    materials: "Tapete y bloque",
    durationMinutes: 55,
    startDateTime: "2024-11-25T08:00:00Z",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200",
  },
  {
    id: "class-4",
    title: "Encontrando tu centro",
    description: "miércoles 24 de Diciembre a las 6:00pm horario CDMX",
    category: "Mindfulness",
    instructor: "Ana Lore",
    date: "24 Dic",
    time: "18:00",
    modality: "Zoom",
    materials: "Tapete de yoga, audífonos",
    durationMinutes: 60,
    startDateTime: "2025-12-24T18:00:00Z",
    zoomLink: "https://zoom.us/j/123456789",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300",
  },
  {
    id: "class-5",
    title: "Sábado 5 de Dic",
    description: "Clase presencial enfocada en respiración consciente.",
    category: "Meditación",
    instructor: "Carlos Ruiz",
    date: "05 Dic",
    time: "16:30",
    modality: "Presencial",
    materials: "Ropa cómoda, botella de agua",
    durationMinutes: 45,
    startDateTime: "2025-12-05T16:30:00Z",
    image:
      "https://plus.unsplash.com/premium_photo-1674675646818-01d7a7bae64c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const sortByStartDate = (a, b) => {
  const aTime = new Date(a.startDateTime).getTime();
  const bTime = new Date(b.startDateTime).getTime();
  return aTime - bTime;
};

const sortByStartDateDesc = (a, b) => {
  const aTime = new Date(a.startDateTime).getTime();
  const bTime = new Date(b.startDateTime).getTime();
  return bTime - aTime;
};

export const getUpcomingClasses = (now = new Date()) =>
  classes
    .filter((item) => new Date(item.startDateTime) >= now)
    .slice()
    .sort(sortByStartDate);

export const getPastClasses = (now = new Date()) =>
  classes
    .filter((item) => new Date(item.startDateTime) < now)
    .slice()
    .sort(sortByStartDateDesc);

export const getNextClass = (now = new Date()) => {
  const featured = classes.find((item) => item.isFeatured);
  if (featured) return featured;
  return getUpcomingClasses(now)[0] || null;
};

export const upcomingClasses = getUpcomingClasses();
export const pastClasses = getPastClasses();

export const mockClasses = classes;
