// Proxy côté serveur vers l'API publique ClubElo (http://api.clubelo.com).
// Aucune clé nécessaire — l'API est déjà publique et gratuite. Ce proxy sert
// uniquement à éviter les soucis de CORS quand on appelle depuis le navigateur,
// puisqu'un appel serveur-à-serveur n'y est jamais soumis.

export async function handler(event) {
  const team = event.queryStringParameters && event.queryStringParameters.team;

  if (!team) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "Paramètre 'team' manquant, ex. ?team=Bodo/Glimt",
    };
  }

  try {
    const url = `http://api.clubelo.com/${encodeURIComponent(team)}`;
    const res = await fetch(url);
    const text = await res.text();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        // ClubElo est mis à jour une fois par jour — pas la peine de le réinterroger
        // à chaque clic, un court cache limite le nombre d'appels sortants
        "Cache-Control": "public, max-age=3600",
      },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "Erreur en contactant ClubElo — réessaie dans un instant.",
    };
  }
}
