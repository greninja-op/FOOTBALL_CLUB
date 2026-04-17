# COURT JUSTICE - PROJECT DOCUMENTATION

**Project Name:** Court Justice - Digital Court Case Management System  
**Version:** 1.0.0  
**Platform:** Web Application  
**Architecture:** Full-Stack MERN-based System with AI Integration

---

# 1. INTRODUCTION

## 1.1 Project Overview

The Court Justice system is a comprehensive, web-based application designed to replace traditional, paper-based court operations in the Indian judicial system. It digitizes and streamlines key legal and administrative workflows by providing four distinct, role-based interfaces:

- **Admin Panel** - Central control for user verification and system management
- **Judge Panel** - Judicial hub for cause lists, hearings, and judgments
- **Lawyer Panel** - Legal practice management for cases and clients
- **Civilian Panel** - Accessible interface for citizens to access justice

These modules are not isolated; they function as a single, interconnected ecosystem. This project moves the judicial institution away from fragmented, manual processes toward a centralized, efficient, and data-driven operational model.

**Real-Time Data Integration:**

The system's core value lies in its real-time data integration. Actions taken by one user role are instantly reflected for others:

- When a **judge schedules a hearing**, it immediately appears in the lawyer's calendar and generates a notice for the civilian petitioner
- When a **lawyer uploads evidence**, it generates an instant notification on the judge's dashboard
- When an **admin verifies a lawyer**, the account is immediately activated with full access

**Technology Foundation:**

The portal is built on a modern, scalable technology stack:

- **Backend**: Node.js with Express for server-side business logic
- **Database**: PostgreSQL for persistent data storage
- **Frontend**: React.js with Material-UI components for dynamic user interface
- **File Storage**: MinIO (S3-compatible) with SHA-256 hash verification
- **AI Services**: Python FastAPI with Ollama and Qwen 2.5 LLM
- **Authentication**: JWT-based secure authentication with bcrypt password hashing

**Key Architectural Feature:**

A microservices system where:
- **Node.js API** handles all data (CRUD) operations and authentication
- **Python FastAPI service** manages AI-powered features (legal assistance, OCR scanning, petition generation)

**Module Definitions:**

The four modules provide comprehensive functionality:

1. **Admin Panel** - Central control center for user verification and system management
2. **Judge Panel** - Judicial hub for managing cause lists, conducting hearings, and writing judgments
3. **Lawyer Panel** - Legal practice management tool for handling cases, clients, and document generation
4. **Civilian Panel** - Accessible interface for citizens to file cases, track status, and receive legal guidance

This project provides a complete, end-to-end solution for a modern judicial institution.

---


## 1.2 Problem Statement

The traditional court management system is fundamentally inefficient, relying on outdated, manual, and disconnected processes. This legacy approach creates significant operational bottlenecks and a poor user experience for all stakeholders in the judicial system.

**Challenges for Citizens:**

Citizens face multiple barriers in accessing justice:

- Forced to waste valuable time traveling to court premises to file cases
- Must constantly visit physical notice boards for hearing dates and court orders
- Often miss critical deadlines due to lack of timely notifications
- Case filing process requires multiple visits and physical form submissions
- Manual verification creates unnecessary delays in accessing justice
- No way to track case status without visiting court in person

**Challenges for Legal Professionals:**

Lawyers are burdened with excessive administrative overhead:

- Physically maintaining case files across multiple cases
- Manually tracking hearing schedules in separate paper registers
- Time-consuming and highly susceptible to human error
- Missed hearings due to scheduling conflicts
- Lost documents with no backup mechanism
- Difficulty managing multiple clients efficiently
- No centralized system for case information

**Data Fragmentation Issues:**

The reliance on paper files and manual registers leads to severe problems:

- No single, reliable source of truth for case information
- Impossible to retrieve real-time case status
- Hearing schedules not synchronized across stakeholders
- Judicial statistics unavailable for administrative reporting
- Case files often misplaced or damaged
- Evidence documents lack proper tracking
- No mechanism to verify document authenticity
- Difficult to maintain audit trail

**System Limitations:**

This existing system suffers from critical deficiencies:

- **Slow**: Manual processes cause significant delays
- **Error-prone**: Human errors in data entry and file management
- **Inaccessible**: Requires physical presence during working hours
- **Opaque**: Limited visibility into case progress
- **Insecure**: Risk of document tampering and loss

The system is incapable of meeting the demands of a modern judicial institution seeking transparency, efficiency, and accessibility.

---

## 1.3 Project Objectives

The primary objective of this project is to design and develop a centralized, web-based Court Justice Management System that eliminates the inefficiencies inherent in the traditional, paper-based judicial model. To achieve this vision, the project is guided by the following specific and measurable goals:

### To Centralize Judicial Administration

Develop a secure, database-driven Admin Panel that acts as the single source of truth for all judicial data:

- Consolidate user records, case files, and lawyer credentials from paper files and isolated registers
- Manage entire user verification workflow with automated tracking
- Implement Bar Council ID validation for lawyer registration
- Provide comprehensive audit logging for system oversight and compliance
- Enable system-wide statistics and reporting
- Configure system settings and parameters centrally

### To Streamline Judicial Workflows

Support judges by digitizing their most repetitive and time-intensive judicial tasks:

- Enable digital cause list management with multi-criteria filtering
- Provide real-time case review with AI-powered summarization
- Automate hearing scheduling with instant notifications
- Offer streamlined interface for judgment writing
- Reduce administrative overhead significantly
- Allow judges to focus more on delivering justice efficiently
- Maintain proper audit trail for all judicial actions

### To Enhance Legal Professional Efficiency

Provide lawyers with a unified, device-independent Lawyer Panel for complete digital legal practice management:

- Personalized dashboard with case statistics and win rate calculations
- Comprehensive case and client management system
- Evidence document upload with OCR scanning capabilities
- AI-powered legal document generation (petitions, applications, affidavits)
- Instant case status updates and hearing notifications
- Calendar view for hearing schedule management
- 24/7 access to all essential legal practice services
- SHA-256 hash verification for document integrity

### To Empower Citizens with Access to Justice

Provide civilians with an accessible Civilian Panel that democratizes access to the judicial system:

- Digital case filing with CNR number generation (KL-HC-YYYY-NNNNNN format)
- Real-time case tracking with complete timeline
- Court notice delivery via digital platform
- AI legal assistant for guidance in simple language
- Automated petition building for non-technical users
- Hearing schedule notifications
- Evidence upload capability during proceedings
- Navigate legal system without geographical or knowledge barriers

### To Improve Data Integrity and Communication

Ensure seamless, real-time data synchronization across all four modules:

- Any action in one panel triggers immediate updates in relevant modules
- Example: Judge schedules hearing → Lawyer gets calendar update + Civilian receives notice
- Eliminate information silos completely
- Replace outdated physical notice-board communication with automated alerts
- Ensure document integrity through SHA-256 hash verification
- Maintain comprehensive audit logs for all critical operations
- Enable real-time status tracking for all stakeholders
- Provide single source of truth for all judicial data

---

## 1.4 Scope of the Project

The scope of this project is to design, build, and deploy a fully functional web-based court management portal capable of managing the institution's core judicial and administrative processes. The system encompasses the following four major functional modules:

**Admin Panel Scope** This module covers complete administrative and system management. Its scope includes CRUD operations for all user accounts (civilians, lawyers, judges) in the users table; full user verification workflow management, including lawyer registration approval with Bar Council ID validation, user status management (active/inactive), broadcasting system-wide notices, and comprehensive audit logging via the audit_logs table. Additionally, it includes creating judge accounts with employee ID and court hall number assignment, generating system statistics (total users by role, pending verifications, total cases, document counts), and managing system-wide settings and configurations.

**Judge Panel Scope** This module supports judicial-oriented functionalities. Its scope includes viewing daily cause lists with multi-criteria filtering; reviewing case files with AI-powered summarization via the cases and evidence tables; scheduling and managing hearings through the hearings table; conducting digital courtroom proceedings with PDF document viewing; writing and finalizing judgments with automated lawyer statistics updates in the lawyer_stats table; and disposing cases with outcome recording (WIN, LOSS, SETTLED, ALLOWED, DISMISSED). All interactions are database-backed and updated in real time with proper audit trail maintenance.

**Lawyer Panel Scope** This module empowers legal professionals to manage their practice efficiently. Its scope includes a personalized dashboard with case statistics and win rate calculations, viewing assigned cases with client information, managing multiple clients through linked case tracking, uploading evidence documents to MinIO storage with SHA-256 hash verification via the evidence table, using AI-powered OCR document scanner (EasyOCR) for digitizing physical documents, generating legal templates (bail applications, vakalatnama, affidavits) using Qwen 2.5 LLM, viewing hearing schedules in calendar format, and accessing comprehensive case history with real-time status updates.

**Civilian Panel Scope** This module provides citizens with accessible justice services. Its scope includes digital case filing with petition PDF upload and automatic CNR number generation (KL-HC-YYYY-NNNNNN format), real-time case status tracking through the cases table, viewing court notices and orders via the notices table, uploading additional evidence documents during case proceedings, accessing AI legal assistant chatbot (Qwen 2.5) for legal guidance in simple language, using AI petition builder for automated legal document generation, receiving instant notifications for hearing schedules and case updates, and viewing complete case timeline with hearing history and judge notes.

**Out of Scope** The project explicitly excludes functionalities such as real payment gateway integration (mock payment only), video conferencing for virtual hearings, mobile native applications (iOS/Android), multi-language support beyond English, e-signature integration with Aadhaar, SMS notifications (email only), advanced business intelligence analytics, and integration with external legal databases or National Judicial Data Grid (NJDG). These features are identified as potential future enhancements but are not part of the current development scope.

---


# 2. SYSTEM SPECIFICATIONS

## 2.1 Software Specification

The system is developed using a modern microservices architecture, separating the Presentation (client-side), Logic (server-side), and Data (database) layers. A key innovation in this project is its dual-backend architecture, which utilizes two distinct server-side technologies to handle specific tasks, ensuring both high performance and AI-powered capabilities.

**Presentation Layer (Client-Side):** This layer is responsible for rendering the user interface (UI) and handling all user-facing interactions within the browser. The foundational technologies are:
• HTML5, CSS3, and JavaScript (ES6): These are the core technologies. HTML5 is used to provide the semantic structure for all pages across the four role-based panels (Admin, Judge, Lawyer, Civilian). CSS3 is employed for all custom styling, layout, responsive design (ensuring the portal works on mobile, tablet, and desktop), and glassmorphism design effects. JavaScript (ES6+) is the primary language for all client-side logic, event handling, and data manipulation.
• React.js (v18.2.0): This project uses React as the principal JavaScript library for building the user interface. It was chosen for its component-based architecture, which allows for the creation of reusable UI elements (e.g., buttons, cards, dashboards, forms). Its use of a virtual DOM ensures efficient UI updates, which is critical for a data-intensive judicial management system. React Hooks (useState, useEffect, useContext) are extensively used for state management.
• Material-UI (v5.15.3) & Vite: To accelerate development and create a professional aesthetic, the Material-UI component library is used for its comprehensive set of pre-built components following Material Design principles. Vite (v5.0.11) serves as the build tool, providing fast development server with Hot Module Replacement (HMR) and optimized production builds.

