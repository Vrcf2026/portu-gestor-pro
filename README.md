# Lovable Gestor

Create a professional web application for managing clients, tasks, technical work logs, contracted support hours, billing, and client portals for a small IT services business.

INTERFACE LANGUAGE
The entire interface must be in European Portuguese.

USER TYPE
Single administrator user.

MAIN MODULES

DASHBOARD Show:

Pending tasks

Tasks in progress

Overdue tasks

Tasks scheduled for today

Clients with active contracts

Remaining support hours per client

Client profitability (total billed, costs, net profit)

Include quick action buttons:

Nova tarefa rápida

Registar trabalho rápido

Novo cliente

CLIENT MANAGEMENT

Client database with fields:

Client name

Company name

Phone

Email

Address

City

Notes

Contracted yearly support hours (optional)

Contract start date

Contract end date

Features:

Search, edit, view full client history

Access equipment and technical information

Track contract hours and alert if near expiration

CLIENT TECHNICAL INFORMATION

For each client, allow:

Infrastructure notes

Network info

Backup info

Important configurations

Technical notes

CLIENT EQUIPMENT MANAGEMENT

Each client can have equipment records:

Type (PC, NAS, Router, Switch, CCTV, Server)

Brand

Model

Serial number

Installation date

Warranty expiration

Maintenance notes

Highlight equipment with warranty near expiration.

TASK MANAGEMENT

Tasks include:

Client (selected from database)

Creation date (automatic)

Task description (free text)

Priority (Low / Medium / High)

Status (workflow): New request, Pending, In progress, Waiting for client, Waiting for parts, Completed, Invoiced

Expected completion date

Completion date

Internal notes

Filters:

Client

Status

Priority

Date

Allow global search: clients, tasks, equipment, technical notes.

WORK LOG / TIME TRACKING

Each task can have multiple work logs.

Time registration methods:

Manual entry (date, description, hours & minutes)

Optional timer (start/stop, editable manually)

Deduct hours automatically from client contracts if applicable.

QUICK WORK ENTRY

Single screen or button for ultra-fast work registration:

Select client

Enter task description

Enter time (manual or timer)

Automatically deduct contract hours

CALENDAR AND SCHEDULING

Daily, weekly, monthly views

Drag and drop to reschedule tasks

Highlight overdue tasks

CLIENT MAP

Interactive map showing client locations.

Click a client to view info, pending tasks, recent work logs

Filter to show only clients with pending tasks

REPORTS

Monthly reports per client (tasks, work logs, hours, remaining contract hours)

Export to CSV or PDF

AUTOMATIONS

Create tasks automatically from email (subject = task title, body = description)

Create tasks automatically from WhatsApp messages via webhook

Recurring tasks generation (monthly backup verification, quarterly maintenance, yearly inspections)

CHECKLISTS AUTOMÁTICAS

Associate checklists to task types or equipment types

Display checklist when starting a task

Allow marking items as done and adding notes

ALERTAS INTELIGENTES

Contract hours almost exhausted

Contract nearing renewal

Equipment warranty expiration

Overdue tasks

PROFITABILITY / RENTABILIDADE

Track total hours worked per client

Billable hours

Hourly rate

Total billed

Estimated costs

Net profit

Highlight most and least profitable clients

BILLING / FATURAÇÃO AUTOMÁTICA

Each work log or task can have hourly rate and calculated value

Automatically generate monthly invoices per client

Include tasks, hours, hourly rate, total value

Allow export to PDF or CSV

Keep invoice history per client

CLIENT PORTAL

Each client has a secure login

Can view tasks completed, work logs, remaining hours

Can download reports and invoices

View status of equipment and maintenance

Alerts on upcoming tasks or contract expiry

DATABASE STRUCTURE

Automatically create relational tables for:

Clients
Tasks
WorkLogs
Contracts
Equipment
TechnicalNotes
Invoices

Include proper relationships and allow fast navigation between modules.

PERFORMANCE & MOBILE

Optimize for quick task entry

Optimize mobile layout (PWA support, installable on phone, full screen)

Quick access buttons for daily operations

VISUAL & UX

Clean, professional interface

Sidebar sections: Dashboard, Tasks, Clients, Equipment, Contracts, Calendar, Reports, Invoices, Client Portal

Color indicators for priority, status, and alerts

Icons for modules

Quick navigation between tasks and clients

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3aaacf30-9afb-454f-986a-b9b7486a7520).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
