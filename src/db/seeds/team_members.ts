import { db } from '@/db';
import { teamMembers } from '@/db/schema';

async function main() {
    const sampleTeamMembers = [
        // Team 1 (Neural Ninjas) - 3 members
        {
            teamId: 1,
            participantId: 1,
            createdAt: Date.now() - 172800000, // 2 days ago
        },
        {
            teamId: 1,
            participantId: 2,
            createdAt: Date.now() - 172800000 + 3600000, // 2 days ago + 1 hour
        },
        {
            teamId: 1,
            participantId: 3,
            createdAt: Date.now() - 172800000 + 7200000, // 2 days ago + 2 hours
        },
        // Team 2 (Data Dreamers) - 2 members
        {
            teamId: 2,
            participantId: 4,
            createdAt: Date.now() - 86400000, // 1 day ago
        },
        {
            teamId: 2,
            participantId: 5,
            createdAt: Date.now() - 86400000 + 1800000, // 1 day ago + 30 minutes
        },
        // Team 3 (AI Pioneers) - 3 members
        {
            teamId: 3,
            participantId: 6,
            createdAt: Date.now() - 43200000, // 12 hours ago
        },
        {
            teamId: 3,
            participantId: 7,
            createdAt: Date.now() - 43200000 + 900000, // 12 hours ago + 15 minutes
        },
        {
            teamId: 3,
            participantId: 8,
            createdAt: Date.now() - 43200000 + 1800000, // 12 hours ago + 30 minutes
        },
    ];

    await db.insert(teamMembers).values(sampleTeamMembers);
    
    console.log('✅ Team members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});