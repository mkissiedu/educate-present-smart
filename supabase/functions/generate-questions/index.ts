import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') ?? '' });

const SYSTEM_PROMPT = `You are an expert educational assessment writer for Ghana's NaCCA curriculum.
Your job is to generate high-quality exam questions for Ghanaian school students.

You must return ONLY valid JSON — no markdown, no explanation, just the JSON object.

Return this exact structure:
{
  "questions": [
    {
      "question_text": "string — the full question",
      "question_type": "multiple_choice" | "true_false" | "short_answer" | "fill_blank" | "essay",
      "difficulty": "easy" | "medium" | "hard",
      "marks": number,
      "explanation": "string — why the answer is correct",
      "options": [
        { "option_text": "string", "is_correct": boolean }
      ]
    }
  ]
}

Rules:
- For multiple_choice: provide exactly 4 options, exactly 1 must be is_correct: true
- For true_false: provide exactly 2 options ("True" and "False"), exactly 1 correct
- For short_answer, fill_blank, essay: options array should be empty []
- marks: easy=1, medium=2, hard=3 (unless overridden)
- Questions must be age-appropriate, clear, and directly test the curriculum indicator
- Use Ghanaian context (names, places, currency GHS, etc.) where natural
- Do not number the questions or options in the text`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const RH = { 'Content-Type': 'application/json', ...corsHeaders };

  try {
    const {
      subject,
      grade_level,
      strand,
      sub_strand,
      indicator_code,
      indicator_text,
      question_type,
      difficulty,
      count = 5,
      knowledge_base_context,
    } = await req.json();

    if (!subject || !grade_level) {
      return new Response(
        JSON.stringify({ success: false, error: 'subject and grade_level are required' }),
        { status: 200, headers: RH }
      );
    }

    const requestedCount = Math.min(Math.max(1, Number(count)), 10);

    let userContent = `Generate ${requestedCount} ${difficulty || 'medium'} difficulty ${question_type || 'multiple_choice'} question(s) for:

Subject: ${subject}
Grade: ${grade_level}
${strand ? `Strand: ${strand}` : ''}
${sub_strand ? `Sub-strand: ${sub_strand}` : ''}
${indicator_code ? `Indicator: ${indicator_code}` : ''}
${indicator_text ? `Learning outcome: ${indicator_text}` : ''}`;

    if (knowledge_base_context) {
      userContent += `\n\nReference material to draw questions from:\n${knowledge_base_context}`;
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userContent }],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    let parsed: { questions: any[] };
    try {
      // Strip markdown code fences if Claude wraps the JSON anyway
      const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error('generate-questions: JSON parse failed:', raw.substring(0, 300));
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI response as JSON' }),
        { status: 200, headers: RH }
      );
    }

    if (!Array.isArray(parsed?.questions)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unexpected response shape from AI' }),
        { status: 200, headers: RH }
      );
    }

    // Attach curriculum metadata to every question
    const questions = parsed.questions.map((q: any) => ({
      question_text: q.question_text,
      question_type: q.question_type || question_type || 'multiple_choice',
      difficulty: q.difficulty || difficulty || 'medium',
      marks: q.marks ?? (difficulty === 'hard' ? 3 : difficulty === 'easy' ? 1 : 2),
      explanation: q.explanation || '',
      curriculum_type: 'NaCCA',
      subject,
      grade_level,
      strand: strand || '',
      sub_strand: sub_strand || '',
      indicator_code: indicator_code || '',
      indicator_text: indicator_text || '',
      is_approved: false,
      options: Array.isArray(q.options) ? q.options : [],
    }));

    return new Response(
      JSON.stringify({ success: true, questions }),
      { status: 200, headers: RH }
    );
  } catch (err: any) {
    console.error('generate-questions error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal server error' }),
      { status: 200, headers: RH }
    );
  }
});
