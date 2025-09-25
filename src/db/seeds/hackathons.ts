import { db } from '@/db';
import { hackathons } from '@/db/schema';

async function main() {
    const now = Date.now();
    const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = now + (5 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
    const fourteenDaysFromNow = now + (14 * 24 * 60 * 60 * 1000);

    const sampleHackathons = [
        {
            name: 'AI Sprint',
            description: 'Build innovative AI-powered applications using machine learning, natural language processing, and computer vision. Create solutions that solve real-world problems with artificial intelligence.',
            startAt: twoDaysAgo,
            endAt: fiveDaysFromNow,
            status: 'active',
            maxTeamSize: 4,
            createdAt: twoDaysAgo - (7 * 24 * 60 * 60 * 1000),
        },
        {
            name: 'Web Hack',
            description: 'Develop cutting-edge web applications using modern frameworks and technologies. Focus on responsive design, user experience, and innovative web solutions.',
            startAt: sevenDaysFromNow,
            endAt: fourteenDaysFromNow,
            status: 'upcoming',
            maxTeamSize: 3,
            createdAt: now - (3 * 24 * 60 * 60 * 1000),
        },
    ];

    await db.insert(hackathons).values(sampleHackathons);
    
    console.log('✅ Hackathons seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});