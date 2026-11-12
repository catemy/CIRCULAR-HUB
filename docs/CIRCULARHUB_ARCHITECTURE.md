# CircularHub Product And System Architecture

## Product Positioning

CircularHub is a sustainability intelligence and collaboration platform for households, students, creators, institutions, NGOs, municipalities, and environmental teams. The product combines a structured waste knowledge base, institutional sustainability workflows, learning content, campaigns, community innovation, and impact analytics.

The product should feel closer to a focused SaaS operating system than a content feed. Social features exist to support learning, collaboration, and measurable environmental contribution.

## Implementation Status

This document distinguishes the repository's current behavior from its target architecture. “Current” describes the implementation at the time this document was updated; “Target” describes work that still needs to be designed or built.

| Area | Current | Target |
|---|---|---|
| Frontend | React application built with Vite. Learning catalog and progress are stored in browser `localStorage`. | Keep the current app or adopt another framework only when there is a specific product need; move shared and durable records behind the API. |
| API and persistence | FastAPI with SQLAlchemy async models. SQLite is the development default; production configuration requires a non-SQLite database. | Use the configured production database with versioned migrations, explicit constraints, and documented API contracts. |
| Learning | Course catalog is defined in frontend code. Lesson completion and certificate state are browser-local; the API has no course, lesson, or learning-progress model or route. | Add a versioned learning domain, server-persisted progress, meaningful assessment behavior, and auditable certificate rules. |
| Analytics | API exposes entity counts, a count-based sustainability score, and sums of named integer metrics. The frontend also builds chart values from local activity counts. | Define metric meaning, unit, period, provenance, and verification before presenting environmental outcomes or combining data. |

## Product Modules

### 1. Waste Intelligence Explorer

Purpose: a professional environmental encyclopedia and decision-support layer.

Core objects:
- Waste category
- Hazard classification
- Decomposition timeline
- Disposal and recycling methods
- Reuse opportunities
- Safety precautions
- Industry relevance
- Related learning resources
- Media and infographic references

Primary UX:
- Visual category grid by waste type and hazard level
- Category detail pages with impact, safety, recycling, reuse, and institutional guidance
- Search and filters by hazard, classification, industry, and audience
- Guided identification from plain-language descriptions

### 2. Institutional Sustainability System

Purpose: let schools, hospitals, factories, restaurants, NGOs, and municipalities manage sustainability participation over time.

Core workflows:
- Create verified institution profile
- Define generated waste streams
- Track campaigns and learning participation
- Record sustainability initiatives
- Report metrics such as awareness, participation, reuse innovation, and compliance readiness

Primary UX:
- Institution dashboard
- Waste stream matrix
- Campaign participation timeline
- Sustainability progress score
- Recommended educational resources by institution type

### 3. Community Innovation And Collaboration

Purpose: professional sharing of reuse projects, recycling innovation, research ideas, cleanup initiatives, and sustainability learnings.

Post structure:
- Title and detailed description
- Waste categories used
- Environmental value
- Materials used
- Project steps
- Before and after media
- Educational references
- Collaboration tags

Engagement model:
- Discussion quality over virality
- Contribution points tied to educational value and sustainability outcomes
- Moderation for safety, misinformation, and hazardous reuse advice

### 4. Learning And Awareness Hub

Purpose: structured environmental learning for students, communities, and institutions.

Current implementation:
- The frontend defines the course catalog and its lesson content in application code.
- A course includes an identifier, title, level, audience, certificate label, summary, and ordered lessons. Lessons have an identifier, type, title, duration, and content; some include quiz questions.
- Progress and certificate state are stored in browser `localStorage`, not on the API. Progress is therefore device/browser-local and is not shared across devices or accounts.
- A learner can mark any lesson complete. A certificate is recorded when all lesson IDs are marked complete; quizzes are not currently graded as assessments.

