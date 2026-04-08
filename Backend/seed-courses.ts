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

const generateLevels = (subject: string, hook: string, outcomes: string[], category: string, basePrice: number, thumbnail: string) => {
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
            thumbnail_url: `/images/courses/${thumbnail}`,
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
    // 1. Artificial Intelligence
    ...generateLevels("Python Programming Fundamentals", "Stop writing code. Start engineering solutions.", ["Python", "Logic", "Automation"], "Artificial Intelligence", 649, "python-fundamentals.png"),
    
    // 2. Information Technology
    ...generateLevels("Cybersecurity Essentials", "The digital world is under attack. Become the shield.", ["Networking", "Defense", "Security"], "Information Technology", 819, "cybersecurity.png"),
    ...generateLevels("Cloud Computing with AWS", "Master the AWS ecosystem and cloud architecture.", ["AWS", "Infrastructure", "Scalability"], "Information Technology", 679, "cloud-aws.png"),
    ...generateLevels("DevOps & CI/CD Practices", "Automate the Future.", ["Docker", "Kubernetes", "Pipelines"], "Information Technology", 749, "devops-cicd.png"),
    ...generateLevels("Networking and System Administration", "Control the wire.", ["OSI Model", "Routers", "SysAdmin"], "Information Technology", 1049, "networking-sysadmin.png"),
    ...generateLevels("Ethical Hacking and Penetration Testing", "Be the Ethical Shield.", ["Exploits", "Pen-testing", "Ethics"], "Information Technology", 879, "ethical-hacking.png"),

    // 3. Sales and Marketing
    ...generateLevels("Digital Marketing Masterclass", "Sell anything to anyone, anywhere.", ["SEO", "Social Media", "Ads"], "Sales and Marketing", 549, "api-dev.png"),

    // 4. Data Science
    ...generateLevels("Data Structures & Algorithms", "Code that scales is the goal.", ["Algorithms", "Complexity", "Efficiency"], "Data Science", 1149, "dsa-mastery.png"),
    ...generateLevels("Database Design & SQL", "Data is the New Oil.", ["SQL", "Normalization", "Architecture"], "Data Science", 639, "database-sql.png"),

    // 5. Design
    ...generateLevels("Web Development Bootcamp", "The Internet is your canvas. Learn to build the digital world.", ["HTML/CSS", "JavaScript", "React"], "Design", 729, "web-dev-bootcamp.png"),
    ...generateLevels("Mobile App Development", "Build native-feeling apps for iOS and Android.", ["Mobile", "UI/UX", "State Management"], "Design", 929, "mobile-app-dev.png"),

    // 6. Languages
    ...generateLevels("Professional Business English", "Speak the language of global success.", ["Communication", "Grammar", "Business"], "Languages", 499, "business-english.png"),

    // 7. Business
    ...generateLevels("Modern Business Management", "Lead with data and empathy.", ["Strategy", "Leadership", "Finance"], "Business", 799, "uiux-design.png"),

    // 8. Entrepreneurship
    ...generateLevels("The Startup Architect", "Turn your ideas into a scalable empire.", ["Innovation", "VC", "Growth"], "Entrepreneurship", 999, "ai-fundamentals.png")
  ];

  console.log(`Seeding ${itCourses.length} courses across 8 categories...`);
  
  // Clear existing courses to avoid duplicates during re-seeding if desired, 
  // but here we just rely on slug uniqueness provided by generateLevels
  
  for (const course of itCourses) {
    try {
      await courseModel.create(course);
      console.log(`+ Created: ${course.title} [${course.category.main}]`);
    } catch (e: any) {
      if (e.code === 11000) {
        // Update existing if duplicate slug found to refresh data
        await courseModel.findOneAndUpdate({ slug: course.slug }, course);
        console.log(`~ Updated: ${course.title}`);
      } else {
        console.log(`- Error creating ${course.title}: ${e.message}`);
      }
    }
  }
  
  await app.close();
  console.log('Seeding completed successfully.');
}

bootstrap();
