import { db } from '@/db';
import { judges } from '@/db/schema';

async function main() {
    const sampleJudges = [
        {
            hackathonId: 1,
            name: 'Sarah Chen',
            createdAt: Math.floor(new Date('2024-01-15T10:00:00Z').getTime() / 1000),
        },
        {
            hackathonId: 1,
            name: 'Marcus Rodriguez',
            createdAt: Math.floor(new Date('2024-01-15T10:30:00Z').getTime() / 1000),
        }
    ];

    await db.insert(judges).values(sampleJudges);
    
    console.log('✅ Judges seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});