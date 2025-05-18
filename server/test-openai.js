require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
    try {
        console.log('Starting OpenAI test...');
        console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
        console.log('API Key length:', process.env.OPENAI_API_KEY?.length);
        console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // בדיקה פשוטה
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: "Say 'Hello' in Hebrew"
                }
            ]
        });

        console.log('Test successful!');
        console.log('Response:', completion.choices[0].message.content);

    } catch (error) {
        console.error('Error during test:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        }
    }
}

// הפעלת הבדיקה
console.log('=== Starting OpenAI API Test ===');
testOpenAI().then(() => {
    console.log('=== Test Complete ===');
}).catch(error => {
    console.error('=== Test Failed ===');
    console.error(error);
}); 