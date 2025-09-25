import { db } from '@/db';
import { teams } from '@/db/schema';

async function main() {
    const sampleTeams = [
        {
            hackathonId: 1,
            name: 'Neural Ninjas',
            createdAt: Math.floor(new Date('2024-01-15T09:00:00Z').getTime() / 1000),
        },
        {
            hackathonId: 1,
            name: 'Data Dreamers',
            createdAt: Math.floor(new Date('2024-01-15T10:30:00Z').getTime() / 1000),
        },
        {
            hackathonId: 1,
            name: 'AI Pioneers',
            createdAt: Math.floor(new Date('2024-01-15T11:45:00Z').getTime() / 1000),
        },
    ];

    await db.insert(teams).values(sampleTeams);
    
    console.log('✅ Teams seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});