**Business Logic Layer (Server-Side):** The server-side logic is handled by two specialized backends:
• Node.js with Express (API Server): Node.js (v20.x) with Express (v4.18.2) serves as the primary workhorse for all core business logic and data processing. The Node.js API backend is responsible for handling all user authentication (issuing and validating JWT tokens with bcrypt password hashing), processing all API requests from the React client, and executing all Create, Read, Update, and Delete (CRUD) operations with the PostgreSQL database. It also securely handles all file uploads (petition PDFs, evidence documents) to MinIO object storage with SHA-256 hash calculation for integrity verification.
• Python with FastAPI (AI Service): Python (v3.11) with FastAPI is employed as the secondary application server running on port 5000. Its primary role is to manage all AI-powered features through integration with Ollama and Qwen 2.5 LLM. This includes the AI Legal Assistant chatbot with role-specific responses, OCR document scanning using EasyOCR for digitizing physical documents, automated petition generation using ReportLab for PDF creation, and AI-powered case summarization for judges. The Node.js backend forwards AI requests to this service via HTTP API calls.

**Data Storage Layer (Database & File Storage):**
• PostgreSQL (v16): PostgreSQL is the chosen Relational Database Management System (RDBMS). It serves as the single source of truth for all persistent data. Its reliability, ACID compliance, advanced indexing capabilities, and robust support for relational data make it the ideal choice for storing the 8 interconnected tables of the database schema: users, cases, hearings, evidence, lawyer_stats, notices, counters, and audit_logs. PostgreSQL's support for JSONB data types is utilized in the audit_logs table for flexible metadata storage.
• MinIO (S3-Compatible Object Storage): MinIO is used for secure, scalable file storage. All uploaded documents (petition PDFs, evidence files, OCR images) are stored in MinIO buckets with SHA-256 hash verification. This ensures document integrity and provides S3-compatible API for future cloud migration.
• Redis (v7): Redis is employed as an in-memory cache for session management, temporary data storage, and performance optimization of frequently accessed data.

---

## 2.2 Hardware Specification

The hardware requirements are defined for both the server (which hosts the application) and the client (which accesses the application).

**Server-Side Requirements (Minimum):** These specifications are for the server environment responsible for hosting the Node.js API, the Python AI service, the PostgreSQL database, MinIO object storage, and Redis cache.
• Processor: 2.4 GHz Quad-Core CPU (e.g., Intel Xeon, AMD EPYC) or equivalent. A multi-core processor is required to handle concurrent API requests, AI service calls, database queries, and file storage operations. For optimal AI performance with Qwen 2.5 LLM, an 8-core processor is recommended.
• RAM: 16 GB minimum (32 GB recommended). This memory is necessary to run the Node.js processes, the Python FastAPI application with Ollama LLM runtime, the PostgreSQL database service, MinIO storage server, and Redis cache simultaneously. The Qwen 2.5 7B model requires approximately 8 GB RAM, while larger models (14B/32B) require 16-32 GB.
• Storage: 500 GB SSD (Solid State Drive). An SSD is required, not optional, to ensure fast database I/O (read/write speeds), rapid access to MinIO object storage for petition PDFs and evidence documents, and quick loading of AI models. Additional storage may be required based on case volume and document retention policies.
• GPU (Optional): NVIDIA GPU with CUDA support (e.g., RTX 4090, A100) for accelerated AI inference and OCR processing. While not mandatory, GPU acceleration significantly improves response times for AI legal assistant, case summarization, and OCR document scanning.
• Network: A high-bandwidth (1 Gbps minimum), low-latency internet connection to manage numerous concurrent users, handle large file uploads (petition PDFs up to 10 MB), and maintain responsive AI service communication without interruption.

**Client-Side Requirements (Recommended):** These are the specifications for the end-user's device (e.g., an administrator, judge, lawyer, or civilian).
• Device: Any modern desktop, laptop, tablet, or smartphone capable of running a modern web browser. The responsive design ensures optimal experience across all device types.
• RAM: 4 GB or more. Modern web browsers are memory-intensive, and the React.js application with Material-UI components runs entirely within the browser's memory. 8 GB RAM is recommended for judges and lawyers handling multiple cases simultaneously.
• Browser: An up-to-date version of a modern web browser such as Google Chrome (v90+), Mozilla Firefox (v88+), Apple Safari (v14+), or Microsoft Edge (v90+). This is essential for compatibility with HTML5, CSS3, ES6 JavaScript, React.js, and Material-UI components. JavaScript must be enabled for full functionality.
• Network: A stable internet connection (e.g., Broadband, 4G, or 5G with minimum 2 Mbps speed) is required to handle data-rich API requests, PDF document viewing, AI chatbot interactions, and real-time case status updates without significant lag. Higher bandwidth (10+ Mbps) is recommended for uploading large petition files and evidence documents.

---


# 3. SYSTEM ANALYSIS

## 3.1 Existing System

The existing system for court management is a collection of traditional, manual, and disconnected processes that are deeply rooted in physical operations. This legacy model is inefficient, prone to human error, and ill-suited for the demands of a modern, transparent judicial institution. The core problems are found in every major operational workflow.

**Administrative and Case Management Inefficiencies:** The most significant bottleneck is in case filing and management. The process for filing a case is entirely physical; citizens are required to be present at court premises to stand in long queues at the filing counter to submit their petitions. The court staff must then manually verify each document, assign a case number, issue a physical receipt, and update a paper register or a simple spreadsheet. This process is incredibly time-consuming for all parties and places a heavy, repetitive burden on the administrative department. Furthermore, tracking case status, scheduling hearings, and sending notices is a manual, ad-hoc process that often results in missed deadlines and lost documents. Citizens have no way to track their case progress without physically visiting the court.

**Judicial and Legal Professional Overhead:** The legal professionals are similarly burdened with non-legal administrative tasks. The case workflow is entirely physical: lawyers must maintain physical case files, manually track hearing dates across multiple courts in paper diaries, and physically collect evidence documents from clients. Judges must review stacks of paper case files, manually maintain cause lists in registers, and handwrite judgments. This method makes it difficult to manage hearing schedules, track case history, or maintain a secure, auditable record of proceedings. The process for managing evidence and court orders is identical, relying on paper-based filing systems that are susceptible to being lost, damaged, or tampered with.

**Fragmented Communication and Data:** Communication is one of the most critical failures of the existing system. All official notices—from hearing dates and court orders to summons and judgments—are posted on a physical notice board or sent via postal mail. Parties who are not physically present at court can easily miss this critical, time-sensitive information. This results in a chaotic information flow where litigants are often uninformed about their case status. Data is similarly fragmented; case records are kept in one office, lawyer credentials in another, and hearing schedules with individual judges. There is no single source of truth, making it impossible to generate judicial statistics, track case disposal rates, or get a holistic view of a case's complete history. Evidence documents lack proper tracking, and there is no mechanism to verify document authenticity or prevent tampering.

In summary, the existing system is a disjointed and labor-intensive model that creates bottlenecks, frustrates users, delays justice delivery, and is highly susceptible to data loss, document tampering, and human error.

---

## 3.2 Proposed System

The proposed solution is a centralized, web-based Court Justice Management System. This system is designed to directly solve the inefficiencies of the existing model by digitizing all core judicial workflows and consolidating them into a single, unified, and real-time application with AI-powered capabilities.

The core of the proposed system is its 4-panel architecture, which provides a tailored, secure interface for each user role:

1. **The Admin Panel:** This is the high-level control center. It replaces the physical user verification queues and paper registers with a powerful, automated user management module. The administrator can verify lawyer registrations with Bar Council ID validation with a few clicks, manage user accounts (activate/deactivate), broadcast system-wide notices, and view a real-time dashboard of all pending verifications, total cases, and system statistics. This panel also centralizes audit logging, replacing scattered records with a unified database of all system activities with comprehensive tracking of user actions, IP addresses, and timestamps for compliance and security.

2. **The Judge Panel:** This module functions as the judicial hub for case management. It eliminates the need for paper cause lists by providing a streamlined interface for managing hearings, reviewing cases, and writing judgments. Judges can view their daily cause list digitally with multi-criteria filtering, which instantly displays all assigned cases with hearing times. They can then access a real-time case review system with AI-powered summarization that extracts key facts, legal issues, and recommendations. The panel includes a digital courtroom interface with PDF document viewing for petitions and evidence, automated hearing scheduling with instant notifications to lawyers and civilians, and a judgment writing interface with AI assistance. This automates the most time-consuming administrative tasks and allows judges to focus on delivering justice efficiently.

3. **The Lawyer Panel:** This module functions as the legal professional's digital practice management tool. It eliminates the need for physical case files by providing a comprehensive interface for managing cases, clients, and documents. Lawyers can view all assigned cases with client information, case status, and hearing schedules in a unified dashboard. They can upload evidence documents to secure MinIO storage with SHA-256 hash verification, use AI-powered OCR document scanner (EasyOCR) to digitize physical documents, generate legal templates (bail applications, vakalatnama, affidavits) using Qwen 2.5 LLM, and track their professional statistics including win rate, total cases, and case outcomes. The calendar view provides hearing schedule management across all cases, ensuring no missed court dates.

4. **The Civilian Panel:** This module is the "digital justice gateway" for the citizen. It replaces all the physical touchpoints—the filing counter, the notice board, the court office—with a single, 24/7 accessible portal. Citizens are greeted with a personalized dashboard showing real-time notifications for hearing dates and court orders. They can file cases digitally with petition PDF upload and automatic CNR number generation (KL-HC-YYYY-NNNNNN format), track their case status in real-time with complete timeline and hearing history, receive court notices and orders digitally, upload additional evidence during proceedings, access AI legal assistant chatbot (Qwen 2.5) for legal guidance in simple language, and use AI petition builder for automated legal document generation. This democratizes access to justice by removing geographical and knowledge barriers.

By connecting these four panels to a single, central PostgreSQL database, using MinIO for secure file storage with SHA-256 hash verification, and employing a Python FastAPI service for AI-powered features, the proposed system solves the fundamental problem of data fragmentation. An action in one panel—such as a judge scheduling a hearing—is instantly available in the Lawyer Panel and generates a notice in the Civilian Panel. This creates a single source of truth, eliminates information silos, ensures document integrity, and provides a modern, efficient, transparent, and user-friendly experience for the entire judicial system.

---

## 3.3 Feasibility Study

A feasibility study was conducted to evaluate the proposed system's viability from technical, operational, and economic perspectives.

**Technical Feasibility:** The project is technically feasible. The chosen technology stack is a combination of mature, robust, and modern technologies. The core API logic is handled by Node.js with Express (v20.x and v4.18.2), a server-side platform renowned for its scalability, non-blocking I/O, and extensive ecosystem. The PostgreSQL database (v16) is a powerful RDBMS with ACID compliance capable of handling the relational data (8 interconnected tables) required for this project. The dynamic user interface is built in React.js (v18.2.0) with Material-UI (v5.15.3), leading technologies for creating responsive, high-performance, single-page applications with professional design. The project's most complex technical requirement—the AI-powered features—is handled by a Python FastAPI service (v3.11) integrating with Ollama and Qwen 2.5 LLM for legal assistance, OCR scanning with EasyOCR, and automated document generation with ReportLab. File storage is managed by MinIO (S3-compatible) with SHA-256 hash verification for document integrity. This microservices architecture, while advanced, is a well-established pattern. All required technologies are well-documented, widely supported, and fully capable of delivering the features defined in the project scope including AI capabilities, secure file storage, and real-time case tracking.

