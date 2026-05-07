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

const generateSpecificCourse = (
    title: string,
    slug: string,
    mainCategory: string,
    subcategory: string,
    level: string,
    price: number,
    shortDesc: string,
    detailedCurriculum: string
) => {
    return {
        title: title,
        slug: slug,
        description: detailedCurriculum,
        short_description: shortDesc,
        category: { 
            main: mainCategory, 
            sub: subcategory, 
            tags: [subcategory, mainCategory, "Nexvera"] 
        },
        pricing: { 
            type: 'paid', 
            price: price, 
            currency: "INR" 
        },
        level: level.toLowerCase(),
        language: "English",
        thumbnail_url: "",
        status: "published",
        outcomes: [subcategory, "Professional Certification", "Hands-on Projects"],
        requirements: ["Internet connection", "Dedication to learn"],
        curriculum: [
            {
                title: "Phase 1: Concepts & Foundations",
                order: 1,
                lessons: courseLessons.map((l, i) => ({ title: l, type: "video", order: i + 1, is_preview: i < 2 }))
            }
        ],
        total_lessons: courseLessons.length,
        total_duration_hours: level.toLowerCase() === 'advanced' ? 25 : level.toLowerCase() === 'intermediate' ? 20 : 15
    };
};


const generateSpecificTuition = (
    title: string,
    slug: string,
    gradeLevel: number,
    boards: string[],
    monthlyPrice: number,
    bundlePrice: number,
    shortDesc: string,
    detailedDesc: string
) => {
    let subjects: string[] = [];
    if (gradeLevel <= 10) {
      subjects = ["Mathematics", "Science", "English", "Social Science"];
    } else {
      subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "English Core"];
    }
    
    const generatedSubjects = subjects.map(sub => ({
      name: sub,
      slug: `${slug}-${sub.toLowerCase().replace(/ /g, '-')}`,
      short_description: `Comprehensive ${sub} curriculum with ${title}`,
      status: 'published',
      pricing: {
        monthly_enabled: true,
        monthly_price: Math.floor(monthlyPrice / subjects.length),
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

    return {
        title: title,
        slug: slug,
        product_type: 'tuition',
        status: 'published',
        description: detailedDesc,
        short_description: shortDesc,
        tuition_meta: {
            class_level: gradeLevel,
            boards_supported: boards,
            pricing: {
                monthly_enabled: true,
                monthly_price: monthlyPrice,
                bundle_enabled: true,
                bundle_price: bundlePrice,
                currency: 'INR'
            },
            subjects: generatedSubjects
        }
    };
};


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const courseModel = (coursesService as any).courseModel;

  let seedIndex = 1;
  const generate = (s: string, h: string, o: string[], c: string, l: string) => generateCourse(s, h, o, c, l, seedIndex++);

  const allCourses = [
    // 1. Artificial Intelligence (20 courses)
    generateSpecificCourse(
        "AI For Everyone", 
        "ai-for-everyone", 
        "Artificial Intelligence",
        "AI Fundamentals", 
        "Beginner", 
        7999, 
        "A beginner-friendly introduction to Artificial Intelligence concepts and real-world applications.\nUnderstand how AI is transforming industries and daily life.", 
        "This course introduces the fundamentals of Artificial Intelligence in a non-technical way. It begins with the history and evolution of AI and explains how AI systems work. Learners explore key concepts like machine learning, data, and automation. The course highlights real-world use cases across industries such as healthcare, finance, and retail. Students also learn how AI supports decision-making and business growth. Ethical concerns like bias, privacy, and responsible AI are discussed in detail. Future trends and career opportunities in AI are also covered. By the end, learners will have a clear understanding of AI’s impact on the modern world."
    ),
    generateSpecificCourse(
        "Introduction to AI", 
        "introduction-to-ai", 
        "Artificial Intelligence",
        "AI Fundamentals", 
        "Beginner", 
        8599, 
        "Learn the core principles behind Artificial Intelligence and intelligent systems.\nBuild a strong base for further AI learning.", 
        "This course covers the foundational principles of Artificial Intelligence with a slightly technical approach. It includes problem-solving techniques, search algorithms, and knowledge representation. Students learn how machines process information and make decisions. The course introduces supervised and unsupervised learning concepts. Basic algorithms and models are explained with practical examples. Learners explore simple AI implementations and real-world applications. Key challenges and limitations of AI are also discussed. By the end, students will be ready to move into intermediate AI topics."
    ),
    generateSpecificCourse(
        "Machine Learning Specialization", 
        "machine-learning-specialization", 
        "Artificial Intelligence",
        "Machine Learning", 
        "Intermediate", 
        15999, 
        "Master core machine learning algorithms and data-driven model building.\nWork with real datasets and practical implementations.", 
        "This course focuses on building a strong understanding of machine learning techniques. Students learn supervised learning methods such as regression and classification. Unsupervised learning techniques like clustering and dimensionality reduction are covered. The course includes data preprocessing and feature engineering. Learners work with real datasets using tools like Python and ML libraries. Model evaluation techniques such as accuracy, precision, and recall are explained. Overfitting, underfitting, and optimization strategies are discussed. By the end, students will be able to build and evaluate machine learning models confidently."
    ),
    generateSpecificCourse(
        "Generative AI for Everyone", 
        "generative-ai-for-everyone", 
        "Artificial Intelligence",
        "Generative AI", 
        "Beginner", 
        8999, 
        "Explore how generative AI creates text, images, and content.\nUnderstand tools like ChatGPT and modern AI systems.", 
        "This course introduces the concepts of generative AI and how it produces content. Students learn about large language models and generative systems. The course covers applications in content creation, design, and automation. Learners explore prompt basics and how to interact effectively with AI tools. Limitations and risks of generative AI are discussed. Ethical issues like misinformation and bias are also covered. Real-world case studies demonstrate practical usage. By the end, learners will be able to use generative AI tools effectively."
    ),
    generateSpecificCourse(
        "Deep Learning Specialization", 
        "deep-learning-specialization", 
        "Artificial Intelligence",
        "Deep Learning", 
        "Advanced", 
        26999, 
        "Learn advanced neural networks and deep learning architectures.\nBuild high-performance AI systems for complex tasks.", 
        "This course provides in-depth knowledge of deep learning techniques. Students learn about neural networks, activation functions, and backpropagation. Advanced architectures like CNNs and RNNs are covered. The course includes optimization techniques and hyperparameter tuning. Learners work on projects such as image recognition and sequence prediction. Regularization and performance improvement methods are discussed. Implementation using deep learning frameworks is included. By the end, students can design and train advanced deep learning models."
    ),
    generateSpecificCourse(
        "Natural Language Processing Specialization", 
        "natural-language-processing-specialization", 
        "Artificial Intelligence",
        "NLP", 
        "Advanced", 
        24999, 
        "Understand how machines process and analyze human language.\nBuild NLP-based applications like chatbots and translators.", 
        "This course focuses on Natural Language Processing techniques used in AI systems. Students learn text preprocessing, tokenization, and vectorization. The course covers sentiment analysis, classification, and language modeling. Advanced topics like transformers and attention mechanisms are included. Learners build applications such as chatbots and recommendation systems. Evaluation techniques and optimization strategies are discussed. Real-world datasets are used for practical learning. By the end, students can build and deploy NLP solutions."
    ),
    generateSpecificCourse(
        "Prompt Engineering for ChatGPT", 
        "prompt-engineering-chatgpt", 
        "Artificial Intelligence",
        "Generative AI", 
        "Beginner", 
        7999, 
        "Learn how to write effective prompts for AI tools.\nImprove output quality using structured prompting techniques.", 
        "This course teaches how to design prompts for AI systems like ChatGPT. Students learn zero-shot, few-shot, and chain-of-thought prompting. The course explains how prompt structure affects AI output. Real-world use cases in writing, coding, and automation are covered. Learners practice prompt refinement and optimization. Limitations and biases in responses are discussed. Hands-on exercises help improve skills. By the end, learners will be able to generate accurate and useful AI outputs."
    ),
    generateSpecificCourse(
        "Ethics of AI", 
        "ethics-of-ai", 
        "Artificial Intelligence",
        "AI Ethics", 
        "Beginner", 
        8499, 
        "Explore ethical challenges in AI development and deployment.\nLearn about fairness, bias, and responsible AI practices.", 
        "This course examines the ethical aspects of Artificial Intelligence. Students learn about bias, fairness, and accountability in AI systems. It covers data privacy and security concerns. Real-world case studies highlight ethical dilemmas. Regulations and governance frameworks are discussed. Learners explore transparency and explainability in AI. Strategies for building responsible AI are introduced. By the end, students can evaluate AI systems ethically."
    ),
    generateSpecificCourse(
        "Vibe Coding: AI-Driven Software Development", 
        "vibe-coding-ai-development", 
        "Artificial Intelligence",
        "AI Development", 
        "Intermediate", 
        14999, 
        "Accelerate coding using AI-powered tools and workflows.\nLearn modern AI-assisted development practices.", 
        "This course focuses on integrating AI into software development. Students learn how AI tools assist in coding, debugging, and optimization. The course covers AI-powered IDEs and automation workflows. Learners explore real-world development scenarios using AI assistants. Best practices for efficient coding are discussed. Practical projects help build hands-on experience. Limitations and risks of AI coding are also covered. By the end, learners can significantly improve development productivity."
    ),
    generateSpecificCourse(
        "AI Product Management", 
        "ai-product-management", 
        "Artificial Intelligence",
        "AI Business & Strategy", 
        "Intermediate", 
        16999, 
        "Learn how to build and manage AI-powered products.\nCombine business strategy with technical AI understanding.", 
        "This course focuses on the lifecycle of AI product development. Students learn how to identify opportunities and define product requirements. It covers collaboration with data scientists and engineers. Learners explore model selection, evaluation, and deployment. The course includes user experience design for AI systems. Ethical considerations and risk management are discussed. Real-world case studies provide practical insights. By the end, students can successfully manage AI products."
    ),
    generateSpecificCourse(
        "Applied Generative AI & LLM Engineering", 
        "applied-generative-ai-llm-engineering", 
        "Artificial Intelligence",
        "Generative AI", 
        "Advanced", 
        29999, 
        "Build real-world applications using large language models.\nMaster deployment and scaling of generative AI systems.", 
        "This course focuses on practical implementation of generative AI systems. Students learn about LLM architectures and fine-tuning techniques. The course covers prompt pipelines and API integration. Learners build real-world applications using AI tools. Optimization and scaling strategies are discussed. Safety, bias, and ethical concerns are included. Hands-on projects provide real-world experience. By the end, students can deploy production-ready AI applications."
    ),
    generateSpecificCourse(
        "AI Agents & Autonomous Systems Development", 
        "ai-agents-autonomous-systems", 
        "Artificial Intelligence",
        "AI Systems", 
        "Advanced", 
        31999, 
        "Design AI agents that can act and make decisions independently.\nExplore automation using intelligent systems.", 
        "This course explores the development of AI agents and autonomous systems. Students learn how agents perceive environments and make decisions. It covers reinforcement learning basics and agent frameworks. Learners build systems that perform tasks independently. Multi-agent systems and coordination are discussed. Real-world automation projects are included. Evaluation and optimization techniques are covered. By the end, students can build intelligent autonomous systems."
    ),
    generateSpecificCourse(
        "Computer Vision with Deep Learning", 
        "computer-vision-deep-learning", 
        "Artificial Intelligence",
        "Computer Vision", 
        "Advanced", 
        27999, 
        "Enable machines to understand and analyze visual data.\nBuild systems for image and video processing.", 
        "This course focuses on computer vision using deep learning. Students learn image processing and feature extraction techniques. CNN architectures for classification and detection are covered. The course includes object detection and segmentation methods. Learners work on real-world projects like face recognition. Optimization and deployment strategies are discussed. Tools and frameworks are introduced. By the end, students can build vision-based AI systems."
    ),
    generateSpecificCourse(
        "Reinforcement Learning: From Basics to Robotics", 
        "reinforcement-learning-robotics", 
        "Artificial Intelligence",
        "Reinforcement Learning", 
        "Advanced", 
        28999, 
        "Learn how AI systems learn through rewards and actions.\nApply reinforcement learning in robotics and automation.", 
        "This course introduces reinforcement learning concepts and algorithms. Students learn about agents, environments, and rewards. It covers Q-learning and policy gradient methods. Applications in robotics and gaming are explored. Learners implement RL models in projects. Advanced topics like deep RL are included. Performance optimization is discussed. By the end, students can build intelligent learning systems."
    ),
    generateSpecificCourse(
        "AI for Healthcare & Medical Imaging", 
        "ai-healthcare-medical-imaging", 
        "Artificial Intelligence",
        "AI in Healthcare", 
        "Intermediate", 
        18999, 
        "Apply AI in healthcare for diagnosis and prediction.\nExplore medical imaging and healthcare analytics.", 
        "This course explores AI applications in healthcare. Students learn medical data analysis and imaging techniques. It covers predictive models for disease detection. Ethical concerns and patient privacy are discussed. Real-world case studies are included. Tools and frameworks for healthcare AI are introduced. Practical applications in diagnostics are covered. By the end, students understand AI’s role in healthcare."
    ),
    generateSpecificCourse(
        "MLOps: Deploying AI Models", 
        "mlops-deploying-ai-models", 
        "Artificial Intelligence",
        "MLOps", 
        "Intermediate", 
        17999, 
        "Deploy, monitor, and manage machine learning models in production.\nUnderstand the full ML lifecycle.", 
        "This course focuses on operationalizing machine learning models. Students learn deployment strategies and monitoring techniques. It covers CI/CD pipelines for ML systems. Learners explore version control and automation tools. Scaling and performance optimization are discussed. Real-world deployment projects are included. Security and maintenance are covered. By the end, students can manage ML systems effectively."
    ),
    generateSpecificCourse(
        "AI in Finance: Quant & Trading", 
        "ai-finance-quant-trading", 
        "Artificial Intelligence",
        "AI in Finance", 
        "Advanced", 
        30999, 
        "Use AI for financial analysis and trading strategies.\nLearn quantitative modeling with machine learning.", 
        "This course explores AI applications in finance and trading. Students learn algorithmic trading techniques. It covers predictive modeling for market analysis. Learners work with financial datasets. Risk management and optimization are discussed. Trading simulations provide hands-on experience. Portfolio management using AI is explored. By the end, students can build AI-driven trading systems."
    ),
    generateSpecificCourse(
        "Multimodal AI Systems", 
        "multimodal-ai-systems", 
        "Artificial Intelligence",
        "Advanced AI Systems", 
        "Advanced", 
        32999, 
        "Build AI systems that combine text, image, and audio data.\nUnderstand next-gen AI architectures.", 
        "This course focuses on multimodal AI systems. Students learn how different data types are integrated. It covers architectures used in modern AI systems. Applications like virtual assistants are explored. Challenges in multimodal learning are discussed. Hands-on projects provide practical experience. Optimization and deployment are included. By the end, students can design multimodal systems."
    ),
    generateSpecificCourse(
        "Edge AI & TinyML", 
        "edge-ai-tinyml", 
        "Artificial Intelligence",
        "Edge AI", 
        "Advanced", 
        26999, 
        "Deploy AI models on edge devices and low-power systems.\nBuild real-time AI applications.", 
        "This course introduces Edge AI and TinyML concepts. Students learn how to run models on embedded systems. It covers optimization for low-power devices. Real-time AI applications are explored. Tools and hardware platforms are introduced. Deployment challenges are discussed. Practical IoT-based projects are included. By the end, students can build efficient edge AI systems."
    ),
    generateSpecificCourse(
        "AI Research & Paper Implementation", 
        "ai-research-paper-implementation", 
        "Artificial Intelligence",
        "AI Research", 
        "Advanced", 
        34999, 
        "Learn how to read and implement AI research papers.\nBridge the gap between theory and real-world AI systems.", 
        "This course teaches how to interpret and implement AI research papers. Students learn how to analyze methodologies and experiments. It covers implementing models from published work. Advanced AI concepts are explored. Learners work on research-based projects. Writing and presenting research findings are included. Real-world applications are discussed. By the end, students can contribute to AI research."
    ),

    // 2. Information Technology (19 courses)
    generateSpecificCourse(
        "CS50: Introduction to Computer Science", 
        "cs50-introduction-to-computer-science", 
        "Information Technology",
        "Computer Science Fundamentals", 
        "Beginner", 
        8999, 
        "Build a strong foundation in computer science and programming concepts.\nLearn problem-solving and computational thinking from scratch.", 
        "This course introduces the core concepts of computer science and programming. Students learn problem-solving techniques and computational thinking. It covers algorithms, data structures, and basic programming principles. Learners explore languages like C and Python for practical understanding. Memory management and system-level concepts are introduced. The course also includes debugging and optimization techniques. Real-world programming challenges help reinforce learning. By the end, students will have a solid foundation in computer science."
    ),
    generateSpecificCourse(
        "Python for Everybody", 
        "python-for-everybody", 
        "Information Technology",
        "Programming", 
        "Beginner", 
        7999, 
        "Learn Python programming from scratch in a simple and practical way.\nPerfect for beginners entering the coding world.", 
        "This course introduces Python programming with a focus on simplicity and usability. Students learn variables, loops, and functions. It covers file handling and data structures like lists and dictionaries. Learners explore working with APIs and web data. The course includes practical exercises and small projects. Error handling and debugging are explained clearly. Real-world examples help in understanding concepts. By the end, students will be able to write functional Python programs."
    ),
    generateSpecificCourse(
        "Web Developer Bootcamp", 
        "web-developer-bootcamp", 
        "Information Technology",
        "Web Development", 
        "Intermediate", 
        15999, 
        "Become a full web developer by learning front-end and back-end technologies.\nBuild complete web applications from scratch.", 
        "This course covers the complete web development stack. Students learn HTML, CSS, and JavaScript for front-end development. It includes responsive design and UI fundamentals. Backend development with Node.js and databases is introduced. Learners build real-world web applications. Authentication, APIs, and deployment are covered. Debugging and optimization techniques are included. By the end, students can build and deploy full-stack web applications."
    ),
    generateSpecificCourse(
        "CS50 Cybersecurity", 
        "cs50-cybersecurity", 
        "Information Technology",
        "Cybersecurity", 
        "Intermediate", 
        14999, 
        "Understand cybersecurity principles and protect systems from threats.\nLearn ethical hacking basics and security practices.", 
        "This course introduces cybersecurity concepts and threats. Students learn about network security, encryption, and authentication. It covers common vulnerabilities and attack methods. Learners explore ethical hacking fundamentals. Security tools and techniques are introduced. Risk assessment and mitigation strategies are discussed. Real-world case studies are included. By the end, students can understand and improve system security."
    ),
    generateSpecificCourse(
        "100 Days Python Bootcamp", 
        "100-days-python-bootcamp", 
        "Information Technology",
        "Programming", 
        "Intermediate", 
        13999, 
        "Master Python through daily coding challenges and projects.\nBuild strong programming skills with hands-on practice.", 
        "This course is designed to build Python skills through consistent practice. Students complete daily coding exercises and projects. It covers advanced Python topics and real-world applications. Learners build applications like games, automation scripts, and web tools. Debugging and optimization techniques are included. The course focuses on problem-solving skills. Hands-on learning ensures strong retention. By the end, students become confident Python developers."
    ),
    generateSpecificCourse(
        "Google IT Support Certificate", 
        "google-it-support-certificate", 
        "Information Technology",
        "IT Support", 
        "Beginner", 
        8999, 
        "Start your career in IT support with essential technical skills.\nLearn troubleshooting, networking, and system administration.", 
        "This course covers the basics of IT support and system administration. Students learn computer hardware and software fundamentals. It includes networking basics and troubleshooting techniques. Learners explore operating systems and system configuration. Customer support and communication skills are emphasized. Security fundamentals are also introduced. Practical labs provide hands-on experience. By the end, students are ready for entry-level IT roles."
    ),
    generateSpecificCourse(
        "Java Programming Fundamentals", 
        "java-programming-fundamentals", 
        "Information Technology",
        "Programming", 
        "Beginner", 
        8499, 
        "Learn Java programming and object-oriented concepts from scratch.\nBuild a strong foundation in software development.", 
        "This course introduces Java programming and core concepts. Students learn syntax, variables, and control structures. Object-oriented programming concepts are covered in depth. The course includes classes, inheritance, and polymorphism. Learners build small applications using Java. Debugging and best practices are discussed. Real-world coding examples are included. By the end, students can develop basic Java applications."
    ),
    generateSpecificCourse(
        "JavaScript Course", 
        "javascript-course", 
        "Information Technology",
        "Web Development", 
        "Beginner", 
        7999, 
        "Master JavaScript for building dynamic and interactive websites.\nLearn the core language of the web.", 
        "This course covers JavaScript fundamentals and advanced concepts. Students learn variables, functions, and event handling. It includes DOM manipulation and asynchronous programming. Learners build interactive web features. The course introduces APIs and modern JavaScript frameworks. Debugging and optimization are covered. Hands-on projects enhance learning. By the end, students can create dynamic web applications."
    ),
    generateSpecificCourse(
        "Automate the Boring Stuff", 
        "automate-the-boring-stuff", 
        "Information Technology",
        "Automation", 
        "Beginner", 
        7999, 
        "Use Python to automate repetitive tasks and save time.\nLearn practical automation for daily workflows.", 
        "This course focuses on using Python for automation. Students learn how to automate file handling, emails, and data processing. It covers web scraping and task scheduling. Learners build scripts for real-world tasks. The course includes practical exercises and projects. Debugging and error handling are discussed. Productivity-focused use cases are emphasized. By the end, students can automate everyday processes efficiently."
    ),
    generateSpecificCourse(
        "AWS Cloud Practitioner", 
        "aws-cloud-practitioner", 
        "Information Technology",
        "Cloud Computing", 
        "Beginner", 
        9999, 
        "Understand cloud computing concepts and AWS services.\nPrepare for AWS Cloud Practitioner certification.", 
        "This course introduces cloud computing fundamentals using AWS. Students learn core AWS services and architecture. It covers pricing, security, and deployment models. Learners explore real-world cloud use cases. The course includes hands-on labs and demos. Best practices for cloud management are discussed. Certification preparation is included. By the end, students understand cloud fundamentals."
    ),
    generateSpecificCourse(
        "Full Stack MERN Development", 
        "full-stack-mern-development", 
        "Information Technology",
        "Full Stack Development", 
        "Intermediate", 
        17999, 
        "Build full-stack applications using MongoDB, Express, React, and Node.js.\nMaster modern web development.", 
        "This course covers the MERN stack in detail. Students learn MongoDB for databases and Express for backend. React is used for building user interfaces. Node.js handles server-side logic. Learners build full-stack projects. Authentication and APIs are included. Deployment and scaling are discussed. By the end, students can build complete web applications."
    ),
    generateSpecificCourse(
        "DevOps Engineering (CI/CD)", 
        "devops-engineering-ci-cd", 
        "Information Technology",
        "DevOps", 
        "Advanced", 
        26999, 
        "Learn DevOps practices and CI/CD pipelines.\nAutomate software delivery and deployment.", 
        "This course focuses on DevOps tools and workflows. Students learn CI/CD pipeline design and automation. It covers version control and containerization. Learners explore cloud integration and deployment strategies. Monitoring and logging are included. Real-world DevOps projects are part of the course. Security and scalability are discussed. By the end, students can implement DevOps practices."
    ),
    generateSpecificCourse(
        "Kubernetes & Containers", 
        "kubernetes-containers", 
        "Information Technology",
        "DevOps", 
        "Advanced", 
        24999, 
        "Manage containerized applications using Kubernetes.\nLearn orchestration and scaling of systems.", 
        "This course teaches containerization and orchestration. Students learn Docker and Kubernetes basics. It covers deployment, scaling, and management of containers. Learners explore cluster architecture and networking. Monitoring and logging are included. Real-world deployment scenarios are covered. Security and optimization are discussed. By the end, students can manage containerized systems."
    ),
    generateSpecificCourse(
        "Advanced Cybersecurity & Ethical Hacking", 
        "advanced-cybersecurity-ethical-hacking", 
        "Information Technology",
        "Cybersecurity", 
        "Advanced", 
        28999, 
        "Master ethical hacking and advanced cybersecurity techniques.\nProtect systems from sophisticated attacks.", 
        "This course focuses on advanced cybersecurity and ethical hacking. Students learn penetration testing techniques. It covers network security and vulnerability analysis. Learners use professional security tools. Real-world attack simulations are included. Risk mitigation strategies are discussed. Legal and ethical considerations are covered. By the end, students can secure systems effectively."
    ),
    generateSpecificCourse(
        "Cloud Engineering (AWS + Azure)", 
        "cloud-engineering-aws-azure", 
        "Information Technology",
        "Cloud Computing", 
        "Advanced", 
        29999, 
        "Build and manage cloud infrastructure using AWS and Azure.\nLearn multi-cloud strategies.", 
        "This course covers cloud engineering using AWS and Azure. Students learn infrastructure design and deployment. It includes networking, storage, and compute services. Learners explore multi-cloud strategies. Security and cost optimization are discussed. Real-world projects are included. Monitoring and scaling techniques are covered. By the end, students can manage cloud systems."
    ),
    generateSpecificCourse(
        "Backend Development (Node.js)", 
        "backend-development-nodejs", 
        "Information Technology",
        "Backend Development", 
        "Intermediate", 
        15999, 
        "Build scalable backend systems using Node.js.\nLearn APIs, databases, and server logic.", 
        "This course focuses on backend development using Node.js. Students learn server-side programming and APIs. It covers database integration and authentication. Learners build scalable backend systems. Error handling and debugging are discussed. Security practices are included. Real-world backend projects are covered. By the end, students can build backend services."
    ),
    generateSpecificCourse(
        "System Design for Scalable Apps", 
        "system-design-scalable-apps", 
        "Information Technology",
        "System Design", 
        "Advanced", 
        27999, 
        "Design scalable and high-performance systems.\nLearn architecture for large applications.", 
        "This course focuses on system design principles. Students learn scalability, reliability, and performance optimization. It covers load balancing and distributed systems. Learners explore real-world architectures. Database design and caching are included. Case studies of large systems are discussed. Interview-focused design questions are included. By the end, students can design scalable systems."
    ),
    generateSpecificCourse(
        "Linux Administration", 
        "linux-administration", 
        "Information Technology",
        "System Administration", 
        "Intermediate", 
        13999, 
        "Learn Linux system administration and server management.\nMaster command-line tools and system operations.", 
        "This course teaches Linux fundamentals and administration. Students learn command-line operations and file systems. It covers user management and permissions. Learners explore server configuration and networking. Security and troubleshooting are discussed. Real-world system tasks are included. Automation using scripts is covered. By the end, students can manage Linux systems."
    ),
    generateSpecificCourse(
        "API Development (REST + GraphQL)", 
        "api-development-rest-graphql", 
        "Information Technology",
        "Backend Development", 
        "Intermediate", 
        16999, 
        "Build APIs using REST and GraphQL.\nLearn modern backend communication methods.", 
        "This course focuses on API development techniques. Students learn RESTful API design principles. It covers GraphQL queries and schema design. Learners build APIs using modern frameworks. Authentication and security are included. Testing and debugging APIs are covered. Real-world projects are included. By the end, students can build efficient APIs."
    ),

    // 3. Sales & Marketing (13 courses)
    generateSpecificCourse(
        "Google Digital Marketing & E-commerce", 
        "google-digital-marketing-ecommerce", 
        "Sales & Marketing",
        "Digital Marketing", 
        "Beginner", 
        8999, 
        "Learn the fundamentals of digital marketing and e-commerce.\nBuild skills to grow businesses online using modern tools.", 
        "This course introduces digital marketing and e-commerce fundamentals. Students learn SEO, social media, and paid advertising basics. It covers online store setup and customer acquisition strategies. Learners explore platforms like Google Ads and analytics tools. The course includes content marketing and email campaigns. Conversion optimization techniques are discussed. Real-world case studies provide practical insights. By the end, students can run basic digital marketing campaigns and manage online businesses."
    ),
    generateSpecificCourse(
        "Viral Marketing", 
        "viral-marketing", 
        "Sales & Marketing",
        "Growth Marketing", 
        "Intermediate", 
        13999, 
        "Learn how to create viral campaigns that reach millions.\nUnderstand audience psychology and content strategy.", 
        "This course focuses on creating high-impact viral marketing campaigns. Students learn the psychology behind shareable content. It covers storytelling, emotional triggers, and audience targeting. Learners analyze successful viral campaigns. The course includes content creation strategies for different platforms. Metrics and performance tracking are explained. Practical exercises help design viral campaigns. By the end, students can create content with high engagement potential."
    ),
    generateSpecificCourse(
        "SEO Specialization", 
        "seo-specialization", 
        "Sales & Marketing",
        "SEO", 
        "Intermediate", 
        15999, 
        "Master search engine optimization to rank websites higher.\nDrive organic traffic and improve visibility.", 
        "This course covers complete SEO strategies and techniques. Students learn keyword research and on-page optimization. It includes technical SEO and website performance improvement. Learners explore link building and off-page strategies. The course explains search engine algorithms. Analytics tools are used to track performance. Real-world SEO projects are included. By the end, students can optimize websites for search engines effectively."
    ),
    generateSpecificCourse(
        "Digital Marketing Foundations (Beginner)", 
        "digital-marketing-foundations-beginner", 
        "Sales & Marketing",
        "Digital Marketing", 
        "Beginner", 
        7999, 
        "Start your journey in digital marketing with core concepts.\nLearn essential tools and strategies.", 
        "This course introduces the basics of digital marketing. Students learn about online channels like SEO, social media, and email marketing. It covers content creation and audience targeting. Learners explore marketing funnels and customer journeys. The course includes basic analytics and performance tracking. Practical examples help understanding. Tools used in marketing are introduced. By the end, students have a strong foundation in digital marketing."
    ),
    generateSpecificCourse(
        "Digital Marketing Growth Mastery (Advanced)", 
        "digital-marketing-growth-mastery", 
        "Sales & Marketing",
        "Growth Marketing", 
        "Advanced", 
        25999, 
        "Scale businesses using advanced growth marketing strategies.\nMaster data-driven marketing techniques.", 
        "This course focuses on scaling businesses through growth marketing. Students learn advanced funnel optimization techniques. It covers customer acquisition and retention strategies. Learners explore A/B testing and performance tracking. The course includes paid marketing and automation tools. Data-driven decision-making is emphasized. Real-world case studies are analyzed. By the end, students can design scalable marketing strategies."
    ),
    generateSpecificCourse(
        "Digital Marketing Expert (Expert)", 
        "digital-marketing-expert", 
        "Sales & Marketing",
        "Digital Marketing", 
        "Advanced", 
        29999, 
        "Become a complete digital marketing expert.\nMaster all channels and advanced strategies.", 
        "This course provides complete mastery over digital marketing. Students learn advanced SEO, paid ads, and social media strategies. It covers branding, automation, and analytics. Learners explore multi-channel campaigns. The course includes advanced tools and frameworks. Real-world business scenarios are analyzed. Leadership and strategy building are emphasized. By the end, students can lead digital marketing initiatives."
    ),
    generateSpecificCourse(
        "Social Media Marketing Strategy", 
        "social-media-marketing-strategy", 
        "Sales & Marketing",
        "Social Media Marketing", 
        "Intermediate", 
        14999, 
        "Build and execute effective social media strategies.\nGrow brands across platforms like Instagram and LinkedIn.", 
        "This course focuses on social media marketing strategies. Students learn content planning and scheduling. It covers platform-specific growth strategies. Learners explore audience engagement techniques. The course includes influencer collaborations. Analytics and performance tracking are discussed. Real-world campaigns are analyzed. By the end, students can manage social media growth effectively."
    ),
    generateSpecificCourse(
        "Performance Marketing (Ads Mastery)", 
        "performance-marketing-ads-mastery", 
        "Sales & Marketing",
        "Paid Advertising", 
        "Advanced", 
        27999, 
        "Master paid ads across Google, Facebook, and other platforms.\nOptimize campaigns for maximum ROI.", 
        "This course focuses on paid advertising and performance marketing. Students learn ad creation and targeting strategies. It covers Google Ads, Facebook Ads, and retargeting. Learners explore budget optimization techniques. Conversion tracking and analytics are included. A/B testing strategies are discussed. Real-world ad campaigns are built. By the end, students can run high-performing ad campaigns."
    ),
    generateSpecificCourse(
        "Brand Building & Personal Branding", 
        "brand-building-personal-branding", 
        "Sales & Marketing",
        "Branding", 
        "Beginner", 
        8999, 
        "Build a strong personal and business brand.\nLearn positioning and identity creation.", 
        "This course focuses on brand building strategies. Students learn brand identity and positioning. It covers storytelling and brand communication. Learners explore personal branding techniques. The course includes social media branding strategies. Real-world case studies are discussed. Audience perception and trust-building are covered. By the end, students can build a strong brand presence."
    ),
    generateSpecificCourse(
        "Influencer Marketing", 
        "influencer-marketing", 
        "Sales & Marketing",
        "Influencer Marketing", 
        "Intermediate", 
        13999, 
        "Leverage influencers to grow brand reach and engagement.\nLearn campaign planning and collaboration strategies.", 
        "This course explores influencer marketing strategies. Students learn how to identify and collaborate with influencers. It covers campaign planning and execution. Learners explore content co-creation techniques. Performance measurement and ROI tracking are discussed. Legal and ethical considerations are included. Real-world examples are analyzed. By the end, students can run influencer campaigns effectively."
    ),
    generateSpecificCourse(
        "Copywriting for Conversions", 
        "copywriting-for-conversions", 
        "Sales & Marketing",
        "Copywriting", 
        "Intermediate", 
        14999, 
        "Write persuasive copy that converts leads into customers.\nMaster sales psychology and messaging.", 
        "This course focuses on persuasive writing techniques. Students learn copywriting frameworks and structures. It covers headlines, CTAs, and sales pages. Learners explore psychological triggers and storytelling. The course includes email and ad copywriting. A/B testing and optimization are discussed. Practical writing exercises are included. By the end, students can create high-converting copy."
    ),
    generateSpecificCourse(
        "Marketing Analytics", 
        "marketing-analytics", 
        "Sales & Marketing",
        "Analytics", 
        "Intermediate", 
        15999, 
        "Understand marketing data and make data-driven decisions.\nTrack and optimize campaign performance.", 
        "This course focuses on marketing analytics and data interpretation. Students learn key metrics and KPIs. It covers tools like Google Analytics. Learners explore data visualization and reporting. Campaign tracking and optimization are discussed. The course includes real-world data analysis projects. Decision-making using data is emphasized. By the end, students can analyze and improve marketing performance."
    ),
    generateSpecificCourse(
        "Email Marketing & Funnels", 
        "email-marketing-funnels", 
        "Sales & Marketing",
        "Email Marketing", 
        "Intermediate", 
        13999, 
        "Build email campaigns and marketing funnels that convert.\nAutomate customer journeys effectively.", 
        "This course focuses on email marketing strategies and funnel building. Students learn list building and segmentation. It covers email copywriting and automation tools. Learners design marketing funnels for conversions. A/B testing and optimization are discussed. The course includes real-world campaign building. Analytics and performance tracking are covered. By the end, students can build effective email marketing systems."
    ),

    // 4. Data Science (19 courses)
    generateSpecificCourse(
        "Google Data Analytics", 
        "google-data-analytics", 
        "Data Science",
        "Data Analytics", 
        "Beginner", 
        8999, 
        "Learn data analytics fundamentals using industry tools and techniques.\nStart your career in data analytics with practical skills.", 
        "This course introduces the fundamentals of data analytics. Students learn data collection, cleaning, and transformation techniques. It covers tools like spreadsheets, SQL, and visualization platforms. Learners explore data-driven decision-making. The course includes real-world case studies and projects. Key concepts like data ethics and reporting are discussed. Hands-on exercises reinforce learning. By the end, students can analyze and interpret data effectively."
    ),
    generateSpecificCourse(
        "Data Science Specialization", 
        "data-science-specialization", 
        "Data Science",
        "Data Science", 
        "Intermediate", 
        16999, 
        "Build strong data science skills including analysis, modeling, and visualization.\nWork with real-world datasets and tools.", 
        "This course covers core data science concepts and workflows. Students learn data preprocessing and exploratory data analysis. It includes statistical methods and machine learning basics. Learners work with Python and data science libraries. Data visualization techniques are covered. Real-world datasets are used for projects. Model evaluation and optimization are discussed. By the end, students can handle complete data science workflows."
    ),
    generateSpecificCourse(
        "IBM Data Science Certificate", 
        "ibm-data-science-certificate", 
        "Data Science",
        "Data Science", 
        "Beginner", 
        9999, 
        "Gain industry-recognized data science skills and certifications.\nLearn tools used by professionals.", 
        "This course introduces learners to practical data science skills. Students learn Python, SQL, and data analysis tools. It covers data visualization and machine learning basics. Learners explore real-world projects and case studies. The course includes cloud-based tools and platforms. Data cleaning and preparation are emphasized. Practical assignments ensure hands-on experience. By the end, students are ready for entry-level data science roles."
    ),
    generateSpecificCourse(
        "SQL for Data Science", 
        "sql-for-data-science", 
        "Data Science",
        "Databases", 
        "Beginner", 
        7999, 
        "Learn SQL for data querying and analysis.\nWork with databases efficiently.", 
        "This course teaches SQL for data analysis and management. Students learn database concepts and query writing. It covers joins, aggregations, and filtering techniques. Learners work with real datasets. The course includes performance optimization strategies. Practical exercises help reinforce learning. Data extraction and reporting are emphasized. By the end, students can query databases effectively."
    ),
    generateSpecificCourse(
        "Tableau Specialist", 
        "tableau-specialist", 
        "Data Science",
        "Data Visualization", 
        "Intermediate", 
        13999, 
        "Create interactive dashboards using Tableau.\nVisualize data effectively for insights.", 
        "This course focuses on data visualization using Tableau. Students learn dashboard creation and data storytelling. It covers charts, filters, and interactivity. Learners explore real-world datasets. The course includes best practices for visualization. Performance optimization techniques are discussed. Hands-on projects are included. By the end, students can build professional dashboards."
    ),
    generateSpecificCourse(
        "Power BI Analyst", 
        "power-bi-analyst", 
        "Data Science",
        "Data Visualization", 
        "Intermediate", 
        13999, 
        "Analyze and visualize data using Power BI.\nBuild dashboards and reports for business insights.", 
        "This course teaches Power BI for data analysis. Students learn data modeling and transformation. It covers dashboard creation and reporting. Learners explore DAX functions and calculations. Real-world datasets are used. The course includes visualization best practices. Performance optimization is discussed. By the end, students can create business dashboards."
    ),
    generateSpecificCourse(
        "Statistics with R", 
        "statistics-with-r", 
        "Data Science",
        "Statistics", 
        "Intermediate", 
        14999, 
        "Learn statistical analysis using R programming.\nApply statistics to real-world data problems.", 
        "This course covers statistical concepts using R. Students learn probability, distributions, and hypothesis testing. It includes regression analysis and modeling. Learners work with datasets for analysis. Visualization techniques in R are covered. Real-world case studies are included. Practical exercises reinforce learning. By the end, students can perform statistical analysis effectively."
    ),
    generateSpecificCourse(
        "Excel Skills for Business", 
        "excel-skills-for-business", 
        "Data Science",
        "Data Analysis Tools", 
        "Beginner", 
        7999, 
        "Master Excel for business and data analysis tasks.\nLearn formulas, functions, and data handling.", 
        "This course teaches Excel for business analytics. Students learn formulas, functions, and data manipulation. It covers charts and dashboards. Learners explore pivot tables and data analysis tools. Real-world business scenarios are included. Automation using Excel is discussed. Practical exercises enhance skills. By the end, students can use Excel effectively for analysis."
    ),
    generateSpecificCourse(
        "Business Analytics", 
        "business-analytics", 
        "Data Science",
        "Business Analytics", 
        "Intermediate", 
        15999, 
        "Use data to drive business decisions and strategy.\nLearn analytics tools and techniques.", 
        "This course focuses on business analytics concepts. Students learn data analysis for decision-making. It covers forecasting and trend analysis. Learners explore visualization tools and dashboards. Case studies demonstrate real-world applications. Statistical methods are included. Practical projects are part of the course. By the end, students can apply analytics in business."
    ),
    generateSpecificCourse(
        "Advanced Machine Learning", 
        "advanced-machine-learning", 
        "Data Science",
        "Machine Learning", 
        "Advanced", 
        27999, 
        "Master advanced machine learning algorithms and techniques.\nBuild high-performance predictive models.", 
        "This course covers advanced machine learning topics. Students learn ensemble methods and boosting techniques. It includes deep learning basics and optimization. Learners explore large-scale data processing. Model tuning and evaluation are discussed. Real-world projects are included. Performance optimization is emphasized. By the end, students can build advanced ML models."
    ),
    generateSpecificCourse(
        "Data Engineering (Python + Spark)", 
        "data-engineering-python-spark", 
        "Data Science",
        "Data Engineering", 
        "Advanced", 
        28999, 
        "Build scalable data pipelines using Python and Spark.\nLearn big data processing techniques.", 
        "This course focuses on data engineering concepts. Students learn data pipelines and ETL processes. It covers Spark for big data processing. Learners work with distributed systems. Data storage and management are discussed. Real-world projects are included. Performance and scalability are emphasized. By the end, students can build data pipelines."
    ),
    generateSpecificCourse(
        "Big Data Analytics", 
        "big-data-analytics", 
        "Data Science",
        "Big Data", 
        "Advanced", 
        27999, 
        "Analyze large-scale datasets using modern tools.\nLearn big data technologies and frameworks.", 
        "This course covers big data analytics techniques. Students learn distributed computing concepts. It includes Hadoop and Spark frameworks. Learners analyze large datasets. Data storage and processing are covered. Real-world use cases are discussed. Performance optimization is included. By the end, students can handle big data systems."
    ),
    generateSpecificCourse(
        "Time Series Forecasting", 
        "time-series-forecasting", 
        "Data Science",
        "Forecasting", 
        "Advanced", 
        26999, 
        "Predict future trends using time series data.\nLearn forecasting models and techniques.", 
        "This course focuses on time series analysis. Students learn trend, seasonality, and patterns. It covers ARIMA and forecasting models. Learners work with real datasets. Evaluation techniques are discussed. Practical projects are included. Optimization methods are covered. By the end, students can build forecasting models."
    ),
    generateSpecificCourse(
        "Data Science for Finance", 
        "data-science-for-finance", 
        "Data Science",
        "Finance Analytics", 
        "Advanced", 
        29999, 
        "Apply data science techniques in financial analysis.\nBuild predictive models for finance.", 
        "This course explores financial data analysis using data science. Students learn predictive modeling for markets. It covers risk analysis and portfolio management. Learners analyze financial datasets. Real-world case studies are included. Tools and techniques are discussed. Optimization strategies are covered. By the end, students can apply data science in finance."
    ),
    generateSpecificCourse(
        "A/B Testing", 
        "ab-testing", 
        "Data Science",
        "Experimentation", 
        "Intermediate", 
        14999, 
        "Learn how to run experiments and optimize decisions using A/B testing.\nMake data-driven improvements.", 
        "This course focuses on experimentation techniques. Students learn hypothesis testing and statistical significance. It covers experiment design and execution. Learners analyze results and make decisions. Real-world case studies are included. Tools for A/B testing are introduced. Optimization strategies are discussed. By the end, students can run experiments effectively."
    ),
    generateSpecificCourse(
        "Deep Learning for Data Science", 
        "deep-learning-for-data-science", 
        "Data Science",
        "Deep Learning", 
        "Advanced", 
        27999, 
        "Apply deep learning techniques to data science problems.\nBuild neural network models.", 
        "This course focuses on deep learning in data science. Students learn neural networks and architectures. It covers CNNs and RNNs. Learners work on real datasets. Optimization and tuning are discussed. Practical projects are included. Tools and frameworks are covered. By the end, students can build deep learning models."
    ),
    generateSpecificCourse(
        "Advanced Data Visualization", 
        "advanced-data-visualization", 
        "Data Science",
        "Data Visualization", 
        "Advanced", 
        25999, 
        "Create advanced visualizations for complex datasets.\nTell compelling stories using data.", 
        "This course focuses on advanced visualization techniques. Students learn storytelling with data. It covers tools and frameworks. Learners explore complex datasets. Design principles are emphasized. Real-world projects are included. Optimization and performance are discussed. By the end, students can create impactful visualizations."
    ),
    generateSpecificCourse(
        "Data Science Portfolio Projects", 
        "data-science-portfolio-projects", 
        "Data Science",
        "Projects", 
        "Intermediate", 
        17999, 
        "Build real-world projects to showcase your data science skills.\nStrengthen your portfolio.", 
        "This course focuses on building portfolio projects. Students work on real-world datasets. It covers end-to-end project development. Learners apply data science techniques. Documentation and presentation are included. Feedback and improvements are emphasized. Multiple projects are built. By the end, students have a strong portfolio."
    ),
    generateSpecificCourse(
        "Data Science Interview Prep", 
        "data-science-interview-prep", 
        "Data Science",
        "Career Prep", 
        "Intermediate", 
        15999, 
        "Prepare for data science interviews with confidence.\nMaster technical and behavioral questions.", 
        "This course prepares students for data science interviews. It covers technical concepts and problem-solving. Learners practice coding and case studies. Mock interviews are included. Resume building and portfolio review are covered. Behavioral questions are discussed. Real-world interview scenarios are practiced. By the end, students are job-ready."
    ),

    // 5. Design (14 courses)
    generateSpecificCourse(
        "The Arts of Visualizing Data", 
        "the-arts-of-visualizing-data", 
        "Design",
        "Data Visualization Design", 
        "Intermediate", 
        14999, 
        "Learn how to visually communicate data effectively.\nTransform complex data into clear and engaging visuals.", 
        "This course focuses on the principles of data visualization design. Students learn how to convert raw data into meaningful visuals. It covers charts, graphs, and storytelling techniques. Learners explore design principles like clarity, balance, and hierarchy. The course includes tools for creating visual dashboards. Real-world datasets are used for practice. Design mistakes and best practices are discussed. By the end, students can create impactful data visualizations."
    ),
    generateSpecificCourse(
        "UI/UX Design (Figma)", 
        "ui-ux-design-figma", 
        "Design",
        "UI/UX Design", 
        "Beginner", 
        8999, 
        "Learn UI/UX design using Figma from scratch.\nCreate modern and user-friendly interfaces.", 
        "This course introduces UI/UX design fundamentals using Figma. Students learn layout design, spacing, and alignment. It covers wireframing and prototyping techniques. Learners explore user flows and interaction design. The course includes hands-on projects. Design systems and components are introduced. Usability principles are discussed. By the end, students can design complete UI interfaces."
    ),
    generateSpecificCourse(
        "UX Research & Psychology", 
        "ux-research-psychology", 
        "Design",
        "UX Research", 
        "Intermediate", 
        15999, 
        "Understand user behavior and psychology in design.\nConduct effective UX research.", 
        "This course focuses on user research and behavioral psychology. Students learn research methods like interviews and surveys. It covers usability testing and persona creation. Learners explore cognitive psychology principles. The course includes data-driven design decisions. Real-world case studies are discussed. Tools for UX research are introduced. By the end, students can conduct effective UX research."
    ),
    generateSpecificCourse(
        "Graphic Design & Branding", 
        "graphic-design-branding", 
        "Design",
        "Graphic Design", 
        "Beginner", 
        8999, 
        "Learn graphic design principles and branding basics.\nCreate visually appealing brand assets.", 
        "This course introduces graphic design fundamentals. Students learn color theory, typography, and layout design. It covers branding concepts and visual identity creation. Learners create logos and marketing materials. The course includes design tools and techniques. Real-world projects are included. Design principles and consistency are emphasized. By the end, students can create professional designs."
    ),
    generateSpecificCourse(
        "Web Design UI Trends", 
        "web-design-ui-trends", 
        "Design",
        "Web Design", 
        "Intermediate", 
        13999, 
        "Stay updated with modern UI trends in web design.\nCreate visually appealing and modern websites.", 
        "This course explores modern web design trends and practices. Students learn layout structures and responsive design. It covers UI trends like minimalism and micro-interactions. Learners explore typography and color usage. The course includes real-world design projects. Tools and frameworks are introduced. Performance and usability are discussed. By the end, students can design modern websites."
    ),
    generateSpecificCourse(
        "Mobile App Design", 
        "mobile-app-design", 
        "Design",
        "UI/UX Design", 
        "Intermediate", 
        14999, 
        "Design intuitive and engaging mobile applications.\nLearn mobile-first design principles.", 
        "This course focuses on mobile app design principles. Students learn layout design for mobile screens. It covers navigation and interaction patterns. Learners explore platform-specific guidelines. The course includes prototyping and testing. Real-world app design projects are included. Usability and accessibility are discussed. By the end, students can design mobile applications."
    ),
    generateSpecificCourse(
        "Motion Graphics", 
        "motion-graphics", 
        "Design",
        "Motion Design", 
        "Intermediate", 
        15999, 
        "Create engaging animations and motion graphics.\nBring designs to life with animation.", 
        "This course introduces motion graphics and animation principles. Students learn keyframe animation and transitions. It covers tools for motion design. Learners create animated visuals and videos. The course includes storytelling through motion. Real-world projects are included. Timing and easing techniques are discussed. By the end, students can create professional animations."
    ),
    generateSpecificCourse(
        "Design Systems", 
        "design-systems", 
        "Design",
        "UI Systems", 
        "Advanced", 
        24999, 
        "Build scalable design systems for products.\nEnsure consistency across UI designs.", 
        "This course focuses on creating design systems. Students learn component-based design. It covers style guides and UI libraries. Learners explore scalability and consistency. The course includes real-world system design projects. Collaboration between teams is discussed. Tools for managing design systems are introduced. By the end, students can build scalable design systems."
    ),
    generateSpecificCourse(
        "Canva Design Mastery", 
        "canva-design-mastery", 
        "Design",
        "Design Tools", 
        "Beginner", 
        7999, 
        "Master Canva for quick and professional design creation.\nCreate social media and marketing visuals.", 
        "This course teaches design using Canva. Students learn templates and customization. It covers social media graphics and presentations. Learners explore branding tools in Canva. The course includes real-world projects. Design consistency is emphasized. Practical exercises improve skills. By the end, students can create professional visuals quickly."
    ),
    generateSpecificCourse(
        "3D Design Basics", 
        "3d-design-basics", 
        "Design",
        "3D Design", 
        "Beginner", 
        8999, 
        "Learn the fundamentals of 3D design and modeling.\nCreate simple 3D assets and visuals.", 
        "This course introduces 3D design fundamentals. Students learn modeling, texturing, and lighting. It covers tools used in 3D design. Learners create basic 3D objects. The course includes rendering techniques. Real-world examples are included. Design principles are discussed. By the end, students can create basic 3D designs."
    ),
    generateSpecificCourse(
        "Portfolio for Designers", 
        "portfolio-for-designers", 
        "Design",
        "Career Development", 
        "Beginner", 
        8999, 
        "Build a professional design portfolio.\nShowcase your work effectively to clients and employers.", 
        "This course helps designers build strong portfolios. Students learn how to present projects effectively. It covers storytelling and case studies. Learners explore portfolio platforms. The course includes personal branding. Feedback and improvement are emphasized. Real-world examples are analyzed. By the end, students have a professional portfolio."
    ),
    generateSpecificCourse(
        "Advanced UI Prototyping", 
        "advanced-ui-prototyping", 
        "Design",
        "UI/UX Design", 
        "Advanced", 
        25999, 
        "Create advanced interactive prototypes for applications.\nImprove user experience through testing and iteration.", 
        "This course focuses on advanced prototyping techniques. Students learn interactive design and animations. It covers usability testing and feedback. Learners build high-fidelity prototypes. The course includes real-world projects. Tools and frameworks are introduced. Iteration and improvement are emphasized. By the end, students can create advanced prototypes."
    ),
    generateSpecificCourse(
        "Typography & Visual Hierarchy", 
        "typography-visual-hierarchy", 
        "Design",
        "Typography", 
        "Intermediate", 
        13999, 
        "Master typography and layout for better design communication.\nImprove readability and visual impact.", 
        "This course focuses on typography and hierarchy principles. Students learn font selection and pairing. It covers spacing, alignment, and layout. Learners explore readability and accessibility. The course includes real-world design examples. Practical exercises are included. Visual communication techniques are discussed. By the end, students can design visually balanced layouts."
    ),
    generateSpecificCourse(
        "Branding Strategy Masterclass", 
        "branding-strategy-masterclass", 
        "Design",
        "Branding", 
        "Advanced", 
        27999, 
        "Learn advanced branding strategies for businesses.\nBuild strong and consistent brand identities.", 
        "This course focuses on advanced branding strategies. Students learn brand positioning and identity creation. It covers storytelling and communication. Learners explore market research and audience targeting. The course includes case studies of successful brands. Practical branding projects are included. Strategy development is emphasized. By the end, students can build strong brand identities."
    ),

    // 6. Languages & Communication (23 courses)
    generateSpecificCourse(
        "Spoken English Mastery", 
        "spoken-english-mastery", 
        "Languages & Communication",
        "English Communication", 
        "Beginner", 
        7999, 
        "Improve your spoken English for daily conversations and confidence.\nBuild fluency with practical speaking exercises.", 
        "This course focuses on improving spoken English skills for real-life situations. Students learn pronunciation, vocabulary, and sentence formation. It covers daily conversation practice and listening skills. Learners engage in speaking exercises and role-plays. Grammar basics are reinforced through usage. Confidence-building techniques are included. Real-world scenarios help practical learning. By the end, students can communicate clearly and confidently in English."
    ),
    generateSpecificCourse(
        "Business English", 
        "business-english", 
        "Languages & Communication",
        "Professional Communication", 
        "Intermediate", 
        13999, 
        "Develop English communication skills for professional environments.\nImprove emails, meetings, and presentations.", 
        "This course focuses on English used in business settings. Students learn formal communication styles and vocabulary. It covers writing professional emails and reports. Learners practice presentations and meeting communication. The course includes negotiation and workplace conversations. Grammar and tone refinement are emphasized. Real-world business scenarios are included. By the end, students can communicate effectively in professional environments."
    ),
    generateSpecificCourse(
        "French A1–B1", 
        "french-a1-b1", 
        "Languages & Communication",
        "Foreign Languages", 
        "Beginner", 
        9999, 
        "Learn French from beginner to intermediate level.\nBuild speaking, reading, and writing skills.", 
        "This course covers French language learning from A1 to B1 levels. Students learn basic grammar, vocabulary, and pronunciation. It includes speaking, listening, reading, and writing practice. Learners explore real-life conversations and cultural context. The course includes exercises and assessments. Progression is structured from beginner to intermediate. Practical usage is emphasized. By the end, students can communicate in French confidently."
    ),
    generateSpecificCourse(
        "Spanish Course", 
        "spanish-course", 
        "Languages & Communication",
        "Foreign Languages", 
        "Beginner", 
        8999, 
        "Learn Spanish basics for communication and travel.\nBuild conversational fluency step by step.", 
        "This course introduces Spanish language fundamentals. Students learn pronunciation, vocabulary, and grammar. It covers everyday conversations and listening skills. Learners practice speaking and writing. Cultural aspects are also included. Exercises reinforce learning. Real-world scenarios are used. By the end, students can communicate in basic Spanish."
    ),
    generateSpecificCourse(
        "German Certification Prep", 
        "german-certification-prep", 
        "Languages & Communication",
        "Foreign Languages", 
        "Intermediate", 
        14999, 
        "Prepare for German language certification exams.\nImprove grammar, vocabulary, and test performance.", 
        "This course prepares students for German language certification exams. It covers grammar, vocabulary, and comprehension. Students practice listening, reading, writing, and speaking. Mock tests and exam strategies are included. Learners improve fluency and accuracy. Real exam patterns are followed. Feedback and improvement techniques are provided. By the end, students are ready for certification exams."
    ),
    generateSpecificCourse(
        "IELTS Preparation", 
        "ielts-preparation", 
        "Languages & Communication",
        "Test Preparation", 
        "Intermediate", 
        15999, 
        "Prepare for IELTS with focused training and practice tests.\nImprove all four language skills.", 
        "This course prepares students for the IELTS exam. It covers listening, reading, writing, and speaking sections. Students learn test strategies and time management. Practice tests simulate real exam conditions. Learners receive feedback and improvement tips. Vocabulary and grammar are strengthened. Scoring criteria are explained. By the end, students are ready to achieve high IELTS scores."
    ),
    generateSpecificCourse(
        "Public Speaking", 
        "public-speaking", 
        "Languages & Communication",
        "Communication Skills", 
        "Beginner", 
        8999, 
        "Build confidence and improve public speaking skills.\nDeliver impactful speeches and presentations.", 
        "This course focuses on public speaking and presentation skills. Students learn speech structure and delivery techniques. It covers body language and voice modulation. Learners practice speaking in front of audiences. Confidence-building exercises are included. Feedback helps improvement. Real-world speaking scenarios are covered. By the end, students can deliver effective speeches."
    ),
    generateSpecificCourse(
        "Professional Writing Skills", 
        "professional-writing-skills", 
        "Languages & Communication",
        "Writing Skills", 
        "Intermediate", 
        13999, 
        "Improve professional writing for emails, reports, and content.\nEnhance clarity and communication.", 
        "This course focuses on professional writing techniques. Students learn structure, tone, and clarity. It covers business writing and formal communication. Learners practice writing emails, reports, and documents. Grammar and editing skills are included. Real-world writing tasks are provided. Feedback improves writing quality. By the end, students can write professionally."
    ),
    generateSpecificCourse(
        "Cross-Cultural Communication", 
        "cross-cultural-communication", 
        "Languages & Communication",
        "Communication Skills", 
        "Intermediate", 
        14999, 
        "Learn to communicate effectively across cultures.\nUnderstand global communication dynamics.", 
        "This course explores communication across different cultures. Students learn cultural awareness and sensitivity. It covers communication styles and barriers. Learners explore global workplace interactions. Case studies provide real-world insights. Strategies for effective communication are included. Practical exercises reinforce learning. By the end, students can communicate globally."
    ),
    generateSpecificCourse(
        "Advanced English Fluency", 
        "advanced-english-fluency", 
        "Languages & Communication",
        "English Communication", 
        "Advanced", 
        19999, 
        "Achieve advanced fluency in English communication.\nSpeak confidently and naturally.", 
        "This course focuses on advanced English communication skills. Students learn complex sentence structures and vocabulary. It covers advanced speaking and listening techniques. Learners practice discussions and debates. Accent and pronunciation are refined. Real-world communication scenarios are included. Feedback helps improvement. By the end, students achieve fluent English communication."
    ),
    generateSpecificCourse(
        "Accent Training & Voice Modulation", 
        "accent-training-voice-modulation", 
        "Languages & Communication",
        "Speech Training", 
        "Intermediate", 
        14999, 
        "Improve pronunciation and voice clarity.\nDevelop effective speaking tone and modulation.", 
        "This course focuses on accent training and voice control. Students learn pronunciation techniques and clarity. It covers voice modulation and tone. Learners practice speaking exercises. Listening skills are improved. Real-world speaking scenarios are included. Feedback helps refinement. By the end, students speak clearly and confidently."
    ),
    generateSpecificCourse(
        "Corporate Communication Skills", 
        "corporate-communication-skills", 
        "Languages & Communication",
        "Professional Communication", 
        "Intermediate", 
        14999, 
        "Develop communication skills for corporate environments.\nImprove workplace interaction and professionalism.", 
        "This course focuses on communication in corporate settings. Students learn formal communication styles. It covers meetings, presentations, and teamwork. Learners practice professional interactions. Conflict resolution techniques are included. Real-world scenarios are discussed. Feedback improves performance. By the end, students communicate effectively in corporate environments."
    ),
    generateSpecificCourse(
        "Storytelling & Presentation Skills", 
        "storytelling-presentation-skills", 
        "Languages & Communication",
        "Communication Skills", 
        "Intermediate", 
        14999, 
        "Master storytelling for impactful presentations.\nEngage and influence audiences effectively.", 
        "This course focuses on storytelling and presentation techniques. Students learn how to structure compelling stories. It covers audience engagement and delivery. Learners practice presentations and speaking. Visual storytelling techniques are included. Real-world case studies are discussed. Feedback helps improve performance. By the end, students can deliver powerful presentations."
    ),
    generateSpecificCourse(
        "Hindi Communication Mastery",
        "hindi-communication-mastery",
        "Languages & Communication",
        "Hindi Language",
        "Beginner",
        18999,
        "Learn spoken and written Hindi confidently through interactive and practical sessions.",
        "Hindi Communication Mastery is designed for learners who want to improve their fluency, pronunciation, and confidence in Hindi communication. The course focuses on practical conversations, vocabulary building, grammar understanding, and real-world communication skills. Students participate in interactive speaking sessions, reading exercises, and guided practice activities that help them become comfortable using Hindi in daily life, academics, and professional environments."
    ),
    generateSpecificCourse(
        "Advanced German Fluency Program",
        "advanced-german-fluency-program",
        "Languages & Communication",
        "German Language",
        "Advanced",
        47999,
        "Master advanced German communication and professional-level fluency with expert guidance.",
        "Advanced German Fluency Program is created for learners aiming to achieve professional and academic fluency in German. The course covers advanced grammar, professional communication, fluent speaking practice, and comprehension development through interactive live sessions. Students gain confidence in formal conversations, workplace communication, and advanced language usage while preparing for international opportunities and certifications."
    ),
    generateSpecificCourse(
        "Japanese Language Essentials",
        "japanese-language-essentials",
        "Languages & Communication",
        "Japanese Language",
        "Beginner",
        19499,
        "Start learning Japanese with easy conversational lessons and cultural understanding.",
        "Japanese Language Essentials introduces learners to the basics of Japanese communication through practical conversation training, pronunciation practice, and interactive activities. The course helps students understand sentence structures, commonly used phrases, and cultural communication styles. It is ideal for beginners interested in travel, anime culture, international careers, or language learning as a hobby."
    ),
    generateSpecificCourse(
        "Korean Speaking and Writing Course",
        "korean-speaking-writing-course",
        "Languages & Communication",
        "Korean Language",
        "Intermediate",
        32999,
        "Improve Korean speaking, reading, and writing skills with interactive live learning.",
        "Korean Speaking and Writing Course is designed for learners who want to strengthen their Korean communication skills beyond the basics. The course includes pronunciation improvement, conversational practice, writing exercises, and cultural communication training. Students gain confidence in understanding and using Korean naturally in daily conversations and professional settings."
    ),
    generateSpecificCourse(
        "Mandarin Chinese Professional Course",
        "mandarin-chinese-professional-course",
        "Languages & Communication",
        "Chinese Language",
        "Advanced",
        49999,
        "Build advanced Mandarin communication skills for international and professional opportunities.",
        "Mandarin Chinese Professional Course focuses on helping learners achieve strong communication skills in Mandarin through immersive and interactive learning methods. The course includes advanced vocabulary, pronunciation training, listening comprehension, and professional communication practice. Students also gain exposure to cultural etiquette and real-world language applications useful for business and global networking."
    ),
    generateSpecificCourse(
        "Italian Conversation Masterclass",
        "italian-conversation-masterclass",
        "Languages & Communication",
        "Italian Language",
        "Intermediate",
        29999,
        "Learn conversational Italian confidently through practical speaking-focused sessions.",
        "Italian Conversation Masterclass helps learners develop fluent communication skills through interactive speaking practice and real-life conversational exercises. The course emphasizes pronunciation, listening comprehension, and natural communication techniques. Students gain confidence in expressing themselves comfortably while understanding Italian culture and communication styles."
    ),
    generateSpecificCourse(
        "Arabic Language and Communication Program",
        "arabic-language-communication-program",
        "Languages & Communication",
        "Arabic Language",
        "Intermediate",
        34999,
        "Develop practical Arabic communication skills for travel, business, and everyday conversations.",
        "Arabic Language and Communication Program is designed to help learners improve speaking, reading, and listening skills through structured and interactive sessions. The course focuses on practical communication, pronunciation accuracy, and vocabulary development. Learners also gain exposure to cultural communication practices and professional language applications."
    ),
    generateSpecificCourse(
        "Russian Language Certification Course",
        "russian-language-certification-course",
        "Languages & Communication",
        "Russian Language",
        "Advanced",
        45999,
        "Prepare for advanced Russian fluency and certification through expert-led training.",
        "Russian Language Certification Course focuses on advanced communication skills, professional vocabulary, and certification-oriented preparation. The course helps students improve pronunciation, listening ability, and real-world communication confidence through practical assignments and interactive speaking sessions. It is ideal for learners preparing for academic, professional, or international opportunities."
    ),
    generateSpecificCourse(
        "Portuguese Fluency Program",
        "portuguese-fluency-program",
        "Languages & Communication",
        "Portuguese Language",
        "Beginner",
        17999,
        "Learn practical Portuguese communication skills through engaging and beginner-friendly lessons.",
        "Portuguese Fluency Program introduces learners to the foundations of Portuguese communication through speaking practice, listening exercises, and vocabulary-building activities. The course focuses on helping students become comfortable with real-life conversations while improving pronunciation and communication confidence in an engaging learning environment."
    ),
    generateSpecificCourse(
        "Public Speaking and Communication Excellence",
        "public-speaking-communication-excellence",
        "Languages & Communication",
        "Communication Skills",
        "Advanced",
        42999,
        "Build strong public speaking, presentation, and communication confidence for professional success.",
        "Public Speaking and Communication Excellence is designed for learners who want to improve confidence, stage presence, and professional communication abilities. The course focuses on speech delivery, audience engagement, personality development, and presentation techniques through live interactive practice sessions. Students gain practical communication skills that are valuable for careers, leadership, and personal growth."
    ),

    // 7. Business & Management (16 courses)
    generateSpecificCourse(
        "Business Strategy", 
        "business-strategy", 
        "Business & Management",
        "Strategy", 
        "Intermediate", 
        15999, 
        "Learn how to create and execute winning business strategies.\nUnderstand competitive advantage and market positioning.", 
        "This course focuses on strategic thinking and planning in business. Students learn how to analyze markets and competitors. It covers frameworks like SWOT and Porter’s Five Forces. Learners explore business models and growth strategies. The course includes case studies of successful companies. Decision-making and risk analysis are discussed. Practical strategy-building exercises are included. By the end, students can design effective business strategies."
    ),
    generateSpecificCourse(
        "Digital Product Management", 
        "digital-product-management", 
        "Business & Management",
        "Product Management", 
        "Intermediate", 
        16999, 
        "Learn how to manage digital products from idea to launch.\nBridge business, design, and technology.", 
        "This course focuses on managing digital products effectively. Students learn product lifecycle and roadmap planning. It covers user research and requirement gathering. Learners explore collaboration with tech and design teams. The course includes agile methodologies and sprint planning. Metrics and KPIs are discussed. Real-world product case studies are included. By the end, students can manage digital product development."
    ),
    generateSpecificCourse(
        "Successful Negotiation", 
        "successful-negotiation", 
        "Business & Management",
        "Negotiation Skills", 
        "Beginner", 
        8999, 
        "Master negotiation techniques for business and daily life.\nAchieve win-win outcomes confidently.", 
        "This course teaches negotiation strategies and techniques. Students learn preparation and planning methods. It covers communication and persuasion skills. Learners explore conflict resolution strategies. Real-world negotiation scenarios are included. Psychological aspects of negotiation are discussed. Practical exercises improve skills. By the end, students can negotiate effectively."
    ),
    generateSpecificCourse(
        "Supply Chain Management", 
        "supply-chain-management", 
        "Business & Management",
        "Operations", 
        "Intermediate", 
        15999, 
        "Understand supply chain operations and logistics.\nOptimize efficiency and reduce costs.", 
        "This course focuses on supply chain processes and management. Students learn procurement, logistics, and inventory management. It covers demand forecasting and planning. Learners explore global supply chains. Risk management strategies are discussed. Real-world case studies are included. Tools and technologies are introduced. By the end, students can manage supply chains effectively."
    ),
    generateSpecificCourse(
        "Leading Teams", 
        "leading-teams", 
        "Business & Management",
        "Leadership", 
        "Intermediate", 
        14999, 
        "Develop leadership skills to manage and inspire teams.\nBuild high-performing teams effectively.", 
        "This course focuses on leadership and team management. Students learn communication and motivation techniques. It covers conflict resolution and decision-making. Learners explore team dynamics and collaboration. The course includes leadership frameworks. Real-world leadership challenges are discussed. Practical exercises are included. By the end, students can lead teams successfully."
    ),
    generateSpecificCourse(
        "Financial Markets", 
        "financial-markets", 
        "Business & Management",
        "Finance", 
        "Intermediate", 
        15999, 
        "Understand how financial markets operate.\nLearn about stocks, bonds, and investment strategies.", 
        "This course introduces financial markets and instruments. Students learn about stocks, bonds, and derivatives. It covers market structure and trading mechanisms. Learners explore risk and return concepts. Investment strategies are discussed. Real-world market examples are included. Financial analysis basics are covered. By the end, students understand market dynamics."
    ),
    generateSpecificCourse(
        "MBA Essentials", 
        "mba-essentials", 
        "Business & Management",
        "Business Fundamentals", 
        "Beginner", 
        9999, 
        "Learn key concepts from an MBA program.\nUnderstand business fundamentals across domains.", 
        "This course covers core MBA topics. Students learn marketing, finance, and operations basics. It includes strategy and leadership concepts. Learners explore business case studies. The course provides a holistic understanding of business. Practical examples are included. Decision-making frameworks are discussed. By the end, students gain a strong business foundation."
    ),
    generateSpecificCourse(
        "Startup Finance", 
        "startup-finance", 
        "Business & Management",
        "Entrepreneurship Finance", 
        "Intermediate", 
        16999, 
        "Manage finances for startups and new ventures.\nUnderstand funding, valuation, and cash flow.", 
        "This course focuses on financial management for startups. Students learn budgeting and financial planning. It covers fundraising and investor relations. Learners explore valuation techniques. Cash flow management is emphasized. Real-world startup case studies are included. Risk and financial strategy are discussed. By the end, students can manage startup finances."
    ),
    generateSpecificCourse(
        "Corporate Finance", 
        "corporate-finance", 
        "Business & Management",
        "Finance", 
        "Advanced", 
        27999, 
        "Learn financial decision-making in corporations.\nUnderstand investments, capital structure, and valuation.", 
        "This course focuses on corporate financial management. Students learn capital budgeting and investment decisions. It covers risk analysis and valuation methods. Learners explore financial planning and strategy. Real-world corporate cases are included. Advanced financial concepts are discussed. Tools and techniques are covered. By the end, students can make financial decisions."
    ),
    generateSpecificCourse(
        "Business Leadership", 
        "business-leadership", 
        "Business & Management",
        "Leadership", 
        "Advanced", 
        25999, 
        "Develop advanced leadership skills for business success.\nLead organizations with vision and strategy.", 
        "This course focuses on leadership in business contexts. Students learn strategic leadership and decision-making. It covers organizational behavior and culture. Learners explore leadership styles and impact. Real-world leadership case studies are included. Change management is discussed. Practical exercises build leadership skills. By the end, students can lead organizations effectively."
    ),
    generateSpecificCourse(
        "Operations Management", 
        "operations-management", 
        "Business & Management",
        "Operations", 
        "Intermediate", 
        15999, 
        "Optimize business operations and processes.\nImprove efficiency and productivity.", 
        "This course focuses on operations management principles. Students learn process design and optimization. It covers quality management and supply chain basics. Learners explore production planning. Real-world case studies are included. Tools for efficiency improvement are discussed. Performance measurement is covered. By the end, students can manage operations effectively."
    ),
    generateSpecificCourse(
        "Strategic Management", 
        "strategic-management", 
        "Business & Management",
        "Strategy", 
        "Advanced", 
        26999, 
        "Learn advanced strategic planning and execution.\nDrive long-term business success.", 
        "This course focuses on strategic management concepts. Students learn competitive analysis and planning. It covers implementation and execution strategies. Learners explore business growth models. Case studies of global companies are included. Risk management is discussed. Tools and frameworks are introduced. By the end, students can execute strategies effectively."
    ),
    generateSpecificCourse(
        "International Business", 
        "international-business", 
        "Business & Management",
        "Global Business", 
        "Intermediate", 
        16999, 
        "Understand global business operations and markets.\nLearn international trade and strategy.", 
        "This course focuses on global business practices. Students learn international trade concepts. It covers market entry strategies. Learners explore cultural and legal differences. Global supply chains are discussed. Case studies provide insights. Risk management in global markets is covered. By the end, students understand international business."
    ),
    generateSpecificCourse(
        "Business Law", 
        "business-law", 
        "Business & Management",
        "Legal Studies", 
        "Beginner", 
        9999, 
        "Learn legal principles related to business.\nUnderstand contracts, regulations, and compliance.", 
        "This course introduces business law concepts. Students learn contracts and legal agreements. It covers corporate laws and regulations. Learners explore compliance and risk management. Real-world legal cases are included. Ethical considerations are discussed. Practical examples help understanding. By the end, students understand business legal frameworks."
    ),
    generateSpecificCourse(
        "Financial Modeling", 
        "financial-modeling", 
        "Business & Management",
        "Finance", 
        "Advanced", 
        29999, 
        "Build financial models for business decision-making.\nAnalyze investments and forecasts.", 
        "This course focuses on financial modeling techniques. Students learn Excel-based modeling. It covers forecasting and valuation models. Learners analyze financial statements. Real-world projects are included. Investment analysis is discussed. Tools and techniques are covered. By the end, students can build financial models."
    ),
    generateSpecificCourse(
        "Executive Communication", 
        "executive-communication", 
        "Business & Management",
        "Communication", 
        "Intermediate", 
        14999, 
        "Improve communication skills for leadership roles.\nDeliver clear and impactful messages.", 
        "This course focuses on executive-level communication. Students learn presentation and storytelling techniques. It covers communication strategies for leaders. Learners practice public speaking and messaging. Real-world scenarios are included. Feedback improves skills. Professional communication is emphasized. By the end, students can communicate effectively as leaders."
    ),

    // 8. Entrepreneurship (14 courses)
    generateSpecificCourse(
        "Entrepreneurship Specialization", 
        "entrepreneurship-specialization", 
        "Entrepreneurship",
        "Entrepreneurship Fundamentals", 
        "Beginner", 
        9999, 
        "Learn the fundamentals of entrepreneurship and business creation.\nBuild a strong foundation for launching startups.", 
        "This course introduces the core principles of entrepreneurship. Students learn idea validation and market research techniques. It covers business models and value proposition design. Learners explore customer discovery and product-market fit. The course includes case studies of successful startups. Financial basics and planning are discussed. Risk management and execution strategies are covered. By the end, students understand how to start and manage a business."
    ),
    generateSpecificCourse(
        "Startup Launchpad", 
        "startup-launchpad", 
        "Entrepreneurship",
        "Startup Development", 
        "Beginner", 
        8999, 
        "Turn your startup idea into a real business.\nLearn step-by-step startup creation.", 
        "This course guides learners through launching a startup. Students learn idea validation and market analysis. It covers MVP development and early-stage planning. Learners explore branding and positioning. The course includes customer acquisition basics. Legal and operational setup are discussed. Real-world startup examples are included. By the end, students can launch a startup."
    ),
    generateSpecificCourse(
        "Build Startup from Scratch", 
        "build-startup-from-scratch", 
        "Entrepreneurship",
        "Startup Development", 
        "Intermediate", 
        14999, 
        "Build a startup step-by-step from idea to execution.\nLearn practical entrepreneurship skills.", 
        "This course focuses on building a startup from the ground up. Students learn ideation and validation techniques. It covers MVP building and testing. Learners explore business models and monetization. The course includes growth and scaling basics. Marketing and operations are discussed. Real-world projects are included. By the end, students can build a startup independently."
    ),
    generateSpecificCourse(
        "Lean Startup", 
        "lean-startup", 
        "Entrepreneurship",
        "Startup Methodologies", 
        "Intermediate", 
        13999, 
        "Learn the Lean Startup approach to build efficiently.\nValidate ideas quickly with minimal risk.", 
        "This course teaches the Lean Startup methodology. Students learn build-measure-learn cycles. It covers MVP creation and rapid iteration. Learners explore customer feedback loops. The course includes validation techniques. Risk reduction strategies are discussed. Case studies of lean startups are included. By the end, students can apply lean principles effectively."
    ),
    generateSpecificCourse(
        "Startup Growth Hacking", 
        "startup-growth-hacking", 
        "Entrepreneurship",
        "Growth", 
        "Advanced", 
        25999, 
        "Scale startups using growth hacking strategies.\nLearn data-driven growth techniques.", 
        "This course focuses on growth strategies for startups. Students learn user acquisition and retention techniques. It covers viral marketing and growth loops. Learners explore data-driven experimentation. The course includes tools for growth tracking. Case studies of successful startups are included. Optimization and scaling strategies are discussed. By the end, students can grow startups rapidly."
    ),
    generateSpecificCourse(
        "Fundraising Basics", 
        "fundraising-basics", 
        "Entrepreneurship",
        "Startup Finance", 
        "Beginner", 
        8999, 
        "Understand how startups raise funding.\nLearn investor pitching and fundraising strategies.", 
        "This course introduces startup fundraising concepts. Students learn funding stages and sources. It covers investor communication and pitch preparation. Learners explore valuation basics. The course includes real-world fundraising examples. Legal and financial considerations are discussed. Practical exercises are included. By the end, students understand how to raise funds."
    ),
    generateSpecificCourse(
        "SaaS Startup Building", 
        "saas-startup-building", 
        "Entrepreneurship",
        "SaaS", 
        "Advanced", 
        27999, 
        "Build and scale SaaS-based businesses.\nLearn subscription-based business models.", 
        "This course focuses on SaaS startup development. Students learn product design and development. It covers pricing models and subscriptions. Learners explore customer acquisition strategies. The course includes scaling SaaS businesses. Metrics like churn and retention are discussed. Real-world SaaS case studies are included. By the end, students can build SaaS products."
    ),
    generateSpecificCourse(
        "E-commerce Business", 
        "ecommerce-business", 
        "Entrepreneurship",
        "E-commerce", 
        "Beginner", 
        8999, 
        "Start and grow an online e-commerce business.\nLearn product sourcing and online selling.", 
        "This course focuses on building an e-commerce business. Students learn product selection and sourcing. It covers online store setup and operations. Learners explore digital marketing for sales. The course includes logistics and fulfillment. Customer service and retention are discussed. Real-world case studies are included. By the end, students can run an online business."
    ),
    generateSpecificCourse(
        "Personal Brand Business", 
        "personal-brand-business", 
        "Entrepreneurship",
        "Personal Branding", 
        "Beginner", 
        8999, 
        "Build a business around your personal brand.\nLeverage content and audience for growth.", 
        "This course focuses on building a personal brand business. Students learn content creation strategies. It covers audience building and engagement. Learners explore monetization methods. The course includes branding and positioning. Social media growth strategies are discussed. Real-world examples are included. By the end, students can build personal brand businesses."
    ),
    generateSpecificCourse(
        "Startup Scaling", 
        "startup-scaling", 
        "Entrepreneurship",
        "Growth", 
        "Advanced", 
        28999, 
        "Scale startups efficiently and sustainably.\nManage growth and operations effectively.", 
        "This course focuses on scaling startup operations. Students learn growth strategies and execution. It covers team building and process optimization. Learners explore funding and expansion strategies. The course includes real-world scaling case studies. Risk management is discussed. Operational efficiency is emphasized. By the end, students can scale startups successfully."
    ),
    generateSpecificCourse(
        "Entrepreneurial Mindset", 
        "entrepreneurship-mindset", 
        "Entrepreneurship",
        "Mindset", 
        "Beginner", 
        7999, 
        "Develop the mindset needed to succeed as an entrepreneur.\nBuild resilience and problem-solving skills.", 
        "This course focuses on developing an entrepreneurial mindset. Students learn creativity and innovation techniques. It covers resilience and risk-taking. Learners explore problem-solving approaches. The course includes real-world examples. Motivation and goal-setting are discussed. Practical exercises are included. By the end, students think like entrepreneurs."
    ),
    generateSpecificCourse(
        "No-Code Startup Development", 
        "no-code-startup-development", 
        "Entrepreneurship",
        "No-Code", 
        "Intermediate", 
        14999, 
        "Build startups without coding using no-code tools.\nLaunch products quickly and efficiently.", 
        "This course focuses on building startups using no-code tools. Students learn platforms for app and website creation. It covers MVP development without coding. Learners explore automation and integrations. The course includes real-world projects. Tools and platforms are introduced. Rapid prototyping is emphasized. By the end, students can build startups without coding."
    ),
    generateSpecificCourse(
        "Startup Pitch Deck Mastery", 
        "startup-pitch-deck-mastery", 
        "Entrepreneurship",
        "Fundraising", 
        "Intermediate", 
        13999, 
        "Create powerful pitch decks to attract investors.\nCommunicate your startup idea effectively.", 
        "This course focuses on creating pitch decks. Students learn storytelling and presentation techniques. It covers slide structure and content. Learners explore investor expectations. The course includes real-world pitch examples. Feedback improves presentation quality. Practice sessions are included. By the end, students can pitch confidently."
    ),
    generateSpecificCourse(
        "Building in Public (Startup Branding)", 
        "building-in-public-startup-branding", 
        "Entrepreneurship",
        "Branding", 
        "Intermediate", 
        14999, 
        "Build your startup publicly and grow an audience.\nLeverage transparency for brand growth.", 
        "This course focuses on building startups in public. Students learn content strategies and audience engagement. It covers transparency and storytelling. Learners explore community building. The course includes real-world examples. Social media strategies are discussed. Branding and positioning are emphasized. By the end, students can grow startups publicly."
    ),
    
    // 9. Personal Development (19 courses)
    generateSpecificCourse(
        "Science of Well-Being", 
        "science-of-well-being", 
        "Personal Development",
        "Well-being", 
        "Beginner", 
        7999, 
        "Learn the science behind happiness and well-being.\nBuild habits that improve life satisfaction.", 
        "This course explores the psychology of happiness and well-being. Students learn how thoughts and behaviors affect mental health. It covers habits that increase happiness and reduce stress. Learners explore gratitude, mindfulness, and positive psychology techniques. The course includes practical exercises and daily routines. Real-world research is explained in simple terms. Self-reflection activities help in personal growth. By the end, students can build a happier and more fulfilling life."
    ),
    generateSpecificCourse(
        "Learning How to Learn", 
        "learning-how-to-learn", 
        "Personal Development",
        "Learning Skills", 
        "Beginner", 
        7999, 
        "Improve your ability to learn faster and more effectively.\nMaster techniques used by top learners.", 
        "This course focuses on effective learning techniques. Students learn how the brain processes information. It covers memory techniques and focus strategies. Learners explore active recall and spaced repetition. The course includes study methods and productivity tips. Common learning mistakes are discussed. Practical exercises improve retention. By the end, students can learn any skill efficiently."
    ),
    generateSpecificCourse(
        "Mindshift", 
        "mindshift", 
        "Personal Development",
        "Mindset", 
        "Beginner", 
        7999, 
        "Develop a growth mindset and adapt to change.\nOvercome mental barriers and limiting beliefs.", 
        "This course focuses on mindset transformation. Students learn how to shift from fixed to growth mindset. It covers overcoming fear and self-doubt. Learners explore adaptability and career change strategies. The course includes real-life examples and exercises. Motivation and goal-setting techniques are discussed. Practical steps help apply mindset shifts. By the end, students can embrace change confidently."
    ),
    generateSpecificCourse(
        "Writing Masterclass", 
        "writing-masterclass-pd", 
        "Personal Development",
        "Writing Skills", 
        "Intermediate", 
        13999, 
        "Improve writing skills for clarity and impact.\nLearn to communicate ideas effectively.", 
        "This course focuses on improving writing skills. Students learn structure, tone, and clarity. It covers storytelling and persuasive writing techniques. Learners practice different writing styles. The course includes editing and proofreading skills. Real-world writing tasks are provided. Feedback helps improve quality. By the end, students can write clearly and effectively."
    ),
    generateSpecificCourse(
        "Work Smarter Not Harder", 
        "work-smarter-not-harder", 
        "Personal Development",
        "Productivity", 
        "Beginner", 
        7999, 
        "Increase productivity using smarter work strategies.\nAchieve more with less effort.", 
        "This course focuses on productivity improvement techniques. Students learn time management strategies. It covers prioritization and focus methods. Learners explore efficiency tools and systems. The course includes habit-building techniques. Real-world examples are discussed. Practical exercises improve productivity. By the end, students can work more efficiently."
    ),
    generateSpecificCourse(
        "Thinking Fast and Slow", 
        "thinking-fast-and-slow", 
        "Personal Development",
        "Critical Thinking", 
        "Intermediate", 
        14999, 
        "Understand how your mind makes decisions.\nImprove judgment and decision-making skills.", 
        "This course explores decision-making processes. Students learn about cognitive biases and thinking systems. It covers intuitive and analytical thinking. Learners explore decision-making frameworks. The course includes real-world scenarios. Strategies for better judgment are discussed. Practical exercises improve thinking skills. By the end, students make better decisions."
    ),
    generateSpecificCourse(
        "Finding Your Purpose", 
        "finding-your-purpose", 
        "Personal Development",
        "Self-Discovery", 
        "Beginner", 
        7999, 
        "Discover your passion and life purpose.\nAlign your goals with your values.", 
        "This course focuses on self-discovery and purpose. Students explore personal values and interests. It covers goal-setting and life planning. Learners identify strengths and passions. The course includes reflection exercises. Real-world examples are discussed. Practical frameworks help in decision-making. By the end, students gain clarity about their purpose."
    ),
    generateSpecificCourse(
        "Introduction to Psychology", 
        "introduction-to-psychology", 
        "Personal Development",
        "Psychology", 
        "Beginner", 
        8999, 
        "Learn the basics of psychology and human behavior.\nUnderstand how people think and act.", 
        "This course introduces psychological concepts and theories. Students learn about behavior, cognition, and emotions. It covers personality and development. Learners explore mental processes and motivation. The course includes real-world examples. Practical applications are discussed. Key psychological theories are explained. By the end, students understand human behavior."
    ),
    generateSpecificCourse(
        "Mindfulness", 
        "mindfulness", 
        "Personal Development",
        "Well-being", 
        "Beginner", 
        7999, 
        "Practice mindfulness for better focus and mental health.\nReduce stress and improve awareness.", 
        "This course focuses on mindfulness techniques. Students learn meditation and breathing exercises. It covers stress reduction and focus improvement. Learners explore present-moment awareness. The course includes guided practices. Real-world applications are discussed. Daily routines are included. By the end, students improve mental clarity."
    ),
    generateSpecificCourse(
        "Productivity Mastery", 
        "productivity-mastery-pd", 
        "Personal Development",
        "Productivity", 
        "Intermediate", 
        14999, 
        "Master advanced productivity systems and workflows.\nAchieve peak performance.", 
        "This course focuses on advanced productivity strategies. Students learn time blocking and deep work techniques. It covers task management systems. Learners explore digital tools and automation. The course includes real-world productivity systems. Performance tracking is discussed. Practical exercises improve efficiency. By the end, students achieve high productivity."
    ),
    generateSpecificCourse(
        "Emotional Intelligence", 
        "emotional-intelligence", 
        "Personal Development",
        "Emotional Skills", 
        "Intermediate", 
        13999, 
        "Develop emotional awareness and control.\nImprove relationships and communication.", 
        "This course focuses on emotional intelligence skills. Students learn self-awareness and empathy. It covers emotional regulation techniques. Learners explore communication and relationships. The course includes real-world scenarios. Practical exercises improve emotional skills. Feedback helps improvement. By the end, students manage emotions effectively."
    ),
    generateSpecificCourse(
        "Critical Thinking", 
        "critical-thinking-pd", 
        "Personal Development",
        "Thinking Skills", 
        "Intermediate", 
        14999, 
        "Develop logical reasoning and analytical skills.\nMake better decisions with clarity.", 
        "This course focuses on critical thinking skills. Students learn logical reasoning and analysis. It covers problem-solving frameworks. Learners explore argument evaluation. The course includes real-world case studies. Bias and fallacies are discussed. Practical exercises improve thinking. By the end, students think clearly and logically."
    ),
    generateSpecificCourse(
        "Habit Building", 
        "habit-building", 
        "Personal Development",
        "Habits", 
        "Beginner", 
        7999, 
        "Build positive habits and break bad ones.\nCreate long-term behavioral change.", 
        "This course focuses on habit formation techniques. Students learn habit loops and triggers. It covers consistency and discipline. Learners explore behavior change strategies. The course includes practical exercises. Real-world examples are discussed. Tracking and accountability methods are included. By the end, students build lasting habits."
    ),
    generateSpecificCourse(
        "Mental Resilience", 
        "mental-resilience", 
        "Personal Development",
        "Mental Strength", 
        "Intermediate", 
        13999, 
        "Develop resilience to handle stress and challenges.\nStay strong in difficult situations.", 
        "This course focuses on mental resilience and strength. Students learn coping strategies for stress. It covers emotional stability and adaptability. Learners explore mindset techniques. The course includes real-world scenarios. Practical exercises build resilience. Stress management techniques are discussed. By the end, students handle challenges effectively."
    ),
    generateSpecificCourse(
        "Success Psychology", 
        "success-psychology", 
        "Personal Development",
        "Psychology", 
        "Intermediate", 
        14999, 
        "Understand the psychology behind success.\nDevelop habits and mindset for achievement.", 
        "This course explores psychological principles of success. Students learn motivation and goal-setting. It covers mindset and discipline. Learners explore success habits. The course includes real-world examples. Practical exercises improve performance. Strategies for long-term success are discussed. By the end, students achieve their goals."
    ),
    generateSpecificCourse(
        "Deep Work", 
        "deep-work-pd", 
        "Personal Development",
        "Productivity", 
        "Intermediate", 
        14999, 
        "Master deep focus and eliminate distractions.\nAchieve high-quality work output.", 
        "This course focuses on deep work techniques. Students learn focus strategies and distraction control. It covers time blocking and routines. Learners explore productivity systems. The course includes real-world examples. Practical exercises improve focus. Performance tracking is discussed. By the end, students work with deep concentration."
    ),
    generateSpecificCourse(
        "Career Planning", 
        "career-planning-pd", 
        "Personal Development",
        "Career Development", 
        "Beginner", 
        8999, 
        "Plan and build a successful career path.\nMake informed career decisions.", 
        "This course focuses on career planning strategies. Students learn goal-setting and decision-making. It covers skill development and opportunities. Learners explore career paths and transitions. The course includes resume and planning techniques. Real-world examples are included. Practical exercises improve clarity. By the end, students plan their careers effectively."
    ),
    generateSpecificCourse(
        "Confidence Building", 
        "confidence-building", 
        "Personal Development",
        "Self-Improvement", 
        "Beginner", 
        7999, 
        "Build confidence in personal and professional life.\nOvercome fear and self-doubt.", 
        "This course focuses on building confidence. Students learn self-awareness and mindset techniques. It covers overcoming fear and anxiety. Learners explore communication and presentation skills. The course includes practical exercises. Real-world scenarios are discussed. Feedback improves confidence. By the end, students feel confident and capable."
    ),
    generateSpecificCourse(
        "Leadership Psychology", 
        "leadership-psychology-pd", 
        "Personal Development",
        "Leadership", 
        "Intermediate", 
        14999, 
        "Understand the psychology behind effective leadership.\nLead with empathy and influence.", 
        "This course focuses on leadership psychology concepts. Students learn motivation and behavior. It covers leadership styles and impact. Learners explore team dynamics and influence. The course includes real-world examples. Practical exercises build leadership skills. Communication and decision-making are discussed. By the end, students become effective leaders."
    ),
    
    // 10. Project Management (20 courses)
    generateSpecificCourse(
        "PMP Prep", 
        "pmp-prep", 
        "Project Management",
        "Certification", 
        "Advanced", 
        27999, 
        "Prepare for the PMP certification with structured guidance.\nMaster project management frameworks and concepts.", 
        "This course prepares students for the PMP certification exam. It covers PMBOK concepts and frameworks in depth. Students learn project lifecycle and processes. Risk, cost, and scope management are included. Practice exams and mock tests are provided. Real-world project scenarios are discussed. Exam strategies and time management are covered. By the end, students are ready for PMP certification."
    ),
    generateSpecificCourse(
        "Project Management Fundamentals", 
        "project-management-fundamentals", 
        "Project Management",
        "Fundamentals", 
        "Beginner", 
        8999, 
        "Learn the basics of project management.\nUnderstand planning, execution, and delivery.", 
        "This course introduces core project management concepts. Students learn project lifecycle and phases. It covers planning, scheduling, and execution. Learners explore team coordination and communication. Basic tools and techniques are introduced. Real-world examples are included. Practical exercises reinforce learning. By the end, students understand project management basics."
    ),
    generateSpecificCourse(
        "Agile & Scrum", 
        "agile-scrum", 
        "Project Management",
        "Agile", 
        "Intermediate", 
        14999, 
        "Master Agile and Scrum methodologies.\nImprove flexibility and project delivery speed.", 
        "This course focuses on Agile and Scrum frameworks. Students learn Scrum roles and ceremonies. It covers sprint planning and backlog management. Learners explore Agile principles and values. Real-world Agile projects are included. Tools and practices are introduced. Performance tracking is discussed. By the end, students can manage Agile projects."
    ),
    generateSpecificCourse(
        "Advanced Project Management", 
        "advanced-project-management", 
        "Project Management",
        "Advanced PM", 
        "Advanced", 
        26999, 
        "Enhance advanced project management skills.\nManage complex projects effectively.", 
        "This course focuses on advanced project management techniques. Students learn complex project planning and execution. It covers risk management and stakeholder engagement. Learners explore resource allocation and optimization. Advanced tools and frameworks are included. Real-world case studies are discussed. Leadership in projects is emphasized. By the end, students manage complex projects."
    ),
    generateSpecificCourse(
        "Risk Management", 
        "risk-management-projects", 
        "Project Management",
        "Risk Management", 
        "Intermediate", 
        14999, 
        "Identify and manage project risks effectively.\nReduce uncertainty in project execution.", 
        "This course focuses on project risk management. Students learn risk identification and analysis. It covers mitigation and contingency planning. Learners explore risk assessment tools. Real-world scenarios are included. Monitoring and control techniques are discussed. Practical exercises improve skills. By the end, students can manage project risks."
    ),
    generateSpecificCourse(
        "Program Management", 
        "program-management", 
        "Project Management",
        "Program Management", 
        "Advanced", 
        27999, 
        "Manage multiple projects under a single program.\nAlign projects with business goals.", 
        "This course focuses on program management concepts. Students learn coordination of multiple projects. It covers governance and alignment strategies. Learners explore performance tracking. Real-world examples are included. Risk and resource management are discussed. Leadership skills are emphasized. By the end, students manage programs effectively."
    ),
    generateSpecificCourse(
        "Jira Tools", 
        "jira-tools", 
        "Project Management",
        "Tools", 
        "Beginner", 
        8999, 
        "Learn Jira for project tracking and management.\nImprove team collaboration and workflow.", 
        "This course focuses on Jira tool usage. Students learn issue tracking and workflows. It covers sprint planning and backlog management. Learners explore dashboards and reporting. Real-world use cases are included. Practical exercises improve skills. Automation features are discussed. By the end, students can manage projects using Jira."
    ),
    generateSpecificCourse(
        "Product Management", 
        "product-management-pm", 
        "Project Management",
        "Product Management", 
        "Intermediate", 
        16999, 
        "Learn product lifecycle and management strategies.\nBridge business, design, and development.", 
        "This course focuses on product management principles. Students learn product lifecycle and roadmap planning. It covers user research and requirements. Learners explore cross-functional collaboration. Real-world case studies are included. Metrics and KPIs are discussed. Product strategy is emphasized. By the end, students manage products effectively."
    ),
    generateSpecificCourse(
        "Technical Project Management", 
        "technical-project-management", 
        "Project Management",
        "Technical PM", 
        "Intermediate", 
        16999, 
        "Manage technical projects with efficiency.\nUnderstand development workflows and systems.", 
        "This course focuses on managing technical projects. Students learn software development lifecycle. It covers Agile and DevOps integration. Learners explore technical communication. Real-world tech projects are included. Tools and frameworks are discussed. Performance tracking is covered. By the end, students manage technical projects."
    ),
    generateSpecificCourse(
        "PMP Case Studies", 
        "pmp-case-studies", 
        "Project Management",
        "Certification", 
        "Advanced", 
        24999, 
        "Practice PMP concepts with real-world case studies.\nStrengthen exam preparation.", 
        "This course focuses on PMP case study analysis. Students apply concepts to real scenarios. It covers decision-making and problem-solving. Learners explore complex project cases. Practice exercises reinforce learning. Exam-oriented questions are included. Strategies for solving case studies are discussed. By the end, students improve PMP readiness."
    ),
    generateSpecificCourse(
        "Stakeholder Management", 
        "stakeholder-management", 
        "Project Management",
        "Communication", 
        "Intermediate", 
        14999, 
        "Manage stakeholders effectively for project success.\nImprove communication and relationships.", 
        "This course focuses on stakeholder management. Students learn stakeholder identification and analysis. It covers communication strategies. Learners explore engagement techniques. Real-world scenarios are included. Conflict resolution is discussed. Practical exercises improve skills. By the end, students manage stakeholders effectively."
    ),
    generateSpecificCourse(
        "Agile Project Simulation", 
        "agile-project-simulation", 
        "Project Management",
        "Agile", 
        "Intermediate", 
        15999, 
        "Experience real-world Agile projects through simulation.\nLearn by doing.", 
        "This course provides hands-on Agile project experience. Students participate in simulated sprints. It covers backlog management and iteration. Learners explore real-world scenarios. Feedback improves skills. Tools and frameworks are used. Performance evaluation is included. By the end, students understand Agile practically."
    ),
    generateSpecificCourse(
        "Project Planning & Scheduling (MS Project)", 
        "project-planning-scheduling-ms-project", 
        "Project Management",
        "Planning Tools", 
        "Intermediate", 
        14999, 
        "Plan and schedule projects using MS Project.\nImprove time management and execution.", 
        "This course focuses on project planning tools. Students learn MS Project software. It covers scheduling and resource allocation. Learners explore timeline creation. Real-world planning scenarios are included. Monitoring and tracking are discussed. Practical exercises improve skills. By the end, students plan projects effectively."
    ),
    generateSpecificCourse(
        "Scrum Master Certification Prep", 
        "scrum-master-certification-prep", 
        "Project Management",
        "Certification", 
        "Advanced", 
        25999, 
        "Prepare for Scrum Master certification.\nMaster Agile leadership and Scrum practices.", 
        "This course prepares students for Scrum Master certification. Students learn Scrum roles and principles. It covers Agile frameworks and implementation. Learners explore team facilitation techniques. Practice exams are included. Real-world scenarios are discussed. Leadership skills are emphasized. By the end, students are ready for certification."
    ),
    generateSpecificCourse(
        "Project Budgeting & Cost Control", 
        "project-budgeting-cost-control", 
        "Project Management",
        "Finance", 
        "Intermediate", 
        15999, 
        "Manage project budgets and control costs effectively.\nEnsure financial success of projects.", 
        "This course focuses on project financial management. Students learn budgeting and cost estimation. It covers cost control techniques. Learners explore financial tracking tools. Real-world case studies are included. Risk and cost management are discussed. Practical exercises improve skills. By the end, students manage project budgets effectively."
    ),
    generateSpecificCourse(
        "Lean Project Management", 
        "lean-project-management", 
        "Project Management",
        "Lean", 
        "Intermediate", 
        14999, 
        "Apply Lean principles to improve project efficiency.\nReduce waste and increase value.", 
        "This course focuses on Lean project management principles. Students learn waste reduction and efficiency techniques. It covers process optimization. Learners explore continuous improvement methods. Real-world examples are included. Tools and frameworks are discussed. Practical exercises improve performance. By the end, students apply Lean effectively."
    ),
    generateSpecificCourse(
        "Change Management in Projects", 
        "change-management-projects-pm", 
        "Project Management",
        "Change Management", 
        "Intermediate", 
        15999, 
        "Manage change effectively within projects.\nEnsure smooth transitions and adoption.", 
        "This course focuses on change management strategies. Students learn planning and implementation of change. It covers communication and stakeholder engagement. Learners explore resistance management. Real-world scenarios are included. Tools and frameworks are discussed. Practical exercises improve skills. By the end, students manage change effectively."
    ),
    generateSpecificCourse(
        "Project Documentation & Reporting", 
        "project-documentation-reporting", 
        "Project Management",
        "Documentation", 
        "Beginner", 
        8999, 
        "Create effective project documentation and reports.\nImprove clarity and communication.", 
        "This course focuses on project documentation techniques. Students learn report writing and templates. It covers documentation standards. Learners explore communication clarity. Real-world examples are included. Tools and formats are discussed. Practical exercises improve skills. By the end, students create professional documentation."
    ),
    generateSpecificCourse(
        "Portfolio & PMO Management", 
        "portfolio-pmo-management", 
        "Project Management",
        "Portfolio Management", 
        "Advanced", 
        28999, 
        "Manage multiple projects through portfolio and PMO structures.\nAlign projects with organizational strategy.", 
        "This course focuses on portfolio and PMO management. Students learn project prioritization and governance. It covers alignment with business goals. Learners explore performance tracking. Real-world examples are included. Risk and resource management are discussed. Tools and frameworks are covered. By the end, students manage portfolios effectively."
    ),
    generateSpecificCourse(
        "Hybrid Project Management (Agile + Waterfall)", 
        "hybrid-project-management", 
        "Project Management",
        "Hybrid", 
        "Advanced", 
        26999, 
        "Combine Agile and Waterfall methodologies.\nAdapt project management to different scenarios.", 
        "This course focuses on hybrid project management approaches. Students learn Agile and Waterfall integration. It covers planning and execution strategies. Learners explore real-world scenarios. Flexibility and adaptability are emphasized. Case studies are included. Tools and frameworks are discussed. By the end, students can manage hybrid projects."
    ),
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

  allTuitions.push(
    // GRADE 5
    generateSpecificTuition("Anita Ma’am", "anita-maam-grade5", 5, ["CBSE", "ICSE"], 1499, 12999, "A friendly and encouraging mentor who helps young learners build confidence and enjoy learning.", "Anita Ma’am is known for her patient teaching style and engaging classroom sessions. She creates a positive learning environment where students feel comfortable asking questions and expressing themselves freely. With years of experience mentoring young learners, she focuses on building confidence, discipline, and curiosity among students. Her interactive teaching methods and supportive guidance help students stay motivated and perform better academically."),
    generateSpecificTuition("Rahul Sir", "rahul-sir-grade5", 5, ["CBSE"], 1499, 12999, "An energetic and engaging teacher who makes online learning fun and interactive.", "Rahul Sir believes that learning should always be enjoyable and stress-free. His sessions are filled with interactive discussions, practical examples, and activities that keep students attentive throughout the class. He has helped hundreds of students improve their classroom performance while also boosting their confidence. His calm and approachable nature makes him one of the most loved teachers among students."),
    generateSpecificTuition("Shivam Sir", "shivam-sir-grade5", 5, ["CBSE", "ICSE"], 1499, 12999, "A dedicated mentor focused on creating strong academic foundations for students.", "Shivam Sir is passionate about helping students understand concepts clearly instead of memorizing them. His teaching approach focuses on patience, concept clarity, and personalized attention. He motivates students to think creatively and develop problem-solving skills from an early stage. His classes are highly interactive and designed to make every learner feel involved and confident."),
    generateSpecificTuition("Neha Ma’am", "neha-maam-grade5", 5, ["ICSE"], 1499, 12999, "A warm and motivating educator who helps students learn with confidence.", "Neha Ma’am has a student-friendly teaching style that encourages participation and curiosity. She believes in creating a comfortable environment where students can grow academically and personally. Her sessions are well-structured, interactive, and focused on improving attention span and understanding. Parents appreciate her dedication and ability to keep students engaged throughout the learning journey."),
    generateSpecificTuition("Arjun Sir", "arjun-sir-grade5", 5, ["CBSE", "ICSE"], 1499, 12999, "A highly supportive mentor who inspires students to achieve their best potential.", "Arjun Sir focuses on helping students become independent learners with strong critical-thinking abilities. His sessions are designed to encourage active participation and confidence building. He uses real-life examples and engaging teaching techniques to make learning simple and effective. Students enjoy his positive attitude, motivational guidance, and easy-to-understand explanations."),
    
    // GRADE 6
    generateSpecificTuition("Kavita Ma’am", "kavita-maam-grade6", 6, ["CBSE", "ICSE"], 1499, 12999, "A compassionate mentor who helps students stay focused and motivated.", "Kavita Ma’am has years of experience guiding middle school learners through interactive and engaging online classes. Her calm teaching approach and structured sessions help students stay disciplined while enjoying the learning process. She strongly believes in individual attention and encourages every student to participate confidently in class discussions."),
    generateSpecificTuition("Rohit Sir", "rohit-sir-grade6", 6, ["CBSE"], 1499, 12999, "A dynamic educator who makes learning enjoyable and easy to understand.", "Rohit Sir is appreciated for his energetic teaching style and student-friendly nature. He encourages curiosity and creativity among students while helping them improve their overall academic performance. His classes focus on discipline, interaction, and long-term understanding rather than rote learning."),
    generateSpecificTuition("Sneha Ma’am", "sneha-maam-grade6", 6, ["CBSE", "ICSE"], 1499, 12999, "A patient and supportive teacher who believes every child can excel with the right guidance.", "Sneha Ma’am creates an engaging online learning atmosphere where students feel encouraged to ask questions and express themselves. She focuses on building confidence and developing strong study habits among learners. Her classes are interactive, organized, and highly appreciated by parents and students alike."),
    generateSpecificTuition("Amit Sir", "amit-sir-grade6", 6, ["CBSE", "ICSE"], 1499, 12999, "A creative and enthusiastic mentor known for his practical teaching methods.", "Amit Sir uses modern teaching techniques and interactive activities to keep students engaged throughout the class. He believes in simplifying difficult concepts and making learning enjoyable. His sessions are focused on developing confidence, discipline, and analytical thinking among students."),
    generateSpecificTuition("Pooja Ma’am", "pooja-maam-grade6", 6, ["CBSE"], 1499, 12999, "A caring educator who helps students build consistency and confidence in learning.", "Pooja Ma’am is loved for her approachable nature and highly engaging sessions. She focuses on improving students’ learning habits through structured guidance and regular interaction. Her goal is to make every student feel motivated and capable of achieving academic success."),

    // GRADE 7
    generateSpecificTuition("Meera Ma’am", "meera-maam-grade7", 7, ["CBSE", "ICSE"], 1499, 12999, "A calm and inspiring educator who helps students stay motivated and academically confident.", "Meera Ma’am is known for her supportive teaching style and ability to connect with students personally. She specializes in helping middle school students improve learning consistency, confidence, and communication skills. Her sessions are interactive and designed to create a stress-free learning environment where students can comfortably participate and grow academically."),
    generateSpecificTuition("Aditya Sir", "aditya-sir-grade7", 7, ["CBSE", "ICSE"], 1499, 12999, "An energetic mentor who makes learning engaging and practical.", "Aditya Sir focuses on concept clarity, analytical thinking, and interactive learning methods. He encourages students to ask questions confidently and participate actively during sessions. His practical teaching approach helps learners stay motivated and develop strong academic discipline from an early stage."),
    generateSpecificTuition("Nidhi Ma’am", "nidhi-maam-grade7", 7, ["CBSE"], 1499, 12999, "A supportive teacher who focuses on student confidence and steady growth.", "Nidhi Ma’am is appreciated for her approachable personality and student-friendly teaching methods. She specializes in personalized mentoring and interactive classroom engagement that helps students improve concentration and overall academic performance."),
    generateSpecificTuition("Karan Sir", "karan-sir-grade7", 7, ["CBSE", "ICSE"], 1499, 12999, "A motivating educator known for his engaging online sessions.", "Karan Sir believes in simplifying concepts through relatable examples and interactive discussions. His expertise lies in helping students develop independent learning habits and stronger problem-solving skills while maintaining confidence throughout the academic year."),
    generateSpecificTuition("Sophia Williams", "sophia-williams-grade7", 7, ["CBSE", "ICSE"], 1499, 12999, "An international educator focused on communication skills and global learning methods.", "Sophia Williams has experience teaching international middle school students through modern and interactive online learning techniques. She specializes in communication development, confidence building, and collaborative learning strategies that help students become more expressive and academically active."),
    generateSpecificTuition("Ethan Carter", "ethan-carter-grade7", 7, ["CBSE", "ICSE"], 1499, 12999, "A globally experienced mentor who focuses on critical thinking and practical learning.", "Ethan Carter is known for his engaging teaching style and student-focused learning approach. His expertise includes logical reasoning, interactive problem-solving, and helping students adapt to modern learning environments through activity-based sessions and personalized mentoring."),

    // GRADE 8
    generateSpecificTuition("Riya Ma’am", "riya-maam-grade8", 8, ["CBSE", "ICSE"], 1499, 12999, "A confident educator who creates engaging and student-friendly classes.", "Riya Ma’am focuses on improving confidence, communication, and learning discipline among students. Her classes are interactive and designed to help learners participate actively while developing stronger academic habits."),
    generateSpecificTuition("Manav Sir", "manav-sir-grade8", 8, ["CBSE"], 1499, 12999, "A passionate mentor known for concept clarity and interactive learning.", "Manav Sir specializes in helping students improve analytical thinking and classroom consistency. His practical and engaging teaching style encourages learners to understand concepts deeply rather than relying on memorization."),
    generateSpecificTuition("Tanya Ma’am", "tanya-maam-grade8", 8, ["ICSE"], 1499, 12999, "A motivating teacher who encourages confidence and discipline.", "Tanya Ma’am creates a positive learning environment where students feel comfortable participating and asking questions. She focuses on improving communication, academic discipline, and classroom engagement through interactive sessions."),
    generateSpecificTuition("Harsh Sir", "harsh-sir-grade8", 8, ["CBSE", "ICSE"], 1499, 12999, "An engaging mentor who inspires students to stay focused and motivated.", "Harsh Sir uses activity-based teaching methods and practical examples to make learning enjoyable and effective. His expertise lies in helping students improve confidence, participation, and independent thinking abilities."),
    generateSpecificTuition("Olivia Brown", "olivia-brown-grade8", 8, ["CBSE", "ICSE"], 1499, 12999, "An international teacher focused on modern learning techniques and student confidence.", "Olivia Brown specializes in communication skills, collaborative learning, and interactive classroom engagement. She helps students improve self-expression and confidence while adapting to global online education methods."),
    generateSpecificTuition("Daniel Smith", "daniel-smith-grade8", 8, ["CBSE", "ICSE"], 1499, 12999, "A globally experienced educator who encourages creativity and analytical thinking.", "Daniel Smith is known for his practical teaching methods and highly engaging sessions. His expertise includes critical thinking development, logical reasoning, and helping students become more confident independent learners."),

    // GRADE 9
    generateSpecificTuition("Sanya Ma’am", "sanya-maam-grade9", 9, ["CBSE", "ICSE"], 1499, 12999, "A disciplined and supportive mentor who helps students stay academically focused.", "Sanya Ma’am specializes in helping students improve concentration, consistency, and learning confidence during important academic years. Her structured sessions and motivational teaching style encourage active classroom participation and long-term academic improvement."),
    generateSpecificTuition("Akash Sir", "akash-sir-grade9", 9, ["CBSE"], 1499, 12999, "An energetic educator who makes online learning engaging and practical.", "Akash Sir focuses on concept clarity, logical thinking, and practical learning approaches. His sessions are interactive and designed to help students stay motivated while improving their confidence and analytical abilities."),
    generateSpecificTuition("Kritika Ma’am", "kritika-maam-grade9", 9, ["CBSE", "ICSE"], 1499, 12999, "A patient mentor who creates a positive and confidence-building learning atmosphere.", "Kritika Ma’am is appreciated for her organized teaching methods and personalized guidance. She specializes in helping students manage academic pressure effectively while improving discipline and communication skills."),
    generateSpecificTuition("Ryan Mitchell", "ryan-mitchell-grade9", 9, ["CBSE", "ICSE"], 1499, 12999, "An international mentor focused on analytical learning and problem-solving techniques.", "Ryan Mitchell has expertise in activity-based online teaching and interactive student mentoring. His teaching methods encourage critical thinking, logical reasoning, and active classroom participation among learners."),
    generateSpecificTuition("Emma Wilson", "emma-wilson-grade9", 9, ["CBSE", "ICSE"], 1499, 12999, "A globally experienced educator known for modern and engaging online learning strategies.", "Emma Wilson specializes in communication development, confidence-building, and collaborative classroom engagement. Her sessions focus on helping students improve academic performance while developing stronger learning habits."),

    // GRADE 10
    generateSpecificTuition("Pritam Sir", "pritam-sir-grade10", 10, ["CBSE", "ICSE"], 1499, 12999, "A focused and disciplined mentor who helps students prepare confidently for board examinations.", "Pritam Sir specializes in board exam preparation, time management strategies, and helping students build consistent study habits. His sessions are structured, interactive, and focused on reducing exam stress while improving confidence and performance. Students appreciate his practical guidance, motivational support, and easy-to-follow teaching style."),
    generateSpecificTuition("Anjali Ma’am", "anjali-maam-grade10", 10, ["CBSE"], 1499, 12999, "A supportive educator who creates a motivating and confidence-building learning environment.", "Anjali Ma’am is known for her patient teaching style and strong student mentorship. She focuses on improving concentration, discipline, and classroom consistency among learners. Her personalized guidance and engaging sessions help students feel academically confident and exam-ready."),
    generateSpecificTuition("Rohan Sir", "rohan-sir-grade10", 10, ["CBSE", "ICSE"], 1499, 12999, "An energetic mentor who makes online learning engaging and result-oriented.", "Rohan Sir uses practical examples and interactive discussions to simplify learning and improve student understanding. His expertise lies in helping students strengthen confidence, study discipline, and analytical thinking while maintaining motivation throughout the academic year."),
    generateSpecificTuition("Garima Ma’am", "garima-maam-grade10", 10, ["ICSE"], 1499, 12999, "A dedicated mentor who helps students stay calm, focused, and academically strong.", "Garima Ma’am focuses on concept clarity, structured learning, and stress-free academic preparation. She creates engaging sessions that encourage active participation and confidence-building among students preparing for board examinations."),
    generateSpecificTuition("Liam Anderson", "liam-anderson-grade10", 10, ["CBSE", "ICSE"], 1499, 12999, "An international educator focused on analytical learning and modern teaching methods.", "Liam Anderson specializes in critical thinking development, interactive classroom engagement, and helping students improve independent learning skills. His sessions combine practical activities with modern online learning strategies to create an enjoyable and productive educational experience."),
    generateSpecificTuition("Chloe Martin", "chloe-martin-grade10", 10, ["CBSE", "ICSE"], 1499, 12999, "A globally experienced teacher who helps students build confidence and communication skills.", "Chloe Martin focuses on collaborative learning, student participation, and confidence-building techniques. Her interactive teaching style helps learners improve classroom engagement, communication abilities, and overall academic consistency."),

    // GRADE 11
    generateSpecificTuition("Aarav Sir", "aarav-sir-grade11", 11, ["CBSE", "ICSE"], 1499, 12999, "A knowledgeable mentor who helps students transition confidently into senior secondary academics.", "Aarav Sir specializes in concept-based learning and advanced academic guidance for senior secondary students. His structured and engaging teaching style helps learners improve discipline, confidence, and analytical thinking while adapting smoothly to higher-level studies."),
    generateSpecificTuition("Sakshi Ma’am", "sakshi-maam-grade11", 11, ["CBSE"], 1499, 12999, "A supportive educator who creates a balanced and motivating learning environment.", "Sakshi Ma’am focuses on improving concentration, confidence, and classroom consistency among students. Her interactive sessions and personalized mentoring approach help learners manage academic pressure effectively while maintaining motivation throughout the year."),
    generateSpecificTuition("Ritesh Sir", "ritesh-sir-grade11", 11, ["CBSE", "ICSE"], 1499, 12999, "An engaging mentor who encourages curiosity, discipline, and academic growth.", "Ritesh Sir uses practical learning methods and interactive discussions to help students strengthen understanding and communication skills. His sessions focus on developing independent learning habits and stronger analytical abilities among learners."),
    generateSpecificTuition("Divya Ma’am", "divya-maam-grade11", 11, ["ICSE"], 1499, 12999, "A patient and motivating teacher who helps students manage advanced studies confidently.", "Divya Ma’am creates highly engaging classroom sessions that encourage participation and active learning. She specializes in helping students improve confidence, discipline, and conceptual understanding while preparing for senior secondary academic challenges."),
    generateSpecificTuition("Noah Thompson", "noah-thompson-grade11", 11, ["CBSE", "ICSE"], 1499, 12999, "An international mentor focused on logical reasoning and modern learning techniques.", "Noah Thompson specializes in analytical thinking, collaborative online learning, and practical academic strategies. His sessions are designed to improve student engagement, independent learning skills, and overall classroom confidence."),
    generateSpecificTuition("Grace Miller", "grace-miller-grade11", 11, ["CBSE", "ICSE"], 1499, 12999, "A globally experienced educator who focuses on communication and confidence development.", "Grace Miller is known for her engaging and supportive teaching style. Her expertise lies in helping students improve self-expression, communication skills, and active classroom participation through interactive and modern teaching approaches."),

    // GRADE 12
    generateSpecificTuition("Abhishek Sir", "abhishek-sir-grade12", 12, ["CBSE", "ICSE"], 1499, 12999, "A highly experienced mentor who helps students prepare confidently for board exams and future goals.", "Abhishek Sir focuses on strategic learning, confidence-building, and disciplined preparation for senior secondary students. His sessions are interactive and designed to reduce academic pressure while improving overall academic performance and consistency."),
    generateSpecificTuition("Radhika Ma’am", "radhika-maam-grade12", 12, ["CBSE"], 1499, 12999, "A supportive educator who helps students stay calm, focused, and academically motivated.", "Radhika Ma’am specializes in personalized mentoring and structured learning methods that help students stay disciplined during board exam preparation. Her interactive sessions encourage confidence, participation, and effective time management."),
    generateSpecificTuition("Nishant Sir", "nishant-sir-grade12", 12, ["CBSE", "ICSE"], 1499, 12999, "An engaging mentor known for his practical teaching methods and student-friendly approach.", "Nishant Sir focuses on simplifying advanced concepts through interactive discussions and structured academic guidance. His expertise lies in helping students improve analytical thinking, confidence, and consistency while preparing for higher education goals."),
    generateSpecificTuition("Muskan Ma’am", "muskan-maam-grade12", 12, ["ICSE"], 1499, 12999, "A calm and dedicated teacher who helps students handle academic pressure effectively.", "Muskan Ma’am creates a balanced and supportive learning environment where students feel encouraged and motivated. Her sessions focus on improving concentration, communication skills, and classroom participation while maintaining academic discipline."),
    generateSpecificTuition("William Parker", "william-parker-grade12", 12, ["CBSE", "ICSE"], 1499, 12999, "An international educator focused on critical thinking and modern online learning strategies.", "William Parker specializes in interactive teaching techniques, logical reasoning development, and helping students become independent learners. His engaging sessions encourage creativity, confidence, and strong analytical abilities among senior secondary students."),
    generateSpecificTuition("Amelia Scott", "amelia-scott-grade12", 12, ["CBSE", "ICSE"], 1499, 12999, "A globally experienced mentor who helps students improve communication and academic confidence.", "Amelia Scott focuses on collaborative learning, communication development, and personalized student mentoring. Her modern teaching methods help students stay motivated, engaged, and academically prepared for future educational opportunities.")
  );

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
