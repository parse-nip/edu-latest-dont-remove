import { db } from '@/db';
import { submissions } from '@/db/schema';

async function main() {
    const sampleSubmissions = [
        {
            hackathonId: 1,
            teamId: 1,
            title: 'AI Code Assistant',
            repoUrl: 'https://github.com/team1/ai-assistant',
            demoUrl: 'https://ai-assistant-demo.vercel.app',
            description: 'An intelligent coding companion that helps developers write better code faster. Features include real-time code suggestions, bug detection, automated refactoring, and smart documentation generation. Built with advanced language models to understand context and provide relevant assistance across multiple programming languages.',
            submittedAt: 1704067200000, // January 1, 2024 00:00:00 UTC
        },
        {
            hackathonId: 1,
            teamId: 2,
            title: 'Smart Recipe Generator',
            repoUrl: 'https://github.com/team2/recipe-ai',
            demoUrl: 'https://recipe-ai.netlify.app',
            description: 'Personalized AI-powered recipe recommendations based on your dietary preferences, available ingredients, and cooking skill level. The app learns from your feedback to suggest increasingly relevant recipes, includes nutritional analysis, shopping list generation, and step-by-step cooking guidance with smart timer integration.',
            submittedAt: 1704070800000, // January 1, 2024 01:00:00 UTC
        }
    ];

    await db.insert(submissions).values(sampleSubmissions);
    
    console.log('✅ Submissions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});