# Santiago Morel — Knowledge Base for Chat Widget

## About
Santiago Morel is a Senior Full Stack Software Engineer based in Pittsburg, KS, with 15+ years of experience shipping web and mobile applications across startup, agency, and client environments. He works across the full stack: frontend architecture, backend APIs, databases, and production deployment. His current focus combines traditional full-stack engineering with applied AI work — tool-calling, structured-output extraction, RAG architecture, and validation workflows.

## Experience

### LimeLight Marketing — Senior Full Stack Developer (August 2025 – Present)
Builds production web applications and e-commerce experiences for client brands using Shopify, BigCommerce, WordPress, Next.js, React, TypeScript, PHP, REST APIs, and GraphQL. Developed a private Shopify conversational AI search app with brand-aware natural-language product discovery, streaming responses, product cards, and content recommendations. Implemented a RAG-based commerce architecture using embeddings, vector search, hybrid retrieval, reranking, structured AI outputs, live catalog sync, and business-rule guardrails. Integrated Shopify Theme App Extensions, Admin GraphQL, Bulk Operations, webhooks, Supabase pgvector, Redis caching, and AI model routing into a reusable multi-tenant app foundation. Also modernizing LimeLight's own SaaS password manager (framework upgrades and security fixes on .NET, Vue and Azure), and builds backend services and integrations that connect storefronts to business systems (Laravel, Node.js, BigQuery, REST APIs).

### Pittsburg State University — Graduate Teaching Assistant (February 2025 – May 2025)
Assisted faculty in course delivery and grading for software development courses. Built a Python script to automate internal administrative data processing. Supported students in developing problem-solving and collaborative project skills.

### Mambo Business Technology — Lead Full Stack Engineer (February 2014 – May 2024, 10 years 4 months, Startup)
Designed and built 50+ web and mobile applications across diverse industries: frontend (React, Vue, TypeScript), backend (Node.js, Python, Java, PHP), databases (PostgreSQL, MySQL, MongoDB), and mobile (native iOS and Android, then React Native). Made pragmatic architecture decisions to keep systems maintainable and scalable as products grew, from early MVPs to long-running production services. Used AI coding tools (GitHub Copilot, ChatGPT) to accelerate development, improve code quality, and assist with PR reviews and technical documentation. Planned and managed projects using Scrum. Mentored and coordinated a team of 4–6 engineers (technical direction, code reviews). Set up and ran CI/CD (a self-managed Jenkins server and GitHub Actions, deploying to DigitalOcean and AWS). Worked directly with clients and stakeholders across 10+ years to define requirements, prioritize features, and deliver working software on time.

### Edge – Mobile Ideas — Full Stack Software Engineer (February 2012 – February 2014, 2 years 1 month)
Delivered over 15 customized software solutions for diverse client requirements. Developed 7 mobile applications for both iOS and Android platforms. Led research initiatives that introduced new technologies into 4 projects.

### "Pablo VI" Library — Software Engineer & Web Developer (September 2010 – December 2012, 2 years 4 months)
Developed scalable software solutions using Ruby on Rails. Led a NoSQL-to-relational database migration.

### Telecom Personal Paraguay — Software Developer & NOC Support (March 2008 – February 2012, 4 years)
Built internal network monitoring tools and supported network operations and system reliability for cellular and internet services.

### Teaching & Instruction (alongside engineering work)
iOS Development Instructor at High Tech (Oct 2013 – Jan 2014), teaching Objective-C and Xcode. Web Security Teaching Assistant at Catholic University Asunción (Nov–Dec 2013), covering SQL injection, XSS, and CSRF. Java Programming Instructor at High Tech (Mar 2012 – Jun 2013), covering OOP, data structures, and algorithms.

## Projects

### Sidequest Studio
A small creative studio run by AI agents, with a human approving every post before it goes out. Four plush-toy characters (Pancracio, Eusebio, CoderAssist, Gervasio), each with a written "bible" defining its look, voice, and boundaries. The pipeline: an idea goes on the schedule, Claude writes the script in-character and checks it against the bible, an image model paints the scenes (checked by another AI for errors), each character gets its own AI voice and motion, and Remotion (Python) assembles the final cut with captions and on-screen text. The finished video arrives by email for a yes/no — nothing posts without that approval. 165+ PRs merged building it. Stack: Claude Code, Claude, OpenAI image models, ElevenLabs, Remotion, Python. Live across Instagram, YouTube, and Facebook, posting most days.

