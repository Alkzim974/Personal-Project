// services/igdb.js

const CLIENT_ID = "q4cs8xwjgtfdu48701s0zxi2nu4qqg";
const CLIENT_SECRET = "0r440bj8mtk1032lgvzg3eu3dgwn9p";

let accessToken = null;
let tokenExpirationTime = 0;

/**
 * S'authentifier auprès de Twitch pour obtenir un jeton d'accès (Access Token) pour IGDB.
 * Documentation : https://api-docs.igdb.com/#authentication
 */
export const getAccessToken = async () => {
    // Vérifie si on a déjà un token valide
    const now = Date.now();
    if (accessToken && now < tokenExpirationTime) {
        return accessToken;
    }

    console.log("Récupération d'un nouveau Token d'accès IGDB...");
    try {
        const response = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: "POST",
            }
        );

        const data = await response.json();
        console.log("Twitch Auth Response:", data); // DEBUG LOG
        
        if (data.access_token) {
            accessToken = data.access_token;
            // Définir l'expiration un peu avant la vraie date (expires_in est en secondes)
            tokenExpirationTime = now + ((data.expires_in - 60) * 1000);
            return accessToken;
        } else {
            console.error("Échec de l'obtention du token IGDB :", data);
            throw new Error("Impossible de s'authentifier auprès d'IGDB");
        }
    } catch (error) {
        console.error("Erreur dans getAccessToken :", error);
        throw error;
    }
};

/**
 * Rechercher des jeux sur IGDB.
 * @param {string} query - Le nom du jeu à chercher.
 */
export const searchGames = async (query) => {
    const token = await getAccessToken();

    try {
        // IGDB utilise un corps brut (raw body) avec une syntaxe spécifique
        // On demande le nom, l'URL de la jaquette, la date de sortie, et les plateformes
        const body = `
            search "${query}";
            fields name, cover.url, first_release_date, platforms.name, summary, rating;
            limit 10;
        `;

        const response = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": CLIENT_ID,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "text/plain"
            },
            body: body
        });

        const data = await response.json();
        console.log("IGDB Search Response:", JSON.stringify(data)); // DEBUG LOG
        return data;
    } catch (error) {
        console.error("Erreur lors de la recherche de jeux :", error);
        return [];
    }
};

/**
 * Obtenir les détails d'un jeu spécifique par son ID.
 * @param {number} gameId 
 */
export const getGameDetails = async (gameId) => {
    const token = await getAccessToken();
    const body = `
        fields name, cover.url, first_release_date, platforms.name, summary, rating, genres.name, screenshots.url;
        where id = ${gameId};
    `;

    const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
            "Client-ID": CLIENT_ID,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "text/plain"
        },
        body: body
    });

    const data = await response.json();
    return data[0]; // IGDB retourne un tableau, on prend le premier élément
};

/**
 * Récupérer les jeux récents (6 derniers mois) avec une bonne note (> 74).
 */
export const getRecentHighRatedGames = async () => {
    const token = await getAccessToken();
    
    // Calcul du timestamp d'il y a 6 mois
    const now = Math.floor(Date.now() / 1000);
    const sixMonthsAgo = now - (6 * 30 * 24 * 60 * 60);

    const body = `
        fields name, cover.url, first_release_date, platforms.name, summary, rating;
        where first_release_date > ${sixMonthsAgo} & rating > 74 & cover != null;
        sort first_release_date desc;
        limit 20;
    `;

    try {
        const response = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": CLIENT_ID,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "text/plain"
            },
            body: body
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur getRecentHighRatedGames :", error);
        return [];
    }
};
