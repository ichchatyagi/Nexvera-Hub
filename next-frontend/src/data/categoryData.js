import { itCoursesDetails } from "./itCourseDetails.js";

/**
 * categoryData
 * 
 * Groupings of courses by category for the home UI.
 */
export const categoryData = [
    {
        name: 'Information Technology',
        icon: 'Information Technology',
        courses: itCoursesDetails.filter(c =>
            c.title.includes('Cyber') ||
            c.title.includes('AWS') ||
            c.title.includes('Networking') ||
            c.title.includes('DevOps') ||
            c.title.includes('Ethical Hacking')
        )
    },
    {
        name: 'Sales and Marketing',
        icon: 'Sales & Marketing',
        courses: []
    },
    {
        name: 'Artificial Intelligence',
        icon: 'Artificial Intelligence',
        courses: itCoursesDetails.filter(c => c.title.includes('Python'))
    },
    {
        name: 'Data Science',
        icon: '📈',
        courses: itCoursesDetails.filter(c => c.title.includes('SQL'))
    },
    {
        name: 'Design',
        icon: '🎨',
        courses: itCoursesDetails.filter(c => c.title.includes('Web Development') || c.title.includes('Mobile'))
    },
    {
        name: 'Languages',
        icon: 'Language Learning',
        courses: []
    },
    {
        name: 'Business',
        icon: 'Business & Entrepreneurship',
        courses: []
    },
    {
        name: 'Entrepreneurship',
        icon: '🚀',
        courses: []
    }
];