**Operational Feasibility:** The proposed system is highly feasible from an operational standpoint. It directly addresses the primary "pain points" of its end-users, which strongly incentivizes adoption.
• Administrators: The system automates their most tedious, repetitive, and error-prone tasks (lawyer verification, user management, audit logging). The comprehensive dashboard with real-time statistics and automated workflows provides exceptionally high value, ensuring a high likelihood of adoption.
• Judges: The Judge Panel significantly reduces the administrative burden of managing cause lists, reviewing case files, and tracking hearings. The AI-powered case summarization saves 5-10 minutes per case review, allowing judges to focus on judicial decision-making rather than paperwork. The digital courtroom interface with PDF viewing and judgment writing tools streamlines the entire judicial workflow.
• Lawyers: The system offers immense professional value by providing comprehensive case and client management, automated document generation with AI, OCR scanning for digitizing physical documents, and real-time case status updates. The win rate tracking and professional statistics help lawyers demonstrate their expertise to potential clients.
• Civilians: The system democratizes access to justice by replacing physical queues and geographical barriers with 24/7, on-demand access to case filing, status tracking, and legal guidance through AI chatbot. The automated petition builder helps non-technical users navigate complex legal procedures. User acceptance is expected to be immediate and enthusiastic, particularly among citizens who previously faced significant barriers to accessing the judicial system.

**Economic Feasibility:** The project is economically feasible. The primary investment is the one-time cost of development and initial setup. This investment is projected to provide a significant return by:
1. Reducing Administrative Overhead: Automating case filing, hearing scheduling, notice delivery, and user verification frees up countless hours of court staff time, which can be re-allocated to higher-value judicial tasks. Judges save significant time with AI-powered case summarization and digital case review.
2. Eliminating Material Costs: The system removes the reliance on paper petitions, physical case files, printed notices, and physical file storage. MinIO object storage provides scalable, cost-effective file management compared to physical storage infrastructure.
3. Reducing Errors and Delays: By eliminating manual data entry and providing SHA-256 hash verification for documents, the system drastically reduces the risk of costly human errors, lost case files, and document tampering. Automated CNR number generation ensures uniqueness and prevents duplicate case registrations.
4. Improving Access to Justice: The system reduces case processing time, minimizes delays caused by manual workflows, and provides citizens with transparent, real-time case tracking. This improves judicial efficiency and public trust in the legal system.
5. Leveraging Open-Source Technologies: The use of open-source technologies (PostgreSQL, MinIO, Ollama, EasyOCR) minimizes licensing costs while providing enterprise-grade capabilities. The long-term savings in operational efficiency, error reduction, and improved justice delivery are projected to significantly outweigh the initial development cost, making this a sound economic investment for judicial modernization.

---


# 4. SYSTEM DESIGN & ARCHITECTURE

## 4.1 System Architecture

The system is designed using a modern 3-tier architecture, separating the Presentation (Client), Logic (Server), and Data (Database) layers. A key feature of this project's architecture is a dual-backend system, which strategically separates the traditional data request/response logic from AI-powered intelligent features.

1. **Presentation Layer (Client):** A dynamic, single-page application (SPA) built in React.js. This layer runs entirely in the user's browser, managing the UI, state, and all user interactions.

2. **Logic Layer 1 (API Server):** A robust Node.js with Express server acts as the primary API backend. It is responsible for handling all business logic, processing data, managing file uploads to MinIO object storage, and executing all secure Create, Read, Update, and Delete (CRUD) operations with the database. It also handles user authentication by issuing and validating stateless JWTs (JSON Web Tokens).

3. **Logic Layer 2 (AI Service Server):** A separate Python FastAPI server. Its primary role is to manage all AI-powered features through integration with Ollama and Qwen 2.5 LLM. This server is responsible for processing AI legal assistant requests, performing OCR document scanning using EasyOCR, generating automated legal petitions, and providing AI-powered case summarization for judges.

4. **Data Layer (Database):** A PostgreSQL relational database serves as the single source of truth, storing all persistent data for users, cases, and judicial records. MinIO handles file storage for petition PDFs and evidence documents with SHA-256 hash verification.

This dual-backend architecture provides the best of both worlds: the scalability and proven data-handling of Node.js for the core API, and the powerful AI capabilities of Python for intelligent legal assistance and document processing.

---

## 4.2 Data Flow Diagram (DFD)

A Data Flow Diagram (DFD) is a graphical representation of the flow of data through an information system. It illustrates how data is processed by the system in terms of inputs and outputs.

A DFD also known as a "bubble chart" has the purpose of clarifying system requirements and identifying major transformations that will become programs in system design. So, it is the starting point of the design to the lowest level of detail. A DFD consists of a series of bubbles joined by data flows in the system.

### DFD Symbols

In the DFD, there are four symbols:

```
    ┌─────────────┐
    │             │
    │   CIRCLE    │        - Represents a process that transforms data streams
    │             │
    └─────────────┘


    ──────────►            - Represents flow of data


    ┌─────────────┐
    │             │        - Represents a data source or destination
    │             │          (External Entity: Civilian, Lawyer, Judge, Admin)
    └─────────────┘


    ║             ║
    ║  DATABASE   ║        - Represents the database
    ║             ║          (PostgreSQL tables, MinIO storage)
    ║             ║

```

### Rules for Drawing Data Flow Diagrams

• Rule 1: Establish the context of the data flow diagram by identifying all the net input and output data flows.
• Rule 2: Select a starting point for drawing the DFD.
• Rule 3: Give meaningful labels to all data flow lines.
• Rule 4: Label all processes with action verbs that relate input and output data flows.
• Rule 5: Omit insignificant functions routinely handled in the programming process.
• Rule 6: Do not include control or flow of control information.
• Rule 7: Do not try to put too much information in one DFD.
• Rule 8: Be prepared to start over.

---

### 4.2.1 Level 0 Context Level Diagram

The Level 0 DFD, also known as the Context Diagram, provides the highest-level view of the Court Justice system. It shows the system as a single process and illustrates how external entities interact with it.

```
                                    ┌─────────────────┐
                                    │                 │
                          REQUEST──►│    CIVILIAN     │
                              ┌─────│                 │
                              │     └─────────────────┘
                              │              │
                              │              │ RESPONSE
                              │              ▼
                              │     ┌──────────────────────┐
                              │     │                      │
                              │     │                      │
    ┌─────────────────┐       │     │   COURT JUSTICE     │
    │                 │       │     │   MANAGEMENT        │
    │     ADMIN       │◄──────┘     │   SYSTEM            │
    │                 │             │                      │
    └─────────────────┘             │                      │
              │                     └──────────────────────┘
              │ RESPONSE                     │        ▲
              │                              │        │
              └──────────────────────────────┘        │
                          REQUEST                     │
                                                      │
                                            RESPONSE  │ REQUEST
                                                      │
                                         ┌────────────┴────────┐
                                         │                     │
                                         │      LAWYER         │
                                         │                     │
                                         └─────────────────────┘
                                                      ▲
                                                      │
                                            RESPONSE  │ REQUEST
                                                      │
                                         ┌────────────┴────────┐
                                         │                     │
                                         │      JUDGE          │
                                         │                     │
                                         └─────────────────────┘
```

**External Entities:**
- **CIVILIAN**: Files cases, tracks status, receives notices
- **LAWYER**: Manages cases, uploads evidence, generates documents
- **JUDGE**: Reviews cases, schedules hearings, writes judgments
- **ADMIN**: Verifies users, manages system, views audit logs

**Data Flows:**
- **REQUEST**: User actions (login, file case, upload document, schedule hearing, etc.)
- **RESPONSE**: System outputs (case status, CNR number, notifications, reports, etc.)

[Diagram placeholder - to be replaced with actual image]

---

### 4.2.2 Level 1 Admin Level Diagram

The Level 1 DFD for the Admin module breaks down the administrative processes into detailed sub-processes. It shows how the Admin interacts with various system components to manage users, verify lawyers, handle system oversight, and maintain audit logs.

```
                    ┌──────────────┐
                    │   Manage     │◄────request────┐
                    │   User       │                │
                    └──────┬───────┘                │
                           │response                │
                           │                        │
                           ▼                        │
                    ║─────────────║                 │
                    ║   users     ║                 │
                    ║─────────────║                 │
                           │                        │
                           │request                 │
                           ▼                        │
                    ┌──────────────┐         ┌─────┴──────┐
              ┌────►│    ADMIN     │◄────────│   Verify   │
              │     │  (External   │         │   Lawyers  │
              │     │   Entity)    │────────►└────────────┘
              │     └──────┬───────┘  request      │
              │            │                       │response
    response  │            │response               │
              │            │                       ▼
       ┌──────┴──────┐     │              ║──────────────────║
       │   Manage    │     │              ║  lawyer_stats    ║
       │   Notices   │     │              ║──────────────────║
       └──────┬──────┘     │
              │            │request
              │response    │
              │            ▼
       ║─────────────║  ┌──────────────┐
       ║   notices   ║  │   Generate   │
       ║─────────────║  │   System     │
              ▲         │   Reports    │
              │         └──────┬───────┘
              │                │response
              │                │
              │request         ▼
       ┌──────┴──────┐  ║──────────────────║
       │   View      │  ║   audit_logs     ║
       │   Audit     │  ║──────────────────║
       │   Logs      │         ▲
       └─────────────┘         │
                               │request/response
                               │
                        ║──────────────────║
                        ║     cases        ║
                        ║──────────────────║
```

**Processes:**
1. **Manage User** - Create, update, activate/deactivate user accounts
2. **Verify Lawyers** - Approve/reject lawyer registrations with Bar Council ID validation
3. **Manage Notices** - Broadcast system-wide notices to users
4. **View Audit Logs** - Monitor system activities and user actions
5. **Generate System Reports** - Create statistics and compliance reports

**Data Stores:**
- **users** - User account information
- **lawyer_stats** - Lawyer credentials and Bar Council IDs
- **notices** - System notices and announcements
- **audit_logs** - System activity logs
- **cases** - Case statistics for reporting

**External Entity:**
- **ADMIN** - System administrator performing oversight tasks

[Diagram placeholder - to be replaced with actual image]

---

### 4.2.3 Level 1 Judge Level Diagram

The Level 1 DFD for the Judge module breaks down the judicial processes into detailed sub-processes. It shows how the Judge interacts with various system components to manage hearings, review cases, write judgments, and maintain the cause list.

