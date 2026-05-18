const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.AI_API });

exports.getChatResponse = async (userMessage, fridgeItems) => {
  const itemList = fridgeItems.map(item =>
    `- ${item.displayName}: ${item.totalQuantity}${item.unit}, kategori ${item.category}, exp ${new Date(item.batches[0]?.expireDate).toLocaleDateString('id-ID')}`
  ).join('\n');

  const systemPrompt = `kamu adalah asisten dapur pintar bernama Freya. 
kamu membantu pengguna memanfaatkan bahan makanan yang ada di kulkas mereka.
jawab dalam Bahasa Indonesia, singkat dan helpful.

ini adalah isi kulkas pengguna saat ini:
${itemList || 'Kulkas kosong.'}

tugasmu:
- rekomendasikan resep berdasarkan bahan yang ada, TAPI RESEP HARUS REALISTIS dengan selera manusia, jangan memaksakan pake semua bahan yang ada 
- ingatkan bahan yang hampir expired
- sarankan bahan tambahan jika diperlukan
- jawab pertanyaan seputar memasak dan bahan makanan
- berikan 1 atau 2 resep saja, tetapi berikan detail step-by-step`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 512,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};