import React from "react";
import "./style.css";
/*
function Card(props) {
  return (
    <h2>
      I am a {props.color} {props.brand} {props.model}!
    </h2>
  );
}*/

const Card = ({ card, handleChoice, isFlipped, isMatched }) => {
  return (
    <button
      className={isFlipped || isMatched ? "card flipped" : card}
      onClick={handleChoice(card)}
    >
      <img src={card.icon} className="frontSide" alt={card.name}></img>
      <img src="./backSide.webp" className="backside" alt={card.name}></img>
    </button>
  );
};

export default Card;
