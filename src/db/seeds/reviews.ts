import { db } from '@/db';
import { reviews } from '@/db/schema';

async function main() {
    const now = Math.floor(Date.now() / 1000);
    
    const sampleReviews = [
        {
            submissionId: 1, // AI Code Assistant
            judgeId: 1, // Sarah Chen
            rating: 8,
            comments: 'Great innovation! The AI integration is well thought out and the user experience is smooth.',
            createdAt: now - (3 * 3600), // 3 hours ago
        },
        {
            submissionId: 2, // Smart Recipe Generator
            judgeId: 1, // Sarah Chen
            rating: 7,
            comments: 'Solid execution with good usability. The recipe suggestions are practical and well-organized.',
            createdAt: now - (2 * 3600), // 2 hours ago
        },
        {
            submissionId: 1, // AI Code Assistant
            judgeId: 2, // Marcus Rodriguez
            rating: 9,
            comments: 'Impressive technical depth! The code quality is excellent and the architecture is scalable.',
            createdAt: now - (4 * 3600), // 4 hours ago
        },
        {
            submissionId: 2, // Smart Recipe Generator
            judgeId: 2, // Marcus Rodriguez
            rating: 8,
            comments: 'Creative approach to recipe generation. The algorithm shows good understanding of food pairing.',
            createdAt: now - (1 * 3600), // 1 hour ago
        }
    ];

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});