# Armando RSS

📌 Project description
Armando RSS is a scraping project that automatically collects press releases from Chainwire’s RSS feed and publishes them on Geo Testnet in the Armando RSS space.

🎯 Project motivation
Understanding Geo beyond its user interface
Until now, my interaction with Geo has mostly been through its interface. With this project, I want to go further by interacting with Geo Testnet programmatically, using the API and publishing structured data on the blockchain.

Experimenting with a concrete application of GRC-20
I have been exploring GRC-20 since its release on November 21, 2024, and this project is the ideal opportunity to test its potential in a real-world use case. By integrating press releases into Geo, I want to understand how to structure, store, and efficiently query data using this standard.

Building on my work with RSS feeds
Since I started working with news, I have been convinced that RSS feeds are a highly effective data source. I spent months working on RSS sources and processing them with a RAG tool, achieving excellent results, but this exploration was interrupted. With Armando RSS, I am returning to the original idea, this time developing it autonomously, leveraging RSS technology to automatically publish Chainwire press releases on Geo and eventually expand to other RSS feeds.

Automating Press Release collection and publishing
Press releases are public domain content and serve as the primary source of information for product launches and partnership announcements in the Web3 ecosystem. This project aims to automate their retrieval and publication on Geo Mainnet.

✅ Project timeline
📌 Initial Setup & Development
🔹 Investigated documentation hackathon
🔹 Created the Chainwire RSS scraper → scraper.ts
🔹 Deployed the Armando RSS space on Geo Testnet → NCdYgAuRjEYgsRrzQ5W4NC
🔹 Received Testnet tokens on 03/05/2025

📌 Entities
🔹 Created the "Chainwire" entity
🔹 Created the "Press Release" type
🔹 Added key properties to Press Release
🔹 Published test press releases
🔹 Published scraped press releases
🔹 Improved scrapers with scraper-v2.ts to extract clean press release content
🔹 Published scraped press releases with clean content on Geo Testnet

📌 Other operations
🔹 Successfully searched triples → search.ts
🔹 Successfully deleted triples → delete-triples.ts & publish-delete-triple.ts

📌 Mainnet
🔹 Deployed a space Armando RSS on Mainnet
🔹 Created a new wallet using Export Wallet
🔹 Cloned the repository grc-20-ts
🔹 Started adding new scripts:

Mainnet.ts
smart-wallet.ts
write-url-v2.ts
publish-url.ts
❌ Challenges & Issues
⚠ Failed to delete an entity (Testnet issue)
⚠ Failed to delete relations
⚠ Failed to publish press release content in Blocks
⚠ Unable to create a structured table in Blocks for press releases

✅ Key learnings
📌 Technical Improvements
✔ Strengthened Git & GitHub knowledge
✔ Improved repository management & code structuring
✔ Gained better handling of blockchain data workflows

📌 Geo-Specific Learnings
✔ Deeper understanding of Geo's data publishing process
✔ Learned how to write and publish structured data using the Geo Testnet API
✔ Understood how triples, entities, and relationships work programmatically

📌 Important IDs
Geo Testnet Space ID → VoNCdYgAuRjEYgsRrzQ5W4NC
Chainwire ID → 6RrWbaDFvzrynhMyqZz4Gf
Press Release ID → RZauYFG6886WwWHiq6y5JM
Example Scraped Press Release → R83U758B6FfowvJCbxRhaB
📄 Relations Created
Relation A: Press Release → Properties
NTEp3EBaHRw1eCDiVSgN9c → Properties = 9zBADaYzyfzyFJn4GU1cC

Relation B: Properties → Types
9zBADaYzyfzyFJn4GU1cC → Types = Jfmby78N4BCseZinBmdVov (Property)

Relation C: Properties → Type
9zBADaYzyfzyFJn4GU1cC → Types = Jfmby78N4BCseZinBmdVov

📄 Data Model: Press Release
Property Geo ID Description
Name LuBWqZAu6pz54eiJS5mLv8 The title of the press release
Publish Date KPNjGaLx5dKofVhT6Dfw22 The publication date and time
Web URL 93stf6cgYvBsdPruRzq1KK The original link to the press release
Blocks QYbjCM6NT9xmh2hFGsqpQX The content of the press release stored in Blocks
Publisher Lc4JrkpMUPhNstqs7mvnc5 The wire service publishing the press release
📂 Project Structure
graphql
Copiar
Editar
Armando-RSS/
│── data/ # Contains intermediate storage files
│── src/ # Main scripts directory
│   ├── scraper.ts # Fetches Chainwire RSS feed
│   ├── scraper-v2.ts # Improved scraper for Chainwire RSS feed
│   ├── publisher.ts # Publishes data to Geo Testnet
│   ├── testnet.ts # Functions for interacting with Geo Testnet
│   ├── wallet.ts # Wallet interaction utilities
│   ├── config.ts # Configuration and API keys
│   ├── write-.ts # Scripts to generate and format structured data
│   ├── publish-.ts # Scripts to publish data on Geo
│   ├── deploy-space.ts # Space deployment script
│── package.json # Node.js dependencies and scripts
│── tsconfig.json # TypeScript configuration
│── README.md # Documentation
📌 Next Steps
🛠️ Improving content publication in Blocks
🖨️ Format press release names for consistency with Geo policies
🔄 Refining relation management for structured data
🚀 Transitioning from Testnet to Mainnet deployment
🔮 Becoming able to publish any content on Geo Genesis with full control over Blocks, tables, and ima
