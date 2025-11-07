import React from "react";
import "./style.css";

function Card({ card, isFlipped, isMatched, handleChoice, isDisabled }) {
  const handleClick = () => {
    // ANNULLATION DU CLIC : Empêche le clic si la carte est matchée, désactivée, ou déjà retournée.
    // Les cartes matchées (isMatched: true) restent figées (dos visible et non cliquables).
    if (isMatched || isDisabled || isFlipped) return;

    handleChoice(card);
  };

  const CardBack = () => (
    <div className="card-face card-face-back">
      {
        <img
          // 🚨 IMPORTANT : Vérifiez que ce chemin est correct pour votre structure de projet.
          // Si l'image n'apparaît pas, le chemin est probablement incorrect.
          src="./images/yugioh_back.jpg"
          alt="Dos de la carte"
          className="card-image"
          // Ajout d'un fallback pour l'affichage, si l'image est manquante,
          // au moins la couleur de fond du .card-face-back sera visible.
          onError={(e) => {
            e.target.style.display = "none";
            console.error("Image du dos non trouvée. Vérifiez le chemin.");
          }}
        />
      }
    </div>
  );

  const CardFront = () => (
    <div className="card-face card-face-front">
      {/* C'est ici que l'image de la carte (card.content) est affichée */}
      <img
        src={card.content}
        alt={`Carte ${card.pairId}`}
        className="card-image"
      />
    </div>
  );

  return (
    // LOGIQUE DE FLIP : La carte est "flipped" UNIQUEMENT SI `isFlipped` est true.
    // L'état `isMatched` est ignoré ici pour forcer le retour au dos si `isFlipped` est false (cartes matchées figées).
    <div
      className={`card-container ${
        isFlipped || isMatched ? "is-flipped" : "" // <--- CORRECTION ICI
      } ${isMatched ? "is-matched-static" : ""}`}
      onClick={handleClick}
    >
      {" "}
      <div className="card-content">
        {/* ✅ CORRECTION : Inversion des faces. 
           Le recto (CardFront) doit apparaître après la rotation de 180deg.
           Le verso (CardBack) doit apparaître avant la rotation (par défaut). */}
        <CardFront />
        <CardBack />
      </div>{" "}
    </div>
  );
}

export default Card;
