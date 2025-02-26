import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Convertir `import.meta.url` en chemin de fichier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL du flux RSS de Chainwire
const RSS_FEED_URL = 'https://chainwire.org/feed/';

// Fichier où les press releases seront stockées
const DATA_FILE = path.join(__dirname, '../data/press_releases.json');

// Fonction pour récupérer et afficher les press releases en direct
async function fetchRSSFeed() {
    try {
        console.log('📡 Récupération des press releases en cours...');
        const response = await axios.get(RSS_FEED_URL);
        const rssData = await parseStringPromise(response.data);

        // Vérifier que le format RSS est correct
        const channel = rssData.rss?.channel?.[0];
        if (!channel || !channel.item) {
            console.error('❌ Erreur : Le format RSS reçu est invalide.');
            return [];
        }

        // Extraire les articles
        const items = channel.item.map((item: any) => ({
            title: item.title?.[0] || 'Titre inconnu',
            link: item.link?.[0] || 'Lien non disponible',
            pubDate: item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : 'Date inconnue',
            content: item['content:encoded'] ? item['content:encoded'][0] : 'Pas de contenu disponible',
        }));

        console.log(`✅ ${items.length} articles récupérés.\n`);

        // Afficher chaque press release immédiatement
        items.forEach((article: { title: string; link: string; pubDate: string; content: string }, index: number) => {
            console.log(`🔹 [${index + 1}] ${article.title}`);
            console.log(`   📅 Date : ${article.pubDate}`);
            console.log(`   🔗 Lien : ${article.link}\n`);
        });

        return items;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du RSS :', error);
        return [];
    }
}

// Fonction pour sauvegarder les données dans un fichier JSON
async function saveData(data: any) {
    try {
        await fs.ensureDir(path.dirname(DATA_FILE));
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Press releases sauvegardées dans', DATA_FILE);
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des données :', error);
    }
}

// Exécuter le scraper et afficher immédiatement les résultats
async function runScraper() {
    const data = await fetchRSSFeed();
    await saveData(data);
}

// Lancer immédiatement le scraping
runScraper();