Target learning model:
- **Course**: stable identifier, title, description, audience, level, topic tags, publication status, and current version.
- **Course version**: immutable published snapshot of its ordered lessons and completion requirements. Updating published content creates a new version so prior progress remains interpretable.
- **Lesson**: stable identifier within a course version, position, type (reading, tutorial, case study, project, or assessment), content, and estimated duration.
- **Assessment**: question or task definitions, scoring/validation rules, and pass threshold where applicable. A quiz must have answer and scoring rules before it can count as a passed assessment.
- **Enrollment and lesson progress**: learner, course version, status, lesson completion timestamps, and assessment attempts/results. Store these on the API so progress follows the authenticated learner across devices.
- **Certificate**: learner, course version, issue timestamp, and completion requirements satisfied. Issue only after the published course's stated completion and assessment rules are met.

Completion should distinguish “marked viewed/completed” from “assessment passed” and “project evidence reviewed.” Do not imply that marking a lesson complete proves mastery. State whether a project is self-attested or reviewed, and retain the rule used to award each certificate.

Content types:
- Articles
- Guides
- Courses
- Quizzes
- Case studies
- Tutorials
- Awareness campaign materials

Organization:
- Waste type
- Audience level
- Institution relevance
- Complexity
- Environmental topic

## Learning And Impact Data Boundaries

Analytics must distinguish **activity outputs** from **environmental outcomes**:

| Class | Examples | What it supports |
|---|---|---|
| Activity output | Lesson completions, quiz attempts, campaign joins, scans, posts | Participation and platform-use reporting; not proof of behavior change or environmental benefit. |
| Reported operational measure | Waste weight recorded by a participant or institution, with a stated unit, stream, destination, and period | A reported quantity. Identify whether it is self-reported or verified and avoid implying independent verification. |
| Verified environmental outcome | A measure checked against defined evidence and method, such as a collection receipt or documented weighing record | Outcome reporting within the stated boundary, period, and verification method. Do not extrapolate beyond that evidence. |

Current analytics limitations:
- `ImpactMetric` stores a metric name and integer value, subject type and optional subject ID, optional institution/campaign IDs, and creation time. It does not store a unit, measurement period, source, method, or verification status.
- The API dashboard sums integer values for `tons_tracked`, `communities`, and `education_hours`. The field names alone do not define units or prove that records are comparable or verified.
- The API sustainability score is a capped weighted sum of platform record counts (including users, institutions, waste categories, posts, articles, campaigns, and engagement events). It is not a measured sustainability or environmental-impact outcome.
- Frontend analytics chart categories are assembled from local counts of posts, lesson completions, campaign joins, scans, and marketplace activity. These are activity proxies, not measured awareness, reuse, or waste diversion, and are not a dated environmental time series.

Target metric requirements:
- Give every metric a stable name and definition, unit, subject, and aggregation rule. For quantities, record the waste/material stream and measurement period, and keep the original value and unit rather than silently mixing units.
- Record who reported the value, when it was recorded, the evidence/source and measurement method, and a verification state. Keep reported and verified totals separate.
- Validate allowed units and metric-specific value ranges; preserve precision where measurements require it. Aggregate only compatible metrics with the same definition, unit, and applicable time boundary.
- Prevent duplicate counting when the same activity or material appears in multiple reports. Make assumptions, exclusions, and uncertainty visible in exported and displayed results.
- Label engagement and self-reported activity as such. Do not convert course completions, scans, campaign participation, or unverified weights into avoided emissions or other environmental outcomes without an explicit, defensible method and its assumptions.

### 5. Campaigns And Challenges

Purpose: mobilize communities and institutions around measurable sustainability action.

Campaign types:
- Cleanup drives
- Recycling awareness programs
- School sustainability competitions
- Hospital safety-awareness initiatives
- Municipal participation programs

Primary UX:
- Campaign pages
- Participant registration
- Milestones
- Leaderboards
- Institution participation summaries

### 6. Environmental Impact Analytics