### Artemisa
Full-stack Django + PostgreSQL scoring platform for multi-round competitions with dynamic category rules and live leaderboards. Santiago was the sole developer, owning architecture, backend logic, frontend, and deployment end-to-end. Stack: Django, JavaScript, PostgreSQL, Bootstrap. Running in production, actively used for real events.

### Ardu
A working mobile app (in beta on iOS and Android) built as a real-world testbed for prompt engineering. Runs a 1.5B LLM locally via Ollama on a 2GB VPS. Built an 8B judge-model evaluation framework to score outputs on relevance, originality, and clarity, plus a two-gate generation pipeline (lexical overlap + Jaccard similarity) to reject low-quality or near-duplicate outputs. Stack: React Native, Node.js, Ollama, PostgreSQL, prompt engineering.

### Gus Bus Plus
Shuttle tracker built for Pittsburg State University students: it synced live bus positions via Firebase Firestore and rendered them on an interactive Google Maps interface. Stack: JavaScript, Google Maps API, Firebase Firestore, HTML/CSS. Live demo: https://gusbusplus.santiagomorel.dev

### LLM Ranking Pipeline
Personal Python batch pipeline that classifies and ranks ~6,500 documents a week in two LLM passes (a fast model, then a reasoning model) with JSON-schema outputs, enriched from a 550k-row public dataset and web sources. Runs weekly on a Linux VPS with systemd and n8n, with SQLite persistence. Stack: Python, Claude, structured outputs, web scraping, SQLite, n8n.

### PSU Chatbot
Fine-tuned microsoft/DialoGPT-small with the Hugging Face Transformers library on curated Q&A about Pittsburg State University's academic programs, and served it from a Django app on a 1-CPU server. It's a 2024 learning project; the demo page explains its known limits. Stack: Python, Hugging Face, PyTorch, Django, NLP. Live demo: https://chatbot.santiagomorel.dev. Code: https://github.com/athospy/transformer_chatbot

### GateFire
Portrait mobile arcade shooter shipped end-to-end: prototyped in Phaser 3, then rebuilt natively in Unity 6 (C#) with URP and published to the App Store via Xcode/Il2Cpp. Players auto-fire while dodging obstacles and shooting down gates to claim stat trade-offs (damage vs. fire rate, flat bonus vs. multiplier) as difficulty escalates. Stack: Unity 6, C#, URP, Xcode, Il2Cpp.

## Skills
**Applied AI:** RAG (embeddings, pgvector, hybrid vector + BM25 retrieval, reranking), structured outputs and guardrails, LLM evals (LLM-as-judge, regression suites), prompt engineering, MCP, Claude API, Claude Code, OpenAI, Ollama, Hugging Face, PyTorch
**Languages:** TypeScript, JavaScript, Python, PHP, Java, C#, SQL
**Frontend & Mobile:** React, Next.js, Vue, HTML/CSS, React Native, native iOS and Android
**Backend & APIs:** Node.js, ASP.NET Core, Django, Laravel, Ruby on Rails, REST, GraphQL
**Data:** PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, Firebase
**Cloud & DevOps:** AWS, Azure, Vercel, Docker, GitHub Actions, Jenkins, Linux, CI/CD
**Commerce & CMS:** Shopify apps (Theme App Extensions, Admin GraphQL, webhooks), BigCommerce, WordPress
**Practices:** System design, code review, mentoring, Agile/Scrum, requirements gathering with clients

## Education
**Master of Science in Technology (Information Technology)** — Pittsburg State University, graduated July 2025, GPA 4.0. Relevant coursework: Artificial Intelligence, Data Mining, Software Project Management.

**Bachelor of Science in Computer Science** — Catholic University "Nuestra Señora de la Asunción," graduated 2012.

## Certifications
Claude Certified Architect (Anthropic, Foundations, Oct 2026) and Claude Certified Developer (Anthropic, Foundations, Sep 2026). Also holds Building with the Claude API, Claude Code in Action, and Introduction to Model Context Protocol (all Anthropic, issued May 2026), plus CS50: Web Programming with Python and JavaScript (Harvard University, Jul 2024).

## Additional Information
Authorized to work in the U.S. under STEM OPT extension. Open to relocation. Fluent in English, native Spanish speaker.
