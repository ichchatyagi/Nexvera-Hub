import React from 'react';
import { Rocket, Award, CheckCircle2, Briefcase, ShieldCheck, Cpu } from 'lucide-react';

export const faqDetailsData = {
    "how-to-start-learning": {
        title: "How do I start learning on Nexvera Hub?",
        category: "Getting Started",
        icon: Rocket,
        color: "from-blue-600 to-indigo-600",
        metallicGlow: "from-blue-400 via-white to-indigo-400",
        lastUpdated: "March 2026",
        content: (
            <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                <p>
                    Starting your learning journey on Nexvera Hub is designed to be straightforward and clear. We believe in removing barriers to education and helping you jump right into building real skills.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Your 4-Step Action Plan</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                            <div>
                                <strong className="text-slate-900 block mb-1">Create an Account</strong>
                                Sign up for a free Nexvera Hub account to access your personal dashboard. This will be your central hub for tracking progress and accessing materials.
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                            <div>
                                <strong className="text-slate-900 block mb-1">Explore the Catalog</strong>
                                Browse our course catalog. Whether you're interested in Front-End Development, Data Science, or UI/UX Design, we have structured paths for you.
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                            <div>
                                <strong className="text-slate-900 block mb-1">Enroll in a Track</strong>
                                Choose a course that aligns with your goals and enroll. Our courses range from beginner-friendly to advanced masterclasses.
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">4</div>
                            <div>
                                <strong className="text-slate-900 block mb-1">Start Building</strong>
                                Access the first module and begin your hands-on learning. Set up your development environment and write your first lines of code!
                            </div>
                        </li>
                    </ul>
                </div>
                <p>
                    Once enrolled, you'll immediately gain access to high-quality video lectures, interactive coding environments, and our supportive community discord server.
                </p>
                <p>
                    If you're unsure where to begin, check out our <strong>Learning Roadmaps</strong> section for guided paths tailored to specific career outcomes.
                </p>
            </div>
        )
    },
    "certification-details": {
        title: "Do I get certification after course completion?",
        category: "Certifications & Credentials",
        icon: Award,
        color: "from-emerald-500 to-teal-600",
        metallicGlow: "from-emerald-300 via-white to-teal-400",
        lastUpdated: "March 2026",
        content: (
            <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                <p>
                    <strong>Yes, absolutely.</strong> Upon successful completion of any premium course or career track on Nexvera Hub, you will receive an industry-recognized certificate of completion.
                </p>
                <div className="py-6 border-y border-slate-100 my-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">What makes our certificates valuable?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900">Verifiable Credentials</strong>
                                <span className="text-sm">Each certificate has a unique verification URL that employers can check.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Briefcase className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900">Portfolio Integration</strong>
                                <span className="text-sm">Certificates link directly to the portfolio of projects you built during the course.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900">Industry Aligned</strong>
                                <span className="text-sm">Curriculum designed in partnership with leading tech companies.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Cpu className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900">Skill Validation</strong>
                                <span className="text-sm">Proves you can actually build things, not just pass multiple-choice tests.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">Requirements for Certification</h3>
                <p>To ensure the integrity and value of our certificates, they are not handed out just for watching videos. You must complete the required coursework, including:</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>Watching at least 90% of all video lectures in the course.</li>
                    <li>Successfully passing all module quizzes and assessments.</li>
                    <li><strong>Crucially:</strong> Submitting the final capstone project and having it pass our internal review process.</li>
                </ul>
                <p>
                    Once these criteria are met, your certificate will be automatically generated and available in your dashboard for download or adding to your LinkedIn profile.
                </p>
            </div>
        )
    },
    "project-inclusion": {
        title: "Are projects included in the courses?",
        category: "Curriculum & Projects",
        icon: Cpu,
        color: "from-purple-600 to-violet-700",
        metallicGlow: "from-purple-400 via-white to-violet-400",
        lastUpdated: "March 2026",
        content: (
            <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                <p>
                    <strong>Yes, projects aren't just included—they are the core focus of Nexvera Hub.</strong> We strongly believe in project-based learning. You don't learn to code by passively watching videos; you learn by building real things and solving real problems.
                </p>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-3xl border border-purple-100 my-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">The Nexvera Project Hierarchy</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2 tracking-tight">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                Mini-Projects (Module Level)
                            </h4>
                            <p className="text-sm text-slate-600">Small, focused assignments designed to reinforce specific concepts taught in a single module (e.g., building a simple calculator after learning JavaScript functions).</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2 tracking-tight">
                                <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                                Guided Projects (Section Level)
                            </h4>
                            <p className="text-sm text-slate-600">Larger projects built step-by-step alongside the instructor. These combine multiple concepts into a cohesive application (e.g., a weather dashboard using APIs).</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-violet-900 flex items-center gap-2 mb-2 tracking-tight">
                                <div className="w-6 h-6 rounded-full bg-violet-700"></div>
                                Capstone Projects (Course Level)
                            </h4>
                            <p className="text-sm text-slate-600">Massive, real-world portfolio pieces built entirely independently based on a set of requirements. These are the projects that will get you hired (e.g., a full-stack e-commerce platform with authentication and payment processing).</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">Why is this important?</h3>
                <p>
                    When you apply for a job, employers care far more about your portfolio than anything else. By the time you finish a career track at Nexvera Hub, you will have a comprehensive portfolio of professional-grade applications to showcase.
                </p>
                <p>
                    Furthermore, building projects forces you to confront the realities of development: reading documentation, debugging messy errors, architecture planning, and deployment. This "struggle" is where real learning happens.
                </p>
            </div>
        )
    }
};
