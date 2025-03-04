# Armando RSS

## 📌 Project Description

Armando RSS is a scraping project that automatically collects press releases from the [Chainwire](https://chainwire.org/feed/) RSS feed and publishes them on Geo Testnet in the **Armando News** space.

## 🛠 Technologies Used

- **TypeScript**: Main programming language.
- **Node.js**: Runtime environment.
- **ts-node/esm**: Execution of TypeScript scripts.
- **Geo Testnet API**: Publishing press releases on Geo Testnet.
- **JSON Database**: Temporary storage of press releases before publishing.
- **RSS Parsing**: Extracting data from Chainwire.

## 🎯 Project Motivation

### Understanding Geo beyond its user interface

Until now, my interaction with Geo has been primarily through its interface. With this project, I want to go further by interacting with Geo Testnet programmatically, using the API and publishing structured data on the blockchain.

### Experimenting with a concrete application of GRC-20

I have been exploring GRC-20 since its release on November 21, 2024, and this project is an ideal opportunity to test its potential in a real-world use case. By integrating press releases into Geo, I aim to understand how to structure, store, and query data efficiently using this standard.

### Building on my work with RSS feeds

Since I started working with news, I have become convinced that RSS feeds are a highly efficient source of data. I spent months working on RSS sources and processing them with a RAG tool, achieving excellent results, but that exploration was interrupted. With Armando RSS, I am returning to the roots of my idea, this time developing it independently, to leverage RSS technology and automatically publish Chainwire press releases on Geo, and later integrate other RSS feeds.

### Automating Press Release Collection and Publishing

Press releases are public domain content and serve as the primary source of information for product launches and partnership announcements in the Web3 ecosystem. This project aims to automate their retrieval and publication on Geo.

## 📂 Project Structure

```plaintext
Armando-RSS/
│── data/              # Contains the write-triple.ts file
│── src/
│   ├── scraper.ts     # Scraping and storage script
│   ├── publisher.ts   # Publishing script for Geo Testnet
│── package.json       # Node.js dependencies and scripts
│── tsconfig.json      # TypeScript configuration
│── README.md          # Documentation
```

## 🚀 Installation and Setup

### 1. Clone the Project

```sh
git clone https://github.com/armandokaos/Armando-RSS.git
cd Armando-RSS
```

### 2. Install Dependencies

```sh
npm install
```

## 🔄 Running the Scraper

To fetch press releases from Chainwire and store them locally:

```sh
node --loader ts-node/esm src/scraper.ts
```

## 📡 Publishing to Geo Testnet

After scraping, publish the data to Geo Testnet:

```sh
node --loader ts-node/esm src/publisher.ts
```

The Geo Testnet space ID is: `VoNCdYgAuRjEYgsRrzQ5W4NC`.

## ✅ Next Steps

- [x] Add a description to the Geo Testnet space
- [x] Add an avatar to the Geo Testnet space
- [x] Create the "Press Release" entity on Geo Testnet
- [ ] Publish 5 press releases on Geo Testnet ⏳

📌 **Each step is validated before moving to the next one.**

## 📄 Data Model: Press Release

The Press Release type will use the following properties:

| Property       | Geo ID                                 | Description                                        |
|---------------|--------------------------------------|--------------------------------------------------|
| **Name**      | `LuBWqZAu6pz54eiJS5mLv8`            | The title of the press release                 |
| **Publish Date** | `KPNjGaLx5dKofVhT6Dfw22`         | The publication date and time                         |
| **Web URL**   | `93stf6cgYvBsdPruRzq1KK`           | The original link to the press release         |
| **Blocks**    | `QYbjCM6NT9xmh2hFGsqpQX`           | The content of the press release stored in blocks  |
| **Publisher** | `Lc4JrkpMUPhNstqs7mvnc5`           | The wire service publishing the press release |

