# OpenRouter API Setup

To enable real AI code generation, you need to set up an OpenRouter API key:

## 1. Get an API Key
1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up for an account
3. Create a new API key

## 2. Add the API Key
Create a `.env.local` file in the root directory and add:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=your_actual_api_key_here
```

## 3. Restart the Server
After adding the API key, restart your development server:

```bash
npm run dev
```

## 4. Test
Visit `http://localhost:3006/chat?prompt=build%20a%20timer%20app` and check the browser console for AI generation logs.

Without the API key, the system will use a fallback simulation mode.