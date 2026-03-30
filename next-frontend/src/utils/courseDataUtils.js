import { categoryData } from '../data/categoryData';
import { itCoursesDetails, itCoursesDetailsPart2 } from '../data/itCourseDetails';
import coursesPricing from '../data/coursePricingData';

const allDetails = [...itCoursesDetails, ...itCoursesDetailsPart2];

export const getAllCourses = () => {
    return categoryData.flatMap(cat => cat.courses.map(course => ({
        ...course,
        category: cat.name
    })));
};

export const getCourseBySlug = (slug) => {
    const allCourses = getAllCourses();
    return allCourses.find(c => {
        const generatedSlug = (c.title || "").toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        return generatedSlug === slug;
    });
};

const determineLevelAndPrice = (title, category) => {
    const pricingInfo = coursesPricing.find(p => p.title === title);
    const lowTitle = (title || "").toLowerCase();

    // Determine level based on title keywords
    let level = 'Beginner';
    if (lowTitle.includes('advanced') || lowTitle.includes('mastery') || lowTitle.includes('expert') || lowTitle.includes('scientist') || lowTitle.includes('architect')) {
        level = 'Advanced';
    } else if (lowTitle.includes('intermediate') || lowTitle.includes('professional') || lowTitle.includes('practitioner') || lowTitle.includes('strategy')) {
        level = 'Intermediate';
    }

    // Use dynamic price if available, otherwise fallback
    if (pricingInfo) {
        return {
            level,
            price: pricingInfo.pricing[level.toLowerCase()] || pricingInfo.pricing[level]
        };
    }

    const fallbackPrices = { 'Beginner': 699, 'Intermediate': 1299, 'Advanced': 1799 };
    return { level, price: fallbackPrices[level] };
};

const getCategoryOutcomes = (categoryName, title) => {
    const defaultOutcomes = [
        "Master job-ready skills and industry-standard workflows",
        "Build a professional portfolio with real-world projects",
        "Gain lifetime access to comprehensive learning materials",
        "Learn from industry experts with actual field experience",
        "Receive a verified Nexvera Hub Certificate of Excellence",
        "Access exclusive community support and networking"
    ];

    const categoryMap = {
        'Information Technology': [
            "Build real-world software and applications from scratch",
            "Master industry-standard programming languages and frameworks",
            "Learn system design and architecture for scalable apps",
            "Develop debugging and technical problem-solving skills",
            "Get career-ready for roles in Top Tech companies"
        ],
        'Media & Entertainment': [
            "Master professional storytelling and creative production",
            "Build a stunning portfolio for the entertainment industry",
            "Learn advanced editing and post-production techniques",
            "Understand audience strategy and viral content creation",
            "Master the business and management of creative projects"
        ],
        'Artificial Intelligence': [
            "Build and deploy cutting-edge AI models and agents",
            "Master prompt engineering and LLM integration",
            "Understand neural networks and deep learning architectures",
            "Learn AI-driven automation for business scalability",
            "Get ready for the future of AI-enabled industries"
        ],
        'Business & Entrepreneurship': [
            "Build a scalable business model from the ground up",
            "Master startup funding, pitching, and investor relations",
            "Learn digital transformation and growth hacking",
            "Develop strategic leadership and management skills",
            "Understand business law, ethics, and sustainability"
        ],
        'Sales & Marketing': [
            "Master high-converting digital marketing strategies",
            "Learn social media growth and SEO optimization",
            "Develop advanced sales psychology and negotiation skills",
            "Understand analytics-driven customer acquisition",
            "Build and scale a professional brand identity"
        ]
    };

    return categoryMap[categoryName] || defaultOutcomes;
};

