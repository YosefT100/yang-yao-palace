type Unit = {
  week: number;
  topic: string;
  vocab: string[];
  grammar: string;
  exercise: string;
};

type LevelData = {
  sessionsPerWeek: number;
  totalWords: number;
  units: Unit[];
};

const CURRICULUM: Record<string, LevelData> = {
  "HSK 1": {
    sessionsPerWeek: 2,
    totalWords: 150,
    units: [
      { week: 1, topic: "Greetings", vocab: ["你好","再见","谢谢","对不起","请","没关系"], grammar: "Basic affirmative / negative sentence", exercise: "Role-play: first meeting at school" },
      { week: 2, topic: "Numbers & Dates", vocab: ["一","二","三","四","五","六","七","八","九","十"], grammar: "Question with 几 / 多少", exercise: "Count and ask prices of objects" },
      { week: 3, topic: "Pronouns", vocab: ["我","你","他","她","我们","你们","他们","的"], grammar: "Possession with 的", exercise: "Describe who owns what" },
      { week: 4, topic: "Family", vocab: ["妈妈","爸爸","哥哥","姐姐","弟弟","妹妹","孩子"], grammar: "Adjective predicates (无需是)", exercise: "Draw and describe your family tree" },
      { week: 5, topic: "Basic Verbs", vocab: ["吃","喝","看","听","说","写","做","买"], grammar: "SVO sentence pattern", exercise: "Narrate a daily routine" },
      { week: 6, topic: "Adjectives", vocab: ["大","小","多","少","好","不好","漂亮","高"], grammar: "Degree adverbs: 很 / 非常 / 真", exercise: "Describe people and objects in the room" },
      { week: 7, topic: "Food & Drink", vocab: ["苹果","水","米饭","菜","面条","茶","咖啡","肉"], grammar: "Expressing desire: 想 / 要", exercise: "Order from a Chinese menu roleplay" },
      { week: 8, topic: "Measure Words", vocab: ["个","杯","碗","本","张","块","一点儿","一些"], grammar: "Numeral + measure word + noun", exercise: "Shopping dialogue with quantities" },
      { week: 9, topic: "Time Expressions", vocab: ["今天","明天","昨天","现在","以前","以后","早上","晚上"], grammar: "Time phrases as sentence adverbials", exercise: "Plan a daily schedule out loud" },
      { week: 10, topic: "Location & Direction", vocab: ["在","去","来","上面","下面","里面","外面","前面"], grammar: "Location phrase: 在 + place", exercise: "Describe the layout of a room" },
      { week: 11, topic: "Question Words", vocab: ["哪","谁","什么","怎么","为什么","多少钱"], grammar: "Forming all question types", exercise: "Q&A drill with a partner" },
      { week: 12, topic: "Review & Culture", vocab: ["中国","汉语","学生","老师","朋友","工作"], grammar: "Review: all core patterns", exercise: "Self-introduction mini-presentation" },
    ],
  },
  "HSK 2": {
    sessionsPerWeek: 2,
    totalWords: 300,
    units: [
      { week: 1, topic: "Past Actions", vocab: ["工作","学习","身体","健康","累","休息"], grammar: "Aspect marker 了 (completed action)", exercise: "Tell what you did yesterday" },
      { week: 2, topic: "Transport", vocab: ["火车","飞机","地铁","公共汽车","出租车","骑自行车"], grammar: "从...到... (from A to B)", exercise: "Plan a trip itinerary" },
      { week: 3, topic: "Weather", vocab: ["天气","晴天","下雨","刮风","冷","热","温度","季节"], grammar: "Progressive aspect: 在 + V + 着", exercise: "Forecast tomorrow's weather" },
      { week: 4, topic: "Emotions", vocab: ["高兴","生气","难过","担心","紧张","放松","觉得"], grammar: "Resultative complements (V + 好/完/到)", exercise: "Express and respond to feelings roleplay" },
      { week: 5, topic: "Shopping", vocab: ["卖","买","花","钱","贵","便宜","打折","多少钱"], grammar: "Comparison with 比", exercise: "Bargaining at a market roleplay" },
      { week: 6, topic: "Opinions", vocab: ["喜欢","希望","知道","认识","了解","认为","同意"], grammar: "觉得 / 认为 for opinions", exercise: "Share opinions on 3 topics" },
      { week: 7, topic: "Directions", vocab: ["右边","左边","前面","后面","上面","下面","附近"], grammar: "Directional complements 到/在", exercise: "Give directions to school" },
      { week: 8, topic: "Colors & Clothes", vocab: ["颜色","黑","白","红","蓝","绿","穿","衣服"], grammar: "Stative verbs (size, color attributes)", exercise: "Describe what classmates wear" },
      { week: 9, topic: "Technology", vocab: ["手机","电脑","网络","发短信","收邮件","上网","拍照"], grammar: "Modal verbs: 能 / 可以 / 会", exercise: "Tech habits survey" },
      { week: 10, topic: "Helping Others", vocab: ["帮助","告诉","让","给","送","带","一起"], grammar: "Serial verb constructions", exercise: "Cooperative task roleplay" },
      { week: 11, topic: "Study & Exams", vocab: ["成绩","考试","作业","练习","复习","准备","通过"], grammar: "把 structure: intro", exercise: "Talk about study habits" },
      { week: 12, topic: "Review", vocab: ["Review 300 HSK 2 vocabulary"], grammar: "All major grammar patterns", exercise: "Mini storytelling presentation" },
    ],
  },
  "HSK 3": {
    sessionsPerWeek: 2,
    totalWords: 600,
    units: [
      { week: 1, topic: "Daily Life & Habits", vocab: ["习惯","经常","偶尔","总是","从不","已经"], grammar: "Frequency adverbs in context", exercise: "Describe weekly routine in detail" },
      { week: 2, topic: "Travel & Tourism", vocab: ["旅游","景点","参观","导游","路线","预订"], grammar: "V 过 for past experience", exercise: "Describe a trip you've taken" },
      { week: 3, topic: "Health & Body", vocab: ["医院","医生","感冒","发烧","头疼","检查","药"], grammar: "Potential complements V + 得/不了", exercise: "Doctor-patient roleplay" },
      { week: 4, topic: "Social Events", vocab: ["聚会","邀请","参加","庆祝","气氛","礼物"], grammar: "是...的 emphasis structure", exercise: "Plan a class event" },
      { week: 5, topic: "Work & Career", vocab: ["公司","职业","经验","面试","薪水","晋升"], grammar: "Progressive + resultative combinations", exercise: "Conduct a mock job interview" },
      { week: 6, topic: "Environment", vocab: ["环境","污染","节约","保护","垃圾","能源"], grammar: "Expressing cause: 因为...所以...", exercise: "Debate an environmental issue" },
      { week: 7, topic: "Culture & Traditions", vocab: ["传统","节日","习俗","文化","历史","古代"], grammar: "Concessive clauses: 虽然...但是...", exercise: "Compare Chinese and Israeli holidays" },
      { week: 8, topic: "Review & Output", vocab: ["综合复习 HSK 3 词汇"], grammar: "Complex sentence review", exercise: "3-minute topic speech" },
    ],
  },
  "HSK 4": {
    sessionsPerWeek: 1,
    totalWords: 1200,
    units: [
      { week: 1, topic: "Society & Media", vocab: ["社会","媒体","新闻","影响","舆论","公众"], grammar: "Passive voice: 被 / 让 / 叫", exercise: "Summarize a news article in Chinese" },
      { week: 2, topic: "Economy & Business", vocab: ["经济","发展","市场","消费","投资","竞争"], grammar: "Conditional clauses: 如果...就...", exercise: "Present a business proposal" },
      { week: 3, topic: "Education System", vocab: ["教育","课程","素质","评价","改革","政策"], grammar: "Pivotal sentences", exercise: "Critique an educational practice" },
      { week: 4, topic: "Psychology & Emotion", vocab: ["心理","压力","态度","性格","价值观","影响"], grammar: "Modality + negation combinations", exercise: "Discuss stress management" },
      { week: 5, topic: "Technology & Future", vocab: ["人工智能","数据","算法","创新","趋势","挑战"], grammar: "Expressing hypotheticals", exercise: "Debate: AI pros and cons" },
      { week: 6, topic: "HSK 4 Review", vocab: ["综合复习 1200 词"], grammar: "Full grammar review", exercise: "Mock HSK 4 oral exam" },
    ],
  },
  "HSK 5": {
    sessionsPerWeek: 1,
    totalWords: 2500,
    units: [
      { week: 1, topic: "Academic Writing", vocab: ["论点","论据","分析","总结","观点","阐述"], grammar: "Formal written sentence patterns", exercise: "Write a 300-character argumentative paragraph" },
      { week: 2, topic: "Literature & Arts", vocab: ["文学","诗歌","小说","意境","风格","表达"], grammar: "Four-character idioms (成语) usage", exercise: "Analyze a poem excerpt" },
      { week: 3, topic: "Philosophy & Ethics", vocab: ["道德","伦理","价值","责任","公正","原则"], grammar: "Classical Chinese influences on modern", exercise: "Discuss a Confucian concept" },
      { week: 4, topic: "Global Affairs", vocab: ["国际","外交","合作","冲突","协议","贸易"], grammar: "Complex nominalization", exercise: "Debate a global policy issue" },
      { week: 5, topic: "HSK 5 Review", vocab: ["综合复习 2500 词"], grammar: "Advanced grammar patterns", exercise: "Mock HSK 5 writing + speaking" },
    ],
  },
  "HSK 6": {
    sessionsPerWeek: 1,
    totalWords: 5000,
    units: [
      { week: 1, topic: "Advanced Rhetoric", vocab: ["修辞","比喻","排比","对仗","夸张","反问"], grammar: "Classical sentence rhythm", exercise: "Write a persuasive essay" },
      { week: 2, topic: "Political Discourse", vocab: ["政策","治理","民主","改革","体制","决策"], grammar: "Nuanced negation and hedging", exercise: "Analyze a speech excerpt" },
      { week: 3, topic: "Scientific Writing", vocab: ["研究","方法","实验","数据","结论","假设"], grammar: "Formal academic register", exercise: "Summarize a research abstract" },
      { week: 4, topic: "HSK 6 Review", vocab: ["综合复习 5000 词"], grammar: "Master-level patterns", exercise: "Full HSK 6 simulation" },
    ],
  },
};