```
                                    ║─────────────║
                                    ║   notices   ║
                                    ║─────────────║
                                           ▲
                                           │request
                                           │
                                    ┌──────┴──────┐
                              ┌────►│   Manage    │
                              │     │   Notices   │
                              │     └─────────────┘
                              │            ▲
                              │response    │request
                              │            │
                    ┌─────────┴────────────┴─────┐
                    │                            │
                    │         JUDGE              │◄──────┐
                    │      (External Entity)     │       │
                    │                            │       │
                    └─┬──────┬──────┬──────┬────┘       │
                      │      │      │      │            │
            request   │      │      │      │  request   │response
                      │      │      │      │            │
                      ▼      ▼      ▼      ▼            │
              ┌──────────┐ ┌────────────┐ ┌──────────┐ │
              │ Schedule │ │   Review   │ │  Write   │ │
              │ Hearing  │ │   Cases    │ │ Judgment │ │
              └────┬─────┘ └─────┬──────┘ └────┬─────┘ │
                   │             │                │      │
         request   │   request   │      request   │      │
                   │             │                │      │
                   ▼             ▼                ▼      │
            ║───────────║  ║───────────║   ║───────────║│
            ║ hearings  ║  ║   cases   ║   ║   cases   ║│
            ║───────────║  ║───────────║   ║───────────║│
                   │             │                │      │
         response  │   response  │      response  │      │
                   │             │                │      │
                   └─────────────┴────────────────┴──────┘
                                 │
                                 │request
                                 ▼
                          ┌─────────────┐
                          │  AI Case    │
                          │ Summarizer  │
                          └──────┬──────┘
                                 │response
                                 │
                                 ▼
                          ║─────────────║
                          ║  evidence   ║
                          ║─────────────║
                                 ▲
                                 │request/response
                                 │
                          ┌──────┴──────┐
                          │   Update    │
                          │   Lawyer    │
                          │   Stats     │
                          └─────────────┘
                                 │
                                 ▼
                          ║──────────────────║
                          ║  lawyer_stats    ║
                          ║──────────────────║
```

**Processes:**
1. **Manage Notices** - Send hearing notices and court orders
2. **Schedule Hearing** - Set hearing dates and times for cases
3. **Review Cases** - Examine case files, petitions, and evidence
4. **Write Judgment** - Compose and finalize case judgments
5. **AI Case Summarizer** - Generate AI-powered case summaries
6. **Update Lawyer Stats** - Update win/loss records when disposing cases

**Data Stores:**
- **notices** - Court notices and orders
- **hearings** - Hearing schedule and dates
- **cases** - Case information and status
- **evidence** - Evidence documents and files
- **lawyer_stats** - Lawyer performance statistics

**External Entity:**
- **JUDGE** - Judicial officer managing cases and hearings

[Diagram placeholder - to be replaced with actual image]

---

### 4.2.4 Level 1 Civilian Level Diagram

The Level 1 DFD for the Civilian module breaks down the citizen-facing processes into detailed sub-processes. It shows how the Civilian interacts with various system components to file cases, track status, upload evidence, and access legal assistance.

```
                                                    ║─────────────║
                                              ┌────►║    users    ║
                                              │     ║─────────────║
                                              │            │
                                    ┌─────────┴──────┐     │response
                                    │   View         │◄────┘
                                    │   Dashboard    │
                                    └────────────────┘
                                              ▲
                                              │response
                                              │
                    ┌─────────────────────────┴──────────────────────┐
                    │                                                 │
                    │              CIVILIAN                           │
                    │           (External Entity)                     │
                    │                                                 │
                    └─┬────┬────┬────┬────┬────┬────┬───────────────┘
                      │    │    │    │    │    │    │
            request   │    │    │    │    │    │    │  request
                      │    │    │    │    │    │    │
                      ▼    ▼    ▼    ▼    ▼    ▼    ▼
              ┌──────────┐┌──────────┐┌──────────┐┌──────────┐
              │   File   ││  Track   ││  Upload  ││   View   │
              │   Case   ││  Status  ││ Evidence ││  Notices │
              └────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘
                   │           │            │           │
         request   │ request   │  request   │ request   │
                   │           │            │           │
                   ▼           ▼            ▼           ▼
            ║───────────║║───────────║║───────────║║───────────║
            ║   cases   ║║   cases   ║║  evidence ║║  notices  ║
            ║───────────║║───────────║║───────────║║───────────║
                   │           │            │           │
         response  │ response  │  response  │ response  │
                   │           │            │           │
                   └───────────┴────────────┴───────────┘
                               │
                     ┌─────────┴──────────┐
                     │                    │
                     ▼                    ▼
              ┌─────────────┐      ┌─────────────┐
              │  Generate   │      │  AI Legal   │
              │  CNR Number │      │  Assistant  │
              └──────┬──────┘      └──────┬──────┘
                     │                    │
           response  │          response  │
                     │                    │
                     ▼                    │
              ║─────────────║             │
              ║  counters   ║             │
              ║─────────────║             │
                                          │
                     ┌────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │  AI Petition│
              │   Builder   │
              └──────┬──────┘
                     │response
                     │
                     └──────────────────────┐
                                            │
                                            ▼
                                     ║─────────────║
                                     ║   hearings  ║
                                     ║─────────────║
```

**Processes:**
1. **View Dashboard** - Display personalized case overview and notifications
2. **File Case** - Submit new case with petition PDF upload
3. **Track Status** - Monitor case progress and hearing dates
4. **Upload Evidence** - Submit additional evidence documents
5. **View Notices** - Read court notices and orders
6. **Generate CNR Number** - Automatically create unique case number
7. **AI Legal Assistant** - Get legal guidance through chatbot
8. **AI Petition Builder** - Generate automated legal petitions

**Data Stores:**
- **users** - User profile information
- **cases** - Case records and status
- **evidence** - Evidence documents with SHA-256 hash
- **notices** - Court notices and orders
- **hearings** - Hearing schedule
- **counters** - CNR number sequence generator

**External Entity:**
- **CIVILIAN** - Citizen filing and tracking cases

[Diagram placeholder - to be replaced with actual image]

---

## 4.3 Table Design

The data design transforms the information domain model created during analysis into the data structures required to implement the software. The data objects and relationships defined in the Entity Relationship Diagram (ERD), along with the detailed data content depicted in the data dictionary, provide the foundation for the data design activity.

The overall objective of developing database technology is to treat data as an organizational resource and as an integrated whole. A Database Management System (DBMS) allows data to be protected and organized separately from other system resources. A database is an integrated collection of data, representing the difference between logical data and physical data representations.

**Normalization**

Designing a database is a complex task, and normalization theory is an essential aid in this process. Normalization focuses on transforming the conceptual schema into a form suitable for computer representation. A poorly designed database can lead to undesirable issues such as:
• Repetition of information
• Inability to represent certain information
• Loss of information

To minimize these anomalies, normalization is applied. A normalized database helps reduce redundancy, prevent inconsistencies, and maintain data in an organized structure. Maintaining tables in a normalized manner ensures reliability and efficiency.

**First Normal Form (1NF)**
A relation is in 1NF if and only if all attributes are based on a single domain. The goal is to remove repeating groups and ensure that each entry has a single, atomic value.

**Second Normal Form (2NF)**
A table is in 2NF when:
• It is already in 1NF
• Every attribute is fully functionally dependent on the entire primary key, not just a part of it

**Third Normal Form (3NF)**
A table is in 3NF when:
• It is in 2NF
• It contains no transitive dependencies
• All non-key attributes are functionally dependent only on the primary key

**Objectives of Database Organization**

The database aims to achieve three primary goals:
1. Data Integration
2. Data Integrity
3. Data Independence

**Database Design Process**

A database is implemented using a DBMS package, each with unique characteristics and design techniques. There are six major steps in the design process, and the first five are typically done on paper before implementation.

1. Identify the tables and relationships
2. Identify the data needed for each table and relationship
3. Resolve the relationships
4. Verify the design
5. Implement the design
6. Review and refine (post-implementation)

• **Primary Key**: Uniquely identifies each record within a table
• **Foreign Key**: A primary key from another table, establishing relational connections

The quality of database design plays a crucial role in measuring the overall efficiency of the system.

---

### 4.3.1 Table Structure

The Court Justice system uses 8 interconnected tables in PostgreSQL database to manage all judicial data. Each table is designed following normalization principles to ensure data integrity and efficiency.

#### 4.3.1.1 Users Table

**Table Name:** users  
**Primary Key:** id

| #   | Name              | Type         | Collation          | Attributes      | Null | Default | Extra                                                    |
| --- | ----------------- | ------------ | ------------------ | --------------- | ---- | ------- | -------------------------------------------------------- |
| 1   | id                | SERIAL       | -                  | PRIMARY KEY     | NO   | -       | auto_increment                                           |
| 2   | email             | VARCHAR(255) | utf8mb4_unicode_ci | UNIQUE NOT NULL | NO   | NULL    | -                                                        |
| 3   | password_hash     | TEXT         | utf8mb4_unicode_ci | NOT NULL        | NO   | NULL    | -                                                        |
| 4   | role              | VARCHAR(50)  | utf8mb4_unicode_ci | NOT NULL, CHECK | NO   | NULL    | CHECK (role IN ('CIVILIAN', 'LAWYER', 'JUDGE', 'ADMIN')) |
| 5   | full_name         | VARCHAR(255) | utf8mb4_unicode_ci | -               | YES  | NULL    | -                                                        |
| 6   | phone             | VARCHAR(20)  | utf8mb4_unicode_ci | -               | YES  | NULL    | -                                                        |
| 7   | address           | TEXT         | utf8mb4_unicode_ci | -               | YES  | NULL    | -                                                        |
| 8   | linked_lawyer_id  | INT          | -                  | FOREIGN KEY     | YES  | NULL    | REFERENCES users(id)                                     |
| 9   | employee_id       | VARCHAR(50)  | utf8mb4_unicode_ci | -               | YES  | NULL    | For judges and admin staff                               |
| 10  | court_hall_number | VARCHAR(20)  | utf8mb4_unicode_ci | -               | YES  | NULL    | For judges                                               |
| 11  | is_verified       | BOOLEAN      | -                  | -               | YES  | FALSE   | -                                                        |
| 12  | created_at        | TIMESTAMP    | -                  | -               | YES  | NOW()   | DEFAULT GENERATED                                        |
| 13  | updated_at        | TIMESTAMP    | -                  | -               | YES  | NOW()   | DEFAULT GENERATED                                        |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE INDEX: email
- INDEX: idx_users_email ON users(email)

---

#### 4.3.1.2 Cases Table

**Table Name:** cases  
**Primary Key:** id

