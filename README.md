<div align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:06122e,35:184e77,70:34a0a4,100:80ed99&height=190&section=header&text=Typelo&fontSize=68&fontColor=ffffff&animation=twinkling&fontAlignY=36&desc=Fast%20fingers.%20Fair%20matches.&descAlignY=58&descSize=18" alt="Typelo animated header" />

  <a href="https://readme-typing-svg.demolab.com"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1100&color=80ED99&center=true&vCenter=true&width=720&lines=Ranked+typing+duels;React+%2B+FastAPI+%2B+Redis;Live+at+typelo.tech" alt="Typing tagline" /></a>

  <p>
    <a href="https://www.typelo.tech/"><img src="https://img.shields.io/badge/PLAY-typelo.tech-06D6A0?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Play Typelo" /></a>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-FFD166?style=for-the-badge" alt="MIT License" /></a>
  </p>
</div>

## âŒ¨ï¸ What it is

Typelo turns a typing test into a head-to-head game. Players enter ranked matches, build an ELO rating, and progress through quests and unlockable cosmetics. The browser client is React + TypeScript; the API and matchmaking services are Python/FastAPI.

## ðŸ§­ Match flow

```mermaid
flowchart LR
  A[Player joins queue] --> B[Redis matchmaking]
  B --> C[WebSocket typing match]
  C --> D[Server validates keystroke timing]
  D --> E[PostgreSQL result and ELO]
  E --> F[Quest and profile progress]
```

## âœ¨ In the code

- Ranked queue and match coordination backed by Redis.
- Realtime match updates over WebSockets.
- Server-side checks use submitted keystroke timing; the browser is not the source of truth for the final match result.
- ELO ratings, quests, friend features and cosmetic unlock flows.
- PWA support in the frontend.

## ðŸ§° Stack

| Part | Tools |
|---|---|
| Web client | React 18, TypeScript, Vite, Zustand, Framer Motion |
| API | Python, FastAPI, Pydantic |
| Matchmaking | Redis, WebSockets |
| Persistence | PostgreSQL |
| Tests | Vitest / Testing Library / Playwright in the frontend; Python tests in `Backend/` |

## ðŸš€ Run locally

```bash
git clone https://github.com/ChristopherJoshy/typelo.git
cd typelo

# Backend
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r Backend/requirements.txt
uvicorn app.main:app --app-dir Backend --reload
```

In another terminal, configure the frontend's `.env` from `frontend/.env.example`, then:

```bash
cd frontend
npm ci
npm run dev
```

Redis and PostgreSQL are needed for the complete ranked flow. Configure their URLs, Firebase values, and other secrets in local environment files; never commit real credentials.

## ðŸ—‚ï¸ Layout

```text
Backend/   FastAPI app, matchmaking, persistence, scripts
frontend/  React client, tests, PWA assets
```

## ðŸ“„ License

MIT. See [`LICENSE`](LICENSE).