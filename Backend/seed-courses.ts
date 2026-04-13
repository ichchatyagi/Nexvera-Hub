import { NestFactory } from '@nestjs/core';
import { CoursesService } from './src/courses/courses.service';
import { AppModule } from './src/app.module';

const courseLessons = [
    "Introduction to the Subject", "Core Principles & Fundamentals", "Setting up the Environment", "Basic Methodologies",
    "Understanding the Tools", "Practical Implementations", "Intermediate Techniques", "Case Studies Analysis",
    "Advanced Strategies", "Optimization and Best Practices", "Real-world Project Execution", "Final Assessment & Review"
];

const getPrice = (level: string, seed: number) => {
    // Beginner: 7000 - 10000
    // Intermediate: 8000 - 12000
    // Advanced: 10000 - 15000
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    if (level === 'beginner') {
        return Math.floor(7000 + pseudoRandom * 3000);
    } else if (level === 'intermediate') {
        return Math.floor(8000 + pseudoRandom * 4000);
    } else {
        return Math.floor(10000 + pseudoRandom * 5000);
    }
};

const generateDescription = (subject: string, level: string, category: string) => {
    // Generated description will be ~95 words, satisfying the >60 words requirement.
    return `Welcome to the ultimate ${level} journey in ${subject}. This meticulously designed program is tailored to provide you with the most in-depth, practical, and highly relevant knowledge required to excel in the field of ${category}. Throughout this comprehensive curriculum, you will engage in hands-on projects, explore real-world case studies, and master the core principles necessary to achieve professional excellence. By consistently applying these industry-standard techniques, you will build a robust portfolio and establish a strong foundation, dramatically elevating your career prospects and empowering you to confidently tackle complex challenges in the modern professional landscape.`;
};

