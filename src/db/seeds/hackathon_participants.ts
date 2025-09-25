import { db } from '@/db';
import { hackathonParticipants } from '@/db/schema';

async function main() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const sampleParticipants = [
        // AI Sprint hackathon (id=1) - 8 participants, 1 host, 1 judge
        {
            hackathonId: 1,
            displayName: 'Alex Chen',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 5, // 5 days ago
        },
        {
            hackathonId: 1,
            displayName: 'Sarah Martinez',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 4, // 4 days ago
        },
        {
            hackathonId: 1,
            displayName: 'David Kumar',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 4,
        },
        {
            hackathonId: 1,
            displayName: 'Emma Thompson',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 3, // 3 days ago
        },
        {
            hackathonId: 1,
            displayName: 'Marcus Johnson',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 3,
        },
        {
            hackathonId: 1,
            displayName: 'Lisa Wang',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 2, // 2 days ago
        },
        {
            hackathonId: 1,
            displayName: 'James Rodriguez',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 2,
        },
        {
            hackathonId: 1,
            displayName: 'Priya Patel',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 1, // 1 day ago
        },
        {
            hackathonId: 1,
            displayName: 'Michael Zhang',
            role: 'host',
            createdAt: currentTimestamp - 86400 * 7, // 7 days ago
        },
        {
            hackathonId: 1,
            displayName: 'Dr. Rachel Green',
            role: 'judge',
            createdAt: currentTimestamp - 86400 * 6, // 6 days ago
        },
        // Web Hack hackathon (id=2) - 3 participants
        {
            hackathonId: 2,
            displayName: 'Tyler Brooks',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 3,
        },
        {
            hackathonId: 2,
            displayName: 'Sophia Lee',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 2,
        },
        {
            hackathonId: 2,
            displayName: 'Ryan Mitchell',
            role: 'participant',
            createdAt: currentTimestamp - 86400 * 1,
        },
    ];

    await db.insert(hackathonParticipants).values(sampleParticipants);
    
    console.log('✅ Hackathon participants seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});