| #   | Name             | Type         | Collation          | Attributes      | Null | Default      | Extra                                                                           |
| --- | ---------------- | ------------ | ------------------ | --------------- | ---- | ------------ | ------------------------------------------------------------------------------- |
| 1   | id               | SERIAL       | -                  | PRIMARY KEY     | NO   | -            | auto_increment                                                                  |
| 2   | cnr_number       | VARCHAR(50)  | utf8mb4_unicode_ci | UNIQUE NOT NULL | NO   | NULL         | Format: KL-HC-YYYY-NNNNNN                                                       |
| 3   | petitioner_id    | INT          | -                  | FOREIGN KEY     | YES  | NULL         | REFERENCES users(id)                                                            |
| 4   | petitioner_name  | VARCHAR(255) | utf8mb4_unicode_ci | NOT NULL        | NO   | NULL         | -                                                                               |
| 5   | respondent_name  | VARCHAR(255) | utf8mb4_unicode_ci | NOT NULL        | NO   | NULL         | -                                                                               |
| 6   | case_type        | VARCHAR(50)  | utf8mb4_unicode_ci | -               | YES  | 'CIVIL'      | -                                                                               |
| 7   | case_description | TEXT         | utf8mb4_unicode_ci | -               | YES  | NULL         | -                                                                               |
| 8   | lawyer_id        | INT          | -                  | FOREIGN KEY     | YES  | NULL         | REFERENCES users(id)                                                            |
| 9   | judge_id         | INT          | -                  | FOREIGN KEY     | YES  | NULL         | REFERENCES users(id)                                                            |
| 10  | status           | VARCHAR(50)  | utf8mb4_unicode_ci | CHECK           | YES  | 'FILED'      | CHECK (status IN ('FILED', 'HEARING', 'VERDICT_PENDING', 'DISPOSED', 'CLOSED')) |
| 11  | outcome          | TEXT         | utf8mb4_unicode_ci | CHECK           | YES  | NULL         | CHECK (outcome IN ('WIN', 'LOSS', 'SETTLED', 'ALLOWED', 'DISMISSED'))           |
| 12  | judge_notes      | TEXT         | utf8mb4_unicode_ci | -               | YES  | NULL         | -                                                                               |
| 13  | is_urgent        | BOOLEAN      | -                  | -               | YES  | FALSE        | -                                                                               |
| 14  | created_at       | TIMESTAMP    | -                  | -               | YES  | NOW()        | DEFAULT GENERATED                                                               |
| 15  | filing_date      | DATE         | -                  | -               | YES  | CURRENT_DATE | DEFAULT GENERATED                                                               |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE INDEX: cnr_number
- INDEX: idx_cases_cnr ON cases(cnr_number)
- INDEX: idx_cases_status ON cases(status)
- INDEX: idx_cases_lawyer ON cases(lawyer_id)
- INDEX: idx_cases_judge ON cases(judge_id)
- INDEX: idx_cases_urgent ON cases(is_urgent) WHERE is_urgent = TRUE

---

#### 4.3.1.3 Hearings Table

**Table Name:** hearings  
**Primary Key:** id

| #   | Name         | Type         | Collation          | Attributes                     | Null | Default     | Extra                |
| --- | ------------ | ------------ | ------------------ | ------------------------------ | ---- | ----------- | -------------------- |
| 1   | id           | SERIAL       | -                  | PRIMARY KEY                    | NO   | -           | auto_increment       |
| 2   | case_id      | INT          | -                  | FOREIGN KEY, ON DELETE CASCADE | NO   | NULL        | REFERENCES cases(id) |
| 3   | hearing_date | DATE         | -                  | NOT NULL                       | NO   | NULL        | -                    |
| 4   | hearing_time | VARCHAR(20)  | utf8mb4_unicode_ci | -                              | YES  | NULL        | -                    |
| 5   | judge_notes  | TEXT         | utf8mb4_unicode_ci | -                              | YES  | NULL        | -                    |
| 6   | notes        | TEXT         | utf8mb4_unicode_ci | -                              | YES  | NULL        | -                    |
| 7   | next_action  | VARCHAR(100) | utf8mb4_unicode_ci | -                              | YES  | NULL        | -                    |
| 8   | status       | VARCHAR(50)  | utf8mb4_unicode_ci | -                              | YES  | 'SCHEDULED' | -                    |
| 9   | created_at   | TIMESTAMP    | -                  | -                              | YES  | NOW()       | DEFAULT GENERATED    |

**Indexes:**
- PRIMARY KEY: id
- INDEX: idx_hearings_date ON hearings(hearing_date)
- FOREIGN KEY: case_id REFERENCES cases(id) ON DELETE CASCADE

---

#### 4.3.1.4 Evidence Table

**Table Name:** evidence  
**Primary Key:** id

| #   | Name        | Type         | Collation          | Attributes                     | Null | Default | Extra                |
| --- | ----------- | ------------ | ------------------ | ------------------------------ | ---- | ------- | -------------------- |
| 1   | id          | SERIAL       | -                  | PRIMARY KEY                    | NO   | -       | auto_increment       |
| 2   | case_id     | INT          | -                  | FOREIGN KEY, ON DELETE CASCADE | NO   | NULL    | REFERENCES cases(id) |
| 3   | file_name   | VARCHAR(255) | utf8mb4_unicode_ci | NOT NULL                       | NO   | NULL    | -                    |
| 4   | minio_path  | VARCHAR(500) | utf8mb4_unicode_ci | NOT NULL                       | NO   | NULL    | Path in MinIO bucket |
| 5   | file_hash   | VARCHAR(64)  | utf8mb4_unicode_ci | NOT NULL                       | NO   | NULL    | SHA-256 hash         |
| 6   | file_size   | BIGINT       | -                  | -                              | YES  | NULL    | In bytes             |
| 7   | uploaded_by | INT          | -                  | FOREIGN KEY                    | YES  | NULL    | REFERENCES users(id) |
| 8   | uploaded_at | TIMESTAMP    | -                  | -                              | YES  | NOW()   | DEFAULT GENERATED    |

**Indexes:**
- PRIMARY KEY: id
- INDEX: idx_evidence_case ON evidence(case_id)
- FOREIGN KEY: case_id REFERENCES cases(id) ON DELETE CASCADE
- FOREIGN KEY: uploaded_by REFERENCES users(id)

---

#### 4.3.1.5 Lawyer Stats Table

**Table Name:** lawyer_stats  
**Primary Key:** id

| #   | Name           | Type         | Collation          | Attributes          | Null | Default | Extra                 |
| --- | -------------- | ------------ | ------------------ | ------------------- | ---- | ------- | --------------------- |
| 1   | id             | SERIAL       | -                  | PRIMARY KEY         | NO   | -       | auto_increment        |
| 2   | user_id        | INT          | -                  | FOREIGN KEY, UNIQUE | NO   | NULL    | REFERENCES users(id)  |
| 3   | bar_council_id | VARCHAR(100) | utf8mb4_unicode_ci | -                   | YES  | NULL    | -                     |
| 4   | total_cases    | INT          | -                  | -                   | YES  | 0       | -                     |
| 5   | wins           | INT          | -                  | -                   | YES  | 0       | -                     |
| 6   | losses         | INT          | -                  | -                   | YES  | 0       | -                     |
| 7   | win_rate       | DECIMAL(5,2) | -                  | -                   | YES  | 0.00    | Calculated percentage |
| 8   | created_at     | TIMESTAMP    | -                  | -                   | YES  | NOW()   | DEFAULT GENERATED     |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE INDEX: user_id
- FOREIGN KEY: user_id REFERENCES users(id) UNIQUE

---

#### 4.3.1.6 Notices Table

**Table Name:** notices  
**Primary Key:** id

| #   | Name        | Type         | Collation          | Attributes                     | Null | Default  | Extra                                                      |
| --- | ----------- | ------------ | ------------------ | ------------------------------ | ---- | -------- | ---------------------------------------------------------- |
| 1   | id          | SERIAL       | -                  | PRIMARY KEY                    | NO   | -        | auto_increment                                             |
| 2   | user_id     | INT          | -                  | FOREIGN KEY, ON DELETE CASCADE | NO   | NULL     | REFERENCES users(id)                                       |
| 3   | case_id     | INT          | -                  | FOREIGN KEY, ON DELETE CASCADE | YES  | NULL     | REFERENCES cases(id)                                       |
| 4   | title       | VARCHAR(255) | utf8mb4_unicode_ci | NOT NULL                       | NO   | NULL     | -                                                          |
| 5   | message     | TEXT         | utf8mb4_unicode_ci | NOT NULL                       | NO   | NULL     | -                                                          |
| 6   | type        | VARCHAR(50)  | utf8mb4_unicode_ci | CHECK                          | YES  | 'NOTICE' | CHECK (type IN ('NOTICE', 'ORDER', 'SUMMONS', 'JUDGMENT')) |
| 7   | read_status | BOOLEAN      | -                  | -                              | YES  | FALSE    | -                                                          |
| 8   | file_url    | TEXT         | utf8mb4_unicode_ci | -                              | YES  | NULL     | -                                                          |
| 9   | issued_date | TIMESTAMP    | -                  | -                              | YES  | NOW()    | DEFAULT GENERATED                                          |
| 10  | created_at  | TIMESTAMP    | -                  | -                              | YES  | NOW()    | DEFAULT GENERATED                                          |
|     |             |              |                    |                                |      |          |                                                            |

**Indexes:**
- PRIMARY KEY: id
- INDEX: idx_notices_user ON notices(user_id)
- INDEX: idx_notices_case ON notices(case_id)
- INDEX: idx_notices_type ON notices(type)
- INDEX: idx_notices_read ON notices(read_status)

---

#### 4.3.1.7 Counters Table

**Table Name:** counters  
**Primary Key:** id

| #   | Name          | Type        | Collation          | Attributes      | Null | Default | Extra             |
| --- | ------------- | ----------- | ------------------ | --------------- | ---- | ------- | ----------------- |
| 1   | id            | SERIAL      | -                  | PRIMARY KEY     | NO   | -       | auto_increment    |
| 2   | counter_name  | VARCHAR(50) | utf8mb4_unicode_ci | UNIQUE NOT NULL | NO   | NULL    | -                 |
| 3   | year          | INT         | -                  | NOT NULL        | NO   | NULL    | -                 |
| 4   | current_value | INT         | -                  | -               | YES  | 0       | -                 |
| 5   | created_at    | TIMESTAMP   | -                  | -               | YES  | NOW()   | DEFAULT GENERATED |
| 6   | updated_at    | TIMESTAMP   | -                  | -               | YES  | NOW()   | DEFAULT GENERATED |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE INDEX: (counter_name, year)
- INDEX: idx_counters_name_year ON counters(counter_name, year)

---

#### 4.3.1.8 Audit Logs Table

**Table Name:** audit_logs  
**Primary Key:** id

| #   | Name        | Type         | Collation          | Attributes                      | Null | Default | Extra                |
| --- | ----------- | ------------ | ------------------ | ------------------------------- | ---- | ------- | -------------------- |
| 1   | id          | SERIAL       | -                  | PRIMARY KEY                     | NO   | -       | auto_increment       |
| 2   | user_id     | INT          | -                  | FOREIGN KEY, ON DELETE SET NULL | YES  | NULL    | REFERENCES users(id) |
| 3   | action      | VARCHAR(255) | utf8mb4_unicode_ci | NOT NULL                        | NO   | NULL    | -                    |
| 4   | entity_type | VARCHAR(50)  | utf8mb4_unicode_ci | -                               | YES  | NULL    | -                    |
| 5   | entity_id   | INT          | -                  | -                               | YES  | NULL    | -                    |
| 6   | ip_address  | VARCHAR(45)  | utf8mb4_unicode_ci | -                               | YES  | NULL    | IPv4/IPv6            |
| 7   | user_agent  | TEXT         | utf8mb4_unicode_ci | -                               | YES  | NULL    | Browser info         |
| 8   | details     | JSONB        | -                  | -                               | YES  | NULL    | Additional data      |
| 9   | created_at  | TIMESTAMP    | -                  | -                               | YES  | NOW()   | DEFAULT GENERATED    |

