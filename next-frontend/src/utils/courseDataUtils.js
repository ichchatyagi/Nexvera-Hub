import { categoryData } from '../data/categoryData';
import { itCoursesDetails, itCoursesDetailsPart2 } from '../data/itCourseDetails';

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
        const generatedSlug = c.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        return generatedSlug === slug;
    });
};

export const getCourseDetails = (categoryName, title) => {
    // Find the base course info from categoryData to preserve icon/color/instructor
    const category = categoryData.find(cat => cat.name === categoryName);
    const baseCourse = category?.courses.find(c => c.title === title) || {
        instructor: "Expert Instructor",
        rating: 4.8,
        reviews: "1.2k",
        color: "from-blue-600 to-indigo-700",
        icon: "✨",
        lessons: 20
    };

    // 1. Check if we have explicit details for this course
    const explicitDetails = allDetails.find(d => d.title === title);

    // 2. Define Default Values (Fallbacks)
    const defaultDetails = {
        overview: `${title} is a comprehensive program designed by industry experts to provide you with the skills and knowledge needed to excel in the field of ${categoryName}. This course covers everything from fundamental principles to advanced real-world applications, ensuring you build a robust professional portfolio.`,
        whatYouLearn: [
            `Master the core concepts and advanced techniques of ${title}`,
            "Understand industry-standard tools and workflows",
            "Develop practical, hands-on skills through real-world projects",
            "Learn best practices from experienced professionals",
            "Collaborate on peer-reviewed assignments and case studies"
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
                title: "Module 1: Introduction & Fundamentals",
                topics: ["Course Overview", "Core Concepts", "Setting the Foundation", "Initial Assessment"]
            },
            {
                title: "Module 2: Essential Tools & Techniques",
                topics: ["Key Methodologies", "Hands-on Practice", "Common Challenges", "Interactive Laboratory"]
            },
            {
                title: "Module 3: Advanced Applications",
                topics: ["Mastering Complexity", "Case Study Analysis", "Optimization Strategies", "Expert Secrets"]
            },
            {
                title: "Module 4: Final Project & Certification",
                topics: ["Capstone Project Brief", "Implementation Phase", "Final Review", "Certification Ceremony"]
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
            { title: "Phase 1: Concepts", desc: "Understanding the core architecture and fundamental principles." },
            { title: "Phase 2: Practice", desc: "Applying theoretical knowledge through structured laboratory sessions." },
            { title: "Phase 3: Mastery", desc: "Optimizing skills for professional performance and real-world deployment." }
        ],
        projects: [
            { title: "Foundational Capstone", desc: "Build a solid project that demonstrates your understanding of core concepts." },
            { title: "Real-world Simulation", desc: "Solve a professional-grade problem using the techniques learned in this course." }
        ],
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
        // Map common field name differences
        whatYouLearn: explicitDetails?.whatYouWillLearn || explicitDetails?.whatYouLearn || defaultDetails.whatYouLearn,
        highlights: explicitDetails?.courseHighlights || explicitDetails?.highlights || defaultDetails.highlights,
        certificationInfo: explicitDetails?.certification || explicitDetails?.certificationInfo || defaultDetails.certificationInfo,
        lessonStructure: explicitDetails?.lessonStructure || (explicitDetails?.lessons && Array.isArray(explicitDetails.lessons) && explicitDetails.lessons.map(l => ({ title: l, topics: ["Introduction", "Core Concepts", "Practice Session"] }))) || defaultDetails.lessonStructure
    };

    return {
        ...baseCourse,
        ...finalDetails,
        category: categoryName
    };
};