const generateCourse = (subject: string, hook: string, outcomes: string[], category: string, level: string, seedIndex: number) => {
    const price = getPrice(level, seedIndex);
    const roundedPrice = Math.round(price / 100) * 100;
    
    return {
        title: `${subject}`,
        slug: `${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        description: generateDescription(subject, level, category),
        short_description: hook,
        category: { main: category, sub: subject, tags: outcomes },
        pricing: { 
            type: 'paid', 
            price: roundedPrice, 
            currency: "INR" 
        },
        level: level,
        language: "English",
        thumbnail_url: "",
        status: "published",
        outcomes: outcomes,
        requirements: ["Internet connection", "Dedication to learn"],
        curriculum: [
            {
                title: "Phase 1: Concepts & Foundations",
                order: 1,
                lessons: courseLessons.map((l, i) => ({ title: l, type: "video", order: i + 1, is_preview: i < 2 }))
            }
        ],
        total_lessons: courseLessons.length,
        total_duration_hours: level === 'advanced' ? 25 : level === 'intermediate' ? 20 : 15
    };
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const courseModel = (coursesService as any).courseModel;

  let seedIndex = 1;
  const generate = (s: string, h: string, o: string[], c: string, l: string) => generateCourse(s, h, o, c, l, seedIndex++);

  const allCourses = [
    // 1. Artificial Intelligence (12 courses)
    generate("AI Fundamentals", "Start your AI journey.", ["Basics", "AI", "Logic"], "Artificial Intelligence", "beginner"),
    generate("Machine Learning Foundations", "Understand the math behind the machines.", ["ML", "Data", "Algorithms"], "Artificial Intelligence", "intermediate"),
    generate("Deep Learning and Neural Networks", "Build the brains of tomorrow.", ["Deep Learning", "AI", "Vision"], "Artificial Intelligence", "advanced"),
    generate("Natural Language Processing Models", "Teach computers to understand speech.", ["NLP", "Text", "Speech"], "Artificial Intelligence", "advanced"),
    generate("Generative AI for Creators", "Create content with AI.", ["Generative AI", "LLMs", "Prompting"], "Artificial Intelligence", "beginner"),
    generate("Computer Vision Applications", "See the world through AI.", ["CV", "Image", "Processing"], "Artificial Intelligence", "intermediate"),
    generate("Reinforcement Learning Basics", "Agents that learn from environments.", ["RL", "Agents", "Learning"], "Artificial Intelligence", "beginner"),
    generate("Robot Perception & Control", "Intelligence for hardware.", ["Robotics", "Control", "Perception"], "Artificial Intelligence", "advanced"),
    generate("Large Language Models Masterclass", "Fine-tune massive networks.", ["LLM", "Transformers", "Scaling"], "Artificial Intelligence", "advanced"),
    generate("AI Ethics and Governance", "Responsible AI.", ["Ethics", "Bias", "Governance"], "Artificial Intelligence", "beginner"),
    generate("Predictive Analytics with AI", "Forecast with precision.", ["Prediction", "Data", "Forecasting"], "Artificial Intelligence", "intermediate"),
    generate("Cognitive Computing Architectures", "Human-like AI models.", ["Cognitive", "Systems", "Design"], "Artificial Intelligence", "advanced"),

    // 2. Information Technology (12 courses)
    generate("CompTIA A+ Certification Prep", "Start your IT career here.", ["Hardware", "Software", "ITSupport"], "Information Technology", "beginner"),
    generate("Network Security Fundamentals", "Defend the networks.", ["Security", "Networking", "Firewalls"], "Information Technology", "intermediate"),
    generate("Cloud Infrastructure with AWS", "Scale to the cloud.", ["AWS", "Cloud", "Servers"], "Information Technology", "advanced"),
    generate("DevOps Automation Pipelines", "Streamline the deployments.", ["DevOps", "CI/CD", "Docker"], "Information Technology", "advanced"),
    generate("IT Helpdesk and System Admin", "The backbone of any company.", ["SysAdmin", "Support", "Windows"], "Information Technology", "beginner"),
    generate("Linux Server Administration", "Master the penguin.", ["Linux", "Terminal", "Servers"], "Information Technology", "intermediate"),
    generate("Cybersecurity Incident Response", "React to digital threats.", ["Cybersecurity", "Response", "Hacking"], "Information Technology", "advanced"),
    generate("Enterprise Architecture", "Design massive IT systems.", ["Enterprise", "Architecture", "ITIL"], "Information Technology", "intermediate"),
    generate("Database Management Systems", "Store and query data.", ["Databases", "SQL", "Storage"], "Information Technology", "beginner"),
    generate("IT Service Management", "ITSM best practices.", ["ITSM", "Service", "Management"], "Information Technology", "intermediate"),
    generate("Disaster Recovery Planning", "Prepare for the worst.", ["DRP", "Backup", "Resilience"], "Information Technology", "advanced"),
    generate("IoT Administration", "Manage smart devices.", ["IoT", "Edge", "Management"], "Information Technology", "beginner"),

    // 3. Sales and Marketing (12 courses)
    generate("Digital Marketing Strategy", "Master the digital landscape.", ["Marketing", "Strategy", "Digital"], "Sales and Marketing", "beginner"),
    generate("B2B Sales Masterclass", "Close enterprise deals.", ["B2B", "Sales", "Negotiation"], "Sales and Marketing", "intermediate"),
    generate("Social Media Advertising", "Grow your audience fast.", ["Social Media", "Ads", "Growth"], "Sales and Marketing", "beginner"),
    generate("Content Marketing and SEO", "Rank higher, sell more.", ["SEO", "Content", "Writing"], "Sales and Marketing", "intermediate"),
    generate("E-commerce Conversion Optimization", "Turn clicks into customers.", ["E-commerce", "CRO", "Sales"], "Sales and Marketing", "advanced"),
    generate("Outbound Sales Tactics", "Cold calling that works.", ["Cold Call", "Outbound", "Sales"], "Sales and Marketing", "beginner"),
    generate("Customer Retention & Loyalty", "Keep them coming back.", ["Retention", "Loyalty", "Churn"], "Sales and Marketing", "intermediate"),
    generate("Data-Driven Marketing Models", "Metrics that matter.", ["Analytics", "Data", "Marketing"], "Sales and Marketing", "advanced"),
    generate("Copywriting that Sells", "Words that convert.", ["Copywriting", "Persuasion", "Writing"], "Sales and Marketing", "beginner"),
    generate("Key Account Management", "Nurture big clients.", ["KAM", "Accounts", "Relationships"], "Sales and Marketing", "intermediate"),
    generate("Brand Identity and Positioning", "Stand out in the market.", ["Branding", "Identity", "Positioning"], "Sales and Marketing", "advanced"),
    generate("Email Marketing Campaigns", "The inbox is yours.", ["Email", "Newsletters", "Campaigns"], "Sales and Marketing", "beginner"),

    // 4. Data Science (12 courses)
    generate("Intro to Data Analysis with Python", "Extract value from data.", ["Python", "Pandas", "Analysis"], "Data Science", "beginner"),
    generate("Big Data Processing with Spark", "Handle massive datasets.", ["Big Data", "Spark", "Processing"], "Data Science", "advanced"),
    generate("Statistical Inference & Metrics", "The math of data.", ["Statistics", "Metrics", "Math"], "Data Science", "intermediate"),
    generate("Data Visualization with Tableau", "Tell appealing data stories.", ["Tableau", "Visualization", "Dashboards"], "Data Science", "beginner"),
    generate("Predictive Modeling and Analytics", "Forecast the future.", ["Predictive", "Analytics", "Modeling"], "Data Science", "advanced"),
    generate("Data Wrangling Basics", "Clean your datasets.", ["Wrangling", "Cleaning", "Data"], "Data Science", "beginner"),
    generate("Time Series Forecasting", "Predict trends over time.", ["Time Series", "Forecasting", "Trends"], "Data Science", "advanced"),
    generate("A/B Testing and Experimentation", "Test your hypotheses.", ["A/B Testing", "Experiments", "Stats"], "Data Science", "intermediate"),
    generate("R Programming for Data Science", "The classic stat language.", ["R", "Programming", "Stats"], "Data Science", "beginner"),
    generate("Real-time Data Streaming", "Process data on the fly.", ["Streaming", "Kafka", "Real-time"], "Data Science", "advanced"),
    generate("Text Mining & Analytics", "Uncover text insights.", ["Text", "Mining", "NLP"], "Data Science", "intermediate"),
    generate("Quantitative Finance", "Data in the stock market.", ["Finance", "Quant", "Data"], "Data Science", "advanced"),

    // 5. Design (12 courses)
    generate("UI/UX Principles", "Design user-centric interfaces.", ["UI/UX", "Figma", "Design"], "Design", "beginner"),
    generate("Graphic Design Intermediate", "Master Adobe Creative Suite.", ["Graphics", "Photoshop", "Illustrator"], "Design", "intermediate"),
    generate("Motion Graphics and Animation", "Bring your designs to life.", ["Animation", "After Effects", "Motion"], "Design", "advanced"),
    generate("Web Design for Professionals", "Create stunning websites.", ["Web Design", "Layouts", "Typography"], "Design", "intermediate"),
    generate("3D Modeling and Rendering", "Build virtual worlds.", ["3D", "Blender", "Rendering"], "Design", "advanced"),
    generate("Color Theory and Typography", "The basics of aesthetics.", ["Color", "Typography", "Art"], "Design", "beginner"),
    generate("Design Systems at Scale", "Manage large UI projects.", ["Systems", "Scale", "Tokens"], "Design", "advanced"),
    generate("Prototyping Interactive Experiences", "From wireframes to prototypes.", ["Prototyping", "Interactions", "UX"], "Design", "intermediate"),
    generate("Illustration and Digital Art", "Digital drawing techniques.", ["Illustration", "Art", "Drawing"], "Design", "beginner"),
    generate("Spatial Design and AR/VR", "Design for new realities.", ["AR/VR", "Spatial", "3D"], "Design", "advanced"),
    generate("User Research Methods", "Understand your users.", ["Research", "UX", "Interviews"], "Design", "intermediate"),
    generate("Accessible Design Principles", "Design for everyone.", ["A11y", "Accessibility", "Design"], "Design", "beginner"),

    // 6. Languages (12 courses)
    generate("Spanish for Global Communication", "Habla español fluidamente.", ["Spanish", "Speaking", "Language"], "Languages", "beginner"),
    generate("French Language and Culture", "Parlez français avec confiance.", ["French", "Culture", "Speaking"], "Languages", "intermediate"),
    generate("German for Professionals", "Sprechen Sie Deutsch.", ["German", "Business", "Language"], "Languages", "advanced"),
    generate("Mandarin Chinese Basics", "Master the tones of Mandarin.", ["Mandarin", "Chinese", "Speaking"], "Languages", "beginner"),
    generate("Advanced English Business Comm", "Perfect your corporate English.", ["English", "Business", "Communication"], "Languages", "advanced"),
    generate("Japanese Writing Systems", "Hiragana, Katakana, Kanji.", ["Japanese", "Writing", "Characters"], "Languages", "beginner"),
    generate("Conversational Italian", "Speak like a native.", ["Italian", "Speaking", "Travel"], "Languages", "intermediate"),
    generate("Portuguese for Travel", "Navigate Brazil and Portugal.", ["Portuguese", "Travel", "Basics"], "Languages", "beginner"),
    generate("Korean Language Immersion", "Hangul and beyond.", ["Korean", "Hangul", "Immersion"], "Languages", "intermediate"),
    generate("Arabic Script and Pronunciation", "The beautiful script.", ["Arabic", "Script", "Pronunciation"], "Languages", "beginner"),
    generate("Translation and Localization", "Bridge language gaps.", ["Translation", "Localization", "Business"], "Languages", "advanced"),
    generate("Russian for Beginners", "Cyrillic made easy.", ["Russian", "Cyrillic", "Basics"], "Languages", "beginner"),

    // 7. Business (12 courses)
    generate("Lean Startup Methodology", "Build products people want.", ["Startup", "Lean", "Business"], "Business", "beginner"),
    generate("Financial Analysis and Accounting", "Understand the numbers.", ["Finance", "Accounting", "Analysis"], "Business", "intermediate"),
    generate("Leadership and Team Management", "Inspire and lead teams.", ["Leadership", "Management", "Team"], "Business", "advanced"),
    generate("Agile Project Management", "Deliver projects faster.", ["Agile", "Scrum", "Projects"], "Business", "intermediate"),
    generate("Corporate Strategy and Operations", "Scale your business efficiently.", ["Strategy", "Operations", "Scaling"], "Business", "advanced"),
    generate("Business Economics Fundamentals", "Micro and Macro basics.", ["Economics", "Markets", "Business"], "Business", "beginner"),
    generate("Supply Chain Management", "Move physical goods.", ["Supply Chain", "Logistics", "Inventory"], "Business", "intermediate"),
    generate("Mergers and Acquisitions", "Corporate finance strategies.", ["M&A", "Finance", "Strategy"], "Business", "advanced"),
    generate("Human Resources Management", "Manage your people.", ["HR", "People", "Culture"], "Business", "beginner"),
    generate("Business Process Optimization", "Six Sigma and beyond.", ["Processes", "Optimization", "Sigma"], "Business", "advanced"),
    generate("Negotiation Skills", "Get to yes.", ["Negotiation", "Soft Skills", "Deals"], "Business", "intermediate"),
    generate("Intro to Business Law", "Legal fundamentals.", ["Law", "Contracts", "Liability"], "Business", "beginner"),

    // 8. Entrepreneurship (12 courses)
    generate("Pitching and Fundraising", "Get money for your startup.", ["Fundraising", "Pitching", "VC"], "Entrepreneurship", "advanced"),
    generate("Building a Personal Brand", "You are your best asset.", ["Branding", "Personal", "Marketing"], "Entrepreneurship", "beginner"),
    generate("E-commerce Business Building", "Start your online store.", ["E-commerce", "Shopify", "Business"], "Entrepreneurship", "intermediate"),
    generate("Side Hustle to Full-time", "Transition to independence.", ["Side Hustle", "Business", "Growth"], "Entrepreneurship", "beginner"),
    generate("Product Discovery and Validation", "Validate before you build.", ["Product", "Validation", "Discovery"], "Entrepreneurship", "intermediate"),
    generate("Bootstrapping Your Business", "Grow without external capital.", ["Bootstrapping", "Finance", "Growth"], "Entrepreneurship", "advanced"),
    generate("Design Thinking for Startups", "Ideate and innovate.", ["Design Thinking", "Innovation", "Idea"], "Entrepreneurship", "beginner"),
    generate("Growth Hacking Strategies", "Unconventional rapid growth.", ["Growth", "Hacking", "Marketing"], "Entrepreneurship", "advanced"),
    generate("Networking and Co-founder Search", "Find your business partner.", ["Network", "Co-founder", "Team"], "Entrepreneurship", "beginner"),
    generate("Legal Structures for Startups", "LLCs, C-Corps, and equity.", ["Legal", "Equity", "Structure"], "Entrepreneurship", "advanced"),
    generate("Building Remote Agencies", "Service businesses online.", ["Agency", "Remote", "Services"], "Entrepreneurship", "intermediate"),
    generate("Market Research Fundamentals", "Know your competitors.", ["Research", "Market", "Competitors"], "Entrepreneurship", "beginner"),
  ];

  const allTuitions: any[] = [];
  for (let c = 5; c <= 12; c++) {
    let subjects: string[] = [];
    if (c <= 10) {
      subjects = ["Mathematics", "Science", "English", "Social Science"];
    } else {
      subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "English Core"];
    }
    
    const generatedSubjects = subjects.map(sub => ({
      name: sub,
      slug: `class-${c}-${sub.toLowerCase().replace(/ /g, '-')}`,
      short_description: `Comprehensive ${sub} curriculum for Class ${c}`,
      status: 'published',
      pricing: {
        monthly_enabled: true,
        monthly_price: Math.floor(1000 + ((c - 5) * 100)),
        bundle_enabled: false,
        bundle_price: 0,
        currency: 'INR'
      },
      syllabus: [
        {
          title: "Term 1 Framework",
          order: 1,
          lessons: [
            { title: "Introduction", type: "video", order: 1, is_preview: true },
            { title: "Core Concepts", type: "video", order: 2, is_preview: false }
          ]
        }
      ],
      total_lessons: 2,
      total_duration_hours: 5
    }));

    allTuitions.push({
      title: `Class ${c} Complete Tuition`,
      slug: `class-${c}-tuition`,
      product_type: 'tuition',
      status: 'published',
      description: `Comprehensive tuition package for Class ${c}. Master your academics with our expert tutors.`,
      short_description: `Master Class ${c} academics.`,
      tuition_meta: {
        class_level: c,
        boards_supported: ['CBSE', 'ICSE', 'State Board'],
        pricing: {
          monthly_enabled: true,
          monthly_price: Math.floor(4000 + (c - 5) * 500),
          bundle_enabled: true,
          bundle_price: Math.floor(40000 + (c - 5) * 5000),
          currency: 'INR'
        },
        subjects: generatedSubjects
      }
    });
  }

  const allDataToSeed: any[] = [...allCourses, ...allTuitions];

  console.log(`Seeding ${allCourses.length} courses and ${allTuitions.length} tuitions...`);
  
  for (const item of allDataToSeed) {
    try {
      await courseModel.create(item);
      const typeLabel = item.product_type === 'tuition' ? `Tuition Class ${item.tuition_meta?.class_level}` : item.category?.main;
      console.log(`+ Created: ${item.title} [${typeLabel}]`);
    } catch (e: any) {
      if (e.code === 11000) {
        // Update existing if duplicate slug found to refresh data
        await courseModel.findOneAndUpdate({ slug: item.slug }, item);
        console.log(`~ Updated: ${item.title}`);
      } else {
        console.log(`- Error creating ${item.title}: ${e.message}`);
      }
    }
  }
  
  await app.close();
  console.log('Seeding completed successfully.');
}

bootstrap();
