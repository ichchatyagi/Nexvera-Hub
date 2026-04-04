import { itCoursesDetails } from "./itCourseDetails.js";

/**
 * categoryData
 * 
 * Groupings of courses by category for the home UI.
 * Now using the flat, schema-compliant course objects.
 */
export const categoryData = [
    {
        name: 'Information Technology',
        icon: 'Information Technology',
        courses: itCoursesDetails
    },
    // Addition categories can be populated from the main course repository similarly.
    {
        name: 'Artificial Intelligence',
        icon: 'Artificial Intelligence',
        courses: [] // To be populated from allCourses
    }
];
