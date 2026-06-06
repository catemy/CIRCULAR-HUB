# CircularHub Product And System Architecture

## Product Positioning

CircularHub is a sustainability intelligence and collaboration platform for households, students, creators, institutions, NGOs, municipalities, and environmental teams. The product combines a structured waste knowledge base, institutional sustainability workflows, learning content, campaigns, community innovation, and impact analytics.

The product should feel closer to a focused SaaS operating system than a content feed. Social features exist to support learning, collaboration, and measurable environmental contribution.

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

Tracked dimensions:
- Waste knowledge engagement
- Learning activity
- Institution participation
- Reuse innovation posts
- Campaign involvement
- Contribution points

Outputs:
- Sustainability score
- Awareness metrics
- Participation insights
- Campaign progress
- Institution dashboards

## Backend Architecture

FastAPI remains the API layer. The backend should be organized by domain:

- `routers`: HTTP endpoints and request/response contracts
- `schemas`: Pydantic v2 DTOs
- `models`: SQLAlchemy database models
- `services`: workflow and domain logic
- `repositories`: reusable persistence queries as the codebase grows
- `analytics`: aggregation logic and scoring models
- `core`: auth, config, permissions, pagination, shared dependencies

Current implementation should move incrementally toward:
- Service-layer first workflows
- Thin routers
- Normalized PostgreSQL schema
- Role-aware permissions
- Pagination, search, filtering, and analytics endpoints
- Alembic migrations instead of relying on `create_all` in production

## Database Design

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
- `campaigns`
- `campaign_participants`
- `engagement_logs`
- `impact_metrics`
- `comments`
- `likes`
- `follows`

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
