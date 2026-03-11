---
title: Routing and Navigation
type: note
permalink: basic-memory/planned/routing-and-navigation
tags:
- feature
- routing
- future
---

# Routing and Navigation

SvelteKit file-based routing for multi-page application.

## Routes

* `/` - Landing page (student code entry)
* `/instructor/setup` - Session creation
* `/instructor/dashboard/[sessionId]` - Results monitoring
* `/student/[accessCode]` - Typing interface

## Navigation Flow

* Student: Landing → Enter code → Typing interface → Results
* Instructor: Setup → Create session → Dashboard → Monitor progress

## Route Parameters

* `[sessionId]` - UUID for session identification
* `[accessCode]` - 6-character student code

## Route Guards

* Validate session ID exists before loading dashboard
* Validate access code exists before loading typing interface
* Redirect to landing if invalid

## Implementation

* Use SvelteKit's file-based routing
* Load data in `+page.js` or `+page.server.js`
* Handle 404s with custom error page
* Preserve state during navigation

---

relates_to [[Instructor Features]]
relates_to [[UI Components]]