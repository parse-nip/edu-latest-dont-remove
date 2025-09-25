import { db } from '@/db';
import { scores } from '@/db/schema';

async function main() {
    const currentTime = Math.floor(Date.now() / 1000);
    
    const sampleScores = [
        // Judge 1 scores for Submission 1 (AI Code Assistant)
        {
            submissionId: 1,
            judgeId: 1,
            criteria: 'innovation',
            score: 9,
            createdAt: currentTime - 3600,
        },
        {
            submissionId: 1,
            judgeId: 1,
            criteria: 'impact',
            score: 8,
            createdAt: currentTime - 3550,
        },
        {
            submissionId: 1,
            judgeId: 1,
            criteria: 'technical',
            score: 9,
            createdAt: currentTime - 3500,
        },
        // Judge 2 scores for Submission 1 (AI Code Assistant)
        {
            submissionId: 1,
            judgeId: 2,
            criteria: 'innovation',
            score: 8,
            createdAt: currentTime - 3400,
        },
        {
            submissionId: 1,
            judgeId: 2,
            criteria: 'impact',
            score: 9,
            createdAt: currentTime - 3350,
        },
        {
            submissionId: 1,
            judgeId: 2,
            criteria: 'technical',
            score: 8,
            createdAt: currentTime - 3300,
        },
        // Judge 1 scores for Submission 2 (Recipe Generator)
        {
            submissionId: 2,
            judgeId: 1,
            criteria: 'innovation',
            score: 7,
            createdAt: currentTime - 3200,
        },
        {
            submissionId: 2,
            judgeId: 1,
            criteria: 'impact',
            score: 8,
            createdAt: currentTime - 3150,
        },
        {
            submissionId: 2,
            judgeId: 1,
            criteria: 'technical',
            score: 7,
            createdAt: currentTime - 3100,
        },
        // Judge 2 scores for Submission 2 (Recipe Generator)
        {
            submissionId: 2,
            judgeId: 2,
            criteria: 'innovation',
            score: 8,
            createdAt: currentTime - 3000,
        },
        {
            submissionId: 2,
            judgeId: 2,
            criteria: 'impact',
            score: 7,
            createdAt: currentTime - 2950,
        },
        {
            submissionId: 2,
            judgeId: 2,
            criteria: 'technical',
            score: 8,
            createdAt: currentTime - 2900,
        },
    ];

    await db.insert(scores).values(sampleScores);
    
    console.log('✅ Scores seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});