export function HSKCurriculum({
  level,
  currentLesson,
}: {
  level: string;
  currentLesson?: number;
}) {
  const data = CURRICULUM[level];
  if (!data) {
    return (
      <p className="text-sm text-palace-dark/50">
        No curriculum data available for {level}.
      </p>
    );
  }

  const currentWeek = currentLesson
    ? Math.ceil(currentLesson / data.sessionsPerWeek)
    : undefined;

  return (
    <div>
      <p className="mb-3 text-xs text-palace-dark/50">
        {data.totalWords} vocabulary words · {data.sessionsPerWeek} sessions/week
      </p>
      <div className="space-y-2">
        {data.units.map((unit) => {
          const isCurrent = currentWeek === unit.week;
          return (
            <div
              key={unit.week}
              className={`rounded-lg border p-3 ${
                isCurrent
                  ? "border-palace-gold bg-palace-gold/5"
                  : "border-black/5"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-palace-gold">
                  Week {unit.week}
                </span>
                <span className="text-sm font-semibold text-palace-dark">
                  {unit.topic}
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-palace-red px-2 py-0.5 text-xs text-white">
                    Current
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {unit.vocab.map((w) => (
                  <span
                    key={w}
                    className="rounded bg-palace-dark/5 px-1.5 py-0.5 font-serif text-xs text-palace-dark"
                  >
                    {w}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-palace-dark/60">
                📝 {unit.grammar}
              </p>
              <p className="mt-0.5 text-xs text-palace-dark/50">
                ✏️ {unit.exercise}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