**Indexes:**
- PRIMARY KEY: id
- INDEX: idx_audit_logs_user ON audit_logs(user_id)
- INDEX: idx_audit_logs_action ON audit_logs(action)
- INDEX: idx_audit_logs_created ON audit_logs(created_at DESC)
- INDEX: idx_audit_logs_entity ON audit_logs(entity_type, entity_id)

---


# 5. MODULE DESIGN & IMPLEMENTATION

## 5.1 Module 1: Admin Panel (The Control Center)

The Admin Panel is the central nervous system of the entire application. It is a secure, role-restricted module designed to provide administrators with complete control over the portal's users, lawyer verification, and system oversight. The first administrator account is created manually in the database during the build process to bootstrap the system. The interface is designed for efficiency, presenting complex data through manageable, card-based layouts and filtered views. The admin's core processes, such as managing users, verifying lawyers, and monitoring system activity, are defined by the data flows that connect the administrator's actions to the central database.

### 5.1.1 User Management

This module provides the administrator with full Create, Read, Update, and Delete (CRUD) capabilities for all user accounts (civilians, lawyers, judges), which are all stored in the central users table. Instead of presenting an overwhelming list of all users, the system employs an intuitive filtering mechanism. To find users, the admin can filter by role (e.g., "LAWYER"), verification status (e.g., "Pending"), or search by name/email. This provides a focused, manageable list of the relevant users.

When adding a new judge, the admin fills a comprehensive form that includes personal information, employee ID, and court hall number, which populates a new row in the users table with role='JUDGE'. This module also handles all account maintenance including activating/deactivating user accounts. As there is no public-facing password reset workflow, if a user forgets their password, they must contact the administrator, who is the only one authorized to set a new one.

### 5.1.2 Lawyer Verification System

This is the most sophisticated component of the Admin Panel, handling all lawyer registration approvals. The admin reviews pending lawyer registrations from the users table where role='LAWYER' and is_verified=FALSE. The interface displays lawyer details including Bar Council ID from the lawyer_stats table.

The admin can approve or reject each application. Upon approval, the system updates is_verified=TRUE and logs the action in audit_logs table. Upon rejection, the system sends a notification with the reason. This ensures only verified legal professionals can access the Lawyer Panel.

### 5.1.3 System Monitoring & Audit Logs

The administrator is responsible for monitoring system activity and maintaining security. This involves two key processes:

1. **System Statistics**: Viewing comprehensive system statistics including total users by role, pending verifications, total cases, and document counts. These metrics provide real-time oversight of system health and usage.

2. **Audit Log Review**: Reviewing detailed activity logs from the audit_logs table. The audit log interface displays user actions, timestamps, IP addresses, and entity changes, providing complete transparency and accountability for all system operations.

---

## 5.2 Module 2: Judge Panel (The Judicial Hub)

The Judge Panel is a specialized interface designed to empower judicial officers by digitizing and streamlining their core judicial and administrative tasks. It is built to be efficient, intuitive, and seamlessly integrated with the Admin, Lawyer, and Civilian panels, reducing manual work and allowing judges to focus on delivering justice. The module's main data flows illustrate how a judge manages cases, from reviewing petitions to scheduling hearings and writing judgments.

### 5.2.1 Cause List Management

This feature provides judges with a comprehensive and filterable view of all assigned cases, reading data from the cases table. To manage large case loads, the interface includes a powerful multi-criteria filtering system. Judges can instantly find specific cases by filtering by status (e.g., "HEARING"), case type (e.g., "CIVIL"), or urgency flag. Additionally, a real-time search bar allows for quick lookups by CNR number or party names.

The daily cause list displays all hearings scheduled for the current date from the hearings table, showing hearing time, case number, parties involved, and current case stage. This provides judges with a complete overview of their daily judicial workload.

### 5.2.2 Case Review & Hearing Management

This is a core workflow of the Judge Panel, designed to provide complete case information while enabling efficient hearing management.

• **Case Review**: The judge can access complete case details including petition PDF, case description, and all evidence documents. The system retrieves files from MinIO storage and displays them in an integrated PDF viewer.

• **AI Case Summarization**: The judge can request an AI-powered case summary that extracts key facts, legal issues, and recommendations using the Qwen 2.5 LLM. This feature saves 5-10 minutes per case review.

• **Hearing Scheduling**: The judge can schedule hearings by selecting a date and time. The system creates an entry in the hearings table and automatically generates notices in the notices table for the lawyer and civilian, ensuring all parties are informed.

• **Judgment Writing**: The judge can compose and finalize judgments. Upon marking a case as DISPOSED, the system automatically updates the lawyer_stats table to reflect wins/losses, maintaining accurate professional statistics.

---

### 5.2.3 Case Disposition Module

This module digitizes the traditional judgment recording process. The judge selects a case from their assigned cases, and the system displays complete case information. The judge can then enter the judgment outcome (WIN, LOSS, SETTLED, ALLOWED, DISMISSED) and detailed judge notes, which are saved to the cases table.

To ensure the integrity of judicial records, this module includes a critical constraint: a judge cannot edit a case's outcome once it has been marked as DISPOSED. Once a case is finalized, all associated records in the cases table are locked. This module also automatically updates the lawyer_stats table to reflect the outcome, maintaining accurate win/loss records for legal professionals.

---

## 5.3 Module 3: Lawyer Panel (The Legal Practice Hub)

The Lawyer Panel is a specialized interface for legal professionals. It functions as their personalized "digital law office," consolidating all case management, client tracking, and document generation tools into one accessible hub. It is designed to be feature-rich and efficient, serving as an indispensable tool for the lawyer's daily practice. The module's workflows are centered around the lawyer's need to manage cases, track clients, generate documents, and monitor professional statistics.

### 5.3.1 Personalized Dashboard

This is the lawyer's landing page, providing an "at-a-glance" summary of their entire practice status. The dashboard features:

• **Key Statistic Cards**: Prominent cards displaying the lawyer's total cases, win rate percentage, and active cases, pulled from the cases and lawyer_stats tables.

• **Real-Time Case Notifications**: When a judge schedules a hearing or updates case status, a notification card instantly appears with the case CNR number and hearing date.

• **Quick Action Buttons**: Large, intuitive buttons for navigating to the most common sections, such as "View Cases," "Manage Clients," and "Generate Documents."

### 5.3.2 Profile & Professional Statistics

This module serves as the lawyer's professional identity. The profile page displays all their personal information, Bar Council ID, and practice statistics as stored in their users and lawyer_stats table records.

The standout feature is the Professional Statistics Dashboard:

• **Performance Metrics**: Displays total cases handled, wins, losses, and calculated win rate percentage.

• **Case Distribution**: Visual charts showing case breakdown by type (CIVIL, CRIMINAL, FAMILY) and status.

• **Functionality**: The page also includes verification status and Bar Council ID for professional credibility.

### 5.3.3 Case Management Hub

This is the dedicated page for viewing and managing all assigned cases. The system queries the cases table to show a complete list of all cases where lawyer_id matches the current user, sorted by filing date and urgency.

Each case card displays CNR number, parties, case type, status, and next hearing date. To upload evidence, the lawyer clicks on a case and uses the file upload interface (supporting drag-and-drop or browse) to upload documents. This action sends the file to the Node.js API, which saves it to MinIO storage with SHA-256 hash calculation and updates the evidence table. The upload immediately generates a notification for the assigned judge.

### 5.3.4 Client Management

This module provides a comprehensive view of the lawyer's client relationships. The interface displays all civilians linked to the lawyer through the linked_lawyer_id field in the users table.

For each client, the system shows their name, contact information, and all associated cases. The lawyer can view complete case history, track hearing schedules, and monitor case outcomes. This centralized client management ensures lawyers maintain strong client relationships and never miss important case updates.

### 5.3.5 Document Generation (AI-Powered)

This module handles all legal document creation using AI assistance. The lawyer can select from various document types:

• **OCR Document Scanner**: Upload scanned images of physical documents. The system sends the image to the Python AI service, which uses EasyOCR to extract text. The extracted text is returned for editing and use in case files.

• **Legal Template Generator**: Select template type (bail application, vakalatnama, affidavit) and provide case details. The system uses Qwen 2.5 LLM to generate professionally formatted legal documents with proper legal language and structure. The generated PDF is created using ReportLab and can be downloaded immediately.

• **Document History**: The lawyer can view all previously generated documents and download them for reuse or reference.

---

## 5.4 Module 4: Civilian Panel (The Citizen Hub)

The Civilian Panel is the primary interface for citizens accessing the judicial system. It functions as their personalized "digital justice gateway," consolidating all case filing, tracking, and legal assistance tools into one accessible, real-time hub. It is designed to be user-friendly and intuitive, making justice accessible to all citizens regardless of their legal knowledge. The module's workflows are centered around the citizen's need to file cases, track status, receive notices, and access legal guidance.

### 5.4.1 Personalized Dashboard

This is the civilian's landing page, providing an "at-a-glance" summary of their case status. The dashboard features:

• **Key Statistic Cards**: Prominent cards displaying total cases filed, active cases, and pending actions, pulled from the cases table.

• **Real-Time Hearing Notifications**: When a judge schedules a hearing, a notification card instantly appears with the case CNR number, hearing date, and time.

• **Quick Action Buttons**: Large, intuitive buttons for navigating to the most common sections, such as "File New Case," "Track Cases," and "Legal Assistant."

### 5.4.2 Case Filing Interface

This is the core functionality for citizens to access justice. The case filing process is designed as a step-by-step wizard:

• **Step 1**: Enter petitioner details (name, address, phone)
• **Step 2**: Enter respondent details (name, address)
• **Step 3**: Select case type and provide description
• **Step 4**: Upload petition PDF (drag-and-drop or browse)
• **Step 5**: Review and submit

Upon submission, the system generates a unique CNR number using the counters table (format: KL-HC-YYYY-NNNNNN), uploads the petition to MinIO storage with SHA-256 hash verification, creates a record in the cases table with status='FILED', and displays the CNR number for future reference.

### 5.4.3 Case Tracking & Timeline

This module provides complete transparency into case progress. The interface displays all cases filed by the civilian from the cases table, showing CNR number, respondent name, case type, current status, and filing date.

Clicking on a case reveals the complete timeline:
• Filing date and petition details
• Assigned judge and lawyer (if any)
• All hearing dates from hearings table
• Evidence documents uploaded
• Judge notes and current status
• Case outcome (if disposed)

This comprehensive view ensures citizens are always informed about their case progress.

### 5.4.4 Notices & Orders

This module displays all court communications. The system queries the notices table to show all notices where user_id matches the current civilian, including:

• **Hearing Notices**: Scheduled hearing dates and times
• **Court Orders**: Judicial orders and directions
• **Summons**: Official summons documents
• **Judgments**: Final case judgments

Each notice displays the title, message, issue date, and any attached documents. Unread notices are highlighted, and clicking a notice marks it as read in the database.

### 5.4.5 AI Legal Assistant

This module provides accessible legal guidance to citizens unfamiliar with legal procedures. The interface features a chat-based AI assistant powered by Qwen 2.5 LLM:

