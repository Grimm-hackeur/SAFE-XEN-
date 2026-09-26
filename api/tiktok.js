// Fonction serverless Vercel — GET /api/tiktok?url=<lien tiktok>
// Sert d'intermédiaire côté serveur vers l'API d'extraction, pour éviter
// le blocage CORS et éviter d'exposer l'URL de l'API tierce dans le front.
//
// La source actuelle (api.bk9.dev) est publique et sans clé, comme dans
// l'implémentation existante du bot WhatsApp. Vérifie la forme réelle de
// sa réponse avant mise en production : le format des champs peut changer
// sans préavis puisque c'est une API tierce non officielle.

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'Paramètre "url" manquant.' });
  }
  if (!url.includes('tiktok.com')) {
    return res.status(400).json({ success: false, error: 'Lien invalide, envoie un lien tiktok.com valide.' });
  }

  const sourceEndpoint = `https://api.bk9.dev/download/tiktok?url=${encodeURIComponent(url)}`;

  try {
    const upstream = await fetch(sourceEndpoint, {
      headers: { 'accept': 'application/json' }
    });

    if (!upstream.ok) {
      return res.status(502).json({ success: false, error: "La source d'extraction a répondu avec une erreur." });
    }

    const data = await upstream.json();

    // Le champ BK9.BK9 est celui utilisé dans l'implémentation existante.
    // D'autres champs (titre, auteur, miniature, audio) sont lus de façon
    // défensive et restent optionnels : adapte ces chemins si la structure
    // réelle de la réponse diffère une fois testée en conditions réelles.
    const payload = data?.BK9 ?? data ?? {};
    const videoUrl = payload.BK9 || payload.video || payload.play || payload.no_watermark || null;
    const audioUrl = payload.audio || payload.music || null;
    const thumbnail = payload.cover || payload.thumbnail || null;
    const title = payload.title || payload.desc || null;
    const author = payload.author?.username || payload.username || null;

    if (!videoUrl) {
      return res.status(502).json({ success: false, error: "Échec de récupération du lien vidéo." });
    }

    return res.status(200).json({
      success: true,
      video: videoUrl,
      audio: audioUrl,
      thumbnail,
      title,
      author
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erreur pendant la communication avec la source.' });
  }
}
