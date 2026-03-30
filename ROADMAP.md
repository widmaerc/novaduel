# 🚀 NovaDuel — Roadmap Technique

Ce document répertorie les fonctionnalités de l'interface qui sont actuellement des **maquettes visuelles** ou des **données simulées**, et définit les étapes nécessaires pour les rendre 100% dynamiques (Data-Driven).

## 📊 Modules Statisiques & Rankings

### 1. Engine de Ranking Global (`Top X%`)
- **État actuel** : Les mentions "Top 10%", "Top 3%" sont codées en dur dans `page.tsx`.
- **À faire** : 
  - [ ] Développer une fonction SQL/Next.js qui calcule le percentile d'un joueur par rapport à sa catégorie (ex: "Attaquants en Ligue 1").
  - [ ] Stocker ou mettre en cache ces classements pour éviter des calculs lourds à chaque vue.
  - [ ] Affichage dynamique des badges de rareté.

### 2. Comparaison vs Moyenne (`+X% vs moy.`)
- **État actuel** : Valeur simulée.
- **À faire** :
  - [ ] Calculer les moyennes par position (ex: Moyenne de passes pour un MIL).
  - [ ] Afficher l'écart réel entre le joueur actuel et cette moyenne.

## 🧠 Intelligence Artificielle & Analyse

### 3. Radar de Compétences Dynamique
- **État actuel** : Catégories (Vision, Créativité) basées uniquement sur la précision de passe.
- **À faire** :
  - [ ] Créer des groupes d'attributs (ex: *Technique* = passes + dribbles + contrôles).
  - [ ] Pondérer chaque branche du radar avec les données réelles de Sportmonks.

### 4. Rôles Tactiques Avancés
- **État actuel** : Placeholders (ex: "Rôle principal 90%").
- **À faire** :
  - [ ] Mapper les statistiques vers des archétypes de joueurs (ex: "Renard des surfaces", "Ailier percutant").
  - [ ] Utiliser les heatmaps (si disponibles dans le plan Sportmonks) pour confirmer ces rôles.

## 👤 Profil & Data Enrichment

### 5. Historique de Carrière & Trophées
- **État actuel** : Tableaux souvent vides ou limités à la saison en cours.
- **À faire** :
  - [ ] Implémenter le fetch récursif des saisons passées via le endpoint `players/seasons`.
  - [ ] Intégrer le palmarès réel (Trophées).

### 6. Algorithme de Joueurs Similaires
- **État actuel** : Liste vide/statique.
- **À faire** :
  - [ ] Développer un moteur de recommandation basé sur la proximité des stats (ex: joueurs avec xG et dribbles similaires).

---
> [!NOTE]
> Les données de base (Buts, Passes, Age, Équipe) sont **déjà 100% réelles** et synchronisées via Supabase et Redis.

## 🚀 SEO & Croissance

### 7. Sitemap Dynamique
- **État actuel** : Fichier de config présent mais non généré pour les milliers de pages joueurs/duels.
- **À faire** :
  - [ ] Configuer `next-sitemap` pour inclure les slugs de joueurs dynamiquement depuis Supabase.
  - [ ] Ajouter les pages de comparaison les plus populaires au sitemap.

### 8. Contenu Éditorial & Articles
- **État actuel** : Structure d'accueil prête, mais pas de système de gestion d'articles.
- **À faire** :
  - [ ] Créer un dossier `editorial` ou une table Supabase pour les articles.
  - [ ] Transformer les insights IA en mini-articles SEO optimisés pour le maillage interne.