• **Legal Guidance**: Citizens can ask questions about legal procedures, case types, and their rights. The AI provides responses in simple, non-technical language.

• **AI Petition Builder**: Citizens can use the AI to generate formal legal petitions by providing case details in plain language. The system constructs a properly formatted petition using legal terminology and structure.

• **Disclaimer**: All AI responses include a disclaimer that this is guidance, not legal advice, and recommends consulting a qualified lawyer for complex matters.

The AI service maintains conversation context and provides relevant IPC/CrPC/CPC references when applicable, making legal information accessible to all citizens.

---


# 6. SYSTEM TESTING

## 6.1 Unit Testing

Unit testing involves the isolated testing of the smallest "units" of code—individual functions, methods, or components—to ensure they operate correctly. This granular approach is essential for building a reliable foundation before integration. For this project, unit testing was applied to both the server-side business logic and the client-side UI components.

**Server-Side Unit Testing (Node.js):** On the backend, individual Node.js functions and API endpoint logic were tested. This involved crafting specific input data and asserting that the functions returned the expected output.

Example 1: CNR Number Generation Logic: A unit test was created for the function that generates unique CNR numbers. This test passed in a year and counter value to verify that it correctly applied the format logic (KL-HC-YYYY-NNNNNN), returning properly formatted case numbers with leading zeros and incrementing the counter in the counters table.

Example 2: Authentication Logic: The login endpoint was tested to ensure the bcrypt.compare() function correctly authenticated a valid password against a stored hash and rejected an invalid one. JWT token generation and validation were also tested to ensure proper expiration and signature verification.

Example 3: File Hash Calculation: The function responsible for calculating SHA-256 hashes for uploaded files was tested with various file types (PDF, JPG, PNG) to ensure consistent hash generation and verification for document integrity.

**Client-Side Unit Testing (JavaScript/React):** On the frontend, individual React components were tested to validate their state, props, and user interactions.

Example 1: Professional Statistics Dashboard: The component was tested in isolation. A test simulated data from the lawyer_stats table and asserted that the win rate percentage was correctly calculated and displayed (e.g., 15 wins out of 20 cases = 75% win rate).

Example 2: Form Validation: The "Case Filing" form's validation logic was unit-tested to confirm that it correctly identified an invalid email format, missing required fields (petitioner name, case type), or invalid file types before allowing an API call to be made.

Example 3: Case Status Badge: The logic for displaying case status with appropriate colors was tested by passing different status values (FILED, HEARING, DISPOSED, CLOSED) and asserting that it correctly rendered the corresponding badge color and text.

---

## 6.2 Integration Testing

Integration testing is focused on verifying the communication and data flow between different modules and services. This phase was the most critical for our project due to its microservices architecture. Our testing was bifurcated to cover the two primary communication channels: the API channel (for data requests) and the AI Service channel (for AI-powered features).

**API Channel Testing (React -> Node.js -> PostgreSQL -> MinIO):** This series of tests validated the standard request-response cycle. We confirmed that the React client (using a JWT for authentication) could successfully send data to the Node.js API, which would then correctly process the data, query the PostgreSQL database, store files in MinIO with SHA-256 hash verification, and return the expected JSON response. A key test involved the Civilian Panel's "File New Case" form: we filled the form in the client, uploaded a petition PDF, clicked submit, and then queried the cases table in the database directly to confirm the new record was created with all the correct fields, the CNR number was properly generated, and the file was stored in MinIO with a valid hash in the evidence table.

**AI Service Channel Testing (React -> Node.js -> Python FastAPI -> Ollama):** This was the most complex integration test. It was designed to validate the end-to-end "AI-powered feature" workflow that is a core promise of the system.

Test Setup: We opened two separate browsers: one logged in as a Judge on the "Case Review" page, and one logged in as a Lawyer on the "Document Generation" page.

Action 1 (Judge): The Judge browser was used to select a case and click "Generate AI Summary." Verification: The system sent the case details to the Python AI service, which processed the request using Qwen 2.5 LLM and returned a comprehensive case summary with key facts, legal issues, and recommendations. The summary appeared on the Judge's screen within 5-10 seconds.

Action 2 (Lawyer): The Lawyer browser was used to upload a scanned document image to the OCR scanner. Verification: The system sent the image to the Python AI service, which used EasyOCR to extract text. The extracted text appeared in an editable text area, ready for use in case documents.

This test successfully validated the entire chain: the React client sent the request to the Node.js API, the Node.js API forwarded the request to the Python FastAPI service (port 5000), the Python service processed the request using Ollama with Qwen 2.5 LLM or EasyOCR, and the response was returned through the chain back to the React client, updating the UI with AI-generated content.

---

## 6.3 Test Cases

The following table documents the formal test cases executed to validate the primary user stories and business logic of the system. These tests were performed after all unit and integration testing was complete.

---


### 6.3.1 System Test Cases

| Test Case ID | Scenario                                     | Test Steps                                                                                                                   | Expected Result                                                                    | Status |
| ------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------ |
| IT-01        | Admin → Lawyer: Admin verifies lawyer        | 1. Admin logs in.2. Navigates to User Management → Pending Lawyers.3. Approves lawyer with Bar Council ID.4. Lawyer logs in. | Lawyer sees verified status with full panel access and professional dashboard.     | Pass   |
| IT-02        | Judge → Civilian: Judge schedules hearing    | 1. Judge logs in.2. Opens Case Review.3. Schedules hearing for case KL-HC-2026-000123.4. Civilian logs in.                   | Hearing notice appears instantly on civilian dashboard with date and time.         | Pass   |
| IT-03        | Lawyer → Judge: Evidence upload notification | 1. Judge opens case file.2. Lawyer uploads evidence document.3. Judge keeps page open.                                       | Evidence appears in case file instantly with notification badge.                   | Pass   |
| IT-04        | Judge → Lawyer: Case disposition             | 1. Judge marks case as DISPOSED with outcome WIN.2. Lawyer checks Statistics.                                                | Lawyer sees updated win count instantly; win rate percentage recalculated.         | Pass   |
| IT-05        | Business Rule: File integrity verification   | 1. System detects tampered PDF file with mismatched SHA-256 hash.                                                            | System rejects file upload; shows error for integrity verification failure.        | Pass   |
| IT-06        | Business Rule: Judgment editing restriction  | 1. Judge attempts to edit outcome from DISPOSED case.                                                                        | System blocks editing; disposed case fields remain read-only with audit log entry. | Pass   |

---


## 6.4 User Acceptance Testing (UAT)

User Acceptance Testing is the final phase designed to confirm that the system is not only technically functional but also usable and valuable to its real-world end-users.

**Process:** A set of realistic scenarios was provided to test users representing each of the four roles: admin, judge, lawyer, and civilian.

• **Admin was asked to:** Verify a new lawyer registration → Approve Bar Council ID → Monitor system audit logs → Generate user statistics report.

• **Judge was asked to:** Review daily cause list → Access case with AI summary → Schedule hearing → Write judgment and dispose case.

• **Lawyer was asked to:** Check professional dashboard → Upload evidence documents → Generate legal template using AI → Track client cases and win rate.

• **Civilian was asked to:** File new case with petition PDF → Track case status → Receive hearing notice → Access AI legal assistant for guidance.

**Results:** The UAT phase was successful. All test users were able to complete their tasks intuitively. The multi-criteria filtering in the Judge Panel and the AI-powered case summarization received especially positive feedback. The civilian users particularly appreciated the AI legal assistant's ability to explain legal procedures in simple language, while lawyers found the OCR document scanner and automated template generation highly valuable for their practice.

---


# 7. SCOPE FOR FUTURE ENHANCEMENT

The Court Justice Management System, as detailed in this report, provides a robust and comprehensive foundation that successfully digitizes the core judicial and administrative workflows of the institution. The modularity of the system, particularly its microservices architecture (Node.js API + Python AI service) and normalized database schema, is designed to be inherently scalable. While the current scope fulfills all primary objectives, the platform is well-positioned for significant expansion. The following modules and features have been identified as high-value additions for future development. These enhancements would further integrate the portal into every aspect of the judicial system's operations, transforming it from a case management system into a complete, all-encompassing digital justice ecosystem. The potential enhancements are categorized below:

**Judicial & Communication Modules**
− **Secure Messaging System**: A built-in, encrypted messaging platform for direct communication between judges, lawyers, and court staff with case-specific threads.
− **Virtual Court Hearings**: Integration with video conferencing platforms for conducting remote hearings with recording and transcription capabilities.
− **Legal Document Repository**: A centralized library of legal precedents, judgments, and reference materials accessible to all judges and lawyers.
− **E-Signature Integration**: Integration with Aadhaar-based digital signatures for legally valid document signing and authentication.
− **Multi-Language Support**: Interface and AI assistant support for regional languages (Hindi, Malayalam, Tamil, etc.) to improve accessibility.
− **Mediation & ADR Module**: A dedicated system for Alternative Dispute Resolution with mediator assignment and settlement tracking.

**Administrative & Integration Modules**
− **Payment Gateway Integration**: Real payment processing for court fees, fines, and other charges with multiple payment options (UPI, cards, net banking).
− **National Judicial Data Grid (NJDG) Integration**: Seamless data exchange with NJDG for national-level case statistics and reporting.
− **E-Filing Integration**: Direct integration with Supreme Court and High Court e-filing systems for appeal submissions.
− **Digital Certificate Generation**: Automated generation of digitally-signed court orders, judgments, and case status certificates.
− **Bail Management System**: Dedicated module for bail applications, surety verification, and bail bond tracking.
− **Warrant Management**: Digital warrant issuance, tracking, and execution status monitoring with police integration.

**Legal Professional & Community Modules**
− **Lawyer Directory & Rating**: Public directory of verified lawyers with specialization, experience, and client ratings for civilian selection.
− **Legal Aid Portal**: Dedicated portal for citizens to apply for legal aid with automated eligibility verification and lawyer assignment.
− **Case Law Search Engine**: AI-powered search engine for finding relevant case laws, judgments, and legal precedents with citation analysis.
− **Continuing Legal Education (CLE)**: Platform for lawyers to access training materials, webinars, and track CLE credits.
− **Court Calendar Integration**: Synchronization with external calendar applications (Google Calendar, Outlook) for hearing reminders.
− **Witness Management**: Module for witness summons, attendance tracking, and testimony recording.
− **Expert Witness Database**: Registry of certified expert witnesses with specialization and availability tracking.
− **Pro Bono Case Tracking**: System for tracking pro bono cases handled by lawyers for Bar Council reporting.

**Technical & Platform Modules**
− **Native Mobile Applications (iOS/Android)**: Dedicated mobile apps with push notifications for hearing updates, case status changes, and court orders.
− **Advanced Analytics & BI Dashboard**: Predictive analytics for case disposal rates, judge workload optimization, and identification of case backlog patterns.
− **Blockchain Integration**: Immutable audit trail using blockchain technology for critical case documents and judgments.
− **SMS Notification Service**: SMS alerts for hearing dates, case updates, and court orders in addition to email notifications.
− **Biometric Authentication**: Fingerprint/face recognition for secure access to sensitive case information and courtroom entry.
− **AI-Powered Case Prediction**: Machine learning models to predict case outcomes based on historical data and case characteristics.
− **Voice-to-Text Transcription**: Real-time transcription of court proceedings using speech recognition for automatic record generation.
− **Integration with Police Systems**: Direct integration with police databases for FIR details, investigation status, and charge sheet filing.

