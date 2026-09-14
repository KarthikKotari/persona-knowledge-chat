# Persona Knowledge Chat

A small Next.js app where three AI personas answer your questions over a shared
knowledge base:

- **Teacher** — patient and example-driven; breaks concepts into clear steps.
- **Analyst** — concise and evidence-focused; leads with conclusions.
- **Skeptic** — highlights caveats, limits, and unsupported assumptions.

The knowledge base is seeded from Markdown documents into a local SQLite
database. When you ask a question, a lightweight keyword retriever pulls the
most relevant excerpts and passes them to the selected persona, so responses
stay grounded in the source material rather than the model's open-ended
knowledge. You can also browse the raw source documents in the app's knowledge
base viewer.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Prisma 5** with **SQLite** for storage
- **Google Gemini** (`@google/generative-ai`) for chat completions
- **Vitest** + **fast-check** for unit and property-based tests

## Prerequisites

- **Node.js 18+** (Node 20+ recommended) and **npm**
- A **Google Generative AI API key** (used for chat responses)

## Setup

1. Clone the repository and move into the project directory:

   ```bash
   git clone <repository-url>
   cd persona-knowledge-chat
   ```

2. Create your local environment file from the example and open it for editing:

   ```bash
   cp .env.local.example .env.local
   ```

   Set your Google Generative AI API key in `.env.local`:

   ```dotenv
   GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
   DATABASE_URL=file:./dev.db
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Database setup and seeding (one time)

Run the Prisma migration to create the SQLite database (`dev.db`) and generate
the Prisma client:

```bash
npx prisma migrate dev --name init
```

Then seed the knowledge base from the Markdown documents:

```bash
npm run seed
```

The seed script reads Markdown/text files from the `knowledge-base-documents`
folder (located one level above this project), chunks each document, and stores
it in the database. It is **idempotent** — it skips any file whose filename is
already present, so it is safe to re-run. To re-seed a document after editing
it, remove its existing record first (or reset the database).

## Running the app

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Pick a
persona, ask a question, and the app will retrieve relevant excerpts and
respond in that persona's voice.

## Testing

Run the test suite once (non-watch mode):

```bash
npm test
```

This runs Vitest across the unit tests and the **fast-check** property-based
tests that exercise the chunker, retrieval scoring, and LLM message building.

## Environment variables

| Variable                         | Required | Default              | Description                                                                 |
| -------------------------------- | -------- | -------------------- | --------------------------------------------------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY`   | Yes      | —                    | API key for Google Gemini. Chat requests fail without it.                   |
| `DATABASE_URL`                   | Yes      | `file:./dev.db`      | Prisma/SQLite connection string. The default keeps the DB local to the app. |
| `GEMINI_MODEL`                   | No       | `gemini-2.5-flash`   | Overrides the Gemini model used for chat responses.                         |

### Swapping the model

The chat model is read from `GEMINI_MODEL` at request time and falls back to
`gemini-2.5-flash`. To use a different Gemini model, set the variable in
`.env.local`, for example:

```dotenv
GEMINI_MODEL=gemini-2.5-pro
```

No code changes are required to switch between Gemini models.

## Retrieval approach & trade-offs

Retrieval uses a simple **keyword / term-frequency (TF)** scorer rather than
embeddings or vector search:

1. The query and each stored chunk are **tokenised** — lowercased, stripped of
   punctuation, split on whitespace, and filtered to drop very short tokens and
   common stop words.
2. Each chunk is scored by summing, for every query token, how often that token
   appears in the chunk **normalised by the chunk's length** (a term-frequency
   contribution).
3. Chunks scoring below `MIN_SCORE_THRESHOLD` (`0.01`) are discarded, and the
   top `DEFAULT_TOP_N` (`5`) chunks are returned, ordered by score.

**Why this approach:**

- **Fast and deterministic** — scoring is plain arithmetic over stored text; the
  same query always returns the same chunks.
- **Transparent** — it is easy to reason about why a chunk was or wasn't
  selected.
- **Zero extra dependencies** — no embedding model, vector index, or external
  API call is needed for retrieval.
- Well suited to a **small, fixed corpus** like this knowledge base.

**Trade-offs:**

- **No semantic or synonym matching** — retrieval relies on literal keyword
  overlap, so a question worded very differently from the source text may miss
  relevant chunks.
- Term-frequency scoring doesn't down-weight terms that are common across the
  whole corpus the way full TF-IDF would.

Because retrieval is isolated behind the `retrieveChunks` interface in
`lib/retrieval.ts`, it can be upgraded later to full TF-IDF or embedding-based
vector search without changing the callers.
