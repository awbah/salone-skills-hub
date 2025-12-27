/* prisma/seed.ts */
import { PrismaClient, Role, Pathway, JobType, JobStatus, ContractStatus, MilestoneStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use DIRECT_URL for seeding (bypasses connection pooler)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function seedRegionsAndDistricts() {
    // 5 regions, 16 districts
    const regions: Record<string, string[]> = {
        "Eastern": ["Kailahun", "Kenema", "Kono"],
        "Northern": ["Bombali", "Falaba", "Koinadugu", "Tonkolili"],
        "North West": ["Kambia", "Karene", "Port Loko"],
        "Southern": ["Bo", "Bonthe", "Moyamba", "Pujehun"],
        "Western Area": ["Western Area Rural", "Western Area Urban"],
    };

    for (const [regionName, dists] of Object.entries(regions)) {
        const region = await prisma.regionSL.upsert({
            where: { name: regionName },
            update: {},
            create: { name: regionName },
        });

        for (const name of dists) {
            await prisma.districtSL.upsert({
                where: { name_regionId: { name, regionId: region.id } },
                update: {},
                create: { name, regionId: region.id },
            });
        }
    }

    const westernArea = await prisma.regionSL.findUnique({ where: { name: "Western Area" } });
    let wau: { id: number } | null = null;
    if (westernArea) {
        const found = await prisma.districtSL.findFirst({
            where: { name: "Western Area Urban", regionId: westernArea.id },
            select: { id: true },
        });
        wau = found;
    }
    return { westernAreaId: westernArea?.id ?? null, westernAreaUrbanId: wau?.id ?? null };
}

async function seedSkills() {
    const skills: [slug: string, name: string][] = [
        // Technical Skills
        ["frontend-development", "Front-end Development"],
        ["backend-development", "Back-end Development"],
        ["fullstack-development", "Full-stack Development"],
        ["mobile-development", "Mobile Development"],
        ["ui-ux-design", "UI/UX Design"],
        ["graphic-design", "Graphic Design"],
        ["web-design", "Web Design"],
        ["data-entry", "Data Entry"],
        ["data-analysis", "Data Analysis"],
        ["database-management", "Database Management"],
        ["cloud-computing", "Cloud Computing"],
        ["cybersecurity", "Cybersecurity"],
        
        // Business & Marketing
        ["digital-marketing", "Digital Marketing"],
        ["social-media-marketing", "Social Media Marketing"],
        ["content-writing", "Content Writing"],
        ["copywriting", "Copywriting"],
        ["seo", "SEO (Search Engine Optimization)"],
        ["business-development", "Business Development"],
        ["project-management", "Project Management"],
        ["customer-service", "Customer Service"],
        
        // Creative Skills
        ["video-editing", "Video Editing"],
        ["photography", "Photography"],
        ["animation", "Animation"],
        ["illustration", "Illustration"],
        
        // Professional Skills
        ["accounting", "Accounting"],
        ["bookkeeping", "Bookkeeping"],
        ["financial-analysis", "Financial Analysis"],
        ["human-resources", "Human Resources"],
        ["administration", "Administration"],
        
        // Artisan Skills
        ["tailoring", "Tailoring"],
        ["welding", "Welding"],
        ["carpentry", "Carpentry"],
        ["electrical-work", "Electrical Work"],
        ["plumbing", "Plumbing"],
        ["masonry", "Masonry"],
        
        // Other Skills
        ["translation", "Translation"],
        ["tutoring", "Tutoring"],
        ["event-planning", "Event Planning"],
        ["catering", "Catering"],
    ];

    for (const [slug, name] of skills) {
        await prisma.skill.upsert({
            where: { slug },
            update: { name },
            create: { slug, name },
        });
    }
    
    console.log(`✅ Seeded ${skills.length} skills`);
}

async function seedUsersAndDomain(opts: {
    westernAreaId: number | null;
    westernAreaUrbanId: number | null;
}) {
    const { westernAreaId, westernAreaUrbanId } = opts;

    /* ---------- Admin ---------- */
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@skillshub.sl";
    const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";
    const adminHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: Role.ADMIN,
            isEmailVerified: true,
        },
        create: {
            email: adminEmail,
            username: adminUsername,
            password: adminHash,
            role: Role.ADMIN,
            firstName: "System",
            lastName: "Admin",
            isEmailVerified: true,
            addresses: westernAreaId
                ? {
                    create: [{
                        addressLine1: "Administration",
                        city: "Freetown",
                        regionId: westernAreaId ?? undefined,
                        districtId: westernAreaUrbanId ?? undefined,
                        postalCode: "232",
                    }],
                }
                : undefined,
        },
    });

    /* ---------- Employers ---------- */
    const employers = [
        {
            email: "employer@skillshub.sl",
            username: "employer1",
            password: "Employer@123",
            firstName: "Ada",
            lastName: "Kanu",
            orgName: "Salone Digital Co.",
            orgType: "Startup",
            website: "https://salonedigital.example",
            verified: true,
        },
        {
            email: "hr@salonetech.sl",
            username: "salonetech",
            password: "Employer@123",
            firstName: "Mohamed",
            lastName: "Sesay",
            orgName: "Salone Tech Solutions",
            orgType: "Technology Company",
            website: "https://salonetech.example",
            verified: true,
        },
        {
            email: "info@greenleaf.sl",
            username: "greenleaf",
            password: "Employer@123",
            firstName: "Fatmata",
            lastName: "Turay",
            orgName: "GreenLeaf NGO",
            orgType: "NGO",
            website: "https://greenleaf.example",
            verified: false,
        },
        {
            email: "contact@westcoast.sl",
            username: "westcoast",
            password: "Employer@123",
            firstName: "Ibrahim",
            lastName: "Kamara",
            orgName: "West Coast Trading",
            orgType: "Business",
            website: "https://westcoast.example",
            verified: true,
        },
    ];

    const createdEmployers = [];
    for (const emp of employers) {
        const hash = await bcrypt.hash(emp.password, 12);
        const employer = await prisma.user.upsert({
            where: { email: emp.email },
            update: {},
            create: {
                email: emp.email,
                username: emp.username,
                password: hash,
                firstName: emp.firstName,
                lastName: emp.lastName,
            role: Role.EMPLOYER,
            isEmailVerified: true,
            addresses: westernAreaId
                ? {
                    create: [{
                            addressLine1: "Business District",
                        city: "Freetown",
                        regionId: westernAreaId ?? undefined,
                        districtId: westernAreaUrbanId ?? undefined,
                        postalCode: "232",
                    }],
                }
                : undefined,
            employerProfile: {
                create: {
                        orgName: emp.orgName,
                        orgType: emp.orgType,
                        website: emp.website,
                        verified: emp.verified,
                    },
            },
        },
        include: { employerProfile: true },
    });

        // Ensure employerProfile exists
    let employerProfile = employer.employerProfile;
    if (!employerProfile) {
        employerProfile = await prisma.employerProfile.upsert({
            where: { userId: employer.id },
            update: {},
            create: {
                userId: employer.id,
                    orgName: emp.orgName,
                    orgType: emp.orgType,
                    website: emp.website,
                    verified: emp.verified,
            },
        });
    }

        createdEmployers.push({ user: employer, profile: employerProfile });
    }

    console.log(`✅ Seeded ${createdEmployers.length} employers`);

    /* ---------- Job Seekers ---------- */
    const seekers = [
        {
            email: "seeker@skillshub.sl",
            username: "seeker1",
            password: "Seeker@123",
            firstName: "Mariama",
            lastName: "Kamara",
            pathway: Pathway.GRADUATE,
            profession: "Front-end Developer",
            headline: "React + Tailwind junior developer",
            bio: "Passionate about building clean UIs and learning fast. Graduated from University of Sierra Leone with a degree in Computer Science.",
            yearsExperience: 1,
            availability: "Weekdays",
            skills: ["frontend-development", "ui-ux-design"],
            city: "Freetown",
        },
        {
            email: "ahmed@skillshub.sl",
            username: "ahmedk",
            password: "Seeker@123",
            firstName: "Ahmed",
            lastName: "Koroma",
            pathway: Pathway.STUDENT,
            profession: "Web Developer",
            headline: "Student developer building real-world projects",
            bio: "Computer Science student at Njala University. Seeking part-time opportunities to gain experience while studying.",
            yearsExperience: 0,
            availability: "Evenings & Weekends",
            skills: ["fullstack-development", "web-design"],
            city: "Bo",
        },
        {
            email: "isatu@skillshub.sl",
            username: "isatu",
            password: "Seeker@123",
            firstName: "Isatu",
            lastName: "Conteh",
            pathway: Pathway.ARTISAN,
            profession: "Tailor",
            headline: "Experienced tailor specializing in traditional and modern designs",
            bio: "Over 8 years of experience in tailoring and fashion design. Skilled in creating custom garments for all occasions.",
            yearsExperience: 8,
            availability: "Flexible",
            skills: ["tailoring"],
            city: "Kenema",
        },
        {
            email: "musa@skillshub.sl",
            username: "musab",
            password: "Seeker@123",
            firstName: "Musa",
            lastName: "Bangura",
            pathway: Pathway.GRADUATE,
            profession: "Digital Marketer",
            headline: "Creative marketer with proven track record",
            bio: "Marketing graduate with expertise in social media marketing, content creation, and brand management.",
            yearsExperience: 2,
            availability: "Full-time",
            skills: ["digital-marketing", "social-media-marketing", "content-writing"],
            city: "Freetown",
        },
        {
            email: "hawa@skillshub.sl",
            username: "hawaj",
            password: "Seeker@123",
            firstName: "Hawa",
            lastName: "Jalloh",
            pathway: Pathway.GRADUATE,
            profession: "Graphic Designer",
            headline: "Creative designer bringing ideas to life",
            bio: "Talented graphic designer specializing in branding, logo design, and marketing materials. Adobe Creative Suite expert.",
            yearsExperience: 3,
            availability: "Full-time",
            skills: ["graphic-design", "ui-ux-design", "illustration"],
            city: "Freetown",
        },
        {
            email: "alhaji@skillshub.sl",
            username: "alhaji",
            password: "Seeker@123",
            firstName: "Alhaji",
            lastName: "Sankoh",
            pathway: Pathway.ARTISAN,
            profession: "Welder",
            headline: "Skilled welder and metal fabricator",
            bio: "Experienced welder specializing in structural steel, gates, and custom metalwork. Available for residential and commercial projects.",
            yearsExperience: 10,
            availability: "Flexible",
            skills: ["welding"],
            city: "Makeni",
        },
    ];

    const createdSeekers = [];
    for (const seek of seekers) {
        const hash = await bcrypt.hash(seek.password, 12);
        const seeker = await prisma.user.upsert({
            where: { email: seek.email },
            update: {},
            create: {
                email: seek.email,
                username: seek.username,
                password: hash,
                firstName: seek.firstName,
                lastName: seek.lastName,
            role: Role.JOB_SEEKER,
            isEmailVerified: true,
            addresses: westernAreaId
                ? {
                    create: [{
                            addressLine1: seek.city,
                            city: seek.city,
                        regionId: westernAreaId ?? undefined,
                        districtId: westernAreaUrbanId ?? undefined,
                        postalCode: "232",
                    }],
                }
                : undefined,
            seekerProfile: {
                create: {
                        pathway: seek.pathway,
                        profession: seek.profession,
                        headline: seek.headline,
                        bio: seek.bio,
                        yearsExperience: seek.yearsExperience,
                        availability: seek.availability,
                    },
            },
        },
        include: { seekerProfile: true },
    });

        let seekerProfile = seeker.seekerProfile;
        if (!seekerProfile) {
            seekerProfile = await prisma.seekerProfile.upsert({
            where: { userId: seeker.id },
            update: {},
            create: {
                userId: seeker.id,
                    pathway: seek.pathway,
                    profession: seek.profession,
                    headline: seek.headline,
                    yearsExperience: seek.yearsExperience,
                    availability: seek.availability,
                },
            });
        }

        // Attach skills
        const skillIds = await prisma.skill.findMany({
            where: { slug: { in: seek.skills } },
        select: { id: true },
    });
        for (const skill of skillIds) {
        await prisma.skillOnProfile.upsert({
                where: { profileId_skillId: { profileId: seekerProfile.id, skillId: skill.id } },
            update: {},
                create: {
                    profileId: seekerProfile.id,
                    skillId: skill.id,
                    level: seek.yearsExperience > 3 ? 4 : seek.yearsExperience > 1 ? 3 : 2,
                },
            });
        }

        createdSeekers.push({ user: seeker, profile: seekerProfile });
    }

    console.log(`✅ Seeded ${createdSeekers.length} job seekers`);

    /* ---------- Jobs ---------- */
    const jobs = [
        {
            employerProfileId: createdEmployers[0].profile.id,
            title: "Junior Front-end Developer (React + Tailwind)",
            description: "We're looking for a motivated junior front-end developer to join our growing team. You'll work on building modern, responsive web applications using React and Tailwind CSS. This is a full-time position with opportunities for growth and learning.",
            type: JobType.FULL_TIME,
            location: "Freetown / Hybrid",
            salaryRange: "3,000,000 – 5,000,000 SLL",
            status: JobStatus.OPEN,
            skills: ["frontend-development", "ui-ux-design"],
        },
        {
            employerProfileId: createdEmployers[1].profile.id,
            title: "Full-stack Developer",
            description: "Join our tech team as a full-stack developer. You'll work on both front-end and back-end development, building scalable web applications. We use modern technologies including Node.js, React, and PostgreSQL.",
            type: JobType.FULL_TIME,
            location: "Freetown",
            salaryRange: "5,000,000 – 8,000,000 SLL",
            status: JobStatus.OPEN,
            skills: ["fullstack-development", "backend-development", "database-management"],
        },
        {
            employerProfileId: createdEmployers[0].profile.id,
            title: "Graphic Designer - Part-time",
            description: "Seeking a creative graphic designer for part-time work. You'll create marketing materials, social media graphics, and branding assets. Must be proficient in Adobe Creative Suite.",
            type: JobType.PART_TIME,
            location: "Remote",
            salaryRange: "1,500,000 – 2,500,000 SLL",
            status: JobStatus.OPEN,
            skills: ["graphic-design", "web-design"],
        },
        {
            employerProfileId: createdEmployers[2].profile.id,
            title: "Social Media Manager",
            description: "We need an experienced social media manager to handle our organization's online presence. Responsibilities include content creation, community engagement, and campaign management.",
            type: JobType.FULL_TIME,
            location: "Bo / Remote",
            salaryRange: "2,500,000 – 4,000,000 SLL",
            status: JobStatus.OPEN,
            skills: ["social-media-marketing", "content-writing", "digital-marketing"],
        },
        {
            employerProfileId: createdEmployers[3].profile.id,
            title: "Web Developer Intern",
            description: "Great opportunity for students or recent graduates! We're offering an internship program where you'll learn web development while working on real projects under mentorship.",
            type: JobType.INTERNSHIP,
            location: "Freetown",
            salaryRange: "500,000 – 1,000,000 SLL",
            status: JobStatus.OPEN,
            skills: ["web-design", "frontend-development"],
        },
        {
            employerProfileId: createdEmployers[1].profile.id,
            title: "Custom Metal Gate Fabrication",
            description: "Looking for an experienced welder to fabricate custom metal gates for residential properties. Must be able to work from designs and ensure quality finish.",
            type: JobType.GIG,
            location: "Freetown",
            salaryRange: "Negotiable",
            status: JobStatus.OPEN,
            skills: ["welding"],
        },
        {
            employerProfileId: createdEmployers[0].profile.id,
            title: "Data Entry Specialist",
            description: "Part-time data entry position. You'll be responsible for accurately entering and organizing data into our systems. Must be detail-oriented and fast typist.",
            type: JobType.PART_TIME,
            location: "Remote",
            salaryRange: "1,000,000 – 1,500,000 SLL",
            status: JobStatus.OPEN,
            skills: ["data-entry"],
        },
        {
            employerProfileId: createdEmployers[2].profile.id,
            title: "Tailor for Custom Apparel",
            description: "Seeking a skilled tailor to create custom traditional and modern clothing. Must have experience with various fabrics and attention to detail.",
            type: JobType.GIG,
            location: "Kenema",
            salaryRange: "Negotiable",
            status: JobStatus.OPEN,
            skills: ["tailoring"],
        },
    ];

    const createdJobs = [];
    for (const jobData of jobs) {
        const skillIds = await prisma.skill.findMany({
            where: { slug: { in: jobData.skills } },
            select: { id: true },
        });

        const job = await prisma.job.create({
            data: {
                employerId: jobData.employerProfileId,
                title: jobData.title,
                description: jobData.description,
                type: jobData.type,
                location: jobData.location,
                salaryRange: jobData.salaryRange,
                status: jobData.status,
            skills: {
                    create: skillIds.map(s => ({ skillId: s.id, required: true })),
                },
        },
    });

        createdJobs.push(job);
    }

    console.log(`✅ Seeded ${createdJobs.length} jobs`);

    /* ---------- Files (using S3 bucket structure) ---------- */
    const files = [
        {
            id: "seed-cv-mariama",
            bucketKey: "profiles/resumes/cv-mariama-kamara.pdf",
            contentType: "application/pdf",
            sizeBytes: 245760, // 240KB
        },
        {
            id: "seed-cover-mariama",
            bucketKey: "applications/cover-letters/cover-mariama-kamara.txt",
            contentType: "text/plain",
            sizeBytes: 2048, // 2KB
        },
        {
            id: "seed-cv-ahmed",
            bucketKey: "profiles/resumes/cv-ahmed-koroma.pdf",
            contentType: "application/pdf",
            sizeBytes: 215040, // 210KB
        },
        {
            id: "seed-cv-musa",
            bucketKey: "profiles/resumes/cv-musa-bangura.pdf",
            contentType: "application/pdf",
            sizeBytes: 266240, // 260KB
        },
        {
            id: "seed-portfolio-hawa",
            bucketKey: "profiles/portfolio/hawa-jalloh-designs.pdf",
            contentType: "application/pdf",
            sizeBytes: 3072000, // 3MB
        },
    ];

    const createdFiles = [];
    for (const fileData of files) {
        const file = await prisma.fileObject.upsert({
            where: { id: fileData.id },
        update: {},
        create: {
                id: fileData.id,
                bucketKey: fileData.bucketKey,
                contentType: fileData.contentType,
                sizeBytes: fileData.sizeBytes,
            },
        });
        createdFiles.push(file);
    }

    // Link resume to Mariama's profile
    if (createdSeekers[0]?.profile) {
        await prisma.seekerProfile.update({
            where: { id: createdSeekers[0].profile.id },
            data: { resumeFileId: createdFiles[0].id },
        });
    }

    console.log(`✅ Seeded ${createdFiles.length} file records`);

    /* ---------- Applications ---------- */
    const applications = [
        {
            jobId: createdJobs[0].id,
            userId: createdSeekers[0].user.id,
            status: "APPLIED" as const,
            coverLetterText: "I'm excited to contribute to your front-end team. With my experience in React and Tailwind, I believe I can add value to your projects.",
            coverLetterFileId: createdFiles[1].id,
            cvFileId: createdFiles[0].id,
            expectedPay: 4000000,
        },
        {
            jobId: createdJobs[1].id,
            userId: createdSeekers[1].user.id,
            status: "APPLIED" as const,
            coverLetterText: "As a student developer, I'm eager to apply my full-stack skills in a professional environment. This role aligns perfectly with my career goals.",
            coverLetterFileId: createdFiles[1].id,
            cvFileId: createdFiles[2].id,
            expectedPay: 6000000,
        },
        {
            jobId: createdJobs[2].id,
            userId: createdSeekers[4].user.id,
            status: "SHORTLISTED" as const,
            coverLetterText: "I'm a creative graphic designer with 3 years of experience. I'd love to bring my design skills to your team on a part-time basis.",
            coverLetterFileId: createdFiles[1].id,
            cvFileId: createdFiles[3].id,
            expectedPay: 2000000,
        },
    ];

    for (const appData of applications) {
        await prisma.application.create({
            data: appData,
        });
    }

    console.log(`✅ Seeded ${applications.length} applications`);

    /* ---------- Education Records ---------- */
    const educations = [
        {
            profileId: createdSeekers[0].profile.id,
            school: "University of Sierra Leone",
            credential: "Bachelor of Science",
            field: "Computer Science",
            startYear: 2019,
            endYear: 2023,
        },
        {
            profileId: createdSeekers[1].profile.id,
            school: "Njala University",
            credential: "Bachelor of Science (In Progress)",
            field: "Computer Science",
            startYear: 2022,
            endYear: null,
        },
        {
            profileId: createdSeekers[3].profile.id,
            school: "Fourah Bay College",
            credential: "Bachelor of Arts",
            field: "Marketing",
            startYear: 2018,
            endYear: 2022,
        },
    ];

    for (const edu of educations) {
        await prisma.education.create({
            data: edu,
        });
    }

    console.log(`✅ Seeded ${educations.length} education records`);

    /* ---------- Work Experience ---------- */
    const experiences = [
        {
            profileId: createdSeekers[0].profile.id,
            companyName: "Tech Startup Freetown",
            roleTitle: "Junior Developer (Intern)",
            startDate: new Date("2023-06-01"),
            endDate: new Date("2023-12-31"),
            description: "Worked on front-end development tasks, learned React and modern web development practices.",
        },
        {
            profileId: createdSeekers[3].profile.id,
            companyName: "Digital Marketing Agency",
            roleTitle: "Marketing Assistant",
            startDate: new Date("2022-07-01"),
            endDate: new Date("2024-06-30"),
            description: "Managed social media accounts, created content, and assisted with marketing campaigns.",
        },
        {
            profileId: createdSeekers[4].profile.id,
            companyName: "Creative Design Studio",
            roleTitle: "Graphic Designer",
            startDate: new Date("2021-03-01"),
            endDate: null,
            description: "Creating visual designs for clients including logos, branding materials, and marketing collateral.",
        },
    ];

    for (const exp of experiences) {
        await prisma.workExperience.create({
            data: exp,
        });
    }

    console.log(`✅ Seeded ${experiences.length} work experience records`);

    /* ---------- Portfolio Items ---------- */
    const portfolios = [
        {
            profileId: createdSeekers[4].profile.id,
            title: "Brand Identity Design",
            description: "Complete brand identity package including logo, color palette, and business cards for a local restaurant.",
            linkUrl: "https://portfolio.example/hawa-branding",
            fileId: createdFiles[4].id,
        },
        {
            profileId: createdSeekers[0].profile.id,
            title: "E-commerce Dashboard",
            description: "React-based admin dashboard with Tailwind CSS styling. Features include user management and analytics.",
            linkUrl: "https://github.com/mariama/dashboard",
        },
    ];

    for (const portfolio of portfolios) {
        await prisma.portfolioItem.create({
            data: portfolio,
        });
    }

    console.log(`✅ Seeded ${portfolios.length} portfolio items`);

    /* ---------- Contract (from first job application) ---------- */
    const contract = await prisma.contract.upsert({
        where: { jobId: createdJobs[0].id },
        update: {},
        create: {
            jobId: createdJobs[0].id,
            seekerId: createdSeekers[0].user.id,
            employerId: createdEmployers[0].user.id,
            status: ContractStatus.DRAFT,
            milestones: {
                create: [
                    {
                        title: "Onboarding & Project Setup",
                        amount: 1500000,
                        status: MilestoneStatus.PROPOSED,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    },
                    {
                        title: "First Feature Implementation",
                        amount: 2000000,
                        status: MilestoneStatus.PROPOSED,
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                    },
                ],
            },
        },
    });

    console.log(`✅ Seeded contract with ${contract.id}`);

    return {
        adminEmail,
        employers: createdEmployers.map(e => e.user.email),
        seekers: createdSeekers.map(s => s.user.email),
        jobsCount: createdJobs.length,
        applicationsCount: applications.length,
        contractId: contract.id,
    };
}

async function main() {
    console.log("🌱 Starting database seeding...\n");
    
    const regions = await seedRegionsAndDistricts();
    console.log(`✅ Seeded regions and districts\n`);
    
    await seedSkills();
    console.log();
    
    const res = await seedUsersAndDomain({
        westernAreaId: regions.westernAreaId,
        westernAreaUrbanId: regions.westernAreaUrbanId,
    });
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Seed complete! ✅");
    console.log("=".repeat(50));
    console.log("\nSummary:");
    console.log(`- Admin: ${res.adminEmail}`);
    console.log(`- Employers: ${res.employers.length}`);
    console.log(`- Job Seekers: ${res.seekers.length}`);
    console.log(`- Jobs: ${res.jobsCount}`);
    console.log(`- Applications: ${res.applicationsCount}`);
    console.log(`- Contract ID: ${res.contractId}`);
    console.log("\n📝 Default Passwords: All users use password 'Seeker@123' or 'Employer@123'");
    console.log("=".repeat(50) + "\n");
}

main()
    .catch((e) => {
        console.error("\n❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