---


# 8. CONCLUSION

This project, the Court Justice Management System, was undertaken to solve the deep-seated inefficiencies and fragmented workflows inherent in traditional, paper-based court management in the Indian judicial system. The existing system—characterized by manual case filing queues, physical notice boards, and paper-based case tracking—was identified as a primary source of administrative overhead, communication gaps, delays in justice delivery, and a poor experience for citizens, lawyers, and judicial officers. The project's core objective was to design, develop, and implement a centralized, web-based digital ecosystem to replace these outdated methods. The goal was to create four distinct but seamlessly integrated modules—an Admin Panel, a Judge Panel, a Lawyer Panel, and a Civilian Panel—to automate tasks, streamline communication, and provide a single, reliable source of truth for all case-related and judicial data.

The project successfully delivered this solution by implementing the 4-panel ecosystem on a robust and modern technical architecture. The system's design was carefully planned to ensure both functionality and performance, utilizing a microservices architecture. A secure Node.js with Express API server was implemented to handle all core business logic, stateless user authentication via JSON Web Tokens (JWTs) with bcrypt password hashing, and all Create, Read, Update, and Delete (CRUD) operations with the central PostgreSQL database. This primary backend is complemented by a separate Python FastAPI service running on port 5000, which manages all AI-powered features through integration with Ollama and Qwen 2.5 LLM. This microservices approach is a key technical achievement, enabling advanced capabilities—such as AI legal assistance, OCR document scanning, automated petition generation, and case summarization—which were critical requirements for a modern, intelligent judicial application. Additionally, MinIO object storage with SHA-256 hash verification ensures secure and tamper-proof document management.

The project has successfully met all its stated objectives. The Admin Panel provides a powerful and comprehensive control center, enabling administrators to manage the entire user base, verify lawyer registrations with Bar Council ID validation, and maintain system security through comprehensive audit logging. The Judge Panel functions as an efficient judicial hub, drastically reducing judicial overhead by digitizing cause list management, providing AI-powered case summaries, automating hearing scheduling, and streamlining the judgment writing process. The Lawyer Panel empowers legal professionals with comprehensive case and client management, evidence upload with OCR scanning, AI-powered legal document generation, and professional statistics tracking including win rates. Finally, the Civilian Panel provides a feature-rich, user-centric "digital justice gateway" that consolidates every aspect of a citizen's interaction with the judicial system—from filing cases and tracking status to receiving notices and accessing AI legal guidance—into one intuitive, accessible-anywhere portal.

Several key features demonstrate the project's success in delivering a high-quality, innovative application. The CNR Number Generation System (KL-HC-YYYY-NNNNNN format) is a standout feature, providing a standardized and fully automated solution for case identification that ensures uniqueness and traceability. For judges, the AI-powered case summarization, leveraging Qwen 2.5 LLM, provides immediate, actionable insights into case facts and legal issues, saving 5-10 minutes per case review and enabling faster judicial decision-making. For lawyers, the OCR Document Scanner using EasyOCR and the AI-powered legal template generator are unique innovations, offering practical tools that significantly reduce document preparation time and improve practice efficiency. For civilians, the AI Legal Assistant provides accessible legal guidance in simple language, democratizing access to legal information and empowering citizens to navigate the judicial system confidently.

While the core objectives were met, this project also has defined limitations that were acknowledged during the design phase. The current system relies on the administrator for manual password resets, lacking an automated "forgot password" email workflow. The payment system uses mock payment processing only, without integration with real payment gateways. Video conferencing for virtual court hearings is not implemented in the current version. Furthermore, case outcomes are permanently locked after a case is marked as DISPOSED—a deliberate constraint to ensure judicial record integrity and prevent tampering, but one that removes flexibility for outcome corrections without administrative intervention. The system currently supports English only, without multi-language support for regional languages. These limitations represent defined boundaries, not flaws, and provide a clear roadmap for future development as detailed in Chapter 7.

In conclusion, the Court Justice Management System is a comprehensive and successful project that effectively solves the defined problem statement. It provides a robust, scalable, and user-friendly platform that digitizes core judicial operations, enhances communication, ensures document integrity through SHA-256 verification, leverages AI for intelligent assistance, and significantly improves the user experience for all stakeholders in the judicial ecosystem. The project has successfully balanced a rich feature set with a modern and efficient technology stack, including cutting-edge AI integration, laying a solid and dependable foundation for the extensive list of future enhancements detailed in Chapter 7. It stands as a complete and effective solution to the long-standing challenges of traditional court management, bringing transparency, efficiency, and accessibility to the Indian judicial system.

---


# 9. REFERENCES

## 9.1 Academic & Methodological References

[1] R. S. Pressman and B. R. Maxim, Software Engineering: A Practitioner's Approach, 9th ed. New York, NY, USA: McGraw-Hill Education, 2020.

[2] I. Sommerville, Software Engineering, 10th ed. Harlow, United Kingdom: Pearson Education, 2016.

[3] R. Elmasri and S. B. Navathe, Fundamentals of Database Systems, 7th ed. Harlow, United Kingdom: Pearson Education, 2016.

[4] J. W. Satzinger, R. B. Jackson, and S. D. Burd, Systems Analysis and Design in a Changing World, 7th ed. Boston, MA, USA: Cengage Learning, 2016.

[5] K. E. Kendall and J. E. Kendall, Systems Analysis and Design, 11th ed. Harlow, United Kingdom: Pearson Education, 2024.

[6] L. Richardson and S. Ruby, RESTful Web Services. Sebastopol, CA, USA: O'Reilly Media, 2007.

[7] A. S. Tanenbaum and M. Van Steen, Distributed Systems: Principles and Paradigms, 3rd ed. Pearson Education, 2017.

[8] I. Goodfellow, Y. Bengio, and A. Courville, Deep Learning. Cambridge, MA, USA: MIT Press, 2016.

---

## 9.2 Technical Documentation & Standards

[9] OpenJS Foundation, "Node.js Documentation." [Online]. Available: https://nodejs.org/docs/latest/api/. [Accessed: Mar. 6, 2026].

[10] PostgreSQL Global Development Group, "PostgreSQL 16 Documentation." [Online]. Available: https://www.postgresql.org/docs/16/. [Accessed: Mar. 6, 2026].

[11] Express.js, "Express 4.x API Reference." [Online]. Available: https://expressjs.com/en/4x/api.html. [Accessed: Mar. 6, 2026].

[12] Mozilla Developer Network, "JavaScript (ECMAScript)." [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/JavaScript. [Accessed: Mar. 6, 2026].

[13] Meta Platforms, Inc., "React Documentation." [Online]. Available: https://react.dev/. [Accessed: Mar. 6, 2026].

[14] Vitejs.dev, "Vite Documentation." [Online]. Available: https://vitejs.dev/guide/. [Accessed: Mar. 6, 2026].

[15] Material-UI, "MUI Core Documentation." [Online]. Available: https://mui.com/material-ui/getting-started/. [Accessed: Mar. 6, 2026].

[16] Mozilla Developer Network, "HTML5." [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/HTML. [Accessed: Mar. 6, 2026].

[17] Mozilla Developer Network, "CSS3." [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/CSS. [Accessed: Mar. 6, 2026].

[18] M. Jones, J. Bradley, and N. Sakimura, "JSON Web Token (JWT)," RFC 7519, May 2015. [Online]. Available: https://tools.ietf.org/html/rfc7519. [Accessed: Mar. 6, 2026].

[19] MinIO, Inc., "MinIO Object Storage Documentation." [Online]. Available: https://min.io/docs/minio/linux/index.html. [Accessed: Mar. 6, 2026].

[20] Redis Ltd., "Redis Documentation." [Online]. Available: https://redis.io/docs/. [Accessed: Mar. 6, 2026].

---

## 9.3 AI & Machine Learning Documentation

[21] Python Software Foundation, "Python 3.11 Documentation." [Online]. Available: https://docs.python.org/3.11/. [Accessed: Mar. 6, 2026].

[22] FastAPI, "FastAPI Documentation." [Online]. Available: https://fastapi.tiangolo.com/. [Accessed: Mar. 6, 2026].

[23] Ollama, "Ollama Documentation." [Online]. Available: https://ollama.ai/docs. [Accessed: Mar. 6, 2026].

[24] Alibaba Cloud, "Qwen 2.5 Model Documentation." [Online]. Available: https://github.com/QwenLM/Qwen2.5. [Accessed: Mar. 6, 2026].

[25] JaidedAI, "EasyOCR Documentation." [Online]. Available: https://github.com/JaidedAI/EasyOCR. [Accessed: Mar. 6, 2026].

[26] ReportLab, "ReportLab PDF Library Documentation." [Online]. Available: https://www.reportlab.com/docs/reportlab-userguide.pdf. [Accessed: Mar. 6, 2026].

[27] Python Imaging Library, "Pillow Documentation." [Online]. Available: https://pillow.readthedocs.io/. [Accessed: Mar. 6, 2026].

---

## 9.4 Security & Cryptography Standards

[28] N. Provos and D. Mazières, "A Future-Adaptable Password Scheme," in Proceedings of the 1999 USENIX Annual Technical Conference, 1999, pp. 81-91.

[29] National Institute of Standards and Technology, "Secure Hash Standard (SHS)," FIPS PUB 180-4, Aug. 2015. [Online]. Available: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf. [Accessed: Mar. 6, 2026].

[30] bcrypt.js, "bcrypt.js Documentation." [Online]. Available: https://github.com/dcodeIO/bcrypt.js. [Accessed: Mar. 6, 2026].

---

## 9.5 DevOps & Infrastructure

[31] Docker, Inc., "Docker Documentation." [Online]. Available: https://docs.docker.com/. [Accessed: Mar. 6, 2026].

[32] Docker, Inc., "Docker Compose Documentation." [Online]. Available: https://docs.docker.com/compose/. [Accessed: Mar. 6, 2026].

[33] NGINX, Inc., "NGINX Documentation." [Online]. Available: https://nginx.org/en/docs/. [Accessed: Mar. 6, 2026].

---

## 9.6 Legal & Judicial References

[34] Government of India, "The Code of Criminal Procedure, 1973." [Online]. Available: https://legislative.gov.in/. [Accessed: Mar. 6, 2026].

[35] Government of India, "The Code of Civil Procedure, 1908." [Online]. Available: https://legislative.gov.in/. [Accessed: Mar. 6, 2026].

[36] Government of India, "The Indian Penal Code, 1860." [Online]. Available: https://legislative.gov.in/. [Accessed: Mar. 6, 2026].

[37] Supreme Court of India, "e-Courts Project." [Online]. Available: https://ecourts.gov.in/. [Accessed: Mar. 6, 2026].

[38] National Informatics Centre, "National Judicial Data Grid (NJDG)." [Online]. Available: https://njdg.ecourts.gov.in/. [Accessed: Mar. 6, 2026].

---
