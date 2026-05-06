# ZeroDay-Mentor
 An AI-driven cybersecurity ecosystem that actively audits infrastructure setups, runs simulated threat sandboxes, and verifies breached passwords using privacy preserving k-Anonymity.

Most AI chatbots are too polite. In cybersecurity, polite gets you compromised.

**ZeroDay** is a highly cynical, unapologetic AI cybersecurity mentor and auditing ecosystem. Instead of just answering tech support questions, ZeroDay actively hunts for architectural flaws in your setups, roasts you for your vulnerabilities, and then provides the exact, step-by-step mitigation strategy to secure your system. 

Built for developers and security enthusiasts, this platform combines active infrastructure auditing with simulated threat training.

---

## 🔥 Core Features

### 1. The Auditing Forum
Users post their infrastructure configurations, code snippets, or network setups. ZeroDay analyzes the input and:
*   **Identifies Vulnerabilities:** Spots flaws like client-side trust, exposed local hardware, or plaintext secrets.
*   **Calculates Risk:** Assigns a `Vuln_Impact` score (1-100) based on the severity of the misconfiguration.
*   **Roasts & Educates:** Delivers a harsh critique of the flaw followed by an industry-standard mitigation strategy.

### 2. The Threat Sandbox
A dedicated training environment where users test their intuition against simulated cyber threats. Users analyze highly convincing phishing emails, malicious code payloads, and fake login portals to build muscle memory against social engineering and basic exploits.

### 3. The `/pwncheck` Command (k-Anonymity)
A privacy-first tool to verify if a user's password has been leaked in global data breaches. 
*   **How it works securely:** It utilizes cryptographic **k-Anonymity** via SHA-1 hashing. The system hashes the password locally and only queries the first 5 characters of the hash against threat databases. The mathematical verification happens without ever transmitting or exposing the user's plaintext password over the network.

---

## ⚙️ Architecture & Tech Stack

This project is built for performance and scalability, utilizing a serverless architecture.

*   **Backend:** Node.js 
*   **AI Engine:** Integrated LLM via Antigravity / Custom System Prompts
*   **Deployment:** Google Cloud Run (Containerized, Stateless, Serverless)
*   **Data Security:** SHA-1 Cryptographic Hashing for breach verification

---

## 🚀 Live Deployment

The application is currently containerized and deployed via Google Cloud. 
**Access the live platform here:** [ZeroDay Mentor](https://zeroday-mentor-1043710710704.asia-south1.run.app/)