Purpose: turn participation into understandable sustainability intelligence.

Tracked dimensions should be reported with their evidence class and time period:
- Learning and other platform activity
- Institution participation
- Campaign involvement and documented evidence
- Reported material quantities and verified outcomes, separately

Outputs:
- Clearly defined activity and outcome metrics
- Participation insights
- Campaign progress and evidence status
- Institution dashboards with source and period labels
- Any score accompanied by its formula, inputs, scope, and explicit statement of whether it measures activity or environmental outcomes

## Backend Architecture

FastAPI remains the API layer. The backend should be organized by domain:

- `routers`: HTTP endpoints and request/response contracts
- `schemas`: Pydantic v2 DTOs
- `models`: SQLAlchemy database models
- `services`: workflow and domain logic
- `repositories`: reusable persistence queries as the codebase grows
- `analytics`: aggregation logic and scoring models
- `core`: auth, config, permissions, pagination, shared dependencies

Target architecture should be introduced incrementally:
- Service-layer first workflows
- Thin routers
- Normalized PostgreSQL schema
- Role-aware permissions
- Pagination, search, filtering, and analytics endpoints
- Alembic migrations instead of relying on `create_all` in production

## Database Design

The table list below describes the **target domain**, not a claim that every table exists today. The current SQLAlchemy models include users, institutions, waste categories, posts, articles, campaigns, engagement logs, impact metrics, and marketplace listings. Course, lesson, enrollment, and lesson-progress models are not currently present.

Key tables:
- `users`
- `institutions`
- `institution_members`
- `institution_waste_streams`
- `waste_categories`
- `posts`
- `post_waste_categories`
- `articles`
- `courses`
- `course_versions`
- `lessons`
- `enrollments`
- `lesson_progress`
- `assessment_attempts`
- `certificates`
- `campaigns`
- `campaign_participants`
- `engagement_logs`
- `impact_metrics`
- `comments`
- `likes`
- `follows`

For impact metrics, the target schema should additionally represent the metric definition and unit, measurement period, source/method, reporting actor, and verification state. Define uniqueness and deduplication rules for metric records before implementing aggregation.

Indexing strategy:
- Unique indexes on usernames, emails, institution names, waste category names
- Time indexes on feed, campaign, analytics, and engagement tables
- Composite indexes for institution dashboards: `(institution_id, created_at)`
- Composite indexes for campaign participation: `(campaign_id, status)`
- Search-ready columns for titles, categories, tags, and descriptions

Pagination:
- Offset pagination is acceptable for admin and early product views.
- Cursor pagination should be introduced for large feeds, engagement logs, and analytics timelines.

## API Structure

Recommended high-level REST structure:

- `/auth`
- `/users`
- `/waste`
- `/institutions`
- `/posts`
- `/articles`
- `/learning`
- `/campaigns`
- `/analytics`
- `/admin`

API requirements:
- Consistent pagination metadata
- Search and filters on list endpoints
- Role-aware write operations
- Analytics aggregation endpoints
- Workflow endpoints for institution participation and campaigns

## Frontend Architecture

Recommended frontend: React or Next.js with a component system built around product modules.

Core layout:
- Persistent sidebar
- Top command/search bar
- Dashboard landing
- Modular cards for metrics, tasks, campaigns, and insights
- Dense, readable tables for institutional workflows
- Visual explorer for waste categories
- Data visualization for impact analytics

Core screens:
1. Home Dashboard
2. Waste Intelligence Explorer
3. Sustainability Hub
4. Community Innovation Feed
5. Learning Center
6. Campaigns And Challenges
7. Institution Dashboard
8. Analytics And Impact
9. User Profile
10. Admin And Moderation

Design principles:
- Premium, quiet SaaS visual language
- Information-rich but not cluttered
- Professional card usage for objects and dashboards
- Responsive grids
- Clear hierarchy for learning content and institutional reporting
- Dark/light mode ready token system
