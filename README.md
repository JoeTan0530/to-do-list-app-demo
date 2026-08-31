# To Do List App Demo
A simple to do list web application build using Next.js framework, along with bootstrap for UI framework and MongoDB for database.

## Features
- Display simple dashboard to show overall record stats.
- Search bar, filter and sort function for listing.
- Table listing display to do records added to the system.
- Remove to do records and quick update record status function is available.
- Calendar view integrated with listing data from api.
- Form page to add and edit to do tasks.

## Environment Variable
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
|`MONGODB_URI`| MongoDB connection URL | **Yes** | - |
|`NEXT_PUBLIC_APP_QUERY_URL`| Backend connection URL | **Yes** | - |

## Installation
````bash
git clone [This repo clone URL]
npm install
npm run dev
