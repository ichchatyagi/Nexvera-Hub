export const guidesData = [
    {
        slug: "beginners-guide-to-web-development",
        title: "Beginner's Guide to Web Development",
        category: "Programming",
        time: "15 Min",
        excerpt: "A complete roadmap for aspiring web developers. Learn about frontend, backend, and full-stack paths.",
        color: "from-blue-600 to-indigo-700",
        content: [
            {
                title: "Introduction to the Web",
                text: "Web development is the process of creating websites and applications for the internet. It ranges from plain text pages to complex social networks and apps."
            },
            {
                title: "The Frontend: What Users See",
                text: "Frontend development focuses on the visual aspects of a website. Core technologies include HTML (structure), CSS (styling), and JavaScript (interactivity)."
            },
            {
                title: "The Backend: The Engine Room",
                text: "Backend development involves the server-side logic, databases, and APIs that power the frontend. Common languages include Node.js, Python, and Ruby."
            },
            {
                title: "Full-Stack Development",
                text: "Full-stack developers are proficient in both frontend and backend technologies, allowing them to build entire applications from start to finish."
            }
        ],
        resources: [
            { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
            { name: "freeCodeCamp", url: "https://www.freecodecamp.org" }
        ]
    },
    {
        slug: "introduction-to-python-programming",
        title: "Introduction to Python Programming",
        category: "Technology",
        time: "20 Min",
        excerpt: "Master the basics of Python including syntax, data structures, and simple algorithms.",
        color: "from-emerald-600 to-teal-700",
        content: [
            {
                title: "Why Python?",
                text: "Python is one of the world's most popular languages due to its simple syntax, versatility, and massive community support."
            },
            {
                title: "Basic Syntax & Variables",
                text: "Learn how to declare variables, use different data types (strings, integers, floats), and perform basic arithmetic operations."
            },
            {
                title: "Control Flow",
                text: "Master if-else statements, for loops, and while loops to control the logic of your programs effectively."
            }
        ],
        resources: [
            { name: "Python.org", url: "https://www.python.org" },
            { name: "Real Python", url: "https://realpython.com" }
        ]
    },
    {
        slug: "how-to-build-your-first-portfolio-website",
        title: "How to Build Your First Portfolio Website",
        category: "Projects",
        time: "25 Min",
        excerpt: "Step-by-step tutorial on creating and deploying a professional portfolio to showcase your talent.",
        color: "from-fuchsia-600 to-pink-700",
        content: [
            {
                title: "Planning Your Content",
                text: "A great portfolio should feature your best projects, an 'About Me' section, and clear contact information."
            },
            {
                title: "Choosing Your Tech Stack",
                text: "Decide whether to use plain HTML/CSS, a framework like React, or a site builder like Webflow or Framer."
            }
        ],
        resources: [
            { name: "Netlify", url: "https://www.netlify.com" },
            { name: "GitHub Pages", url: "https://pages.github.com" }
        ]
    },
    {
        slug: "top-skills-needed-for-a-tech-career",
        title: "Top Skills Needed for a Tech Career",
        category: "Career Tips",
        time: "12 Min",
        excerpt: "Discover the most in-demand technical and soft skills prioritized by top tech recruiters today.",
        color: "from-blue-700 to-blue-900",
        content: [
            {
                title: "Technical Proficiency",
                text: "Focus on core programming languages, version control with Git, and understanding cloud fundamentals."
            },
            {
                title: "Soft Skills Matter",
                text: "Communication, problem-solving, and adaptability are often as important as technical skills in a team environment."
            }
        ],
        resources: [
            { name: "LinkedIn Learning", url: "https://www.linkedin.com/learning" }
        ]
    },
    {
        slug: "beginners-guide-to-data-science",
        title: "Beginner’s Guide to Data Science",
        category: "Technology",
        time: "18 Min",
        excerpt: "An entry-level overview of data analysis, machine learning foundations, and data ecosystem.",
        color: "from-indigo-600 to-purple-800",
        content: [
            {
                title: "What is Data Science?",
                text: "Data science combines statistics, programming, and domain expertise to extract meaningful insights from data."
            },
            {
                title: "The Data Pipeline",
                text: "Understand the stages: Data collection, cleaning, exploration, modeling, and visualization."
            }
        ],
        resources: [
            { name: "Kaggle", url: "https://www.kaggle.com" },
            { name: "Towards Data Science", url: "https://towardsdatascience.com" }
        ]
    },
    {
        slug: "react-state-management-basics",
        title: "React State Management Basics",
        category: "Programming",
        time: "15 Min",
        excerpt: "Deep dive into useState, useEffect and more for modern React development.",
        color: "from-blue-500 to-indigo-600",
        content: [
            {
                title: "What is State?",
                text: "State represents the dynamic parts of your application that change over time based on user interaction."
            },
            {
                title: "useState & useEffect Hooks",
                text: "These are the fundamental building blocks for managing local state and side effects in functional components."
            }
        ],
        resources: [
            { name: "React Documentation", url: "https://react.dev" }
        ]
    },
    {
        slug: "ui-ux-design-process",
        title: "UI/UX Design Process",
        category: "Projects",
        time: "20 Min",
        excerpt: "From wireframing to high-fidelity prototypes. A guide for designers.",
        color: "from-amber-500 to-orange-600",
        content: [
            {
                title: "Understanding Users",
                text: "Research and personas are the first step to creating designs that truly solve user problems."
            },
            {
                title: "Wireframing vs. Prototyping",
                text: "Wireframes focus on layout and structure, while prototypes add details, color, and interactivity."
            }
        ],
        resources: [
            { name: "Figma", url: "https://www.figma.com" },
            { name: "Nielsen Norman Group", url: "https://www.nngroup.com" }
        ]
    },
    {
        slug: "node-js-api-architecture",
        title: "Node.js API Architecture",
        category: "Programming",
        time: "25 Min",
        excerpt: "Building scalable and performant backends with Node.js and Express.",
        color: "from-emerald-500 to-teal-600",
        content: [
            {
                title: "RESTful Principles",
                text: "Learn how to design clean, predictable, and scalable APIs using standard HTTP methods."
            },
            {
                title: "Middleware & Routing",
                text: "Express middleware allows you to handle authentication, logging, and error handling globally."
            }
        ],
        resources: [
            { name: "Node.js Docs", url: "https://nodejs.org" }
        ]
    },
    {
        slug: "cloud-deployment-with-aws",
        title: "Cloud Deployment with AWS",
        category: "Technology",
        time: "30 Min",
        excerpt: "Deploying your apps to the modern cloud using AWS services.",
        color: "from-purple-500 to-violet-600",
        content: [
            {
                title: "Introduction to AWS",
                text: "AWS provides a massive array of services like EC2 for compute and S3 for storage."
            },
            {
                title: "CI/CD Pipelines",
                text: "Automate your deployment process so every code change is tested and pushed to production seamlessly."
            }
        ],
        resources: [
            { name: "AWS Training", url: "https://explore.skillbuilder.aws" }
        ]
    },
    {
        slug: "agile-software-development",
        title: "Agile Software Development",
        category: "Career Tips",
        time: "15 Min",
        excerpt: "Mastering scrum and team productivity in a modern tech environment.",
        color: "from-pink-500 to-rose-600",
        content: [
            {
                title: "The Agile Manifesto",
                text: "Individuals and interactions over processes and tools. Working software over comprehensive documentation."
            },
            {
                title: "Scrum Ceremonies",
                text: "Learn about Daily Standups, Sprint Planning, and Retrospectives to keep teams aligned."
            }
        ],
        resources: [
            { name: "Atlassian Agile Coach", url: "https://www.atlassian.com/agile" }
        ]
    },
    {
        slug: "responsive-css-frameworks",
        title: "Responsive CSS Frameworks",
        category: "Projects",
        time: "18 Min",
        excerpt: "Comparing Tailwind, Bootstrap and more for modern web design.",
        color: "from-blue-400 to-cyan-600",
        content: [
            {
                title: "Utility-First CSS",
                text: "Tailwind CSS has revolutionized styling by using small, utility classes instead of monolithic CSS files."
            },
            {
                title: "Component-Based Frameworks",
                text: "Frameworks like Bootstrap provide pre-designed components that speed up development for standard UI patterns."
            }
        ],
        resources: [
            { name: "Tailwind CSS", url: "https://tailwindcss.com" },
            { name: "Bootstrap", url: "https://getbootstrap.com" }
        ]
    }
];
