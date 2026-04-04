import { itCoursesDetails } from "./itCourseDetails.js";

/**
 * allCourses
 * 
 * Centralized repository for all courses in the catalog.
 * Follows the Backend Course Schema.
 */
export const allCourses = [
    ...itCoursesDetails,
    // Other categories can be added here
];

export default allCourses;