export const getCourseDetails = (categoryName, title, selectedLevel = null) => {
    // Find the base course info from categoryData to preserve icon/color/instructor
    const category = categoryData.find(cat => cat.name === categoryName);
    const baseCourse = category?.courses.find(c => c.title === title) || {
        title: title,
        instructor: "Expert Instructor",
        rating: 4.8,
        reviews: "1.2k",
        color: "from-blue-600 to-indigo-700",
        icon: "✨",
        lessons: 20
    };

    const { level: determinedLevel, price } = determineLevelAndPrice(title, categoryName);
    const activeLevel = (selectedLevel || determinedLevel).toLowerCase();

    const getCategoryMetadata = (cat, title) => {
        const catLower = (cat || "").toLowerCase();
        const titleLower = (title || "").toLowerCase();

        const metadata = {
            description: "Master the fundamental skills and advanced techniques required for professional excellence in this field through hands-on project-based training.",
            solidColor: "bg-blue-600"
        };

        // Specific description for Python as per mockup
        if (titleLower.includes("python") && titleLower.includes("fundamental")) {
            metadata.description = "Master Python from scratch with hands-on projects, covering everything from basic syntax to object-oriented programming.";
        } else if (catLower.includes("information technology") || catLower.includes("tech")) {
            metadata.description = "Master the digital landscape with expert-led courses in software engineering and systems architecture. Build the technical foundation required for modern engineering roles.";
            metadata.solidColor = "bg-blue-600";
        } else if (catLower.includes("health") || catLower.includes("wellness")) {
            metadata.description = "Transform your lifestyle with evidence-based practices for physical and mental well-being. Achieve balance through professional guidance in nutrition and fitness expertise.";
            metadata.solidColor = "bg-emerald-500";
        } else if (catLower.includes("language")) {
            metadata.description = "Break communication barriers and connect with the world through immersive linguistic training. Master new languages with structured paths designed for global fluency.";
            metadata.solidColor = "bg-indigo-600";
        } else if (catLower.includes("business") || catLower.includes("entrepreneurship")) {
            metadata.description = "Launch and scale your ventures with strategic insights from industry veterans. Master the art of value creation, funding, and sustainable business growth strategies.";
            metadata.solidColor = "bg-orange-500";
        } else if (catLower.includes("management")) {
            metadata.description = "Develop the leadership and organizational skills needed to drive high-performance teams. Master project execution, resource optimization, and corporate strategy mastery.";
            metadata.solidColor = "bg-purple-600";
        } else if (catLower.includes("sales") || catLower.includes("marketing")) {
            metadata.description = "Drive growth and brand influence through modern persuasion and digital reach techniques. Master the psychology of sales and the mechanics of viral marketing success.";
            metadata.solidColor = "bg-rose-500";
        } else if (catLower.includes("engineering") || catLower.includes("construction")) {
            metadata.description = "Build the future with technical mastery in structural design and project execution. Master industry-standard tools and safe engineering practices for global standards.";
            metadata.solidColor = "bg-slate-700";
        } else if (catLower.includes("teaching") || catLower.includes("academic")) {
            metadata.description = "Empower the next generation with modern pedagogical techniques and digital classroom tools. Master the science of learning and effective knowledge transfer methods.";
            metadata.solidColor = "bg-cyan-600";
        } else if (catLower.includes("personal development")) {
            metadata.description = "Unlock your full potential through structured growth in mindset, productivity, and focus. Build the lasting habits required for peak professional performance excellence.";
            metadata.solidColor = "bg-amber-500";
        } else if (catLower.includes("ai") || catLower.includes("artificial")) {
            metadata.description = "Pioneer the next frontier of technology by mastering machine learning and neural networks. Build intelligent systems and automate the future with cutting-edge expertise.";
            metadata.solidColor = "bg-violet-600";
        } else if (catLower.includes("media") || catLower.includes("entertainment")) {
            metadata.description = "Master the art of storytelling and production in the digital age. Build your creative portfolio with expert training in film, music, and social media production.";
            metadata.solidColor = "bg-fuchsia-600";
        }

        return metadata;
    };

    const categoryMetadata = getCategoryMetadata(categoryName, title);

    const getHeroImage = (cat, title) => {
        const catLower = (cat || "").toLowerCase();
        const titleLower = (title || "").toLowerCase();

        // Specific images for certain courses
        if (titleLower.includes("fullstack web development")) return "/images/course-hero/fullstack-web-dev.webp";
        if (titleLower.includes("data science with python")) return "/images/course-hero/data-science-python.webp";
        if (titleLower.includes("ai for business leaders")) return "/images/course-hero/ai-business-leaders.webp";
        if (titleLower.includes("digital marketing mastery")) return "/images/course-hero/digital-marketing.webp";
        if (titleLower.includes("cloud computing fundamentals")) return "/images/course-hero/cloud-computing.webp";
        if (titleLower.includes("cybersecurity essentials")) return "/images/course-hero/cybersecurity.webp";
        if (titleLower.includes("blockchain development")) return "/images/course-hero/blockchain-dev.webp";
        if (titleLower.includes("game development with unity")) return "/images/course-hero/game-dev-unity.webp";
        if (titleLower.includes("ui/ux design principles")) return "/images/course-hero/ui-ux-design.webp";
        if (titleLower.includes("project management professional")) return "/images/course-hero/project-management.webp";
        if (titleLower.includes("financial modeling & valuation")) return "/images/course-hero/financial-modeling.webp";
        if (titleLower.includes("creative writing workshop")) return "/images/course-hero/creative-writing.webp";
        if (titleLower.includes("public speaking & presentation")) return "/images/course-hero/public-speaking.webp";
        if (titleLower.includes("mobile app development")) return "/images/course-hero/mobile-app-dev.webp";
        if (titleLower.includes("devops engineering")) return "/images/course-hero/devops-engineering.webp";
        if (titleLower.includes("machine learning with tensorflow")) return "/images/course-hero/ml-tensorflow.webp";
        if (titleLower.includes("video editing masterclass")) return "/images/course-hero/video-editing.webp";
        if (titleLower.includes("salesforce administration")) return "/images/course-hero/salesforce-admin.webp";
        if (titleLower.includes("ethical hacking")) return "/images/course-hero/ethical-hacking.webp";
        if (titleLower.includes("business analytics")) return "/images/course-hero/business-analytics.webp";
        if (titleLower.includes("photography fundamentals")) return "/images/course-hero/photography.webp";
        if (titleLower.includes("supply chain management")) return "/images/course-hero/supply-chain.webp";
        if (titleLower.includes("human resources management")) return "/images/course-hero/hr-management.webp";
        if (titleLower.includes("data visualization with tableau")) return "/images/course-hero/data-viz-tableau.webp";
        if (titleLower.includes("robotics process automation")) return "/images/course-hero/rpa.webp";
        if (titleLower.includes("content marketing strategy")) return "/images/course-hero/content-marketing.webp";
        if (titleLower.includes("agile project management")) return "/images/course-hero/agile-pm.webp";
        if (titleLower.includes("web3 and blockchain basics")) return "/images/course-hero/web3-blockchain.webp";
        if (titleLower.includes("virtual reality development")) return "/images/course-hero/vr-dev.webp";
        if (titleLower.includes("e-commerce business launch")) return "/images/course-hero/ecommerce-launch.webp";
        if (titleLower.includes("sustainable business practices")) return "/images/course-hero/sustainable-business.webp";
        if (titleLower.includes("leadership and team building")) return "/images/course-hero/leadership-team.webp";
        if (titleLower.includes("personal branding mastery")) return "/images/course-hero/personal-branding.webp";
        if (titleLower.includes("financial literacy for entrepreneurs")) return "/images/course-hero/financial-literacy.webp";
        if (titleLower.includes("advanced excel for business")) return "/images/course-hero/advanced-excel.webp";
        if (titleLower.includes("customer relationship management")) return "/images/course-hero/crm.webp";
        if (titleLower.includes("social media marketing")) return "/images/course-hero/social-media-marketing.webp";
        if (titleLower.includes("search engine optimization (seo)")) return "/images/course-hero/seo.webp";
        if (titleLower.includes("google ads certification")) return "/images/course-hero/google-ads.webp";
        if (titleLower.includes("email marketing automation")) return "/images/course-hero/email-marketing.webp";
        if (titleLower.includes("copywriting for conversion")) return "/images/course-hero/copywriting.webp";
        if (titleLower.includes("product management fundamentals")) return "/images/course-hero/product-management.webp";
        if (titleLower.includes("data engineering with aws")) return "/images/course-hero/data-engineering-aws.webp";
        if (titleLower.includes("azure fundamentals")) return "/images/course-hero/azure-fundamentals.webp";
        if (titleLower.includes("google cloud professional")) return "/images/course-hero/google-cloud.webp";
        if (titleLower.includes("penetration testing")) return "/images/course-hero/penetration-testing.webp";
        if (titleLower.includes("network security")) return "/images/course-hero/network-security.webp";
        if (titleLower.includes("incident response")) return "/images/course-hero/incident-response.webp";
        if (titleLower.includes("forensic analysis")) return "/images/course-hero/forensic-analysis.webp";
        if (titleLower.includes("threat intelligence")) return "/images/course-hero/threat-intelligence.webp";
        if (titleLower.includes("security operations center (soc)")) return "/images/course-hero/soc.webp";
        if (titleLower.includes("compliance and governance")) return "/images/course-hero/compliance-governance.webp";
        if (titleLower.includes("risk management")) return "/images/course-hero/risk-management.webp";
        if (titleLower.includes("security architecture")) return "/images/course-hero/security-architecture.webp";
        if (titleLower.includes("devsecops")) return "/images/course-hero/devsecops.webp";
        if (titleLower.includes("quantum computing basics")) return "/images/course-hero/quantum-computing.webp";
        if (titleLower.includes("edge computing applications")) return "/images/course-hero/edge-computing.webp";
        if (titleLower.includes("internet of things (iot) development")) return "/images/course-hero/iot-dev.webp";
        if (titleLower.includes("augmented reality (ar) creation")) return "/images/course-hero/ar-creation.webp";
        if (titleLower.includes("computer vision with opencv")) return "/images/course-hero/computer-vision.webp";
        if (titleLower.includes("natural language processing (nlp)")) return "/images/course-hero/nlp.webp";
        if (titleLower.includes("reinforcement learning")) return "/images/course-hero/reinforcement-learning.webp";
        if (titleLower.includes("generative ai models")) return "/images/course-hero/generative-ai.webp";
        if (titleLower.includes("ai ethics and governance")) return "/images/course-hero/ai-ethics.webp";
        if (titleLower.includes("data storytelling")) return "/images/course-hero/data-storytelling.webp";
        if (titleLower.includes("big data analytics")) return "/images/course-hero/big-data-analytics.webp";
        if (titleLower.includes("data warehousing")) return "/images/course-hero/data-warehousing.webp";
        if (titleLower.includes("etl processes")) return "/images/course-hero/etl-processes.webp";
        if (titleLower.includes("sql for data analysis")) return "/images/course-hero/sql-data-analysis.webp";
        if (titleLower.includes("python for data science")) return "/images/course-hero/python-data-science.webp";
        if (titleLower.includes("r for statistical analysis")) return "/images/course-hero/r-statistical-analysis.webp";
        if (titleLower.includes("tableau desktop specialist")) return "/images/course-hero/tableau-specialist.webp";
        if (titleLower.includes("power bi for business intelligence")) return "/images/course-hero/power-bi.webp";
        if (titleLower.includes("google analytics 4")) return "/images/course-hero/google-analytics-4.webp";
        if (titleLower.includes("adobe analytics")) return "/images/course-hero/adobe-analytics.webp";
        if (titleLower.includes("web analytics fundamentals")) return "/images/course-hero/web-analytics.webp";
        if (titleLower.includes("conversion rate optimization (cro)")) return "/images/course-hero/cro.webp";
        if (titleLower.includes("a/b testing strategies")) return "/images/course-hero/ab-testing.webp";
        if (titleLower.includes("user experience (ux) research")) return "/images/course-hero/ux-research.webp";
        if (titleLower.includes("design thinking workshop")) return "/images/course-hero/design-thinking.webp";
        if (titleLower.includes("figma for ui design")) return "/images/course-hero/figma-ui-design.webp";
        if (titleLower.includes("adobe xd for prototyping")) return "/images/course-hero/adobe-xd.webp";
        if (titleLower.includes("blender 3d modeling")) return "/images/course-hero/blender-3d.webp";
        if (titleLower.includes("autocad for engineering design")) return "/images/course-hero/autocad.webp";
        if (titleLower.includes("revit for bim")) return "/images/course-hero/revit-bim.webp";
        if (titleLower.includes("solidworks for product design")) return "/images/course-hero/solidworks.webp";
        if (titleLower.includes("gis mapping and analysis")) return "/images/course-hero/gis-mapping.webp";
        if (titleLower.includes("urban planning software")) return "/images/course-hero/urban-planning.webp";
        if (titleLower.includes("renewable energy systems")) return "/images/course-hero/renewable-energy.webp";
        if (titleLower.includes("environmental impact assessment")) return "/images/course-hero/environmental-impact.webp";
        if (titleLower.includes("sustainable agriculture")) return "/images/course-hero/sustainable-agriculture.webp";
        if (titleLower.includes("water resource management")) return "/images/course-hero/water-resource.webp";
        if (titleLower.includes("waste management solutions")) return "/images/course-hero/waste-management.webp";
        if (titleLower.includes("circular economy principles")) return "/images/course-hero/circular-economy.webp";
        if (titleLower.includes("corporate social responsibility")) return "/images/course-hero/csr.webp";
        if (titleLower.includes("ethical leadership")) return "/images/course-hero/ethical-leadership.webp";
        if (titleLower.includes("diversity and inclusion in workplace")) return "/images/course-hero/diversity-inclusion.webp";
        if (titleLower.includes("conflict resolution skills")) return "/images/course-hero/conflict-resolution.webp";
        if (titleLower.includes("emotional intelligence")) return "/images/course-hero/emotional-intelligence.webp";
        if (titleLower.includes("stress management techniques")) return "/images/course-hero/stress-management.webp";
        if (titleLower.includes("mindfulness and meditation")) return "/images/course-hero/mindfulness.webp";
        if (titleLower.includes("yoga and fitness instructor")) return "/images/course-hero/yoga-fitness.webp";
        if (titleLower.includes("nutrition and dietetics")) return "/images/course-hero/nutrition-dietetics.webp";
        if (titleLower.includes("holistic wellness coaching")) return "/images/course-hero/holistic-wellness.webp";
        if (titleLower.includes("first aid and cpr certification")) return "/images/course-hero/first-aid-cpr.webp";
        if (titleLower.includes("emergency preparedness")) return "/images/course-hero/emergency-preparedness.webp";
        if (titleLower.includes("disaster management")) return "/images/course-hero/disaster-management.webp";
        if (titleLower.includes("crisis communication")) return "/images/course-hero/crisis-communication.webp";
        if (titleLower.includes("public relations strategy")) return "/images/course-hero/public-relations.webp";
        if (titleLower.includes("media training")) return "/images/course-hero/media-training.webp";
        if (titleLower.includes("journalism and reporting")) return "/images/course-hero/journalism.webp";
        if (titleLower.includes("broadcast media production")) return "/images/course-hero/broadcast-media.webp";
        if (titleLower.includes("documentary filmmaking")) return "/images/course-hero/documentary-filmmaking.webp";
        if (titleLower.includes("screenwriting essentials")) return "/images/course-hero/screenwriting.webp";
        if (titleLower.includes("music production with ableton")) return "/images/course-hero/music-production.webp";
        if (titleLower.includes("audio engineering")) return "/images/course-hero/audio-engineering.webp";
        if (titleLower.includes("sound design for games")) return "/images/course-hero/sound-design-games.webp";
        if (titleLower.includes("voice acting techniques")) return "/images/course-hero/voice-acting.webp";
        if (titleLower.includes("animation principles")) return "/images/course-hero/animation-principles.webp";
        if (titleLower.includes("character design")) return "/images/course-hero/character-design.webp";
        if (titleLower.includes("storyboarding for film")) return "/images/course-hero/storyboarding.webp";
        if (titleLower.includes("concept art for games")) return "/images/course-hero/concept-art.webp";
        if (titleLower.includes("digital painting masterclass")) return "/images/course-hero/digital-painting.webp";
        if (titleLower.includes("illustration techniques")) return "/images/course-hero/illustration.webp";
        if (titleLower.includes("graphic design fundamentals")) return "/images/course-hero/graphic-design.webp";
        if (titleLower.includes("typography and layout")) return "/images/course-hero/typography-layout.webp";
        if (titleLower.includes("branding and identity design")) return "/images/course-hero/branding-identity.webp";
        if (titleLower.includes("packaging design")) return "/images/course-hero/packaging-design.webp";
        if (titleLower.includes("web design with wordpress")) return "/images/course-hero/web-design-wordpress.webp";
        if (titleLower.includes("shopify e-commerce store")) return "/images/course-hero/shopify-ecommerce.webp";
        if (titleLower.includes("wix website builder")) return "/images/course-hero/wix-website.webp";
        if (titleLower.includes("squarespace portfolio")) return "/images/course-hero/squarespace-portfolio.webp";
        if (titleLower.includes("html css javascript basics")) return "/images/course-hero/html-css-js.webp";
        if (titleLower.includes("react js development")) return "/images/course-hero/react-js.webp";
        if (titleLower.includes("angular framework")) return "/images/course-hero/angular-framework.webp";
        if (titleLower.includes("vue js essentials")) return "/images/course-hero/vue-js.webp";
        if (titleLower.includes("node js and express")) return "/images/course-hero/node-express.webp";
        if (titleLower.includes("python django framework")) return "/images/course-hero/python-django.webp";
        if (titleLower.includes("ruby on rails")) return "/images/course-hero/ruby-on-rails.webp";
        if (titleLower.includes("php laravel development")) return "/images/course-hero/php-laravel.webp";
        if (titleLower.includes("java spring boot")) return "/images/course-hero/java-spring-boot.webp";
        if (titleLower.includes("c# .net core")) return "/images/course-hero/csharp-net-core.webp";
        if (titleLower.includes("go language programming")) return "/images/course-hero/go-lang.webp";
        if (titleLower.includes("rust programming")) return "/images/course-hero/rust-programming.webp";
        if (titleLower.includes("kotlin for android")) return "/images/course-hero/kotlin-android.webp";
        if (titleLower.includes("swift for ios")) return "/images/course-hero/swift-ios.webp";
        if (catLower.includes("information technology") || catLower.includes("tech")) return "/images/course-hero/default-it.webp";
        if (catLower.includes("health") || catLower.includes("wellness")) return "/images/course-hero/default-health.webp";
        if (catLower.includes("language")) return "/images/course-hero/default-language.webp";
        if (catLower.includes("business") || catLower.includes("entrepreneurship")) return "/images/course-hero/default-business.webp";
        if (catLower.includes("management")) return "/images/course-hero/default-management.webp";
        if (catLower.includes("sales") || catLower.includes("marketing")) return "/images/course-hero/default-sales-marketing.webp";
        if (catLower.includes("engineering") || catLower.includes("construction")) return "/images/course-hero/default-engineering.webp";
        if (catLower.includes("teaching") || catLower.includes("academic")) return "/images/course-hero/default-teaching.webp";
        if (catLower.includes("personal development")) return "/images/course-hero/default-personal-dev.webp";
        if (catLower.includes("ai") || catLower.includes("artificial")) return "/images/course-hero/default-ai.webp";
        if (catLower.includes("media") || catLower.includes("entertainment")) return "/images/course-hero/default-media.webp";

        return "/images/course-hero/default-generic.webp"; // Fallback default image
    };

    const heroImage = getHeroImage(categoryName, title);

    // 1. Check if we have explicit details for this course
    const explicitDetails = allDetails.find(d => d.title === title);

    // 2. Define Default Values (Fallbacks)
    const defaultDetails = {
        overview: `${title} is a comprehensive program designed by industry experts to provide you with the skills and knowledge needed to excel in the field of ${categoryName}. This course covers everything from fundamental principles to advanced real-world applications, ensuring you build a robust professional portfolio.`,
        whatYouLearn: getCategoryOutcomes(categoryName, title),
        includes: [
            `${baseCourse.lessons || 20} High-Quality Video Lessons`,
            "Nexvera Hub Certificate of Completion",
            "Lifetime access to future updates",
            "Hands-on Real-world Projects",
            "Exclusive Community Support Access"
        ],
        highlights: [
            "Project-based learning",
            "Industry-recognized certification",
            "24/7 dedicated mentor support",
            "Lifetime access to course materials"
        ],
        prerequisites: [
            "Basic understanding of the subject area",
            "Motivation to learn and grow",
            "Access to a computer and internet connection"
        ],
        lessonStructure: [
            {
                title: "Module 1: Foundations & Core Concepts",
                topics: [`Introduction to ${title}`, "Industry Background", "Setting the Foundation", "Initial Assessment"]
            },
            {
                title: "Module 2: Essential Methodologies",
                topics: ["Key Frameworks", "Hands-on Practice", "Common Challenges", "Interactive Laboratory"]
            },
            {
                title: "Module 3: Strategic Implementation",
                topics: ["Mastering Complexity", "Case Study Analysis", "Optimization Strategies", "Expert Secrets"]
            },
            {
                title: "Module 4: Professional Capstone",
                topics: ["Capstone Project Brief", "Deployment Phase", "Final Review", "Certification Ceremony"]
            }
        ],
        reviewsList: [
            { user: "Sarah Jenkins", date: "2 months ago", comment: "Absolutely loved the depth of this course. The practical projects were exactly what I needed." },
            { user: "Michael Chen", date: "1 month ago", comment: "The instructor's explanations are very clear. Highly recommended for anyone looking to upskill." },
            { user: "Elena Rodriguez", date: "3 weeks ago", comment: "Nexvera Hub has the best curriculum structure. I feel much more confident in my skills now!" }
        ],
        faqs: [
            { q: "Is this course suitable for beginners?", a: "Yes, we start from the basics and gradually move to advanced topics." },
            { q: "Will I get a certificate?", a: "Absolutely! You will receive a verified certificate from Nexvera Hub upon successful completion." },
            { q: "How long do I have access to the course?", a: "You get lifetime access to all course materials and future updates." }
        ],
        certificationInfo: "Upon completion, you will earn the Official Nexvera Hub Certificate of Excellence, a globally recognized credential that validates your expertise in this domain. This certificate can be shared on LinkedIn and your professional portfolio.",
        roadmap: [
            { title: "Step 1: Foundational Intelligence", desc: `Gaining a deep understanding of ${title} architecture and core principles.` },
            { title: "Step 2: Practical Lab Simulation", desc: "Executing industry-grade workflows through structured technical laboratory sessions." },
            { title: "Step 3: Strategic Scaling", desc: "Optimizing theoretical models for high-performance real-world deployment." },
            { title: "Step 4: Professional Mastery", desc: "Finalizing your architectural project and securing your specialized certification." }
        ],
        projects: (() => {
            let count = 3;
            if (activeLevel === 'beginner') count = 2;
            else if (activeLevel === 'intermediate') count = 3;
            else count = 5;

            const projectNames = [
                "Initial Core Sprint", "Market Solution Design", "Scalable Enterprise Beta", 
                "Advanced Logic Optimization", "Final Industrial Capstone", "Global Implementation"
            ];

            const categoryLower = categoryName.toLowerCase();
            let toolsPool = ["Professional Skills", "Strategic Thinking", "Industry Standards", "Case Analysis", "Portfolio Sprint"];
            
            if (categoryLower.includes("information technology") || categoryLower.includes("tech") || categoryLower.includes("software") || categoryLower.includes("cloud") || categoryLower.includes("cyber") || categoryLower.includes("data")) {
                toolsPool = ["VS Code", "GitHub", "Terminal", "NPM Ecosystem", "REST API", "Docker Containers", "AWS Cloud", "System Design Tool"];
            } else if (categoryLower.includes("health") || categoryLower.includes("wellness") || categoryLower.includes("medical")) {
                toolsPool = ["Clinical Diagnostics", "Patient Care Module", "Health Data Analytics", "Medical Ethics Framework", "Therapeutic Planning", "Healthcare Informatics"];
            } else if (categoryLower.includes("business") || categoryLower.includes("management") || categoryLower.includes("sales") || categoryLower.includes("marketing")) {
                toolsPool = ["CRM Architecture", "Market Intelligence", "Financial Modeling", "Strategic SWOT", "KPI Dashboards", "Project Management Flow"];
            } else if (categoryLower.includes("language") || categoryLower.includes("translation")) {
                toolsPool = ["Phonemic Labs", "Grammar Logic", "Cultural Immersion", "Conversational AI", "Linguistic Framework", "Vocabulary Sprints"];
            }

            const getCategoryImage = () => {
                if (categoryLower.includes("information technology") || categoryLower.includes("tech") || categoryLower.includes("software") || categoryLower.includes("cloud") || categoryLower.includes("cyber") || categoryLower.includes("data")) return "/images/projects/it-tech.png";
                if (categoryLower.includes("health") || categoryLower.includes("wellness") || categoryLower.includes("medical")) return "/images/projects/health-wellness.png";
                if (categoryLower.includes("business") || categoryLower.includes("management") || categoryLower.includes("sales") || categoryLower.includes("marketing")) return "/images/projects/business-management.png";
                if (categoryLower.includes("language") || categoryLower.includes("translation") || categoryLower.includes("arts")) return "/images/projects/language-arts.png";
                return "/images/projects/it-tech.png"; // Fallback to IT
            };

            return Array.from({ length: count }, (_, i) => ({
                title: `${title}: ${projectNames[i % projectNames.length]}`,
                desc: `Build a professional-grade ${title} solution that demonstrates mastery of ${categoryName} principles in a real-world scenario.`,
                image: getCategoryImage(),
                tools: [toolsPool[i % toolsPool.length], toolsPool[(i + 1) % toolsPool.length], toolsPool[(i + 2) % toolsPool.length]]
            }));
        })(),
        relatedCourses: (() => {
            const courses = [];
            const otherCategories = categoryData.filter(cat => cat.name !== categoryName);

            // Try to get one course from each of the first 5 other categories
            otherCategories.slice(0, 5).forEach(cat => {
                if (cat.courses.length > 0) {
                    courses.push({
                        ...cat.courses[0],
                        category: cat.name
                    });
                }
            });

            // If we still need more to reach 5, fill from the same category
            if (courses.length < 5 && category) {
                category.courses
                    .filter(c => c.title !== title && !courses.some(rc => rc.title === c.title))
                    .slice(0, 5 - courses.length)
                    .forEach(c => courses.push({ ...c, category: categoryName }));
            }

            return courses.slice(0, 5);
        })()
    };

    // 3. Merge Logic: Explicit data wins, then defaults
    const finalDetails = {
        ...defaultDetails,
        ...explicitDetails,
        overview: (() => {
            const rawOverview = explicitDetails?.overview || defaultDetails.overview;
            
            // If it's already a rich object with levels, resolve the active one
            if (rawOverview && typeof rawOverview === 'object' && rawOverview[activeLevel]) {
                return rawOverview[activeLevel];
            }

            // Fallback: Generate a Universal Rich Overview for any of the 243 courses
            const isBeginner = activeLevel === 'beginner';
            const isIntermediate = activeLevel === 'intermediate';
            
            return {
                hook: isBeginner 
                    ? `Master the foundational intelligence of ${title}.` 
                    : isIntermediate 
                        ? `Elevate your ${title} expertise for the professional market.` 
                        : `Master the elite architectural strategies of ${title}.`,
                problem: typeof rawOverview === 'string' 
                    ? rawOverview 
                    : `Most practitioners of ${title} hit a ceiling because they lack the structured methodologies required for high-performance deployment.`,
                transformation: `We turn you into an authority. Transition from fragmented knowledge to technical mastery with a curriculum designed by industry experts.`,
                whatYouWillLearn: explicitDetails?.whatYouWillLearn?.slice(0, 4) || defaultDetails.whatYouLearn.slice(0, 4),
                whyChoose: `A curriculum focused on 'Industrial Excellence.' We bridge the gap between theory and the high-stakes demands of the global market.`,
                learningMethod: `Victory-driven, hands-on pedagogical approach with a focus on real-world capstone projects.`,
                outcomes: isBeginner 
                    ? `Confident in selecting and applying core ${title} principles in professional environments.` 
                    : `Capable of architecting and optimizing complex ${title} systems for corporate scale.`,
                closing: `The future belongs to the skilled in ${title}. Let's master it.`
            };
        })(),
        description: explicitDetails?.description || categoryMetadata.description,
        whatYouLearn: explicitDetails?.whatYouWillLearn || explicitDetails?.whatYouLearn || defaultDetails.whatYouLearn,
        lessonStructure: (() => {
            const getVarietyNum = (base, range) => base + (Math.floor(Math.random() * range));
            let count = 20;
            if (activeLevel === 'beginner') count = 8;
            else if (activeLevel === 'intermediate') count = getVarietyNum(12, 4);
            else count = getVarietyNum(20, 6);

            const courseSpecificTitles = [
                "Foundational Intelligence", "Core Methodologies", "Practical Lab Session", 
                "Technical Architecture", "Optimization Strategies", "Market-Ready Projects",
                "Advanced Logic", "Industry Standards", "Security Protocols", "Deployment Workflows",
                "High-Performance Design", "System Orchestration", "Final Capstone", "Specialized Deep-Dive"
            ];

            return Array.from({ length: count }, (_, i) => ({
                title: `Curriculum Module ${i + 1}: ${courseSpecificTitles[i % courseSpecificTitles.length]}`,
                topics: [] // Empty topics as per 'no expansion' request
            }));
        })(),
        lessonsCount: 0, // We'll use lessonStructure.length in the UI
        prerequisites: explicitDetails?.prerequisites || defaultDetails.prerequisites,
        targetAudience: explicitDetails?.targetAudience || defaultDetails.targetAudience,
        reviewsList: explicitDetails?.reviewsList || defaultDetails.reviewsList,
        faqs: explicitDetails?.faqs || defaultDetails.faqs
    };

    return {
        ...baseCourse,
        ...finalDetails,
        level: selectedLevel || determinedLevel,
        price,
        category: categoryName
    };
};
