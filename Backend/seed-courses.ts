import { NestFactory } from '@nestjs/core';
import { CoursesService } from './src/courses/courses.service';
import { AppModule } from './src/app.module';

const itCourseLessons = [
    "Introduction to Technology", "Development Environment Setup", "Core Syntax & Variables", "Data Structures Fundamentals",
    "Logic & Control Flow", "Functions & Scope", "Modular Programming Architecture", "File I/O and Persistence",
    "Error Handling & Exception Management", "Object-Oriented Programming Principles", "Advanced System Architecture", "External API Integration",
    "Modern Security Best Practices", "Performance Optimization Techniques", "Testing & Quality Assurance", "Deployment Pipelines & CI/CD",
    "Scalability & Resource Management", "Cloud Infrastructure Overview", "Real-world Case Studies", "Strategic Project Planning", 
    "Software Implementation Phase", "Final Certification Assessment"
];

const generateLevels = (subject: string, hook: string, outcomes: string[], category: string, basePrice: number) => {
    return (["beginner", "intermediate", "advanced"] as const).map((level, idx) => {
        const prices: Record<string, number[]> = { 
            "Python Programming Fundamentals": [649, 1189, 1899], 
            "Web Development Bootcamp": [729, 1349, 1979], 
            "Cybersecurity Essentials": [819, 1219, 2099], 
            "Cloud Computing with AWS": [679, 1429, 1849], 
            "Data Structures & Algorithms": [1149, 1379, 2179], 
            "Mobile App Development": [929, 1149, 1999], 
            "DevOps & CI/CD Practices": [749, 1299, 1879], 
            "Networking and System Administration": [1049, 1129, 2149], 
            "Database Design & SQL": [639, 1399, 1949], 
            "Ethical Hacking and Penetration Testing": [879, 1479, 2049] 
        };
        const price = prices[subject] ? prices[subject][idx] : basePrice * (idx + 1);
        
        return {
            title: `${subject} - ${level.charAt(0).toUpperCase() + level.slice(1)}`,
            slug: `${subject.toLowerCase().replace(/ /g, '-')}-${level}`,
            description: `A comprehensive ${level}-level exploration of ${subject}, designed for high-impact professional outcomes and industry mastery.`,
            short_description: hook,
            category: { main: category, sub: subject, tags: outcomes },
            pricing: { 
                type: 'paid', 
                price: price, 
                currency: "INR" 
            },
            level: level,
            language: "English",
            thumbnail_url: `/images/courses/default.png`,
            status: "published",
            outcomes: outcomes,
            requirements: ["Basic computer literacy", "Stable internet connection"],
            curriculum: [
                {
                    title: "Phase 1: Concepts & Foundations",
                    order: 1,
                    lessons: itCourseLessons.slice(0, 11).map((l, i) => ({ title: l, type: "video", order: i + 1, is_preview: i < 2 }))
                }
            ],
            total_lessons: itCourseLessons.length,
            total_duration_hours: 22
        };
    });
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const courseModel = (coursesService as any).courseModel;

  const itCourses = [
    ...generateLevels("Python Programming Fundamentals", "Stop writing code. Start engineering solutions.", ["Python", "Logic", "Automation"], "Information Technology", 649),
    ...generateLevels("Web Development Bootcamp", "The Internet is your canvas. Learn to build the digital world.", ["HTML/CSS", "JavaScript", "React"], "Information Technology", 729),
    ...generateLevels("Cybersecurity Essentials", "The digital world is under attack. Become the shield.", ["Networking", "Defense", "Security"], "Information Technology", 819),
    ...generateLevels("Cloud Computing with AWS", "Master the AWS ecosystem and cloud architecture.", ["AWS", "Infrastructure", "Scalability"], "Information Technology", 679),
    ...generateLevels("Data Structures & Algorithms", "Code that scales is the goal.", ["Algorithms", "Complexity", "Efficiency"], "Information Technology", 1149),
    ...generateLevels("Mobile App Development", "Build native-feeling apps for iOS and Android.", ["Mobile", "UI/UX", "State Management"], "Information Technology", 929),
    ...generateLevels("DevOps & CI/CD Practices", "Automate the Future.", ["Docker", "Kubernetes", "Pipelines"], "Information Technology", 749),
    ...generateLevels("Networking and System Administration", "Control the wire.", ["OSI Model", "Routers", "SysAdmin"], "Information Technology", 1049),
    ...generateLevels("Database Design & SQL", "Data is the New Oil.", ["SQL", "Normalization", "Architecture"], "Information Technology", 639),
    ...generateLevels("Ethical Hacking and Penetration Testing", "Be the Ethical Shield.", ["Exploits", "Pen-testing", "Ethics"], "Information Technology", 879)
  ];

  console.log(`Seeding ${itCourses.length} IT courses...`);
  
  for (const course of itCourses) {
    try {
      await courseModel.create(course);
      console.log(`+ Created: ${course.title}`);
    } catch (e: any) {
      if (e.code === 11000) {
        console.log(`- Skiped (Duplicate): ${course.title}`);
      } else {
        console.log(`- Error creating ${course.title}: ${e.message}`);
      }
    }
  }
  
  await app.close();
  console.log('Seeding completed successfully.');
}

bootstrap();
